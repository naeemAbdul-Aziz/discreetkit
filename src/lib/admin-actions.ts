
'use server'

export async function getProducts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
}

import { createSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema for product validation
const productSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    price_ghs: z.number(),
    stock_level: z.number(),
    image_url: z.string().optional(),
    description: z.string().optional(),
    featured: z.boolean().optional(),
    requires_prescription: z.boolean().optional(),
    is_student_product: z.boolean().optional(),
    status: z.enum(['active', 'draft', 'archived']).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export async function upsertProduct(data: ProductFormValues) {
    const supabase = await createSupabaseServerClient();
    const validated = productSchema.parse(data);

    const payload: any = {
        name: validated.name,
        category: validated.category,
        price_ghs: validated.price_ghs,
        stock_level: validated.stock_level,
        image_url: validated.image_url,
        description: validated.description,
        featured: validated.featured,
        requires_prescription: validated.requires_prescription,
        is_student_product: validated.is_student_product,
    };

    if (validated.id) {
        payload.id = validated.id;
    }

    const { error } = await supabase
        .from('products')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        console.error('Upsert Error:', error);
        return { error: error.message };
    }

    revalidatePath('/admin/products');
    return { success: true };
}

export async function deleteProduct(id: number) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/products')
    return { success: true }
}

// Partial field update for inline editing
export async function updateProductField(id: number, patch: Partial<ProductFormValues>) {
    const supabase = await createSupabaseServerClient();
    // Validate only provided keys by merging with existing schema defaults
    // Fetch existing product to build a full object if necessary
    const { data: existing, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
    if (fetchError) return { error: fetchError.message };
    const merged = { ...existing, ...patch };
    // Parse with full schema to ensure integrity
    try {
        productSchema.parse(merged);
    } catch (e: any) {
        return { error: e.message };
    }
    const { error } = await supabase
        .from('products')
        .update(patch)
        .eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/products');
    return { success: true };
}

// --- Pharmacies ---

const pharmacySchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    contact_person: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    user_email: z.string().email().optional().or(z.literal("")),
    user_password: z.string().min(6).optional().or(z.literal("")),
})

export type PharmacyFormValues = z.infer<typeof pharmacySchema>

export async function getPharmacies() {
    const supabase = await createSupabaseServerClient();
    const { data: pharmacies, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!pharmacies) return [];

    // Collect user_ids to enrich with auth user emails
    const userIds = pharmacies.filter(p => p.user_id).map(p => p.user_id);
    let userMap: Record<string, { id: string; email: string | null }> = {};
    if (userIds.length) {
        // listUsers does not support filtering; fetch a page large enough then map
        const perPage = Math.max(userIds.length, 100); // safety upper bound
        const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage });
        if (listData?.users) {
            for (const u of listData.users) {
                if (userIds.includes(u.id)) {
                    userMap[u.id] = { id: u.id, email: u.email ?? null };
                }
            }
        }
    }

    // Return enriched pharmacies with a `user` object similar to previous join shape
    return pharmacies.map(p => ({
        ...p,
        user: p.user_id ? userMap[p.user_id] ?? null : null,
    }));
}

export async function upsertPharmacy(data: PharmacyFormValues) {
    const supabase = await createSupabaseServerClient()
    const validated = pharmacySchema.parse(data)

    const payload: any = {
        name: validated.name,
        location: validated.location,
        contact_person: validated.contact_person,
        phone_number: validated.phone_number,
        email: validated.email,
    }

    if (validated.id) payload.id = validated.id

    const { error } = await supabase
        .from('pharmacies')
        .upsert(payload)

    if (error) return { error: error.message }

    revalidatePath('/admin/partners')
    return { success: true }
}

