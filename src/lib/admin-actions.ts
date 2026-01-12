'use server'

import { createSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Helper for Admin Authorization
async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { getUserRoles, getSupabaseAdminClient } = await import('@/lib/supabase');
    // Use admin client to check roles if needed, or rely on getUserRoles which uses a passed client.
    // getUserRoles takes (supabase, userId). We can use the standard client for reading public user_roles if generic,
    // but usually roles table has RLS. Let's use the admin client to be sure we can read roles.
    const adminClient = getSupabaseAdminClient();
    const roles = await getUserRoles(adminClient, user.id);

    const userEmail = user.email?.toLowerCase() || '';
    const adminWhitelist = (process.env.ADMIN_EMAIL_WHITELIST || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

    if (!roles.includes('admin') && !adminWhitelist.includes(userEmail)) {
        throw new Error('Unauthorized: Admin access required');
    }
    return { user, supabase };
}

export async function getProducts() {
    const supabase = await createSupabaseServerClient();
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            pharmacy_products (
                stock_level,
                is_available
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Aggregate stock from all pharmacies
    return products.map((product: any) => {
        const totalStock = product.pharmacy_products
            ? product.pharmacy_products.reduce((acc: number, curr: any) => {
                // Only count stock if it's marked as available? 
                // User requirement "30 49 23 12" implies raw sum.
                // We'll sum all stock, but maybe we should flag if unavailable.
                return acc + (curr.stock_level || 0);
            }, 0)
            : 0;

        // Use manual stock if no pharmacy stock exists (fallback/hybrid)
        // Or strictly override? User asked "if 4... will result be total?". Implies override.
        // We will use totalStock if > 0, otherwise fallback to manual inventory (legacy support)
        const finalStock = totalStock > 0 ? totalStock : (product.stock_level || 0);

        return {
            ...product,
            stock_level: finalStock,
            // Keep original for debugging if needed
            manual_stock_level: product.stock_level
        };
    });
}

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
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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
        // Use Admin Client for Auth operations
        const adminSupabase = getSupabaseAdminClient();

        // listUsers does not support filtering by ID array; fetch a page large enough then map
        // Increased safety buffer to 1000 to catch users if total user count is moderate
        const perPage = Math.max(userIds.length * 2, 1000);
        const { data: listData } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage });

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

