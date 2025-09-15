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
    console.error('Paystack secret key is not configured.');
    return new NextResponse('Webhook Error: Server configuration error.', {status: 500});
  }

  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();

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
    const {reference, status, amount, currency} = event.data;

    if (status === 'success') {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        // Find the order using the reference code
        const {data: order, error: findError} = await supabaseAdmin
          .from('orders')
          .select('id, status, total_price')
          .eq('code', reference)
          .single();

        if (findError || !order) {
          console.error(`Webhook Error: Order with reference ${reference} not found.`);
          // Return 200 so Paystack doesn't retry for a non-existent order
          return new NextResponse('Order not found', {status: 200});
        }
        
        // Only update if the order is still marked as 'received'
        if (order.status === 'received') {
            const {error: updateError} = await supabaseAdmin
                .from('order_events')
                .insert({
                    order_id: order.id,
                    status: 'Payment Confirmed',
                    note: `Successfully received GHS ${(amount / 100).toFixed(2)}.`,
            });

            if (updateError) {
                console.error(`Webhook Error: Failed to add payment event for order ${order.id}.`, updateError);
                // Don't throw, as we still want to give value to the customer.
            }
        }

      } catch (err) {
        console.error('Webhook processing error:', err);
        return new NextResponse('Webhook Error: Internal Server Error', {status: 500});
      }
    }
  }

  // 4. Acknowledge receipt of the event
  return new NextResponse('Webhook received', {status: 200});
}
