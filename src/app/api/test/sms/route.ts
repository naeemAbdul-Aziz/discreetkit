/**
 * Test endpoint for SMS functionality
 * This endpoint allows testing SMS sending without needing actual orders
 * Should be removed or secured in production
 */
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationSMS, sendShippingNotificationSMS, sendDeliveryNotificationSMS } from '@/lib/actions';

export async function POST(req: NextRequest) {
  try {
    const { orderId, type } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    let result = false;
    switch (type) {
      case 'confirmation':
        await sendOrderConfirmationSMS(orderId);
        break;
      case 'shipping':
        await sendShippingNotificationSMS(orderId);
        break;
      case 'delivery':
        await sendDeliveryNotificationSMS(orderId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid SMS type. Use: confirmation, shipping, or delivery' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} SMS sent successfully`,
      orderId 
    });

  } catch (error) {
    console.error('SMS test error:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}