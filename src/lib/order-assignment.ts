'use server'

import { createSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase"

/**
 * Delivery area to pharmacy mapping
 * Maps delivery locations to preferred pharmacy IDs
 */
const DELIVERY_AREA_MAPPING: Record<string, number[]> = {
    // Legon & UG Campus
    "Legon": [1], // Legon Campus Pharmacy
    "University of Ghana": [1],
    "UG": [1],

    // Osu & Oxford Street
    "Osu": [2], // Osu Oxford St Pharmacy
    "Oxford Street": [2],

    // East Legon
    "East Legon": [3], // East Legon Health Mart

    // Spintex
    "Spintex": [4], // Spintex Road Chemist

    // Dansoman
    "Dansoman": [5], // Dansoman Community Pharmacy

    // Kumasi
    "Kumasi": [6, 7], // Kumasi Central, KNUST
    "KNUST": [7, 6],
    "Adum": [6],

    // Tema
    "Tema": [8], // Tema Community 1
    "Community 1": [8],

    // Takoradi
    "Takoradi": [9], // Takoradi Market Circle
    "Market Circle": [9],

    // Tamale
    "Tamale": [10], // Tamale Teaching Hospital
}

/**
 * Auto-assign order to nearest pharmacy based on delivery area
 */
export async function autoAssignOrder(orderId: number, deliveryArea: string) {
    const supabase = getSupabaseAdminClient()

    // Find matching pharmacy IDs for this delivery area
    let pharmacyIds: number[] = []

    // Try exact match first
    if (DELIVERY_AREA_MAPPING[deliveryArea]) {
        pharmacyIds = DELIVERY_AREA_MAPPING[deliveryArea]
    } else {
        // Try partial match (case-insensitive)
        const normalizedArea = deliveryArea.toLowerCase()
        for (const [key, ids] of Object.entries(DELIVERY_AREA_MAPPING)) {
            if (normalizedArea.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedArea)) {
                pharmacyIds = ids
                break
            }
        }
    }

    // If no match found, return error for manual assignment
    if (pharmacyIds.length === 0) {
        return {
            error: "No pharmacy found for this delivery area",
            requiresManual: true
        }
    }

    // Get first available pharmacy (can be enhanced with stock/capacity checks)
    const pharmacyId = pharmacyIds[0]

    // Assign order to pharmacy
    const { error } = await supabase
        .from('orders')
        .update({
            pharmacy_id: pharmacyId,
            pharmacy_ack_status: 'pending'
        })
        .eq('id', orderId)

    if (error) {
        console.error('Order assignment failed:', error.message)
        return { error: error.message }
    }

    // Log event
    await supabase
        .from('order_events')
        .insert({
            order_id: orderId,
            status: 'assigned',
            note: `Order auto-assigned to pharmacy ${pharmacyId}`
        })

    // TODO: Send SMS notification to pharmacy
    // await notifyPharmacy(pharmacyId, orderId)

    return {
        success: true,
        pharmacyId,
        message: "Order auto-assigned successfully"
    }
}


/**
 * Manually assign order to specific pharmacy (admin override)
 */
export async function manuallyAssignOrder(orderId: number, pharmacyId: number) {
    const supabase = getSupabaseAdminClient()

    const { error } = await supabase
        .from('orders')
        .update({
            pharmacy_id: pharmacyId,
            pharmacy_ack_status: 'pending'
        })
        .eq('id', orderId)

    if (error) {
        console.error('Manual order assignment failed:', error.message)
        return { error: error.message }
    }

    // Log event
    await supabase
        .from('order_events')
        .insert({
            order_id: orderId,
            status: 'assigned',
            note: `Order manually assigned to pharmacy ${pharmacyId}`
        })

    return { success: true }
}

/**
 * Get available pharmacies for a delivery area
 */
export async function getAvailablePharmacies(deliveryArea: string) {
    const supabase = await createSupabaseServerClient()

    // Get pharmacy IDs for this area
    let pharmacyIds: number[] = []

    if (DELIVERY_AREA_MAPPING[deliveryArea]) {
        pharmacyIds = DELIVERY_AREA_MAPPING[deliveryArea]
    } else {
        const normalizedArea = deliveryArea.toLowerCase()
        for (const [key, ids] of Object.entries(DELIVERY_AREA_MAPPING)) {
            if (normalizedArea.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedArea)) {
                pharmacyIds = ids
                break
            }
        }
    }

    if (pharmacyIds.length === 0) {
        // Return all pharmacies if no match
        const { data: allPharmacies } = await supabase
            .from('pharmacies')
            .select('*')
            .order('name')

        return { pharmacies: allPharmacies || [] }
    }

    // Get specific pharmacies
    const { data: pharmacies } = await supabase
        .from('pharmacies')
        .select('*')
        .in('id', pharmacyIds)

    return { pharmacies: pharmacies || [] }
}
