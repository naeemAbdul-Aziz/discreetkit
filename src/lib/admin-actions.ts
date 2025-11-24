'use server'

import { createSupabaseServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema for product validation
const productSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    price_ghs: z.coerce.number().min(0, "Price must be positive"),
    stock_level: z.coerce.number().int().min(0, "Stock must be positive"),
    status: z.enum(["Active", "Low Stock", "Out of Stock"]).optional(),
    image_url: z.string().url().optional().or(z.literal("")),
    description: z.string().optional(),
    featured: z.boolean().optional(),
    requires_prescription: z.boolean().optional(),
    is_student_product: z.boolean().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>

export async function getProducts() {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function upsertProduct(data: ProductFormValues) {
    const supabase = await createSupabaseServerClient()

    // Validate data
    const validated = productSchema.parse(data)

    // Prepare payload (remove id if it's undefined/null so Supabase generates it)
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
    }

    if (validated.id) {
        payload.id = validated.id
    }

    const { error } = await supabase
        .from('products')
        .upsert(payload)
        .select()
        .single()

    if (error) {
        console.error('Upsert Error:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/products')
    return { success: true }
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

// --- Pharmacies ---

const pharmacySchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    contact_person: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
})

export type PharmacyFormValues = z.infer<typeof pharmacySchema>

export async function getPharmacies() {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
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
    const { error } = await supabase
        .from('orders')
        .update({ pharmacy_id: pharmacyId, status: 'processing' }) // Auto-move to processing on assignment
        .eq('id', orderId)

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
