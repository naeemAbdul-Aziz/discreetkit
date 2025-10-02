
import { getSupabaseClient } from '@/lib/supabase';
import { ProductCard } from './(components)/product-card';
import type { Product } from '@/lib/data';
import type { Metadata } from 'next';
import { ProductFeature } from '../(home)/components/product-feature';

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
    const allInOneBundle = products.find(p => p.id === 8);
    if (allInOneBundle) {
        allInOneBundle.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
    }
    const coupleBundle = products.find(p => p.id === 3);
    if (coupleBundle) {
        coupleBundle.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
    }
    const hivTest = products.find(p => p.id === 1);
    if (hivTest) {
      hivTest.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
    }
    const pregnancyTest = products.find(p => p.id === 2);
    if (pregnancyTest) {
      pregnancyTest.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
    }
    const postpill = products.find(p => p.id === 4);
    if (postpill) {
      postpill.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
    }
    const lubricant = products.find(p => p.id === 6);
    if (lubricant) {
        lubricant.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png';
    }

    const testKits = products.filter(p => p.name.includes('HIV') || p.name.includes('Pregnancy'));
    const bundles = products.filter(p => p.name.includes('Bundle') || p.name.includes('All-In-One'));
    const wellness = products.filter(p => !testKits.includes(p) && !bundles.includes(p));

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

            {allInOneBundle && <ProductFeature product={allInOneBundle} />}

            {/* Test Kits Section */}
            <div id="test-kits" className="mb-16 scroll-mt-24">
                <h2 className="font-headline text-2xl font-bold text-foreground mb-6">Test Kits</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {testKits.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* Bundles Section */}
            <div id="bundles" className="mb-16 scroll-mt-24">
                 <h2 className="font-headline text-2xl font-bold text-foreground mb-6">Value Bundles</h2>
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {bundles.filter(p => p.id !== allInOneBundle?.id).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
            
            {/* Wellness Essentials Section */}
             <div id="wellness" className="scroll-mt-24">
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
