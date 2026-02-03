/**
 * Centralized Event Message Generator
 * This module provides customer-friendly event messages for order tracking.
 * All event creation should use these functions to ensure consistent, marketable language.
 */

export type EventStatus =
  | 'order_created'
  | 'order_received'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'assigned_to_pharmacy'
  | 'pharmacy_accepted'
  | 'pharmacy_declined'
  | 'processing'
  | 'packed'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'email_notification'
  | 'optimization_in_progress';

interface EventMessage {
  title: string;
  note: string;
}

/**
 * Get customer-friendly event message
 * @param status - The event status
 * @param context - Additional context (e.g., pharmacy name, amount, rider name)
 * @returns Customer-friendly title and note
 */
export function getEventMessage(
  status: EventStatus | string,
  context?: {
    pharmacyName?: string;
    amount?: number;
    riderName?: string;
    riderPhone?: string;
    reason?: string;
  }
): EventMessage {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as EventStatus;

  const messages: Record<EventStatus, EventMessage> = {
    order_created: {
      title: 'Order Received',
      note: 'Your order has been received and is being processed.',
    },
    order_received: {
      title: 'Order Confirmed',
      note: 'Your order is confirmed and in safe hands.',
    },
    payment_pending: {
      title: 'Confirming Payment',
      note: 'We\'re securely verifying your payment.',
    },
    payment_confirmed: {
      title: 'Payment Received',
      note: context?.amount
        ? `Payment of GHS ${context.amount.toFixed(2)} received successfully. Your order is confirmed!`
        : 'Payment received successfully. Your order is confirmed!',
    },
    assigned_to_pharmacy: {
      title: 'Order Assigned',
      note: context?.pharmacyName
        ? `Your order has been assigned to ${context.pharmacyName} for fulfillment.`
        : 'Your order has been assigned to a nearby partner pharmacy for quick fulfillment.',
    },
    pharmacy_accepted: {
      title: 'Pharmacy Confirmed',
      note: 'The pharmacy has confirmed they can fulfill your order.',
    },
    pharmacy_declined: {
      title: 'Finding Best Option',
      note: 'We\'re finding the best pharmacy to fulfill your order quickly.',
    },
    processing: {
      title: 'Preparing Your Order',
      note: 'Your order is being carefully prepared with discretion.',
    },
    packed: {
      title: 'Packed & Ready',
      note: 'Your order is packed and ready for delivery.',
    },
    out_for_delivery: {
      title: 'On the Way',
      note: context?.riderName
        ? `${context.riderName} is bringing your package to you.`
        : 'A trusted rider is bringing your package to you.',
    },
    completed: {
      title: 'Delivered',
      note: 'Delivered safely and discreetly. Thank you for trusting us!',
    },
    cancelled: {
      title: 'Order Cancelled',
      note: context?.reason || 'Your order has been cancelled.',
    },
    email_notification: {
      title: 'Notification Sent',
      note: 'You\'ve been notified via email.',
    },
    optimization_in_progress: {
      title: 'Optimizing Delivery',
      note: 'We\'re finding the best route for your delivery.',
    },
  };

  return messages[normalizedStatus] || {
    title: formatTitle(status),
    note: 'Your order is being processed.',
  };
}

/**
 * Format a technical status into a readable title
 */
function formatTitle(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create an order event with customer-friendly messaging
 * @param supabase - Supabase client
 * @param orderId - Order ID
 * @param status - Event status
 * @param context - Additional context for the message
 */
export async function createOrderEvent(
  supabase: any,
  orderId: number,
  status: EventStatus | string,
  context?: {
    pharmacyName?: string;
    amount?: number;
    riderName?: string;
    riderPhone?: string;
    reason?: string;
    customNote?: string; // Allow custom notes for special cases
  }
) {
  const message = getEventMessage(status, context);

  const { error } = await supabase.from('order_events').insert({
    order_id: orderId,
    status: message.title,
    note: context?.customNote || message.note,
  });

  if (error) {
    console.error('[createOrderEvent] Failed to create event:', error);
  }

  return { error };
}
