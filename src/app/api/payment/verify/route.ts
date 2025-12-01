/**
 * Server route to verify a Paystack transaction by reference and update the order.
 * This is a safe, idempotent fallback in case webhooks are delayed or misconfigured.
 *
 * Flow:
 * - GET /api/payment/verify?reference=ABC-123-XYZ
 * - Calls Paystack Verify API
 * - If successful and order is still pending_payment, set to received and append event
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { paymentDebug, rlAllow } from '@/lib/utils';
import { rlAllowDistributed } from '@/lib/rate-limit';
import { sendOrderConfirmationSMS } from '@/lib/actions';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get('reference') || url.searchParams.get('trxref');
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!reference) {
      return NextResponse.json({ ok: false, error: 'Missing reference' }, { status: 400 });
    }

    // Rate limiting: prefer distributed limiter if configured, fallback to in-memory
    const key = `${ip}:${reference}`;
    const { allowed, retryAfterSec } = await rlAllowDistributed(key, 5, 60).catch(() => {
      const r = rlAllow(key, 5, 60_000);
      return { allowed: r.allowed, retryAfterSec: r.retryAfterSec };
    });
    if (!allowed) {
      paymentDebug('verify rate-limited', { ip, reference });
      return NextResponse.json({ ok: false, error: 'Too Many Requests' }, {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) }
      });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 });
    }

    // 1) Verify transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    const verifyData = await verifyRes.json();

    // Audit log the verify attempt (status will indicate success/failure)
    try {
      const supabaseAudit = getSupabaseAdminClient();
      await supabaseAudit.from('payment_events').insert({
        source: 'verify',
        reference,
        status: verifyData?.data?.status ?? 'unknown',
        payload: verifyData,
      });
    } catch {}

    if (!verifyRes.ok || !verifyData?.status) {
      paymentDebug('Paystack verify failed', { reference, statusCode: verifyRes.status, bodyStatus: verifyData?.status });
      return NextResponse.json({ ok: false, error: 'Unable to verify transaction' }, { status: 400 });
    }

    const data = verifyData.data;
    const status: string | undefined = data?.status;
    const amount: number | undefined = data?.amount; // in minor unit

    // 2) If payment was successful, update order if still pending
    if (status === 'success') {
      const supabase = getSupabaseAdminClient();

      const { data: order, error: findError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('code', reference)
        .single();

      if (findError || !order) {
        // Not fatal for client UX; just report not found
        paymentDebug('Order not found on verify', { reference });
        return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
      }

      let wasUpdated = false;
      
      if (order.status === 'pending_payment') {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'received' })
          .eq('id', order.id);

        if (updateError) {
          console.error('Order update error:', updateError);
          return NextResponse.json({ ok: false, error: 'Failed to update order' }, { status: 500 });
        }

        await supabase.from('order_events').insert({
          order_id: order.id,
          status: 'Payment Confirmed',
          note: `Successfully received GHS ${((amount ?? 0) / 100).toFixed(2)}.`,
        });
        
        wasUpdated = true;
        paymentDebug('Order updated to received via verify', { reference, orderId: order.id });

        // Send SMS confirmation after successful payment
        try {
          await sendOrderConfirmationSMS(order.id);
          paymentDebug('SMS confirmation sent via verify', { orderId: order.id });
        } catch (smsError) {
          // Log but don't fail the request - SMS failure shouldn't block payment confirmation
          console.error('Failed to send SMS confirmation on verify:', smsError);
        }
      } else {
        paymentDebug('Order already processed on verify', { reference, orderId: order.id, status: order.status });
      }

      return NextResponse.json({ ok: true, updated: wasUpdated, status: order.status });
    }

    // Not success – leave order unchanged
    return NextResponse.json({ ok: false, error: 'Payment not successful' }, { status: 400 });
  } catch (err) {
    console.error('Payment verify error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
