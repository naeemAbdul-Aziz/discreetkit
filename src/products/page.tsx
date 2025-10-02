import { getSupabaseClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ProductCard } from './(components)/product-card';
import type { Product } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our full range of confidential health products, including HIV self-test kits, pregnancy tests, value bundles, and wellness essentials. Order online for discreet delivery.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate data every 60 seconds

async function getProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }
    return products.map(p => ({
      ...p,
      price_ghs: Number(p.price_ghs),
      student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
      savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
    }));
}

function FeaturedProduct({ product }: { product: Product }) {
    return (
        <Card className="overflow-hidden rounded-2xl mb-16">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 text-center md:p-12 md:text-left">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">Featured Bundle</h2>
              <h3 className="mt-2 font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {product.name}
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:mx-0">
                {product.description}
              </p>
               <div className="mt-8">
                  <ProductCard product={product} />
              </div>
            </div>
            <div className="relative h-64 min-h-[300px] w-full md:h-full bg-muted/50">
              {product.image_url && (
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>
          </div>
        </Card>
    )
}

export default async function ProductsPage() {
    const products = await getProducts();
    
    const testKits = products.filter(p => p.name.includes('HIV Kit') || p.name.includes('Pregnancy Test'));
    const bundles = products.filter(p => p.name.includes('Bundle') || p.name.includes('All-In-One'));
    const wellness = products.filter(p => !testKits.includes(p) && !bundles.includes(p));

    const featuredBundle = products.find(p => p.id === 8); // The All-In-One

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Our Health Products
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Your complete source for confidential health and wellness products.
                </p>
            </div>

            {featuredBundle && <FeaturedProduct product={featuredBundle} />}

            {/* Test Kits Section */}
            <div className="mb-16">
                <h2 className="font-headline text-2xl font-bold text-foreground mb-6">Test Kits</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {testKits.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* Bundles Section */}
            <div className="mb-16">
                 <h2 className="font-headline text-2xl font-bold text-foreground mb-6">Value Bundles</h2>
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {bundles.filter(p => p.id !== featuredBundle?.id).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
            
            {/* Wellness Essentials Section */}
             <div>
                 <h2 className="font-headline text-2xl font-bold text-foreground mb-6">Wellness Essentials</h2>
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {wellness.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
