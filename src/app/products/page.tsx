
import { getSupabaseClient } from '@/lib/supabase';
import type { Product } from '@/lib/data';
import type { Metadata } from 'next';
import { ProductLineShowcase } from './(components)/product-line-showcase';

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

export default async function ProductsPage() {
    const products = await getProducts();
    
    // Override images with new mockups
    products.forEach(p => {
        if (p.id === 1) p.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
        if (p.id === 2) p.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 3) p.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
        if (p.id === 4) p.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
        if (p.id === 6) p.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png';
        if (p.id === 8) p.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
    });
    
    const testKits = products.filter(p => p.id === 1 || p.id === 2);
    const allInOneBundle = products.find(p => p.id === 8);

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
            
            {allInOneBundle && (
                 <ProductLineShowcase 
                    line={{
                        title: 'Private Test Kits',
                        headline: 'Get Your Answers, Confidentially.',
                        description: 'WHO-approved, 99% accurate self-test kits for private use. Get your results in under 20 minutes from the comfort of home.',
                        showcaseImageUrl: allInOneBundle.image_url || '',
                    }}
                    products={testKits} 
                />
            )}

        </div>
      </div>
    </div>
  );
}
