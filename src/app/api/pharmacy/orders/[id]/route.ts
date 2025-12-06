/**
 * @file src/app/api/pharmacy/orders/[id]/route.ts
 * @description Pharmacy order management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserRoles } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { sendShippingNotificationSMS, sendDeliveryNotificationSMS } from '@/lib/actions';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check pharmacy role
    const roles = await getUserRoles(supabase, user.id);
    if (!roles.includes('pharmacy')) {
      return NextResponse.json({ error: 'Pharmacy access required' }, { status: 403 });
    }

    // Get pharmacy record
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (pharmacyError || !pharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, status, pharmacy_ack_status } = body;

    // Verify order belongs to this pharmacy
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, pharmacy_id')
      .eq('id', id)
      .single();

    if (orderError || !order || order.pharmacy_id !== pharmacy.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let updateData: any = {};

    if (action === 'acknowledge') {
      updateData.pharmacy_ack_status = pharmacy_ack_status;
      updateData.pharmacy_ack_at = new Date().toISOString();

      if (pharmacy_ack_status === 'accepted') {
        updateData.status = 'processing';
      }
    } else if (action === 'update_status') {
      updateData.status = status;
    }

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log(`[Pharmacy Order API] Order ${id} updated: action=${action}, status=${updateData.status}, ack=${updateData.pharmacy_ack_status}`);

    // Log the event
    await supabase
      .from('order_events')
      .insert({
        order_id: Number(id),
        status: updateData.status || 'acknowledged',
        note: `Pharmacy ${action}: ${pharmacy_ack_status || status}`
      });

    // Trigger SMS notifications if status changed
    if (updateData.status === 'out_for_delivery') {
      sendShippingNotificationSMS(id).catch(err => console.error('Failed to send shipping SMS:', err));
    } else if (updateData.status === 'completed') {
      sendDeliveryNotificationSMS(id).catch(err => console.error('Failed to send delivery SMS:', err));
    }

    revalidatePath('/pharmacy/dashboard');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Pharmacy Order API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}