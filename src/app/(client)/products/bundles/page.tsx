
import { getSupabaseClient } from '@/lib/supabase';
import { ProductCard } from '../(components)/product-card';
import type { Product } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Value Bundles | DiscreetKit Ghana',
  description: 'Save on essential health products with our curated value bundles. Get everything you need in one discreet package.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getBundles(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Bundle')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching bundles:", error);
        return [];
    }
    return data.map((p: any) => ({
        ...p,
        price_ghs: Number(p.price_ghs),
        student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
        savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
    }));
}

export default async function BundlesPage() {
    const bundles = await getBundles();
    // Sort by biggest savings first, then by price as a tiebreaker
    const sorted = [...bundles].sort((a, b) => (b.savings_ghs || 0) - (a.savings_ghs || 0) || a.price_ghs - b.price_ghs);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Value Bundles
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                   Be ready for anything and save money. Our bundles are curated to provide complete peace of mind.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {sorted.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
