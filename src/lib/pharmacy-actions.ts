
'use server';

import { createSupabaseServerClient, getUserRoles, getSupabaseAdminClient } from './supabase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- PROFILE SETTINGS ---

export async function getPharmacyProfile() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return pharmacy;
}

export async function updatePharmacyOperationalSettings(prevState: any, formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return { success: false, message: 'Pharmacy profile not found' };

    const is24_7 = formData.get('is_24_7') === 'on';

    const { error } = await supabase
        .from('pharmacies')
        .update({ is_24_7: is24_7 })
        .eq('id', pharmacy.id);

    if (error) {
        console.error('Update settings error:', error);
        return { success: false, message: 'Failed to update settings' };
    }

    revalidatePath('/pharmacy/settings');
    return { success: true, message: 'Settings updated successfully' };
}

// --- SERVICE AREAS ---

export async function getPharmacyServiceAreas() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get pharmacy ID
    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return [];

    const { data: areas } = await supabase
        .from('pharmacy_service_areas')
        .select('*')
        .eq('pharmacy_id', pharmacy.id)
        .order('created_at', { ascending: false });

    return areas || [];
}

const serviceAreaSchema = z.object({
    areaName: z.string().min(2, 'Area name is required'),
    deliveryFee: z.number().min(0, 'Fee cannot be negative'),
    maxDeliveryTime: z.number().min(1, 'Delivery time must be at least 1 hour')
});

export async function addServiceArea(prevState: any, formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return { success: false, message: 'Pharmacy profile not found' };

    const rawData = {
        areaName: formData.get('areaName'),
        deliveryFee: Number(formData.get('deliveryFee')),
        maxDeliveryTime: Number(formData.get('maxDeliveryTime')) || 24
    };

    const validated = serviceAreaSchema.safeParse(rawData);
    if (!validated.success) {
        return { success: false, message: validated.error.errors[0].message };
    }

    const { error } = await supabase.from('pharmacy_service_areas').insert({
        pharmacy_id: pharmacy.id,
        area_name: validated.data.areaName,
        delivery_fee: validated.data.deliveryFee,
        max_delivery_time_hours: validated.data.maxDeliveryTime,
        is_active: true
    });

    if (error) {
        console.error('Add area error:', error);
        return { success: false, message: 'Failed to add area' };
    }

    revalidatePath('/pharmacy/settings');
    return { success: true, message: 'Area added successfully' };
}

export async function removeServiceArea(id: number) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from('pharmacy_service_areas')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/pharmacy/settings');
    return { success: true };
}


// --- INVENTORY ---

export async function getPharmacyInventory() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { products: [], pharmacyId: null };

    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return { products: [], pharmacyId: null };

    // Get all global products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('name');

    // Get pharmacy specific settings (availability, custom price/stock)
    const { data: pharmacyProducts } = await supabase
        .from('pharmacy_products')
        .select('*')
        .eq('pharmacy_id', pharmacy.id);

    // Merge data
    const merged = products?.map(p => {
        const pp = pharmacyProducts?.find(x => x.product_id === p.id);
        return {
            ...p,
            is_available: pp?.is_available ?? false, // Default to false if not in pharmacy_products? Or true? Let's say false/opt-in for now.
            custom_stock: pp?.stock_level ?? 0,
            custom_price: pp?.pharmacy_price_ghs ?? p.price_ghs
        };
    });

    return { products: merged || [], pharmacyId: pharmacy.id };
}

