import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase'
import { getUserRoles } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseServer = await createSupabaseServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await getUserRoles(supabaseServer, user.id)
    const isAdmin = roles.includes('admin')
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const orderId = parseInt(params.id)
    const body = await request.json()
    const { pharmacy_id } = body

    if (!pharmacy_id) {
      return NextResponse.json(
        { error: 'Pharmacy ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    
    // Get current order details for logging
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('pharmacy_id')
      .eq('id', orderId)
      .single()

    // Update order assignment
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        pharmacy_id: pharmacy_id,
        pharmacy_ack_status: 'pending'
      })
      .eq('id', orderId)

    if (orderError) throw orderError

    // Log the reassignment event
    await supabase
      .from('order_events')
      .insert({
        order_id: orderId,
        status: 'reassigned',
        note: `Order reassigned from pharmacy ${currentOrder?.pharmacy_id || 'none'} to pharmacy ${pharmacy_id}`
      })

    return NextResponse.json({ 
      success: true,
      message: 'Order successfully reassigned'
    })
  } catch (error: any) {
    console.error('Error reassigning order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}