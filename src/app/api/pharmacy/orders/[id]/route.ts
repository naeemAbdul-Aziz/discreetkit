/**
 * @file src/app/api/pharmacy/orders/[id]/route.ts
 * @description Pharmacy order management API
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/node';
import { createSupabaseServerClient, getUserRoles } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { sendShippingNotificationSMS, sendDeliveryNotificationSMS } from '@/lib/server-utils';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Initialize Sentry once per runtime if DSN is provided
  try {
    // Initialize only if a client doesn't exist yet and DSN is provided
    // In Node SDK, `getClient()` returns the active client when initialized.
    if (!Sentry.getClient?.() && process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.2),
      });
    }
  } catch (e) {
    // Non-fatal: proceed without Sentry if init fails
    console.warn('[Sentry] init failed:', e);
  }

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
    const { action, status, pharmacy_ack_status, note, courier_name, courier_phone, courier_tracking_url } = body;

    // Verify order belongs to this pharmacy
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, pharmacy_id, status, code, courier_tracking_url')
      .eq('id', id)
      .single();

    if (orderError || !order || order.pharmacy_id !== pharmacy.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let updateData: any = {};

    const previousStatus = order.status;

    if (action === 'acknowledge') {
      updateData.pharmacy_ack_status = pharmacy_ack_status;
      updateData.pharmacy_ack_at = new Date().toISOString();

      if (pharmacy_ack_status === 'accepted') {
        updateData.status = 'processing';
      }
    } else if (action === 'update_status') {
      updateData.status = status;
      // Allow pharmacy to set courier fields when marking out_for_delivery
      if (status === 'out_for_delivery') {
        if (courier_name) updateData.courier_name = courier_name;
        if (courier_phone) updateData.courier_phone = courier_phone;

        let trackingUrl = courier_tracking_url;
        if (!trackingUrl) {
          // Auto-generate tracking URL tied to this order code
          const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com';
          trackingUrl = `${site}/track?code=${order.code}`;
        }
        updateData.courier_tracking_url = trackingUrl;
      }
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

    console.log(JSON.stringify({
      msg: 'Pharmacy Order API update',
      orderId: id,
      actorUserId: user.id,
      action,
      previousStatus,
      newStatus: updateData.status,
      ack: updateData.pharmacy_ack_status,
      courier: {
        name: updateData.courier_name,
        phone: updateData.courier_phone,
        trackingUrl: updateData.courier_tracking_url,
      }
    }));

    // Log the event
    let eventNote = `Pharmacy ${action}: ${pharmacy_ack_status || status}`;
    if (note) {
      eventNote += ` - ${note}`;
    }
    if (updateData.courier_name || updateData.courier_phone) {
      const riderBits = [updateData.courier_name, updateData.courier_phone].filter(Boolean).join(' / ');
      eventNote += ` (Rider: ${riderBits})`;
    }

    // Deduplicate events when no status change on update_status
    const shouldInsertEvent = action === 'acknowledge' || previousStatus !== updateData.status;
    if (shouldInsertEvent) {
      await supabase
        .from('order_events')
        .insert({
          order_id: Number(id),
          status: updateData.status || 'acknowledged',
          note: eventNote
        });
    }

    // Trigger SMS notifications if status changed
    if (previousStatus !== updateData.status) {
      try {
        if (updateData.status === 'out_for_delivery') {
          Sentry.addBreadcrumb({
            category: 'orders',
            message: 'Sending shipping SMS',
            level: 'info',
            data: { orderId: id }
          });
          sendShippingNotificationSMS(id).catch(err => {
            Sentry.captureException(err, { level: 'error', extra: { orderId: id } });
            console.error('Failed to send shipping SMS:', err);
          });
        } else if (updateData.status === 'completed') {
          Sentry.addBreadcrumb({
            category: 'orders',
            message: 'Sending delivery SMS',
            level: 'info',
            data: { orderId: id }
          });
          sendDeliveryNotificationSMS(id).catch(err => {
            Sentry.captureException(err, { level: 'error', extra: { orderId: id } });
            console.error('Failed to send delivery SMS:', err);
          });
        }
      } catch (smsWrapErr) {
        // Continue even if breadcrumb/capture fails
        console.warn('[Sentry] SMS breadcrumb/capture failed:', smsWrapErr);
      }
    }

    revalidatePath('/pharmacy/dashboard');

    return NextResponse.json({ success: true });

  } catch (error) {
    try {
      Sentry.captureException(error, { level: 'error' });
    } catch (e) {
      // ignore Sentry capture errors
    }
    console.error('[Pharmacy Order API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}