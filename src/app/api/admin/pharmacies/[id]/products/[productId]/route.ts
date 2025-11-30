import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase'
import { getUserRoles } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
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

    const pharmacyId = parseInt(params.id)
    const productId = parseInt(params.productId)
    const body = await request.json()
    
    const {
      stock_level,
      reorder_level,
      pharmacy_price_ghs,
      is_available
    } = body

    const supabase = getSupabaseAdminClient()
    
    // Update pharmacy product
    const { data, error } = await supabase
      .from('pharmacy_products')
      .update({
        stock_level,
        reorder_level,
        pharmacy_price_ghs,
        is_available,
        last_updated: new Date().toISOString()
      })
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
  { params }: { params: { id: string; productId: string } }
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

    const pharmacyId = parseInt(params.id)
    const productId = parseInt(params.productId)
    const supabase = getSupabaseAdminClient()
    
    // Delete pharmacy product
    const { error } = await supabase
      .from('pharmacy_products')
      .delete()
      .eq('pharmacy_id', pharmacyId)
      .eq('product_id', productId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting pharmacy product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}