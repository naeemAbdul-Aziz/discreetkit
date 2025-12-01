'use server'

import { createSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getProducts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
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

    // Use admin client for the operation
    // const supabase = getSupabaseAdminClient() // Already have supabaseAdmin

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

            // Send notifications asynchronously (don't block the response)
            notifyPharmacyOfAssignment({
                pharmacyId,
                pharmacyName: pharmacy.name,
                pharmacyPhone: pharmacy.phone_number,
                pharmacyEmail: pharmacy.email,
                orderId,
                orderCode: order.code,
                deliveryArea: order.delivery_area,
                itemCount,
                totalPrice: order.total_price,
            }).catch(err => {
                console.error('[assignPharmacy] Notification error:', err)
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

export async function addServiceArea(data: { pharmacy_id: number; area_name: string; delivery_fee: number; max_delivery_time_hours: number }) {
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