export async function searchPharmacies(query: string, deliveryArea?: string) {
    const supabase = await createSupabaseServerClient()

    // If deliveryArea is provided, we want to find pharmacies that cover this area first.
    // However, exact text match on 'area_name' might be tricky if user typed "Legon Campus".
    // We'll try a flexible approach: 
    // 1. Get IDs of pharmacies serving the area (if any)
    // 2. Perform the name search
    // 3. Mark matches

    let recommendedIds: number[] = [];

    if (deliveryArea) {
        // Simple case-insensitive match. 
        // Ideally, we'd use Full Text Search or PostGIS for locations, but this is a text-based start.
        const { data: areas } = await supabase
            .from('pharmacy_service_areas')
            .select('pharmacy_id')
            .ilike('area_name', `%${deliveryArea}%`) // Partial match

        if (areas) {
            recommendedIds = areas.map(a => a.pharmacy_id);
        }
    }

    let queryBuilder = supabase
        .from('pharmacies')
        .select('id, name, is_24_7')
        .limit(20)

    if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`)
    }

    const { data: pharmacies, error } = await queryBuilder.order('name')

    if (error) {
        console.error('Error searching pharmacies:', error)
        return []
    }

    if (!pharmacies) return []

    // If we have recommendations, we might want to ensure they are included or at least marked
    const result = pharmacies.map(p => ({
        ...p,
        recommended: recommendedIds.includes(p.id)
    }));

    // If we have recommended IDs but they weren't in the top 20 text results, fetch them explicitly?
    // For now, let's just mark the ones that ARE in the results. 
    // Refinement: If query is empty but deliveryArea is set, we should return all recommended pharmacies!

    if (!query && deliveryArea && recommendedIds.length > 0) {
        // Fetch specific recommended pharmacies if no name search was done
        const { data: recommended } = await supabase
            .from('pharmacies')
            .select('id, name, is_24_7')
            .in('id', recommendedIds);


        if (recommended) {
            // Merge unique
            const existingIds = new Set(result.map(r => r.id));
            recommended.forEach(r => {
                if (!existingIds.has(r.id)) {
                    result.unshift({ ...r, recommended: true, is_24_7: r.is_24_7 });
                }
            });
        }
    }

    // Sort: Recommended first
    result.sort((a, b) => (a.recommended === b.recommended ? 0 : a.recommended ? -1 : 1));

    return result
}

export async function upsertPharmacy(data: PharmacyFormValues) {
    await requireAdmin();
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
    await requireAdmin();
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
            let userId = null;

            // Try to create the user
            const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
                email: validated.user_email,
                password: validated.user_password,
                email_confirm: true,
            });

            if (authError) {
                // If user already exists, try to find them
                if (authError.message.includes("already registered") || authError.status === 422) {
                    console.log(`User ${validated.user_email} already exists, attempting to link...`);

                    // List users to find the existing one (Supabase Admin API doesn't have getUserByEmail)
                    // We fetch a reasonable number of users. In production with thousands of users, 
                    // this might need a more robust search or direct DB query if possible.
                    const { data: listData, error: listError } = await adminSupabase.auth.admin.listUsers({
                        perPage: 1000
                    });

                    if (listError) {
                        await supabase.from('pharmacies').delete().eq('id', pharmacy.id);
                        return { error: `Failed to list users to find existing account: ${listError.message}` };
                    }

                    const existingUser = listData.users.find(u => u.email?.toLowerCase() === validated.user_email?.toLowerCase());

                    if (existingUser) {
                        userId = existingUser.id;
                    } else {
                        await supabase.from('pharmacies').delete().eq('id', pharmacy.id);
                        return { error: "User exists but could not be found in user list." };
                    }
                } else {
                    // Real error
                    await supabase.from('pharmacies').delete().eq('id', pharmacy.id);
                    return { error: `Failed to create user: ${authError.message}` };
                }
            } else {
                userId = authData.user.id;
            }

            if (userId) {
                // Assign pharmacy role
                const { data: roleData } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('name', 'pharmacy')
                    .single();

                if (roleData) {
                    // Check if role already assigned
                    const { error: roleAssignError } = await supabase.from('user_roles').insert({
                        user_id: userId,
                        role_id: roleData.id,
                    });
                    // Ignore duplicate key error if role already exists
                    if (roleAssignError && !roleAssignError.message.includes('duplicate key')) {
                        console.error("Error assigning role:", roleAssignError);
                    }
                }

                // Link user to pharmacy
                await supabase
                    .from('pharmacies')
                    .update({ user_id: userId })
                    .eq('id', pharmacy.id);
            }
        }

        revalidatePath('/admin/partners')
        return { success: true }
    } catch (error: any) {
        console.error("createPharmacyWithUser error:", error)
        return { error: error.message || "Failed to create pharmacy with user" }
    }
}

export async function linkPharmacyUser(pharmacyId: number, userEmail: string, password: string) {
    await requireAdmin();
    // Use admin client for user creation
    const adminSupabase = getSupabaseAdminClient();
    const supabase = getSupabaseAdminClient();
    let userId = null;

    // Create user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: userEmail,
        password: password,
        email_confirm: true,
    });

    if (authError) {
        // If user already exists, try to find them
        if (authError.message.includes("already registered") || authError.status === 422) {
            console.log(`User ${userEmail} already exists, attempting to link...`);

            const { data: listData, error: listError } = await adminSupabase.auth.admin.listUsers({
                perPage: 1000
            });

            if (listError) return { error: `Failed to find existing user: ${listError.message}` };

            const existingUser = listData.users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase());

            if (existingUser) {
                userId = existingUser.id;
            } else {
                return { error: "User exists but could not be found." };
            }
        } else {
            return { error: authError.message };
        }
    } else {
        userId = authData.user.id;
    }

    if (userId) {
        // Assign pharmacy role
        const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'pharmacy')
            .single();

        if (roleData) {
            const { error: roleAssignError } = await supabase.from('user_roles').insert({
                user_id: userId,
                role_id: roleData.id,
            });
            // Ignore duplicate key error
            if (roleAssignError && !roleAssignError.message.includes('duplicate key')) {
                console.error("Error assigning role:", roleAssignError);
            }
        }

        // Link to pharmacy
        const { error } = await supabase
            .from('pharmacies')
            .update({ user_id: userId })
            .eq('id', pharmacyId)

        if (error) return { error: error.message }
    }

    revalidatePath('/admin/partners')
    return { success: true }
}

export async function unlinkPharmacyUser(pharmacyId: number) {
    await requireAdmin();
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
    await requireAdmin();
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
            pharmacies (name),
            order_events (*)
        `)
        .order('created_at', { ascending: false })


    if (error) throw new Error(error.message)

    // Normalize data to ensure pharmacies is an object or null, not an array
    const normalizedOrders = (data || []).map((order: any) => ({
        ...order,
        pharmacies: Array.isArray(order.pharmacies) ? order.pharmacies[0] || null : order.pharmacies
    }))

    return normalizedOrders
}

