
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
        .in('id', [3, 7, 8, 15]) // Fetch Couple, Weekend, All-in-One, and Safe & Sound bundles
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching bundles:", error);
        return [];
    }
    return data.map(p => {
        let imageUrl = p.image_url;
        if (p.id === 3) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
        if (p.id === 7) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png';
        if (p.id === 8) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        if (p.id === 15) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';

        return {
          ...p,
          image_url: imageUrl,
          price_ghs: Number(p.price_ghs),
          student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
          savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
          brand: p.brand || 'DiscreetKit',
        };
    });
}

export default async function BundlesPage() {
    const bundles = await getBundles();

    const productsByBrand = bundles.reduce((acc, product) => {
        const brand = product.brand || 'Other Brands';
        if (!acc[brand]) {
            acc[brand] = [];
        }
        acc[brand].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

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

            <div className="space-y-12">
                {Object.entries(productsByBrand).map(([brand, products]) => (
                    <div key={brand}>
                        <h2 className="font-headline text-2xl font-bold text-foreground mb-6 border-b pb-2">{brand}</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