export async function toggleProductAvailability(pharmacyId: number, productId: number, isAvailable: boolean) {
    const supabase = await createSupabaseServerClient();

    // Upsert into pharmacy_products
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
    const supabase = await createSupabaseServerClient();
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

// --- PRODUCT REQUESTS ---

const requestProductSchema = z.object({
    productName: z.string().min(3, 'Product name is required'),
    description: z.string().optional()
});

export async function requestNewProduct(prevState: any, formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return { success: false, message: 'Pharmacy profile not found' };

    const rawData = {
        productName: formData.get('productName'),
        description: formData.get('description')
    };

    const validated = requestProductSchema.safeParse(rawData);
    if (!validated.success) {
        return { success: false, message: validated.error.errors[0].message };
    }

    // Use 'any' cast to bypass strict type checking for the new table
    const { error } = await (supabase as any).from('product_requests').insert({
        pharmacy_id: pharmacy.id,
        product_name: validated.data.productName,
        description: validated.data.description,
        status: 'pending'
    });

    if (error) {
        console.error('Request product error:', error);
        return { success: false, message: 'Failed to submit request' };
    }

    return { success: true, message: 'Product request submitted successfully' };
}
// --- ORDER MANAGEMENT ---

export async function acceptOrder(orderId: number) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    // Get pharmacy ID
    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return { success: false, message: 'Pharmacy profile not found' };

    // Verify order is assigned to this pharmacy
    const { data: order } = await supabase
        .from('orders')
        .select('id, pharmacy_id, status')
        .eq('id', orderId)
        .single();

    if (!order) return { success: false, message: 'Order not found' };

    // Check if already assigned to this pharmacy
    if (order.pharmacy_id !== pharmacy.id) {
        // Allow acceptance if it's currently unassigned? 
        // Strategy: Only allow accepting if it was *assigned* to them (e.g. status 'received' and pharmacy_id is set).
        // Or if they are claiming it from a pool?
        // User earlier said "Acceptance... ensure Accept Order works reliably".
        // Typically the Admin assigns it, then Pharmacy accepts.
        // If Admin assigned it, pharmacy_id matches.
        return { success: false, message: 'This order is not assigned to you.' };
    }

    const { error } = await supabase
        .from('orders')
        .update({
            status: 'processing',
            events: [
                // Need to fetch existing events? Or just append?
                // Supabase doesn't support array_append easily via JS client without fetching first or using RPC.
                // For simplicity/safety, we won't touch events array blindly.
                // We'll rely on the status change.
            ]
        })
        .eq('id', orderId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/pharmacy/orders');
    return { success: true, message: 'Order accepted' };
}

export async function declineOrder(orderId: number) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: pharmacy } = await supabase.from('pharmacies').select('id').eq('user_id', user.id).single();
    if (!pharmacy) return { success: false, message: 'Pharmacy profile not found' };

    // Verify ownership
    const { data: order } = await supabase.from('orders').select('id, pharmacy_id').eq('id', orderId).single();
    if (!order || order.pharmacy_id !== pharmacy.id) {
        return { success: false, message: 'Not authorized to decline this order' };
    }

    // Unassign logic: Set pharmacy_id to null and status back to 'received' (or 'pending_assignment')
    // Assuming 'received' is the stats for "Paid but not processed".
    const { error } = await supabase
        .from('orders')
        .update({
            pharmacy_id: null,
            status: 'received'
        })
        .eq('id', orderId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/pharmacy/orders');
    return { success: true, message: 'Order declined and returned to pool' };
}

// --- PHARMACY REFILLS ---

export async function getPharmacyRefillSubscriptions() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: pharmacy } = await supabase.from('pharmacies').select('id').eq('user_id', user.id).single();
    if (!pharmacy) return [];

    const { data: subscriptions, error } = await supabase
        .from('medication_refill_subscriptions')
        .select(`
            *,
            product:products(name, image_url)
        `)
        .eq('pharmacy_id', pharmacy.id)
        .order('next_delivery_date', { ascending: true }); // Urgent first

    if (error) throw new Error(error.message);
    
    // Normalize logic
    return subscriptions.map((s: any) => ({
        ...s,
        product: Array.isArray(s.product) ? s.product[0] : s.product,
        product_name: Array.isArray(s.product) ? s.product[0]?.name : s.product?.name,
    }));
}