export async function getDashboardStats() {
    const orders = await getOrders();

    // Top Pharmacies by Revenue
    const pharmacyRevenue: Record<string, number> = {};
    orders.forEach((o: any) => {
        if (o.pharmacies?.name) {
            pharmacyRevenue[o.pharmacies.name] = (pharmacyRevenue[o.pharmacies.name] || 0) + (o.total_price || 0);
        }
    });

    const topPharmacies = Object.entries(pharmacyRevenue)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Top 5

    // Top Products by Quantity Sold
    const productSales: Record<string, { quantity: number; revenue: number }> = {};
    orders.forEach((o: any) => {
        if (o.items) {
            // items can be JSON string or object
            let items: any[] = [];
            try {
                items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
            } catch (e) { }

            if (Array.isArray(items)) {
                items.forEach((item) => {
                    const name = item.name || 'Unknown Product';
                    if (!productSales[name]) {
                        productSales[name] = { quantity: 0, revenue: 0 };
                    }
                    productSales[name].quantity += (item.quantity || 1);
                    productSales[name].revenue += (item.price || item.price_ghs || 0) * (item.quantity || 1);
                });
            }
        }
    });

    const topProducts = Object.entries(productSales)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // Top 5

    // --- TIME SERIES DATA (Daily Revenue & Orders) ---
    // Explicitly create supabase client for internal queries
    const supabase = await createSupabaseServerClient();

    const dailyStats: Record<string, { date: string, revenue: number, orders: number }> = {};
    const now = new Date();
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyStats[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    orders.forEach((o: any) => {
        const dateStr = new Date(o.created_at).toISOString().split('T')[0];
        if (dailyStats[dateStr]) {
            dailyStats[dateStr].revenue += (o.total_price || 0);
            dailyStats[dateStr].orders += 1;
        }
    });

    const revenueChart = Object.values(dailyStats);

    // --- CATEGORY DISTRIBUTION ---
    const categoryStats: Record<string, number> = {};

    const { data: allProducts } = await supabase.from('products').select('id, name, category');
    const productMap = new Map(allProducts?.map((p: any) => [p.name, p.category]) || []);

    orders.forEach((o: any) => {
        if (o.items) {
            let items: any[] = [];
            try { items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items; } catch (e) { }

            if (Array.isArray(items)) {
                items.forEach((item: any) => {
                    const cat = productMap.get(item.name) || 'Other';
                    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
                });
            }
        }
    });

    const categoryChart = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

    // --- REGIONAL DATA ---
    const regionalStats: Record<string, number> = {};
    orders.forEach((o: any) => {
        if (o.delivery_area) {
            regionalStats[o.delivery_area] = (regionalStats[o.delivery_area] || 0) + 1;
        }
    });
    const regionChart = Object.entries(regionalStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    return {
        topPharmacies,
        topProducts,
        revenueChart,
        categoryChart,
        regionChart,
        totalRevenue: revenueChart.reduce((acc, curr) => acc + curr.revenue, 0),
        totalOrders: orders.length,
        activePatients: new Set(orders.map((o: any) => o.user_id)).size
    };
}

export async function updateOrderStatus(id: number, status: string, courierDetails?: { name: string; phone: string; trackingUrl?: string }) {
    await requireAdmin();
    const supabase = await createSupabaseServerClient()

    const updatePayload: any = { status }
    if (courierDetails) {
        updatePayload.courier_name = courierDetails.name
        updatePayload.courier_phone = courierDetails.phone
        updatePayload.courier_tracking_url = courierDetails.trackingUrl
    }

    const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id)

    if (error) return { error: error.message }

    // Trigger SMS notifications asynchronously
    if (status === 'out_for_delivery') {
        // Pass courier details to SMS if needed (requires updating SMS function too, but for now we just store it)
        sendShippingNotificationSMS(String(id)).catch(console.error)
    } else if (status === 'completed') {
        sendDeliveryNotificationSMS(String(id)).catch(console.error)
    }

    revalidatePath('/admin/orders')
    return { success: true }
}

export async function assignPharmacyInternal(supabaseAdmin: any, orderId: number, pharmacyId: number) {
    // Get order and pharmacy details for notifications
    const { data: order } = await supabaseAdmin
        .from('orders')
        .select('code, delivery_area, items, total_price')
        .eq('id', orderId)
        .single()

    const { data: pharmacy } = await supabaseAdmin
        .from('pharmacies')
        .select('name, phone_number, email')
        .eq('id', pharmacyId)
        .single()

    // Assign pharmacy and update status
    const { error } = await supabaseAdmin
        .from('orders')
        .update({
            pharmacy_id: pharmacyId,
            status: 'received', // Set to received, pharmacy will move to processing on accept
            pharmacy_ack_status: 'pending'
        })
        .eq('id', orderId)

    if (error) return { error: error.message }

    // Send notifications to pharmacy (SMS + Email)
    if (order && pharmacy) {
        try {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
            const itemCount = Array.isArray(items) ? items.length : 0

            const { notifyPharmacyOfAssignment } = await import('@/lib/pharmacy-notifications')

            // Await notifications to ensure they are sent
            await notifyPharmacyOfAssignment({
                pharmacyId,
                pharmacyName: pharmacy.name,
                pharmacyPhone: pharmacy.phone_number,
                pharmacyEmail: pharmacy.email,
                orderId,
                orderCode: order.code,
                deliveryArea: order.delivery_area,
                itemCount,
                totalPrice: order.total_price,
            })

            // Log assignment event
            await supabaseAdmin.from('order_events').insert({
                order_id: orderId,
                status: 'Assigned to Pharmacy',
                note: `Order assigned to ${pharmacy.name}. Notifications sent.`
            })
        } catch (notifError) {
            console.error('[assignPharmacy] Failed to send notifications:', notifError)
            // Don't fail the assignment if notifications fail
        }
    }

    revalidatePath('/admin/orders')
    revalidatePath('/pharmacy/dashboard')
    return { success: true }
}

export async function assignPharmacy(orderId: number, pharmacyId: number) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check admin role
    const { getUserRoles } = await import('@/lib/supabase')
    const supabaseAdmin = getSupabaseAdminClient()
    const roles = await getUserRoles(supabaseAdmin, user.id)
    const userEmail = user.email?.toLowerCase() || ''
    const adminWhitelist = (process.env.ADMIN_EMAIL_WHITELIST || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

    if (!roles.includes('admin') && !adminWhitelist.includes(userEmail)) {
        return { error: 'Unauthorized: Admin access required' }
    }
    // Using requireAdmin() helper defined above would be cleaner but this existing logic is fine.
    // We already have the logic here, let's keep it to avoid regression or just rely on RequireAdmin?
    // The existing logic imports getUserRoles locally. requireAdmin helper is consistent.
    // Let's replace the whole block with requireAdmin check to be consistent.
    // Wait, assignPharmacy returns { error } object, requireAdmin throws Error.
    // I should catch the error or refactor requireAdmin to return boolean/error.
    // Throwing error is better for security (stops execution hard), but client might expect { error: ... }
    // These actions generally return { error } or { success }.
    // I will leave assignPharmacy AS IS for now as it's already secure, just to be safe.

    return await assignPharmacyInternal(supabaseAdmin, orderId, pharmacyId)
}

import { sendShippingNotificationSMS, sendDeliveryNotificationSMS } from "@/lib/server-utils"

// Bulk update order statuses
export async function bulkUpdateOrderStatus(ids: number[], status: string) {
    await requireAdmin();
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

    // Trigger SMS notifications asynchronously
    if (status === 'out_for_delivery') {
        ids.forEach(id => sendShippingNotificationSMS(String(id)).catch(console.error))
    } else if (status === 'completed') {
        ids.forEach(id => sendDeliveryNotificationSMS(String(id)).catch(console.error))
    }

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
    await requireAdmin();
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

// --- Pharmacy Products Management ---

const pharmacyProductSchema = z.object({
    pharmacy_id: z.number(),
    product_id: z.number(),
    stock_level: z.number().min(0),
    reorder_level: z.number().min(0).default(10),
    pharmacy_price_ghs: z.number().min(0).optional(),
    is_available: z.boolean().default(true),
})

export type PharmacyProductFormValues = z.infer<typeof pharmacyProductSchema>

export async function getPharmacyProducts(pharmacyId: number) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('pharmacy_products')
        .select(`
            *,
            products (
                id,
                name,
                category,
                price_ghs,
                image_url,
                requires_prescription
            )
        `)
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    // Filter out any pharmacy_products where the parent product might have been deleted
    // (orphaned records) to prevent UI crashes
    return (data || []).filter((item: any) => item.products !== null)
}

export async function upsertPharmacyProduct(data: PharmacyProductFormValues) {
    await requireAdmin();
    const supabase = await createSupabaseServerClient()
    const validated = pharmacyProductSchema.parse(data)

    const { error } = await supabase
        .from('pharmacy_products')
        .upsert({
            ...validated,
            last_updated: new Date().toISOString()
        })

    if (error) return { error: error.message }

    revalidatePath(`/admin/partners/${validated.pharmacy_id}`)
    return { success: true }
}

export async function updatePharmacyProductStock(
    pharmacyId: number,
    productId: number,
    stockLevel: number
) {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase
        .from('pharmacy_products')
        .update({
            stock_level: stockLevel,
            last_updated: new Date().toISOString()
        })
        .eq('pharmacy_id', pharmacyId)
        .eq('product_id', productId)

    if (error) return { error: error.message }

    revalidatePath(`/admin/partners/${pharmacyId}`)
    return { success: true }
}

export async function bulkAssignProductsToPharmacy(
    pharmacyId: number,
    productIds: number[],
    defaultStockLevel: number = 0
) {
    const supabase = await createSupabaseServerClient()

    const pharmacyProducts = productIds.map(productId => ({
        pharmacy_id: pharmacyId,
        product_id: productId,
        stock_level: defaultStockLevel,
        reorder_level: 10,
        is_available: true
    }))

    const { error } = await supabase
        .from('pharmacy_products')
        .upsert(pharmacyProducts, { onConflict: 'pharmacy_id,product_id' })

    if (error) return { error: error.message }

    revalidatePath(`/admin/partners/${pharmacyId}`)
    return { success: true }
}

export async function deletePharmacyProduct(pharmacyId: number, productId: number) {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase
        .from('pharmacy_products')
        .delete()
        .eq('pharmacy_id', pharmacyId)
        .eq('product_id', productId)

    if (error) return { error: error.message }

    revalidatePath(`/admin/partners/${pharmacyId}`)
    return { success: true }
}

// --- Enhanced Order Management ---

export async function reassignOrder(orderId: number, newPharmacyId: number) {
    const supabase = await createSupabaseServerClient()

    // Update order
    const { error: orderError } = await supabase
        .from('orders')
        .update({
            pharmacy_id: newPharmacyId,
            pharmacy_ack_status: 'pending'
        })
        .eq('id', orderId)

    if (orderError) return { error: orderError.message }

    // Log event
    await supabase
        .from('order_events')
        .insert({
            order_id: orderId,
            status: 'reassigned',
            note: `Order reassigned to pharmacy ${newPharmacyId}`
        })

    revalidatePath('/admin/orders')
    return { success: true }
}

export async function getPharmacyAnalytics(pharmacyId: number) {
    const supabase = await createSupabaseServerClient()

    // Get order stats
    const { data: orderStats } = await supabase
        .from('orders')
        .select('status, total_price')
        .eq('pharmacy_id', pharmacyId)

    // Get product count
    const { data: productCount } = await supabase
        .from('pharmacy_products')
        .select('id')
        .eq('pharmacy_id', pharmacyId)

    return {
        totalOrders: orderStats?.length || 0,
        totalRevenue: orderStats?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0,
        productCount: productCount?.length || 0,
        ordersByStatus: orderStats?.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1
            return acc
        }, {} as Record<string, number>) || {}
    }
}

