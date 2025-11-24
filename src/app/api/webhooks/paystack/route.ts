/**
 * @file This file contains the API route for handling Paystack webhooks.
 * It listens for payment events from Paystack (e.g., 'charge.success')
 * and updates the order status in the database accordingly. This is a critical
 * part of ensuring payment reliability.
 */
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { paymentDebug } from '@/lib/utils';
import { sendOrderConfirmationSMS } from '@/lib/actions';

export async function POST(req: Request) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecret) {
    console.error('Paystack secret key is not configured.');
    return new NextResponse('Webhook Error: Server configuration error.', { status: 500 });
  }

  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();

  // 1. Verify the webhook signature to ensure it's from Paystack
  const hash = crypto
    .createHmac('sha512', paystackSecret)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    paymentDebug('Invalid Paystack webhook signature');
    return new NextResponse('Webhook Error: Invalid signature', { status: 400 });
  }

  // 2. Parse the event payload
  const event = JSON.parse(body);
  const reference = event?.data?.reference;
  const eventStatus = event?.data?.status;

  // 3. Handle the 'charge.success' event
  if (event.event === 'charge.success') {
    const { reference, status, amount } = event.data;

    if (status === 'success') {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        // Audit log the webhook payload
        try {
          await supabaseAdmin.from('payment_events').insert({
            source: 'webhook',
            reference,
            status,
            payload: event,
          });
        } catch { }
        paymentDebug('Webhook charge.success received', { reference, amount });
        // Find the order using the reference code
        const { data: order, error: findError } = await supabaseAdmin
          .from('orders')
          .select('id, status')
          .eq('code', reference)
          .single();

        if (findError || !order) {
          paymentDebug('Webhook order not found', { reference });
          // Return 200 so Paystack doesn't retry for a non-existent order
          return new NextResponse('Order not found', { status: 200 });
        }

        // Only update if the order is still marked as 'pending_payment'
        if (order.status === 'pending_payment') {
          const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'received' })
            .eq('id', order.id);

          if (updateError) throw updateError;

          await supabaseAdmin.from('order_events').insert({
            order_id: order.id,
            status: 'Payment Confirmed',
            note: `Successfully received GHS ${(amount / 100).toFixed(2)}.`,
          });
          paymentDebug('Webhook updated order to received', { reference, orderId: order.id });

          // Auto-assign pharmacy after payment confirmation
          try {
            const { data: orderDetails } = await supabaseAdmin
              .from('orders')
              .select('delivery_area')
              .eq('id', order.id)
              .single();

            if (orderDetails?.delivery_area) {
              const { autoAssignOrder } = await import('@/lib/order-assignment');
              const assignResult = await autoAssignOrder(order.id, orderDetails.delivery_area);

              if (assignResult.success) {
                paymentDebug('Auto-assigned pharmacy', { orderId: order.id, pharmacyId: assignResult.pharmacyId });
              } else if (assignResult.requiresManual) {
                paymentDebug('Manual assignment required', { orderId: order.id, deliveryArea: orderDetails.delivery_area });
              }
            }
          } catch (assignError) {
            console.warn('Auto-assignment failed, will require manual assignment:', assignError);
          }

          // Send SMS confirmation after successful payment
          await sendOrderConfirmationSMS(order.id);
        }

      } catch (err) {
        console.error('Webhook processing error:', err);
        return new NextResponse('Webhook Error: Internal Server Error', { status: 500 });
      }
    }
  }

  // 4. Acknowledge receipt of the event
  return new NextResponse('Webhook received', { status: 200 });
}
