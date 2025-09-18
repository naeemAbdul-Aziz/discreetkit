
import { getSupabaseClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { ProductCard } from './(components)/product-card';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate data every 60 seconds

// Define the type for a single product based on your new database schema
export type Product = {
    id: number;
    name: string;
    description: string | null;
    price_ghs: number;
    student_price_ghs: number | null;
    image_url: string | null;
    featured: boolean | null;
}

async function getProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching products:", error);
        // In a real app, you might want to throw the error to be caught by an error boundary
        return [];
    }
    // Supabase returns numbers as strings for numeric types, ensure they are numbers
    return products.map(p => ({
      ...p,
      price_ghs: Number(p.price_ghs),
      student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
    }));
}


export default async function ProductsPage() {
    const products = await getProducts();

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    All Health Essentials
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Your complete source for confidential health and wellness products.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
