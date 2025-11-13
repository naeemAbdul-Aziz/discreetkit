import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { paymentDebug } from '@/lib/utils';
import { sendOrderConfirmationSMS } from '@/lib/actions';

// Node runtime (default) is required; do not export runtime = 'edge'

/**
 * Scheduled reconciliation endpoint
 * - Re-verifies pending payments older than a threshold via Paystack Verify API
 * - Requires header: X-CRON-KEY matching process.env.CRON_SECRET to run
 * - Intended to be invoked by Vercel Cron (configured in vercel.json)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secretParam = url.searchParams.get('secret');
  const authHeader = req.headers.get('x-cron-key');
  const vercelCron = req.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;

  let authorized = false;
  if (cronSecret) {
    // Prefer explicit shared secret via header or query param
    authorized = authHeader === cronSecret || secretParam === cronSecret;
  } else {
    // Fallback: allow calls coming from Vercel Cron if secret not configured
    authorized = !!vercelCron;
  }
  if (!authorized) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    return NextResponse.json({ ok: false, error: 'Missing PAYSTACK_SECRET_KEY' }, { status: 500 });
  }

  const supabase = getSupabaseAdminClient();

  // Reconcile orders older than N minutes (default 10)
  const minutes = Number(process.env.RECONCILE_MIN_AGE_MIN || '10');
  const cutoff = new Date(Date.now() - minutes * 60_000).toISOString();
  const limit = Number(process.env.RECONCILE_BATCH_SIZE || '50');

  // Fetch pending orders created before cutoff
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, code, status, created_at')
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff)
    .limit(limit);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let processed = 0;
  let confirmed = 0;
  const results: Array<{ code: string; updated: boolean; reason?: string }> = [];

  for (const o of orders ?? []) {
    processed++;
    try {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(o.code)}`, {
        headers: { Authorization: `Bearer ${paystackSecretKey}`, 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      const body = await res.json().catch(() => null);
      // Audit each reconcile verify call
      try {
        await supabase.from('payment_events').insert({
          source: 'reconcile',
          reference: o.code,
          status: body?.data?.status ?? 'unknown',
          payload: body,
        });
      } catch {}
      if (!res.ok || !body?.status) {
        results.push({ code: o.code, updated: false, reason: 'verify-failed' });
        continue;
      }
      if (body.data?.status === 'success') {
        // Update if still pending
        const { data: current, error: findErr } = await supabase
          .from('orders')
          .select('id, status')
          .eq('id', o.id)
          .single();
        if (findErr || !current) {
          results.push({ code: o.code, updated: false, reason: 'not-found' });
          continue;
        }
        if (current.status === 'pending_payment') {
          const { error: updErr } = await supabase
            .from('orders')
            .update({ status: 'received' })
            .eq('id', current.id);
          if (updErr) {
            results.push({ code: o.code, updated: false, reason: 'update-error' });
            continue;
          }
          await supabase.from('order_events').insert({
            order_id: current.id,
            status: 'Payment Confirmed',
            note: 'Reconciled via scheduled verification.',
          });
          confirmed++;
          paymentDebug('Reconciled order to received', { code: o.code, orderId: current.id });
          
          // Send SMS confirmation after successful payment reconciliation
          await sendOrderConfirmationSMS(current.id);
          
          results.push({ code: o.code, updated: true });
        } else {
          results.push({ code: o.code, updated: false, reason: 'already-updated' });
        }
      } else {
        results.push({ code: o.code, updated: false, reason: 'not-success' });
      }
    } catch (e) {
      results.push({ code: o.code, updated: false, reason: 'exception' });
    }
  }

  return NextResponse.json({ ok: true, processed, confirmed, results });
}
