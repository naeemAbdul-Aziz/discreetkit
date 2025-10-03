
import { getSupabaseClient } from '@/lib/supabase';
import { ProductCard } from './(components)/product-card';
import type { Product } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

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
     // Map over products to update images and cast numeric types
    return products.map(p => {
        let imageUrl = p.image_url;
        if (p.id === 1) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
        if (p.id === 2) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 3) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
        if (p.id === 7) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png';
        if (p.id === 8) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        if (p.id === 14) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 15) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        
        return {
            ...p,
            image_url: imageUrl,
            price_ghs: Number(p.price_ghs),
            student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
            savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
        };
    });
}

function FeaturedProduct({ product }: { product: Product }) {
    if (!product) return null;
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
                    <Link href={`/products/${product.id}`} passHref className="block">
                        <ProductCard product={product} />
                    </Link>
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
    const dbProducts = await getProducts();
    // Since wellness products are now local, we import them and merge
    const wellnessProducts = (await import('./wellness/page')).default.wellnessProducts;
    const products = [...dbProducts, ...wellnessProducts].sort((a, b) => a.id - b.id);
    
    const screeningKits = products.filter(p => [1, 2, 14].includes(p.id));
    const bundles = products.filter(p => [3, 7, 8, 15].includes(p.id));
    const wellness = products.filter(p => ![...screeningKits.map(k=>k.id), ...bundles.map(b=>b.id)].includes(p.id));
    
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

            {/* Screening Kits Section */}
            <div id="test-kits" className="mb-16 scroll-mt-20">
                <h2 className="font-headline text-2xl font-bold text-foreground mb-6">Screening Kits</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {screeningKits.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* Bundles Section */}
            <div id="bundles" className="mb-16 scroll-mt-20">
                 <h2 className="font-headline text-2xl font-bold text-foreground mb-6">Value Bundles</h2>
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {bundles.filter(p => p.id !== featuredBundle?.id).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
            
            {/* Wellness Essentials Section */}
             <div id="wellness" className="scroll-mt-20">
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
