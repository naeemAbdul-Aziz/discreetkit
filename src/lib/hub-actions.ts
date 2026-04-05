'use server'

import { createSupabaseServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

/**
 * FAANG-Level System Design: Clinical Hub Service
 * This service handles all interactions for Partner Hubs (Hospitals).
 * It enforces strict check for is_partner_hub capability.
 */

async function requirePartnerHub() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_partner_hub', true)
        .single();

    if (!pharmacy) {
        throw new Error('Access Denied: This account is not authorized as a Partner Hub.');
    }
    
    return { user, supabase, pharmacy };
}

export async function getHubAssignedSubscriptions() {
    const { pharmacy, supabase } = await requirePartnerHub();
    
    const { data: subscriptions, error } = await supabase
        .from('medication_refill_subscriptions')
        .select(`
            *,
            product:products(name, image_url)
        `)
        .eq('pharmacy_id', pharmacy.id)
        .order('next_delivery_date', { ascending: true });

    if (error) throw new Error(error.message);
    return subscriptions || [];
}

/**
 * Clinically verify a refill token.
 * This is the gatekeeper action for the first refill in the system.
 */
export async function verifyRefillToken(subscriptionId: string) {
    const { supabase } = await requirePartnerHub();

    const { error } = await supabase
        .from('medication_refill_subscriptions')
        .update({ 
            status: 'active',
            prescription_verified: true 
        })
        .eq('id', subscriptionId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath('/pharmacy/refills');
    return { success: true };
}

/**
 * Aggregates Hub-level analytics for the specialized dashboard.
 * FAANG-Level: Optimized for high-volume data points.
 */
export async function getHubAnalytics() {
    const { pharmacy, supabase } = await requirePartnerHub();

    // 1. Total Enrolled
    const { count: totalEnrolled } = await supabase
        .from('medication_refill_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('pharmacy_id', pharmacy.id);

    // 2. Adherence Snapshot (Last 30 Days)
    const { data: logs } = await supabase
        .from('refill_logs')
        .select('adherence_status')
        .eq('pharmacy_id', pharmacy.id)
        .gte('filled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const confirmed = logs?.filter(l => l.adherence_status === 'confirmed').length || 0;
    const totalLogs = logs?.length || 0;
    const adherenceRate = totalLogs > 0 ? (confirmed / totalLogs) * 100 : 100;

    return {
        totalEnrolled: totalEnrolled || 0,
        adherenceRate: Math.round(adherenceRate),
        trend: adherenceRate > 90 ? 'stable' : 'at_risk',
        hubInfo: {
            name: pharmacy.name,
            code: pharmacy.partner_code
        }
    };
}
