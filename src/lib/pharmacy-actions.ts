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
        .select('*') // Select all fields as profile might need them
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) throw new Error('No pharmacy profile associated with this user.');
    
    return { user, supabase, pharmacy };
}

// --- Refill Portal Actions ---

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
            status: 'completed', 
            pharmacist_notes: notes,
            filled_at: new Date().toISOString()
        });

    if (logError) return { error: logError.message };

    // 2. Update Subscription Next Delivery Date
    const { data: sub } = await supabase
        .from('medication_refill_subscriptions')
        .select('frequency, next_delivery_date')
        .eq('id', subscriptionId)
        .single();
    
    if (sub) {
        let nextDate = new Date();
        // Simple logic: +1 or +3 months from NOW
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

// --- Inventory Management Actions ---

export async function getPharmacyInventory() {
    const { pharmacy, supabase } = await requirePharmacy();

    // Fetch all products
    const { data: allProducts, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name');
    
    if (prodError) throw new Error(prodError.message);

    // Fetch pharmacy specific overrides (availability, stock, custom price)
    const { data: pharmacyProducts, error: ppError } = await supabase
        .from('pharmacy_products')
        .select('*')
        .eq('pharmacy_id', pharmacy.id);

    if (ppError) throw new Error(ppError.message);

    // Merge data
    const mergedProducts = allProducts.map((p) => {
        const pp = pharmacyProducts.find((item) => item.product_id === p.id);
        return {
            id: p.id,
            name: p.name,
            category: p.category,
            price_ghs: p.price_ghs,
            image_url: p.image_url,
            requires_prescription: p.requires_prescription,
            // Pharmacy specific fields
            is_available: pp ? pp.is_available : false, // Default to unavailable if no record
            custom_stock: pp ? pp.stock_level : 0,
            custom_price: pp ? (pp.pharmacy_price_ghs || p.price_ghs) : p.price_ghs,
        };
    });

    return { products: mergedProducts, pharmacyId: pharmacy.id };
}

export async function toggleProductAvailability(pharmacyId: number, productId: number, isAvailable: boolean) {
    const { supabase } = await requirePharmacy(); // Security check inside

    // Use upsert to handle both insert (if first time) and update
    const { error } = await supabase
        .from('pharmacy_products')
        .upsert({
            pharmacy_id: pharmacyId,
            product_id: productId,
            is_available: isAvailable,
            last_updated: new Date().toISOString()
        }, { onConflict: 'pharmacy_id, product_id' });

    if (error) return { success: false, error: error.message };
    
    revalidatePath('/pharmacy/inventory');
    return { success: true };
}

export async function updateProductStock(pharmacyId: number, productId: number, stock: number) {
    const { supabase } = await requirePharmacy();

    const { error } = await supabase
        .from('pharmacy_products')
        .upsert({
            pharmacy_id: pharmacyId,
            product_id: productId,
            stock_level: stock,
            last_updated: new Date().toISOString()
        }, { onConflict: 'pharmacy_id, product_id' });

    if (error) return { success: false, error: error.message };
    
    revalidatePath('/pharmacy/inventory');
    return { success: true };
}

export async function requestNewProduct(_prevState: any, formData: FormData) {
    const { pharmacy, supabase } = await requirePharmacy();

    const productName = formData.get('productName') as string;
    const description = formData.get('description') as string;

    if (!productName) return { success: false, message: 'Product name is required' };

    const { error } = await supabase
        .from('product_requests')
        .insert({
            pharmacy_id: pharmacy.id,
            product_name: productName,
            description: description,
            status: 'pending'
        });

    if (error) return { success: false, message: error.message };

    return { success: true, message: 'Request submitted successfully' };
}

// --- Settings & Operational Actions ---

export async function getPharmacyProfile() {
    const { pharmacy } = await requirePharmacy();
    return pharmacy;
}

export async function getPharmacyServiceAreas() {
    const { pharmacy, supabase } = await requirePharmacy();
    
    const { data, error } = await supabase
        .from('pharmacy_service_areas')
        .select('*')
        .eq('pharmacy_id', pharmacy.id)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
}

export async function updatePharmacyOperationalSettings(_prevState: any, formData: FormData) {
    const { pharmacy, supabase } = await requirePharmacy();
    
    const is24_7 = formData.get('is_24_7') === 'on';
    
    const { error } = await supabase
        .from('pharmacies')
        .update({ is_24_7 })
        .eq('id', pharmacy.id);

    if (error) return { success: false, message: error.message };
    
    revalidatePath('/pharmacy/settings');
    return { success: true };
}

export async function addServiceArea(_prevState: any, formData: FormData) {
    const { pharmacy, supabase } = await requirePharmacy();

    const areaName = formData.get('areaName') as string;
    const deliveryFee = Number(formData.get('deliveryFee'));
    const maxDeliveryTime = Number(formData.get('maxDeliveryTime'));
    const minTime = Number(formData.get('minTime'));
    const maxTime = Number(formData.get('maxTime'));

    if (!areaName) return { error: 'Area name is required' };

    const { error } = await supabase
        .from('pharmacy_service_areas')
        .insert({
            pharmacy_id: pharmacy.id,
            area_name: areaName,
            delivery_fee: deliveryFee || 0,
            max_delivery_time_hours: maxDeliveryTime || 24,
            estimated_min_minutes: minTime || 30,
            estimated_max_minutes: maxTime || 120,
            is_active: true
        });

    if (error) return { error: error.message };

    revalidatePath('/pharmacy/settings');
    return { success: true };
}

export async function removeServiceArea(areaId: number) {
    const { pharmacy, supabase } = await requirePharmacy();

    const { error } = await supabase
        .from('pharmacy_service_areas')
        .delete()
        .eq('id', areaId)
        .eq('pharmacy_id', pharmacy.id); // Security check

    if (error) throw new Error(error.message);
    
    revalidatePath('/pharmacy/settings');
    return { success: true };
}
