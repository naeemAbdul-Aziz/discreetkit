import { getProductsWithStock } from '@/lib/client-actions';
import { ProductCard } from '../(components)/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Value Bundles | DiscreetKit Ghana',
  description: 'Save on essential health products with our curated value bundles. Get everything you need in one discreet package.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function BundlesPage() {
    const bundles = await getProductsWithStock('Bundles');
    // Sort by biggest savings first, then by price as a tiebreaker
    const sorted = [...bundles].sort((a, b) => (b.savings_ghs || 0) - (a.savings_ghs || 0) || a.price_ghs - b.price_ghs);

  return (
    <div className="bg-background min-h-screen">
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

            {sorted.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {sorted.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl">
                    <div className="text-4xl">📦</div>
                    <h3 className="text-xl font-bold">Temporarily Unavailable</h3>
                    <p className="text-muted-foreground max-w-md">
                        We are putting together new value bundles. Please check back soon for great deals.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/products">Browse All Products</Link>
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
