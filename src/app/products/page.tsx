
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
    // Update images and cast numeric types
    return products.map(p => {
        let imageUrl = p.image_url;
        if (p.id === 1) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
        if (p.id === 2) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 3) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
        if (p.id === 4) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
        if (p.id === 5) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
        if (p.id === 6) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png';
        if (p.id === 7) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png';
        if (p.id === 8) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        return {
          ...p,
          image_url: imageUrl,
          price_ghs: Number(p.price_ghs),
          student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
          savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
        };
    });
}

function Section({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
    return (
        <div id={id} className="mb-16 scroll-mt-24">
            <h2 className="font-headline text-2xl font-bold text-foreground mb-6">{title}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {children}
            </div>
        </div>
    );
}

export default async function ProductsPage() {
    const products = await getProducts();
    
    const testKits = products.filter(p => p.id === 1 || p.id === 2);
    const bundles = products.filter(p => p.id === 3 || p.id === 7 || p.id === 8);
    const wellness = products.filter(p => p.id === 4 || p.id === 5 || p.id === 6);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Our Health Products
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Your complete source for confidential health and wellness products.
                </p>
            </div>

            <Section id="test-kits" title="Test Kits">
                {testKits.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </Section>

            <Section id="bundles" title="Value Bundles">
                {bundles.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </Section>
            
            <Section id="wellness" title="Wellness Essentials">
                {wellness.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </Section>
        </div>
      </div>
    </div>
  );
}