export async function getServiceAreas(pharmacyId: number) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('pharmacy_service_areas')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('area_name')

    if (error) throw new Error(error.message)
    return data || []
}

export async function addServiceArea(data: { pharmacy_id: number; area_name: string; delivery_fee: number; max_delivery_time_hours: number; is_active?: boolean }) {
    console.log('[addServiceArea] Attempting to add area:', data);
    const supabase = getSupabaseAdminClient()
    const { data: newArea, error } = await supabase
        .from('pharmacy_service_areas')
        .insert(data)
        .select()
        .single()

    if (error) {
        console.error('[addServiceArea] Error adding area:', error);
        return { error: error.message }
    }
    console.log('[addServiceArea] Successfully added area:', newArea);
    revalidatePath(`/admin/partners/${data.pharmacy_id}`)
    return { data: newArea }
}

export async function toggleServiceAreaStatus(id: number, isActive: boolean) {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase
        .from('pharmacy_service_areas')
        .update({ is_active: isActive })
        .eq('id', id)

    if (error) return { error: error.message }

    // We don't know the pharmacy_id easily here without an extra fetch, 
    // but revalidating the partners route group might be enough or we skip specific path revalidation 
    // and rely on client state updates or general revalidation.
    // Ideally we fetch the pharmacy_id first.
    return { success: true }
}

