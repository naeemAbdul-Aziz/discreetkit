/**
 * @file This file contains the API route for handling Paystack webhooks.
 * It listens for payment events from Paystack (e.g., 'charge.success')
 * and updates the order status in the database accordingly. This is a critical
 * part of ensuring payment reliability.
 */
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { sendOrderConfirmationSMS } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  const context = 'Paystack-Webhook';
  const traceId = Math.random().toString(36).substring(7);
  
  logger.info('Webhook received', { context, traceId });
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

  // Use timingSafeEqual to prevent timing attacks
  const signatureBuffer = Buffer.from(signature || '', 'utf8');
  const hashBuffer = Buffer.from(hash, 'utf8');

  // Ensure buffers are same length before comparing (or it throws). 
  // If lengths differ, it's invalid anyway.
  const isValid = signatureBuffer.length === hashBuffer.length && 
                  crypto.timingSafeEqual(signatureBuffer, hashBuffer);

  if (!isValid) {
    logger.warn('Invalid Paystack webhook signature', { context, traceId });
    return new NextResponse('Webhook Error: Invalid signature', { status: 400 });
  }

  // 2. Parse the event payload
  const event = JSON.parse(body);
  const reference = event?.data?.reference;
  const eventStatus = event?.data?.status;
  const eventType = event?.event;

  // Log all webhook events for debugging
  logger.debug('Webhook process start', { context, traceId, data: { eventType, reference, status: eventStatus } });

  // 2.5 Idempotency Check (Redis)
  try {
    const { getRedis } = await import('@/lib/redis'); // Dynamic import to avoid circular dep issues in some Next setups
    const redis = await getRedis();
    const eventId = event?.data?.id || reference || crypto.randomUUID();
    const idempotencyKey = `paystack:event:${eventId}`;

    // Check if processed
    const processed = await redis.get(idempotencyKey);
    if (processed) {
      logger.info('Duplicate webhook detected. Skipping.', { context, traceId, data: { reference } });
      return new NextResponse('Webhook already processed', { status: 200 });
    }

    // Mark as processed (valid for 24h)
    await redis.set(idempotencyKey, 'true', { ex: 86400 });

  } catch (redisError) {
    console.warn('Idempotency check failed (Redis down?), continuing but risk of duplicates:', redisError);
  }

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

        logger.info('Payment success verified', { context, traceId, data: { reference, amount, eventType } });

        // Find the order using the reference code
        const { data: order, error: findError } = await supabaseAdmin
          .from('orders')
          .select('id, status, delivery_area, email, total_price_ghs, code, items')
          .eq('code', reference)
          .single();

        if (findError || !order) {
          logger.error('Webhook order not found', { context, traceId, data: { reference } });
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
          const { createOrderEvent } = await import('@/lib/event-messages');
          await createOrderEvent(supabaseAdmin, order.id, 'payment_confirmed', {
            amount: amount / 100,
          });

          logger.info('Order marked as received', { context, traceId, data: { reference, orderId: order.id } });

          // Send SMS confirmation after successful payment
          // NON-BLOCKING:
          sendOrderConfirmationSMS(order.id)
            .then(() => logger.info('SMS confirmation sent', { context, traceId, data: { orderId: order.id } }))
            .catch(smsError => logger.error('Failed to send SMS confirmation', { context, traceId, data: smsError }));

          // [NEW] Send Customer Order Confirmation Email (Branded)
          if (order.email) {
             const { sendCustomerOrderConfirmation } = await import('@/lib/email-service');
              sendCustomerOrderConfirmation({
                 email: order.email,
                 code: order.code,
                 total_price_ghs: order.total_price_ghs,
                 items: order.items as any[],
                 deliveryArea: order.delivery_area
              }).then((res) => {
                 if (res.success) logger.info('Customer email confirmation sent', { context, traceId, data: { emailId: res.emailId } });
                 else logger.error('Failed to send customer email', { context, traceId, data: res.error });
              }).catch(err => logger.error('Customer email exception', { context, traceId, data: err }));
           }

          // [NEW] Send WhatsApp Rich Receipt
          // Check if it's a WhatsApp order via metadata
          const whatsappId = event.data?.metadata?.whatsapp_id;
          if (whatsappId) {
            try {
              const { sendOrderConfirmation } = await import('@/lib/whatsapp/manager');
              const orderAmount = (amount / 100);
              
              // Construct Item Summary for WhatsApp (e.g. "1x HIV Test, 2x Condoms")
              let itemsSummary = 'Multiple Items';
              if (order.items && Array.isArray(order.items)) {
                itemsSummary = order.items
                  .map((item: any) => `${item.quantity || 1}x ${item.name || 'Item'}`)
                  .join(', ');
              } else if (typeof order.items === 'string') {
                try {
                    const parsed = JSON.parse(order.items);
                    if (Array.isArray(parsed)) {
                        itemsSummary = parsed
                          .map((item: any) => `${item.quantity || 1}x ${item.name || 'Item'}`)
                          .join(', ');
                    }
                } catch(e) {
                    itemsSummary = order.items;
                }
              }

              await sendOrderConfirmation(whatsappId, reference, orderAmount, itemsSummary);
              logger.info('WhatsApp confirmation sent', { context, traceId, data: { whatsappId, items: itemsSummary } });
            } catch (waError) {
              logger.error('Failed to send WhatsApp confirmation', { context, traceId, data: waError });
            }
          }

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
                  logger.info('Auto-assigned pharmacy', { context, traceId, data: { orderId: order.id, pharmacyId: assignResult.pharmacyId } });
                } else {
                  logger.info('Manual assignment required', { context, traceId, data: { orderId: order.id, reason: assignResult.reason || assignResult.error } });
                }
              }
            } catch (assignError) {
              // Log and continue - admin will handle manual assignment
              logger.warn('Auto-assignment failed', { context, traceId, data: assignError });
            }
          }
          // Revalidate dashboard and order paths for real-time updates
          revalidatePath('/admin');
          revalidatePath('/admin/analytics');
          revalidatePath('/admin/orders');

        } else {
          logger.info('Order already processed', { context, traceId, data: { reference, status: order.status } });
        }

      } catch (err) {
        logger.error('Webhook processing error', { context, traceId, data: err });
        return new NextResponse('Webhook Error: Internal Server Error', { status: 500 });
      }
    } else {
      logger.debug('Non-success webhook event', { context, traceId, data: { reference, status } });
    }
  } else {
    // Log unhandled events for monitoring
    logger.debug('Unhandled webhook event', { context, traceId, data: { eventType, reference } });
  }

  // 4. Acknowledge receipt of the event
  return new NextResponse('Webhook received', { status: 200 });
}
