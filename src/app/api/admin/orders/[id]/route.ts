/**
 * API endpoint for updating order status (admin only)
 * This allows admin to update order status and triggers SMS notifications
 */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';
import { sendShippingNotificationSMS, sendDeliveryNotificationSMS } from '@/lib/actions';
import { z } from 'zod';

const updateOrderStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['received', 'processing', 'out_for_delivery', 'completed']),
  note: z.string().optional(),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    // Verify authenticated admin
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validatedData = updateOrderStatusSchema.parse({ ...body, id: id });

    const supabaseAdmin = getSupabaseAdminClient();

    // Get current order status
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, code, status, phone_masked')
      .eq('id', validatedData.id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: validatedData.status })
      .eq('id', validatedData.id);

    if (updateError) {
      console.error('Order status update error:', updateError);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // Create order event
    // ...existing code...

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
