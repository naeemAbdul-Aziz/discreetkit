import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase'
import { getUserRoles } from '@/lib/supabase'

export async function GET(
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

    const pharmacyId = parseInt(params.id)
    const supabase = getSupabaseAdminClient()
    
    // Get pharmacy products with product details
    const { data: pharmacyProducts, error } = await supabase
      .from('pharmacy_products')
      .select(`
        *,
        products (
          id,
          name,
          category,
          price_ghs,
          image_url,
          requires_prescription
        )
      `)
      .eq('pharmacy_id', pharmacyId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(pharmacyProducts || [])
  } catch (error: any) {
    console.error('Error fetching pharmacy products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const pharmacyId = parseInt(params.id)
    const body = await request.json()
    
    const {
      product_id,
      stock_level,
      reorder_level,
      pharmacy_price_ghs,
      is_available
    } = body

    if (!product_id || stock_level === undefined) {
      return NextResponse.json(
        { error: 'Product ID and stock level are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    
    // Insert or update pharmacy product
    const { data, error } = await supabase
      .from('pharmacy_products')
      .upsert({
        pharmacy_id: pharmacyId,
        product_id,
        stock_level,
        reorder_level: reorder_level || 10,
        pharmacy_price_ghs,
        is_available: is_available !== undefined ? is_available : true,
        last_updated: new Date().toISOString()
      })
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error('Error creating pharmacy product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}