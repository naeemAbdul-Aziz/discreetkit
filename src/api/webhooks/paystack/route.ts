/**
 * @file This file contains the API route for handling Paystack webhooks.
 * It listens for payment events from Paystack (e.g., 'charge.success')
 * and updates the order status in the database accordingly. This is a critical
 * part of ensuring payment reliability.
 */
import {NextResponse} from 'next/server';
import crypto from 'crypto';
import {getSupabaseAdminClient} from '@/lib/supabase';

export async function POST(req: Request) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecret) {
    console.error('CRITICAL: Paystack secret key is not configured.');
    return new NextResponse('Webhook Error: Server configuration error.', {status: 500});
  }

  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();

  try {
    // 1. Verify the webhook signature to ensure it's from Paystack
    const hash = crypto
      .createHmac('sha512', paystackSecret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.warn('Invalid Paystack webhook signature received.');
      return new NextResponse('Webhook Error: Invalid signature', {status: 400});
    }

    // 2. Parse the event payload
    const event = JSON.parse(body);

    // 3. Handle the 'charge.success' event
    if (event.event === 'charge.success') {
      const {reference, status, amount, paid_at} = event.data;

      if (status === 'success') {
        const supabaseAdmin = getSupabaseAdminClient();
        // Find the order using the reference code
        const {data: order, error: findError} = await supabaseAdmin
          .from('orders')
          .select('id, status')
          .eq('code', reference)
          .single();

        if (findError || !order) {
          console.error(`Webhook Info: Order with reference ${reference} not found. This can happen if an order was deleted before payment. Acknowledging to prevent retries.`);
          // Return 200 so Paystack doesn't retry for a non-existent order
          return new NextResponse('Order not found, acknowledged.', {status: 200});
        }
        
        // Idempotency check: Only update if the order is still pending payment.
        if (order.status === 'pending_payment') {
            const { error: updateError } = await supabaseAdmin
              .from('orders')
              .update({ status: 'received' })
              .eq('id', order.id);
            
            if (updateError) {
              console.error(`Webhook DB Error: Failed to update order ${order.id} to 'received'.`, updateError);
              throw updateError;
            }
            
            await supabaseAdmin.from('order_events').insert({
                order_id: order.id,
                status: 'Payment Confirmed',
                note: `Successfully received GHS ${(amount / 100).toFixed(2)}.`,
                created_at: paid_at,
            });
            console.log(`Webhook Success: Payment confirmed for order ${order.id}.`);
        } else {
            console.log(`Webhook Info: Received duplicate 'charge.success' for already processed order ${order.id}. Ignoring.`);
        }
      }
    }

    // 4. Acknowledge receipt of the event for all other event types
    return new NextResponse('Webhook received and processed.', {status: 200});

  } catch (err: any) {
      console.error('Webhook processing error:', err.message, { error: err });
      return new NextResponse('Webhook Error: Internal Server Error', {status: 500});
  }
}
