/**
 * API endpoint for updating order status (admin only)
 * This allows admin to update order status and triggers SMS notifications
 */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';
import { sendShippingNotificationSMS, sendDeliveryNotificationSMS } from '@/lib/actions';
import { z } from 'zod';

const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['received', 'processing', 'out_for_delivery', 'completed']),
  note: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    // Verify authenticated admin
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validatedData = updateOrderStatusSchema.parse(body);

    const supabaseAdmin = getSupabaseAdminClient();

    // Get current order status
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, code, status, phone_masked')
      .eq('id', validatedData.orderId)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: validatedData.status })
      .eq('id', validatedData.orderId);

    if (updateError) {
      console.error('Order status update error:', updateError);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // Create order event
    const statusDisplayMap: Record<string, string> = {
      received: 'Order Received',
      processing: 'Processing',
      out_for_delivery: 'Out for Delivery',
      completed: 'Delivered',
    };

    const eventNote = validatedData.note || 
      `Order status updated to ${statusDisplayMap[validatedData.status] || validatedData.status}`;

    await supabaseAdmin.from('order_events').insert({
      order_id: validatedData.orderId,
      status: statusDisplayMap[validatedData.status] || validatedData.status,
      note: eventNote,
    });

    // Send SMS notifications based on status
    if (validatedData.status === 'out_for_delivery') {
      await sendShippingNotificationSMS(validatedData.orderId);
    } else if (validatedData.status === 'completed') {
      await sendDeliveryNotificationSMS(validatedData.orderId);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order ${currentOrder.code} status updated to ${validatedData.status}`,
      orderId: validatedData.orderId,
      newStatus: validatedData.status
    });

  } catch (error) {
    console.error('Update order status error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}