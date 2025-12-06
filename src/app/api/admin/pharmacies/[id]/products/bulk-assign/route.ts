import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase'
import { getUserRoles } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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
    const body = await request.json()

    const { product_ids, default_stock_level = 0, default_reorder_level = 10 } = body

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()

    // Prepare bulk insert data
    const pharmacyProducts = product_ids.map((productId: number) => ({
      pharmacy_id: pharmacyId,
      product_id: productId,
      stock_level: default_stock_level,
      reorder_level: default_reorder_level,
      is_available: true
    }))

    // Bulk insert pharmacy products (ignore conflicts for existing combinations)
    const { data, error } = await supabase
      .from('pharmacy_products')
      .upsert(pharmacyProducts, { onConflict: 'pharmacy_id,product_id', ignoreDuplicates: true })
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      assigned: data?.length || 0,
      message: `${data?.length || 0} products assigned to pharmacy`
    })
  } catch (error: any) {
    console.error('Error bulk assigning products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}