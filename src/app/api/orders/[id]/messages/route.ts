/**
 * @file src/app/api/orders/[id]/messages/route.ts
 * @description API endpoints for order messages/communication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getUserRoles } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await getUserRoles(supabase, user.id)
    const isAdmin = roles.includes('admin')
    const isPharmacy = roles.includes('pharmacy')

    if (!isAdmin && !isPharmacy) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get pharmacy ID if user is pharmacy
    let pharmacyId: number | null = null
    if (isPharmacy) {
      const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (!pharmacy) {
        return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 })
      }
      pharmacyId = pharmacy.id
    }

    // Verify access to this order
    const { data: order } = await supabase
      .from('orders')
      .select('id, pharmacy_id')
      .eq('id', id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Pharmacy can only view messages for their own orders
    if (isPharmacy && order.pharmacy_id !== pharmacyId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch messages
    let query = supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true })

    // Filter internal messages for pharmacy users
    if (isPharmacy) {
      query = query.eq('is_internal', false)
    }

    const { data: messages, error } = await query

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })

  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await getUserRoles(supabase, user.id)
    const isAdmin = roles.includes('admin')
    const isPharmacy = roles.includes('pharmacy')

    if (!isAdmin && !isPharmacy) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { message, is_internal } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Only admins can send internal messages
    const isInternalMessage = isAdmin && is_internal === true

    // Get pharmacy ID if user is pharmacy
    let pharmacyId: number | null = null
    if (isPharmacy) {
      const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (!pharmacy) {
        return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 })
      }
      pharmacyId = pharmacy.id
    }

    // Verify access to this order
    const { data: order } = await supabase
      .from('orders')
      .select('id, pharmacy_id')
      .eq('id', id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Pharmacy can only message their own orders
    if (isPharmacy && order.pharmacy_id !== pharmacyId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Insert message
    const { data: newMessage, error } = await supabase
      .from('order_messages')
      .insert({
        order_id: Number(id),
        sender_type: isAdmin ? 'admin' : 'pharmacy',
        sender_id: user.id,
        message: message.trim(),
        is_internal: isInternalMessage
      })
      .select()
      .single()

    if (error) throw error

    // Create order event for visibility
    await supabase
      .from('order_events')
      .insert({
        order_id: Number(id),
        status: 'Message',
        note: `New message from ${isAdmin ? 'admin' : 'pharmacy'}${isInternalMessage ? ' (internal)' : ''}`
      })

    return NextResponse.json({ success: true, message: newMessage })

  } catch (error: any) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
