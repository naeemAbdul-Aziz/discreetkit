'use server';

import { createSupabaseServerClient } from './supabase';
import type { Product } from './data';

const ITEMS_PER_PAGE = 12;

type FilterOptions = {
    category?: string;
    sub_category?: string;
    brand?: string;
    page?: number;
};

type ProductsResponse = {
    products: Product[];
    total: number;
    totalPages: number;
};

/**
 * Fetches products with server-side pagination and filtering.
 */
export async function getFilteredProducts({
    category = 'All',
    sub_category = 'All',
    brand = 'All',
    page = 1
}: FilterOptions): Promise<ProductsResponse> {
    const supabase = await createSupabaseServerClient();
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Start building the query
    let query = supabase
        .from('products')
        .select(`
            *,
            pharmacy_products (
                stock_level,
                is_available
            )
        `, { count: 'exact' });

    // Apply Filters
    if (category !== 'All') {
        query = query.eq('category', category);
    }
    if (sub_category !== 'All' && category === 'Wellness') { // Sub-cat only applies if logic demands, usually filtered by column
         query = query.eq('sub_category', sub_category);
    }
    if (brand !== 'All') {
        query = query.eq('brand', brand);
    }

    // Apply Pagination
    query = query.order('id', { ascending: true })
                 .range(from, to);

    const { data: products, error, count } = await query;

    if (error) {
        console.error("Error fetching filtered products:", error);
        return { products: [], total: 0, totalPages: 0 };
    }

    // Process logic (stock levels) on server
    const processedProducts = products.map((p: any) => {
        const totalStock = p.pharmacy_products?.reduce((acc: number, curr: any) => {
             if (curr.is_available === false) return acc;
             return acc + (curr.stock_level || 0);
        }, 0) ?? 0;

        const effectiveStock = totalStock > 0 ? totalStock : p.stock_level;

        return {
            ...p,
            price_ghs: Number(p.price_ghs),
            student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
            savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
            stock_level: effectiveStock,
            // Strip heavy fields if not needed for card (optional optimization)
            // But card likely uses image, name, price.
        };
    });

    return {
        products: processedProducts,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
    };
}

/**
 * Fetches unique filter options (Brands, Sub-categories) to populate UI.
 * This avoids fetching all products just to build filters.
 */
export async function getProductFilterOptions() {
    const supabase = await createSupabaseServerClient();
    
    // We can't easily do "DISTINCT" in one query for multiple fields without RPC or raw SQL.
    // But we can fetch just the columns needed.
    const { data, error } = await supabase
        .from('products')
        .select('category, sub_category, brand');
        
    if (error || !data) return { brands: [], wellnessCategories: [] };

    const brands = Array.from(new Set(data.map(p => p.brand).filter(Boolean))) as string[];
    const wellnessCategories = Array.from(new Set(
        data.filter(p => p.category === 'Wellness').map(p => p.sub_category).filter(Boolean)
    )) as string[];

    return {
        brands: ['All', ...brands.sort()],
        wellnessCategories: ['All', ...wellnessCategories.sort()]
    };
}
