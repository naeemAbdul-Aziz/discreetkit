import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase'
import { getUserRoles } from '@/lib/supabase'
import { getRedis } from '@/lib/redis'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; productId: string }> }
) {
  const { id, productId: productIdParam } = await context.params;
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

    const pharmacyId = parseInt(id)
    const productId = parseInt(productIdParam)
    const body = await request.json()

    const updatePayload: any = {
      last_updated: new Date().toISOString()
    }
    if (body.stock_level !== undefined) updatePayload.stock_level = body.stock_level
    if (body.reorder_level !== undefined) updatePayload.reorder_level = body.reorder_level
    if (body.pharmacy_price_ghs !== undefined) updatePayload.pharmacy_price_ghs = body.pharmacy_price_ghs
    if (body.is_available !== undefined) updatePayload.is_available = body.is_available

    const supabase = getSupabaseAdminClient()

    // Update pharmacy product
    const { data, error } = await supabase
      .from('pharmacy_products')
      .update(updatePayload)
      .eq('pharmacy_id', pharmacyId)
      .eq('product_id', productId)
      .select()

    if (error) throw error

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Pharmacy product not found' },
        { status: 404 }
      )
    }

    // Invalidate Redis cache
    try {
      const redis = await getRedis()
      await redis.del(`cache:pharmacy:${pharmacyId}:products`)
      await redis.del(`cache:pharmacy:${pharmacyId}:analytics`)
    } catch (cacheErr) {
      console.error('Cache invalidation failed:', cacheErr)
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error('Error updating pharmacy product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; productId: string }> }
) {
  const { id, productId: productIdParam } = await context.params;
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

    const pharmacyId = parseInt(id)
    const productId = parseInt(productIdParam)
    const supabase = getSupabaseAdminClient()

    // Delete pharmacy product
    const { error } = await supabase
      .from('pharmacy_products')
      .delete()
      .eq('pharmacy_id', pharmacyId)
      .eq('product_id', productId)

    if (error) throw error

    // Invalidate Redis cache
    try {
      const redis = await getRedis()
      await redis.del(`cache:pharmacy:${pharmacyId}:products`)
      await redis.del(`cache:pharmacy:${pharmacyId}:analytics`)
    } catch (cacheErr) {
      console.error('Cache invalidation failed:', cacheErr)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting pharmacy product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}