'use server'

import { createSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Helper to ensure user is a pharmacy staff
async function requirePharmacy() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check role from user_roles (or simplified check if we trust the route protection)
    // We'll trust route protection but verify we can get the pharmacy ID
    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) throw new Error('No pharmacy profile associated with this user.');
    
    return { user, supabase, pharmacy };
}

export async function getAssignedSubscriptions() {
    const { pharmacy, supabase } = await requirePharmacy();
    
    // Fetch subscriptions assigned to this pharmacy
    const { data: subscriptions, error } = await supabase
        .from('medication_refill_subscriptions')
        .select(`
            id,
            subscription_code,
            status,
            frequency,
            next_delivery_date,
            enrolled_at,
            user_id,
            prescription_verified,
            prescription_document_url,
            delivery_address,
            product:products(name, image_url)
        `)
        .eq('pharmacy_id', pharmacy.id)
        .order('next_delivery_date', { ascending: true });

    if (error) throw new Error(error.message);
    if (!subscriptions) return [];

    // Fetch User Details for contacts
    // Since we need to show contact info even for anonymous users (stored in table or delivery_address), 
    // we also try to fetch registered user emails if available.
    const userIds = [...new Set(subscriptions.map((s: any) => s.user_id).filter(Boolean))];
    let userMap: Record<string, { email: string | null, name: string | null }> = {};

    if (userIds.length > 0) {
        const adminSupabase = getSupabaseAdminClient();
        const { data: userData } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
        if (userData?.users) {
            userData.users.forEach(u => {
                if (userIds.includes(u.id)) {
                    userMap[u.id] = { 
                        email: u.email ?? null,
                        name: u.user_metadata?.name || null
                    };
                }
            });
        }
    }

    return subscriptions.map((s: any) => ({
        ...s,
        user_email: s.user_id ? (userMap[s.user_id]?.email || 'Unknown User') : null,
        user_name: s.user_id ? (userMap[s.user_id]?.name || 'Anonymous') : null,
        product: Array.isArray(s.product) ? s.product[0] : s.product,
        product_name: Array.isArray(s.product) ? s.product[0]?.name : s.product?.name,
    }));
}

export async function logRefill(subscriptionId: string, notes: string) {
    const { pharmacy, supabase } = await requirePharmacy();

    // 1. Create Log Entry
    const { error: logError } = await supabase
        .from('refill_logs')
        .insert({
            subscription_id: subscriptionId,
            pharmacy_id: pharmacy.id,
            status: 'completed', // Direct to completed for now, or 'ready_for_pickup'
            pharmacist_notes: notes,
            filled_at: new Date().toISOString()
        });

    if (logError) return { error: logError.message };

    // 2. Update Subscription Next Delivery Date
    // We need to calculate based on frequency. 
    // Fetch current frequency first.
    const { data: sub } = await supabase
        .from('medication_refill_subscriptions')
        .select('frequency, next_delivery_date')
        .eq('id', subscriptionId)
        .single();
    
    if (sub) {
        const currentNext = new Date(sub.next_delivery_date || Date.now());
        const confirmDate = new Date(); // Or use the scheduled date? Let's bump from *today* or *schedule*?
        // Usually bump from schedule if consistent, or today if late.
        // Let's simplified: Bump +1 Month or +3 Months from TODAY.
        
        let nextDate = new Date();
        if (sub.frequency === 'quarterly') {
            nextDate.setMonth(nextDate.getMonth() + 3);
        } else {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }

        await supabase
            .from('medication_refill_subscriptions')
            .update({ next_delivery_date: nextDate.toISOString() })
            .eq('id', subscriptionId);
    }

    revalidatePath('/pharmacy/refills');
    return { success: true };
}
