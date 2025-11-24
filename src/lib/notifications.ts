import { getSupabaseAdminClient } from './supabase'
import { sendSMS } from './actions'

/**
 * Sends a notification SMS to the assigned pharmacy for a given order.
 * Creates/updates a pharmacy_notifications row for auditing.
 */
export async function sendPharmacyOrderNotification(orderId: number, pharmacyId: number) {
  const supabase = getSupabaseAdminClient()

  // Fetch order & pharmacy details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, code, delivery_area, subtotal, total_price, pharmacy_id')
    .eq('id', orderId)
    .single()
  if (orderError || !order) {
    console.error('Pharmacy notify: order fetch error', orderError)
    return
  }

  const { data: pharmacy, error: pharmacyError } = await supabase
    .from('pharmacies')
    .select('id, name, location, phone_number, contact_person, email')
    .eq('id', pharmacyId)
    .single()
  if (pharmacyError || !pharmacy) {
    console.error('Pharmacy notify: pharmacy fetch error', pharmacyError)
    return
  }

  // Ensure notification row exists (idempotent) then send
  const { data: existing } = await supabase
    .from('pharmacy_notifications')
    .select('id, status, attempts')
    .eq('order_id', order.id)
    .eq('pharmacy_id', pharmacy.id)
    .maybeSingle()

  let notificationId: number | null = existing?.id ?? null
  if (!notificationId) {
    const { data: insertRow, error: insertError } = await supabase
      .from('pharmacy_notifications')
      .insert({ order_id: order.id, pharmacy_id: pharmacy.id })
      .select('id')
      .single()
    if (insertError || !insertRow) {
      console.error('Pharmacy notify: cannot create notification row', insertError)
      return
    }
    notificationId = insertRow.id
  }

  const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders?code=${order.code}`
  const msg = `New order ${order.code} for ${order.delivery_area}. Total: GHS ${order.total_price}. Review & accept: ${trackingUrl}`

  const result = await sendSMS(pharmacy.phone_number || '', msg)

  const update = {
    status: result.ok ? 'sent' : 'failed',
    attempts: (existing?.attempts ?? 0) + 1,
    last_error: result.ok ? null : result.error,
    sent_at: result.ok ? new Date().toISOString() : null
  }
  await supabase.from('pharmacy_notifications').update(update).eq('id', notificationId)

  if (result.ok) {
    console.log('Pharmacy notification SMS sent for order', order.code)
  } else {
    console.warn('Pharmacy notification failed', result.error)
  }
}

/** Simple assignment heuristic: match pharmacy.location ILIKE delivery_area */
export async function assignPharmacyForDeliveryArea(deliveryArea: string): Promise<number | null> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('pharmacies')
    .select('id, location')
    .ilike('location', `%${deliveryArea}%`)
    .limit(1)
  if (error) {
    console.error('Pharmacy assignment error', error)
    return null
  }
  return data && data.length > 0 ? data[0].id : null
}
