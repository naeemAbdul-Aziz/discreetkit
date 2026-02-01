/**
 * @file Cron job to release expired inventory reservations
 * @description Runs every 15 minutes to free up inventory that hasn't been dispatched
 */

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const sanitize = (v?: string | null) => (v ?? '').replace(/^"|"$/g, '').trim()
    const expectedAuth = `Bearer ${sanitize(cronSecret)}`
    const providedAuth = sanitize(authHeader)
    
    // Allow Vercel Cron (has x-vercel-cron header) or correct secret
    const isVercelCron = request.headers.get('x-vercel-cron')
    const isAuthorized = isVercelCron || (!!cronSecret && providedAuth === expectedAuth)
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Release reservations older than 2 hours that are still active
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    // Find expired reservations
    const { data: expiredReservations, error: findError } = await supabase
      .from('inventory_reservations')
      .select('id, pharmacy_id, product_id, quantity, order_id')
      .eq('status', 'active')
      .lt('reserved_at', twoHoursAgo)

    if (findError) {
      console.error('Error finding expired reservations:', findError)
      throw findError
    }

    if (!expiredReservations || expiredReservations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired reservations found',
        released: 0
      })
    }

    console.log(`Found ${expiredReservations.length} expired reservations`)

    // Release each reservation and return stock
    let released = 0
    const errors: any[] = []

    for (const reservation of expiredReservations) {
      try {
        // Mark as released
        const { error: updateError } = await supabase
          .from('inventory_reservations')
          .update({
            status: 'released',
            released_at: new Date().toISOString()
          })
          .eq('id', reservation.id)

        if (updateError) throw updateError

        // Return stock to pharmacy
        const { error: stockError } = await supabase
          .rpc('increment_pharmacy_stock', {
            p_pharmacy_id: reservation.pharmacy_id,
            p_product_id: reservation.product_id,
            p_quantity: reservation.quantity
          })

        // If RPC doesn't exist, fall back to direct query
        if (stockError && stockError.message?.includes('not found')) {
          // Get current stock
          const { data: currentStock } = await supabase
            .from('pharmacy_products')
            .select('stock_level')
            .eq('pharmacy_id', reservation.pharmacy_id)
            .eq('product_id', reservation.product_id)
            .single()

          if (currentStock) {
            await supabase
              .from('pharmacy_products')
              .update({
                stock_level: currentStock.stock_level + reservation.quantity
              })
              .eq('pharmacy_id', reservation.pharmacy_id)
              .eq('product_id', reservation.product_id)
          }
        } else if (stockError) {
          throw stockError
        }

        // Log event
        await supabase
          .from('order_events')
          .insert({
            order_id: reservation.order_id,
            status: 'Reservation Released',
            note: `Inventory reservation expired and released. Stock returned to pharmacy.`
          })

        // Add system message
        await supabase
          .from('order_messages')
          .insert({
            order_id: reservation.order_id,
            sender_type: 'system',
            message: `⚠️ Inventory reservation expired after 2 hours. Stock has been returned to pharmacy. Order may need reassignment.`,
            is_internal: false
          })

        released++
      } catch (error) {
        console.error(`Error releasing reservation ${reservation.id}:`, error)
        errors.push({ reservationId: reservation.id, error })
      }
    }

    console.log(`Successfully released ${released}/${expiredReservations.length} reservations`)

    return NextResponse.json({
      success: true,
      message: `Released ${released} expired reservations`,
      released,
      total: expiredReservations.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to release reservations'
      },
      { status: 500 }
    )
  }
}
