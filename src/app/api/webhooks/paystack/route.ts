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
  // Sanitize secret key (some platforms add quotes)
  let paystackSecret = process.env.PAYSTACK_SECRET_KEY as string | undefined;
  if (typeof paystackSecret === 'string') {
    paystackSecret = paystackSecret.replace(/^"|"$/g, '').trim();
  }

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
  const eventType = event?.event;

  // Log all webhook events for debugging
  paymentDebug('Webhook received', { eventType, reference, status: eventStatus });

  // 3. Handle payment success events
  // Paystack sends 'charge.success' for successful payments
  // We also handle the status field as a fallback
  const isPaymentSuccess = eventType === 'charge.success' ||
    (eventType?.includes('success') && eventStatus === 'success');

  if (isPaymentSuccess) {
    const { reference, status, amount } = event.data;

    if (status === 'success') {
      const supabaseAdmin = getSupabaseAdminClient();

      try {
        // Audit log the webhook payload
        try {
          await supabaseAdmin.from('payment_events').insert({
            source: 'webhook',
            reference,
            status,
            payload: event,
          });
        } catch (auditError) {
          console.warn('Failed to log payment event:', auditError);
        }

        paymentDebug('Webhook payment success received', { reference, amount, eventType });

        // Find the order using the reference code
        const { data: order, error: findError } = await supabaseAdmin
          .from('orders')
          .select('id, status, delivery_area')
          .eq('code', reference)
          .single();

        if (findError || !order) {
          paymentDebug('Webhook order not found', { reference });
          // Return 200 so Paystack doesn't retry for a non-existent order
          return new NextResponse('Order not found', { status: 200 });
        }

        // Only update if the order is still marked as 'pending_payment'
        if (order.status === 'pending_payment') {
          // Update order status first
          const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'received' })
            .eq('id', order.id);

          if (updateError) {
            console.error('Failed to update order status:', updateError);
            throw updateError;
          }

          // Log the payment confirmation event
          await supabaseAdmin.from('order_events').insert({
            order_id: order.id,
            status: 'Payment Confirmed',
            note: `Successfully received GHS ${(amount / 100).toFixed(2)}.`,
          });

          paymentDebug('Webhook updated order to received', { reference, orderId: order.id });

          // Send SMS confirmation after successful payment
          // NON-BLOCKING:
          sendOrderConfirmationSMS(order.id)
            .then(() => paymentDebug('SMS confirmation sent', { orderId: order.id }))
            .catch(smsError => console.error('Failed to send SMS confirmation:', smsError));

          // Auto-assign pharmacy after payment confirmation
          // This is isolated so failures don't affect payment confirmation or SMS
          if (order.delivery_area) {
            try {
              // Get order items for auto-assignment
              const { data: orderWithItems } = await supabaseAdmin
                .from('orders')
                .select('items')
                .eq('id', order.id)
                .single();

              if (orderWithItems?.items) {
                const { autoAssignOrder } = await import('@/lib/order-assignment');
                const assignResult = await autoAssignOrder(order.id, order.delivery_area, orderWithItems.items as any[]);

                if (assignResult.success) {
                  paymentDebug('Auto-assigned pharmacy', { orderId: order.id, pharmacyId: assignResult.pharmacyId });
                } else {
                  paymentDebug('Manual assignment required', { orderId: order.id, deliveryArea: order.delivery_area, reason: assignResult.reason || assignResult.error });
                }
              }
            } catch (assignError) {
              // Log and continue - admin will handle manual assignment
              console.warn('Auto-assignment failed, requires manual assignment:', assignError);
              paymentDebug('Auto-assignment failed', { orderId: order.id, error: String(assignError) });
            }
          }
        } else {
          paymentDebug('Order already processed', { reference, orderId: order.id, currentStatus: order.status });
        }

      } catch (err) {
        console.error('Webhook processing error:', err);
        return new NextResponse('Webhook Error: Internal Server Error', { status: 500 });
      }
    } else {
      paymentDebug('Webhook received non-success status', { reference, status });
    }
  } else {
    // Log unhandled events for monitoring
    paymentDebug('Webhook event not handled', { eventType, reference });
  }

  // 4. Acknowledge receipt of the event
  return new NextResponse('Webhook received', { status: 200 });
}
