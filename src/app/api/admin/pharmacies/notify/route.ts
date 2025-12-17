import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { sendPharmacyOrderNotification } from '@/lib/notifications'

// POST /api/admin/pharmacies/notify { orderId: number }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const orderId = Number(body.orderId)
    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json({ ok: false, error: 'Invalid orderId' }, { status: 400 })
    }
    const supabase = getSupabaseAdminClient()

    // Security Check: Verify Admin
    const { createSupabaseServerClient, getUserRoles } = await import('@/lib/supabase');
    const authClient = await createSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const roles = await getUserRoles(supabase, user.id);
    if (!roles.includes('admin')) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, pharmacy_id')
      .eq('id', orderId)
      .single()
    if (error || !order) {
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
    }
    if (!order.pharmacy_id) {
      return NextResponse.json({ ok: false, error: 'Order not assigned to a pharmacy' }, { status: 400 })
    }
    await sendPharmacyOrderNotification(order.id, order.pharmacy_id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
