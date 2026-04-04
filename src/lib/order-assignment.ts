'use server'

import { createSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase"
import { logger } from "@/lib/logger"

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

    // HYBRID APPROACH: Check if there's only one active pharmacy
    const { data: allPharmacies, error: pharmacyError } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('is_active', true);

    if (pharmacyError) {
        logger.error('Error fetching pharmacies', { context: 'Order-Assignment', data: pharmacyError });
        return { pharmacyId: null, reason: 'Database error' };
    }

    // If only one pharmacy, assign directly (skip service area check)
    if (allPharmacies && allPharmacies.length === 1) {
        const singlePharmacyId = allPharmacies[0].id;
        logger.info('Single pharmacy auto-assignment', { context: 'Order-Assignment', data: { pharmacyId: singlePharmacyId } });
        
        // Still check stock availability
        const { data: stockData } = await supabase
            .from('pharmacy_products')
            .select('product_id, stock_level, is_available')
            .eq('pharmacy_id', singlePharmacyId)
            .in('product_id', items.map(i => i.id));

        let hasStock = true;
        if (!stockData) {
            hasStock = false;
        } else {
            for (const item of items) {
                const productStock = stockData.find(p => p.product_id === item.id);
                if (!productStock || !productStock.is_available || productStock.stock_level < item.quantity) {
                    hasStock = false;
                    logger.warn('Single pharmacy lacks stock', { context: 'Order-Assignment', data: { pharmacyId: singlePharmacyId, productId: item.id } });
                    break;
                }
            }
        }

        if (!hasStock) {
            return { pharmacyId: null, reason: 'Pharmacy lacks sufficient stock' };
        }

        return {
            pharmacyId: singlePharmacyId,
            reason: 'Single pharmacy auto-assigned'
        };
    }

    // MULTI-PHARMACY LOGIC: Find pharmacies that cover the delivery area
    logger.debug('Multi-pharmacy area match start', { context: 'Order-Assignment', data: { deliveryArea } });
    const { data: serviceAreas, error: areaError } = await supabase
        .from('pharmacy_service_areas')
        .select('pharmacy_id, delivery_fee, max_delivery_time_hours')
        .ilike('area_name', `%${deliveryArea}%`)
        .eq('is_active', true)

    if (areaError) {
        logger.error('Error fetching service areas', { context: 'Order-Assignment', data: areaError });
    }

    if (areaError || !serviceAreas || serviceAreas.length === 0) {
        logger.warn('No service areas found', { context: 'Order-Assignment', data: { deliveryArea } });
        
        // --- WHATSAPP FALLBACK ---
        if (deliveryArea === 'WhatsApp') {
            logger.info('WhatsApp order fallback trial', { context: 'Order-Assignment' });
            // Get all active pharmacies
            const { data: activePharmacies } = await supabase
                .from('pharmacies')
                .select('id')
                .eq('is_active', true);
            
            if (activePharmacies && activePharmacies.length > 0) {
                // Return the first one for now (or rank by total deliveries if we had that)
                return { 
                    pharmacyId: activePharmacies[0].id, 
                    reason: 'WhatsApp Fallback: Assigned to first active pharmacy' 
                };
            }
        }
        
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
            logger.debug('Candidate lacks stock', { context: 'Order-Assignment', data: { pharmacyId } });
        }
    }

    if (validCandidates.length === 0) {
        logger.warn('No valid candidates found with stock', { context: 'Order-Assignment', data: { deliveryArea } });
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

    logger.info('Best match found', { context: 'Order-Assignment', data: { deliveryArea, pharmacyId: validCandidates[0].pharmacyId } });

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
        // Log failure (User Friendly)
        const { createOrderEvent } = await import('@/lib/event-messages');
        await createOrderEvent(supabase, orderId, 'optimization_in_progress');
        // Log technical reason internally
        logger.warn('Auto-assignment failed', { context: 'Order-Assignment', data: { orderId, reason } });
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

    // Log success (User Friendly)
    const { createOrderEvent } = await import('@/lib/event-messages');
    await createOrderEvent(supabase, orderId, 'packed');

    // Trigger notification (async)
    const { assignPharmacyInternal } = await import('@/lib/admin-actions')

    // Use internal function to bypass auth check (since this runs in webhook/background)
    await assignPharmacyInternal(supabase, orderId, pharmacyId)

    return { success: true, pharmacyId }
}
