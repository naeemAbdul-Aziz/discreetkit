/**
 * Test endpoint for SMS functionality
 * This endpoint allows testing SMS sending without needing actual orders
 * Should be removed or secured in production
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendSMS } from '@/lib/actions';

export async function POST(req: NextRequest) {
  try {
    const { orderId, type } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    // Fetch order and call sendSMS directly to return debug info
    // Try to find by id first, otherwise allow looking up by code (tracking code)
    let { data: order, error } = await supabase
      .from('orders')
      .select('id, code, phone_masked')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      // attempt lookup by code (human-facing tracking code)
      const res = await supabase
        .from('orders')
        .select('id, code, phone_masked')
        .eq('code', orderId)
        .single();
      order = res.data;
      error = res.error;
    }

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let message = '';
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${order.code}`;
    switch (type) {
      case 'confirmation':
        message = `Test: Payment for order ${order.code} confirmed. We're now preparing your package for discreet delivery. Track: ${trackingUrl}`;
        break;
      case 'shipping':
        message = `Test: Your order ${order.code} has been shipped. Your package is on the way for discreet delivery. Track: ${trackingUrl}`;
        break;
      case 'delivery':
        message = `Test: Your order ${order.code} has been delivered successfully. Thank you for choosing DiscreetKit for your health needs.`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid SMS type. Use: confirmation, shipping, or delivery' }, { status: 400 });
    }

    const sendResult = await sendSMS(order.phone_masked, message);

    if (!sendResult.ok) {
      return NextResponse.json({ error: 'Failed to send SMS', detail: sendResult }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId, sendResult });

  } catch (error) {
    console.error('SMS test error:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}