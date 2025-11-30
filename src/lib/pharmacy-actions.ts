'use server'

import { createSupabaseServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

/**
 * Get the current logged-in pharmacy user's pharmacy record
 */
export async function getCurrentPharmacy() {
    const supabase = await createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: "Not authenticated" }
    }

    // Get pharmacy linked to this user
    const { data: pharmacy, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error) {
        return { error: "Pharmacy not found for this user" }
    }

    return { pharmacy }
}

/**
 * Get orders assigned to the current pharmacy
 */
export async function getPharmacyOrders(status?: string) {
    const supabase = await createSupabaseServerClient()

    // Get current pharmacy
    const { pharmacy, error: pharmError } = await getCurrentPharmacy()
    if (pharmError || !pharmacy) {
        return { error: pharmError || "Pharmacy not found" }
    }

    // Build query
    let query = supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', pharmacy.id)
        .order('created_at', { ascending: false })

    // Filter by status if provided
    if (status) {
        query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
        return { error: error.message }
    }

    return { orders }
}

/**
 * Get pharmacy dashboard stats
 */
export async function getPharmacyStats() {
    const supabase = await createSupabaseServerClient()

    // Get current pharmacy
    const { pharmacy, error: pharmError } = await getCurrentPharmacy()
    if (pharmError || !pharmacy) {
        return { error: pharmError || "Pharmacy not found" }
    }

    // Get all orders for this pharmacy
    const { data: orders, error } = await supabase
        .from('orders')
        .select('status, created_at, pharmacy_id')
        .eq('pharmacy_id', pharmacy.id)

    if (error) {
        return { error: error.message }
    }

    // Calculate stats
    const pending = orders?.filter(o => o.status === 'received' && o.pharmacy_id).length || 0
    const processing = orders?.filter(o => o.status === 'processing').length || 0
    const outForDelivery = orders?.filter(o => o.status === 'out_for_delivery').length || 0

    // Completed this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const completedThisWeek = orders?.filter(o =>
        o.status === 'completed' &&
        new Date(o.created_at) >= oneWeekAgo
    ).length || 0

    return {
        stats: {
            pending,
            processing,
            outForDelivery,
            completedThisWeek
        }
    }
}

/**
 * Accept an order (pharmacy acknowledges and starts processing)
 */
export async function acceptOrder(id: number) {
    const supabase = await createSupabaseServerClient()

    // Get current pharmacy
    const { pharmacy, error: pharmError } = await getCurrentPharmacy()
    if (pharmError || !pharmacy) {
        return { error: pharmError || "Pharmacy not found" }
    }

    // Update order status to processing
    const { error } = await supabase
        .from('orders')
        .update({
            status: 'processing',
            pharmacy_ack_status: 'accepted',
            pharmacy_ack_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('pharmacy_id', pharmacy.id) // Security: only update own orders

    if (error) {
        return { error: error.message }
    }

    // Log event
    await supabase
        .from('order_events')
        .insert({
            order_id: id,
            status: 'processing',
            note: `Order accepted by ${pharmacy.name}`
        })

    revalidatePath('/pharmacy/dashboard')
    return { success: true }
}

/**
 * Decline an order
 */
export async function declineOrder(id: number, reason: string) {
    const supabase = await createSupabaseServerClient()

    // Get current pharmacy
    const { pharmacy, error: pharmError } = await getCurrentPharmacy()
    if (pharmError || !pharmacy) {
        return { error: pharmError || "Pharmacy not found" }
    }

    // Update order - unassign pharmacy and set back to received
    const { error } = await supabase
        .from('orders')
        .update({
            pharmacy_id: null,
            pharmacy_ack_status: 'declined',
            pharmacy_ack_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('pharmacy_id', pharmacy.id) // Security: only update own orders

    if (error) {
        return { error: error.message }
    }

    // Log event
    await supabase
        .from('order_events')
        .insert({
            order_id: id,
            status: 'declined',
            note: `Order declined by ${pharmacy.name}: ${reason}`
        })

    revalidatePath('/pharmacy/dashboard')
    return { success: true }
}

/**
 * Update order status (processing → out_for_delivery)
 */
export async function updatePharmacyOrderStatus(id: number, status: 'out_for_delivery' | 'completed') {
    const supabase = await createSupabaseServerClient()

    // Get current pharmacy
    const { pharmacy, error: pharmError } = await getCurrentPharmacy()
    if (pharmError || !pharmacy) {
        return { error: pharmError || "Pharmacy not found" }
    }

    // Update order status
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .eq('pharmacy_id', pharmacy.id) // Security: only update own orders

    if (error) {
        return { error: error.message }
    }

    // Log event
    const statusText = status === 'out_for_delivery' ? 'Out for Delivery' : 'Completed'
    await supabase
        .from('order_events')
        .insert({
            order_id: id,
            status,
            note: `Order marked as ${statusText} by ${pharmacy.name}`
        })

    revalidatePath('/pharmacy/dashboard')
    return { success: true }
}