export async function createPharmacyWithUser(data: PharmacyFormValues) {
    try {
        if (!process.env.SUPABASE_SERVICE_KEY) {
            console.error("Missing SUPABASE_SERVICE_KEY")
            return { error: "Server configuration error: Missing service key" }
        }

        const supabase = getSupabaseAdminClient()
        const validated = pharmacySchema.parse(data)

        // Create pharmacy first
        const pharmacyPayload: any = {
            name: validated.name,
            location: validated.location,
            contact_person: validated.contact_person,
            phone_number: validated.phone_number,
            email: validated.email,
        }

        const { data: pharmacy, error: pharmacyError } = await supabase
            .from('pharmacies')
            .insert(pharmacyPayload)
            .select()
            .single()

        if (pharmacyError) return { error: pharmacyError.message }

        // Create user if email and password provided
        if (validated.user_email && validated.user_password) {
            // Use admin client for user creation
            const adminSupabase = getSupabaseAdminClient();
            const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
                email: validated.user_email,
                password: validated.user_password,
                email_confirm: true,
            });

            if (authError) {
                // Rollback pharmacy creation
                await supabase.from('pharmacies').delete().eq('id', pharmacy.id);
                return { error: `Failed to create user: ${authError.message}` };
            }

            // Assign pharmacy role
            const { data: roleData } = await supabase
                .from('roles')
                .select('id')
                .eq('name', 'pharmacy')
                .single();

            if (roleData) {
                await supabase.from('user_roles').insert({
                    user_id: authData.user.id,
                    role_id: roleData.id,
                });
            }

            // Link user to pharmacy
            await supabase
                .from('pharmacies')
                .update({ user_id: authData.user.id })
                .eq('id', pharmacy.id);
        }

        revalidatePath('/admin/partners')
        return { success: true }
    } catch (error: any) {
        console.error("createPharmacyWithUser error:", error)
        return { error: error.message || "Failed to create pharmacy with user" }
    }
}

export async function linkPharmacyUser(pharmacyId: number, userEmail: string, password: string) {
    // Use admin client for user creation
    const adminSupabase = getSupabaseAdminClient();
    const supabase = getSupabaseAdminClient();

    // Create user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: userEmail,
        password: password,
        email_confirm: true,
    });

    if (authError) return { error: authError.message };

    // Assign pharmacy role
    const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'pharmacy')
        .single();

    if (roleData) {
        await supabase.from('user_roles').insert({
            user_id: authData.user.id,
            role_id: roleData.id,
        })
    }

    // Link to pharmacy
    const { error } = await supabase
        .from('pharmacies')
        .update({ user_id: authData.user.id })
        .eq('id', pharmacyId)

    if (error) return { error: error.message }

    revalidatePath('/admin/partners')
    return { success: true }
}

export async function unlinkPharmacyUser(pharmacyId: number) {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase
        .from('pharmacies')
        .update({ user_id: null })
        .eq('id', pharmacyId)

    if (error) return { error: error.message }

    revalidatePath('/admin/partners')
    return { success: true }
}

export async function deletePharmacy(id: number) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('pharmacies')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/partners')
    return { success: true }
}

// --- Orders ---

export async function getOrders() {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            pharmacies (name)
        `)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    // Normalize data to ensure pharmacies is an object or null, not an array
    const normalizedOrders = data.map((order: any) => ({
        ...order,
        pharmacies: Array.isArray(order.pharmacies) ? order.pharmacies[0] || null : order.pharmacies
    }))

    return normalizedOrders
}

export async function updateOrderStatus(id: number, status: string) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/orders')
    return { success: true }
}

export async function assignPharmacy(orderId: number, pharmacyId: number) {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase
        .from('orders')
        .update({ pharmacy_id: pharmacyId, status: 'processing' }) // Auto-move to processing on assignment
        .eq('id', orderId)

    if (error) return { error: error.message }

    revalidatePath('/admin/orders')
    return { success: true }
}

// Bulk update order statuses
export async function bulkUpdateOrderStatus(ids: number[], status: string) {
    const allowed = ['pending_payment', 'received', 'processing', 'out_for_delivery', 'completed']
    if (!allowed.includes(status)) {
        return { error: 'Invalid status' }
    }
    if (!ids.length) return { error: 'No orders selected' }
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .in('id', ids)
    if (error) return { error: error.message }
    revalidatePath('/admin/orders')
    return { success: true }
}

// --- Store Settings ---

const settingsSchema = z.object({
    store_name: z.string().min(1, "Store name is required"),
    support_email: z.string().email("Invalid email address"),
    support_phone: z.string().min(1, "Phone number is required"),
    notifications_new_orders: z.boolean(),
    notifications_low_stock: z.boolean(),
    notifications_partner_signup: z.boolean(),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>

import { fetchStoreSettings } from "./queries"

export async function getStoreSettings() {
    return await fetchStoreSettings()
}

export async function updateStoreSettings(data: SettingsFormValues) {
    const supabase = await createSupabaseServerClient()
    const validated = settingsSchema.parse(data)

    const { error } = await supabase
        .from('store_settings')
        .update({
            store_name: validated.store_name,
            support_email: validated.support_email,
            support_phone: validated.support_phone,
            notifications_new_orders: validated.notifications_new_orders,
            notifications_low_stock: validated.notifications_low_stock,
            notifications_partner_signup: validated.notifications_partner_signup,
            updated_at: new Date().toISOString(),
        })
        .eq('id', 1) // Always update the single row

    if (error) return { error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/settings')
    return { success: true }
}
