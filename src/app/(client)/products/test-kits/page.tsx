
import { getSupabaseClient } from '@/lib/supabase';
import { ProductCard } from '../../../products/(components)/product-card';
import type { Product } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate data every 60 seconds

async function getScreeningKits(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Test Kit')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching screening kits:", error);
        return [];
    }
    // Update images and cast numeric types
    return data.map((p: any) => ({
        ...p,
        price_ghs: Number(p.price_ghs),
        student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
    }));
}

export default async function TestKitsPage() {
    const allKits = await getScreeningKits();

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Test Kits
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Get peace of mind with our confidential, WHO-approved self-test kits. Fast, accurate, and delivered to you with complete privacy.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {allKits.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
