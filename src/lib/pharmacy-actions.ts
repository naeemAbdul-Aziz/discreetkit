
'use server';

import { createSupabaseServerClient, getUserRoles } from './supabase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
