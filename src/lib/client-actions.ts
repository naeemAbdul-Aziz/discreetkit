import { createSupabaseServerClient } from '@/lib/supabase';
import type { Product } from '@/lib/data';

export async function getProductsWithStock(category?: string | string[]): Promise<Product[]> {
    const supabase = await createSupabaseServerClient();
    let query = supabase
        .from('products')
        .select(`
            *,
            pharmacy_products (
                stock_level,
                is_available
            )
        `)
        .order('id', { ascending: true });

    if (category) {
        if (Array.isArray(category)) {
            query = query.in('category', category);
        } else {
            query = query.eq('category', category);
        }
    }

    const { data: products, error } = await query;

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return products.map((p: any) => {
        const totalStock = p.pharmacy_products?.reduce((acc: number, curr: any) => {
            // Only count active stock towards customer availability
            if (curr.is_available === false) return acc;
            return acc + (curr.stock_level || 0);
        }, 0) ?? 0;

        const effectiveStock = totalStock > 0 ? totalStock : p.stock_level;

        return {
            ...p,
            price_ghs: Number(p.price_ghs),
            student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
            savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
            stock_level: effectiveStock
        };
    });
}