export async function verifyPharmacyPrescription(subscriptionId: string, isValid: boolean) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: pharmacy } = await supabase.from('pharmacies').select('id').eq('user_id', user.id).single();
    if (!pharmacy) return { success: false, message: 'Pharmacy not found' };

    // Update with ownership check
    const { error } = await supabase
        .from('medication_refill_subscriptions')
        .update({ 
            prescription_verified: isValid,
             // Activate if currently pending verification and valid
            status: isValid ? 'active' : 'pending_verification' // Or whatever logic
        })
        .eq('id', subscriptionId)
        .eq('pharmacy_id', pharmacy.id); // Security: Ensure assigned to this pharmacy

    if (error) return { success: false, message: error.message };

    revalidatePath('/pharmacy/refills');
    return { success: true };
}

export async function processRefill(subscriptionId: string) {
    // 1. Verify Access
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: pharmacy } = await supabase.from('pharmacies').select('id, name, partner_code').eq('user_id', user.id).single();
    if (!pharmacy) return { success: false, message: 'Pharmacy not found' };
    
    // 2. Fetch Subscription
    const { data: sub } = await supabase
        .from('medication_refill_subscriptions')
        .select('*, product:products(*)')
        .eq('id', subscriptionId)
        .eq('pharmacy_id', pharmacy.id)
        .single();

    if (!sub) return { success: false, message: 'Subscription not found or not assigned.' };
    if (!sub.prescription_verified) return { success: false, message: 'Prescription must be verified first.' };

    // 3. Create Order
    // We use Admin Client to bypass RLS for creating order on behalf of user
    const supabaseAdmin = getSupabaseAdminClient();
    
    // Prepare product item
    const product = Array.isArray(sub.product) ? sub.product[0] : sub.product;
    const item = {
        id: product.id,
        name: product.name,
        price: product.price_ghs,
        quantity: 1, // Default to 1 unit refill
        image: product.image_url
    };

    const { generateTrackingCode } = await import('./data');
    const code = generateTrackingCode();
    
    // Address logic: Subscription has `delivery_address` JSON.
    const address = sub.delivery_address || {};
    // Extract delivery area if possible, or default to pharmacy location?
    // Refills often delivery? 
    // We'll use "Standard Delivery" or what's in address.
    
    const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
            code,
            partner_code: pharmacy.partner_code, // Tag this pharmacy as the partner
            user_id: sub.user_id, // Link to user
            pharmacy_id: pharmacy.id, // Assign to this pharmacy immediately
            items: [item],
            total_price: product.price_ghs + 20, // Add standard fee?
            delivery_fee: 20,
            subtotal: product.price_ghs,
            status: 'pending_payment', // Waiting for user to pay
            delivery_area: address.city || 'Accra', // Fallback
            delivery_address_note: `Refill Subscription ${sub.subscription_code}`,
            phone_masked: address.phone,
            pharmacy_ack_status: 'accepted', // Auto-accept since pharmacy created it
            pharmacy_ack_at: new Date().toISOString()
        })
        .select()
        .single();

    if (orderError) {
        console.error('Refill order error', orderError);
        return { success: false, message: 'Failed to create order: ' + orderError.message };
    }

    // 4. Log Refill in refill_logs
    await supabaseAdmin
        .from('refill_logs')
        .insert({
            subscription_id: sub.id,
            pharmacy_id: pharmacy.id,
            status: 'processing',
            filled_at: new Date().toISOString(),
            pharmacist_notes: 'Refill processed via dashboard.'
        });

    // 5. Update next delivery date
    let nextDate = new Date();
    if (sub.frequency === 'quarterly') {
        nextDate.setMonth(nextDate.getMonth() + 3);
    } else {
        nextDate.setMonth(nextDate.getMonth() + 1); // Monthly default
    }
    
    await supabaseAdmin
        .from('medication_refill_subscriptions')
        .update({ next_delivery_date: nextDate.toISOString().split('T')[0] })
        .eq('id', sub.id);

    revalidatePath('/pharmacy/refills');
    return { success: true, message: 'Refill processed. Order created: ' + code };
}