export async function deleteServiceArea(id: number) {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase
        .from('pharmacy_service_areas')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
}

// --- Category Management ---

export async function getCategories() {
    const supabase = await createSupabaseServerClient()

    // Fetch categories
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    if (error) throw new Error(error.message)

    // Fetch product counts for each category
    const { data: productCounts, error: countError } = await supabase
        .from('products')
        .select('category')

    if (countError) throw new Error(countError.message)

    // Calculate counts
    const counts: Record<string, number> = {}
    productCounts?.forEach((p: any) => {
        if (p.category) {
            counts[p.category] = (counts[p.category] || 0) + 1
        }
    })

    // Merge counts into categories
    return (categories || []).map(cat => ({
        ...cat,
        productCount: counts[cat.name] || 0
    }))
}

export async function addCategory(data: { name: string; description?: string; image_url?: string }) {
    const supabase = getSupabaseAdminClient()
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({ ...data, slug })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/admin/categories')
    revalidatePath('/admin/products')
    return { success: true, data: newCategory }
}

export async function updateCategory(id: number, data: { name: string; description?: string; image_url?: string }) {
    const supabase = getSupabaseAdminClient()
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    // 1. Get the old category name first
    const { data: oldCategory } = await supabase
        .from('categories')
        .select('name')
        .eq('id', id)
        .single()

    // 2. Update the category
    const { error } = await supabase
        .from('categories')
        .update({ ...data, slug })
        .eq('id', id)

    if (error) return { error: error.message }

    // 3. If name changed, sync all products that used the old name
    if (oldCategory && oldCategory.name !== data.name) {
        const { error: syncError } = await supabase
            .from('products')
            .update({ category: data.name })
            .eq('category', oldCategory.name)

        if (syncError) console.error('Failed to sync products category:', syncError)
    }

    revalidatePath('/admin/categories')
    revalidatePath('/admin/products')
    return { success: true }
}

