'use server'

import { createSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase"

/**
 * Find the best pharmacy for an order based on:
 * 1. Coverage (must cover the area)
 * 2. Stock Availability (must have all items)
 * 3. Cost (lowest delivery fee)
 * 4. Speed (fastest delivery time)
 */
export async function findBestPharmacyForOrder(
    items: { id: number; quantity: number }[],
    deliveryArea: string
): Promise<{ pharmacyId: number | null; reason: string }> {
    const supabase = getSupabaseAdminClient()

    // 1. Find pharmacies that cover the delivery area
    console.log(`[findBestPharmacyForOrder] Searching for pharmacies in area: ${deliveryArea}`);
    const { data: serviceAreas, error: areaError } = await supabase
        .from('pharmacy_service_areas')
        .select('pharmacy_id, delivery_fee, max_delivery_time_hours')
        .ilike('area_name', `%${deliveryArea}%`)
        .eq('is_active', true)

    if (areaError) {
        console.error('[findBestPharmacyForOrder] Error fetching service areas:', areaError);
    }

    if (areaError || !serviceAreas || serviceAreas.length === 0) {
        console.warn(`[findBestPharmacyForOrder] No service areas found matching: ${deliveryArea}`);
        return { pharmacyId: null, reason: `No pharmacy covers area: ${deliveryArea}` }
    }

    // Get unique pharmacy IDs
    const candidatePharmacyIds = Array.from(new Set(serviceAreas.map(sa => sa.pharmacy_id)))

    // 2. Check stock availability for each candidate
    const validCandidates = []

    for (const pharmacyId of candidatePharmacyIds) {
        // Check if pharmacy has enough stock for ALL items
        let hasStock = true

        // Get pharmacy stock for requested items
        const { data: stockData } = await supabase
            .from('pharmacy_products')
            .select('product_id, stock_level, is_available')
            .eq('pharmacy_id', pharmacyId)
            .in('product_id', items.map(i => i.id))

        if (!stockData) {
            hasStock = false
        } else {
            for (const item of items) {
                const productStock = stockData.find(p => p.product_id === item.id)
                if (!productStock || !productStock.is_available || productStock.stock_level < item.quantity) {
                    hasStock = false
                    break
                }
            }
        }

        if (hasStock) {
            // Find the specific service area details for this pharmacy (in case of multiple matches, take best)
            const areaDetails = serviceAreas
                .filter(sa => sa.pharmacy_id === pharmacyId)
                .sort((a, b) => a.delivery_fee - b.delivery_fee)[0] // Take cheapest if multiple matches

            validCandidates.push({
                pharmacyId,
                deliveryFee: areaDetails.delivery_fee,
                maxTime: areaDetails.max_delivery_time_hours
            })
        } else {
            console.log(`[findBestPharmacyForOrder] Pharmacy #${pharmacyId} covers area but lacks stock.`);
        }
    }

    if (validCandidates.length === 0) {
        console.warn(`[findBestPharmacyForOrder] Pharmacies found in area but none have sufficient stock.`);
        return { pharmacyId: null, reason: "Pharmacies found in area but none have sufficient stock." }
    }

    // 3. Rank candidates
    // Priority: Lowest Fee -> Fastest Time
    validCandidates.sort((a, b) => {
        if (a.deliveryFee !== b.deliveryFee) {
            return a.deliveryFee - b.deliveryFee
        }
        return a.maxTime - b.maxTime
    })

    console.log(`[findBestPharmacyForOrder] Found ${validCandidates.length} valid candidates for area ${deliveryArea}. Best match: Pharmacy #${validCandidates[0].pharmacyId}`);

    return {
        pharmacyId: validCandidates[0].pharmacyId,
        reason: `Best match: Fee ${validCandidates[0].deliveryFee}, Time ${validCandidates[0].maxTime}h`
    }
}

/**
 * Auto-assign order wrapper
 */
export async function autoAssignOrder(orderId: number, deliveryArea: string, items: any[]) {
    const supabase = getSupabaseAdminClient()

    // Parse items if needed
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items
    // Map to simple structure for algorithm
    const simpleItems = parsedItems.map((i: any) => ({ id: i.id, quantity: i.quantity || 1 }))

    const { pharmacyId, reason } = await findBestPharmacyForOrder(simpleItems, deliveryArea)

    if (!pharmacyId) {
        // Log failure
        await supabase.from('order_events').insert({
            order_id: orderId,
            status: 'Assignment Failed',
            note: `Auto-assignment failed: ${reason}. Pending manual assignment.`
        })
        return { success: false, reason }
    }

    // Assign
    const { error } = await supabase
        .from('orders')
        .update({
            pharmacy_id: pharmacyId,
            pharmacy_ack_status: 'pending'
        })
        .eq('id', orderId)

    if (error) return { success: false, error: error.message }

    // Log success
    await supabase.from('order_events').insert({
        order_id: orderId,
        status: 'Auto-Assigned',
        note: `Order assigned to pharmacy #${pharmacyId}. Logic: ${reason}`
    })

    // Trigger notification (async)
    const { assignPharmacy } = await import('@/lib/admin-actions')
    // We re-call assignPharmacy to handle notifications, but since we already updated the DB, 
    // maybe we should just call the notification part. 
    // Actually, assignPharmacy does the update AND notification. 
    // Let's just call assignPharmacy directly if we found a match? 
    // But assignPharmacy takes ID. 
    // Let's just let assignPharmacy handle the update to be safe and consistent.

    await assignPharmacy(orderId, pharmacyId)

    return { success: true, pharmacyId }
}
