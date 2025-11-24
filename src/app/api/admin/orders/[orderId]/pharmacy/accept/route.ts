import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { recordPharmacyAcknowledgement } from '@/lib/actions'

export async function POST(_req: Request, { params }: { params: { orderId: string } }) {
  const orderId = Number(params.orderId)
  if (!orderId) return NextResponse.json({ ok: false, error: 'Invalid order id' }, { status: 400 })
  const supabase = getSupabaseAdminClient()
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, pharmacy_id, pharmacy_ack_status')
    .eq('id', orderId)
    .single()
  if (error || !order) return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
  if (!order.pharmacy_id) return NextResponse.json({ ok: false, error: 'Order has no assigned pharmacy' }, { status: 400 })
  if (order.pharmacy_ack_status === 'accepted') return NextResponse.json({ ok: true, already: true })
  const result = await recordPharmacyAcknowledgement(order.id, 'accepted')
  return NextResponse.json(result)
}