export async function deleteCategory(id: number) {
    const supabase = getSupabaseAdminClient()

    // Get category name to check for products
    const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', id)
        .single()

    if (category) {
        // Check if products exist
        const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', category.name)

        if (count && count > 0) {
            return { error: `Cannot delete category "${category.name}" because it contains ${count} products. Please reassign them first.` }
        }
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/categories')
    revalidatePath('/admin/products')
    return { success: true }
}
// --- Product Requests ---

export async function getProductRequests() {
    const supabase = await createSupabaseServerClient();
    const { data: requests, error } = await supabase
        .from('product_requests')
        .select(`
            *,
            pharmacies (name, location)
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Normalize requests
    return requests.map((req: any) => ({
        ...req,
        pharmacyName: req.pharmacies?.name || 'Unknown Pharmacy',
        pharmacyLocation: (req.pharmacies?.location || '').split(',')[0] // Shorten location
    }));
}

export async function approveProductRequest(requestId: number, productData: ProductFormValues) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { getUserRoles } = await import('@/lib/supabase')
    const supabaseAdmin = getSupabaseAdminClient()
    const roles = await getUserRoles(supabaseAdmin, user?.id || '')
    if (!roles.includes('admin')) return { success: false, message: 'Unauthorized' }

    // 1. Create the new product
    const { data: newProduct, error: createError } = await supabase
        .from('products')
        .insert({
            name: productData.name,
            category: productData.category,
            price_ghs: productData.price_ghs,
            stock_level: productData.stock_level,
            image_url: productData.image_url,
            description: productData.description,
            featured: productData.featured || false,
            requires_prescription: productData.requires_prescription || false,
            is_student_product: productData.is_student_product || false
        })
        .select()
        .single();

    if (createError) return { success: false, message: createError.message };

    // 2. Update request status
    const { error: updateError } = await supabase
        .from('product_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

    if (updateError) {
        console.error("Failed to update request status after product creation", updateError);
    }

    revalidatePath('/admin/products');
    return { success: true, message: 'Product created and request approved' };
}

export async function rejectProductRequest(requestId: number) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { getUserRoles } = await import('@/lib/supabase')
    const supabaseAdmin = getSupabaseAdminClient()
    const roles = await getUserRoles(supabaseAdmin, user?.id || '')
    if (!roles.includes('admin')) return { success: false, message: 'Unauthorized' }

    const { error } = await supabase
        .from('product_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/admin/products');
    return { success: true, message: 'Request rejected' };
}
