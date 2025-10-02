
import { getSupabaseClient } from '@/lib/supabase';
import { ProductCard } from '../(components)/product-card';
import type { Product } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wellness Essentials | DiscreetKit Ghana',
  description: 'Shop for contraception, personal care, and other wellness products. Delivered discreetly to your door.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getWellnessProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', [4, 5, 6]) // Postpill, Condoms, Lubricant
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching wellness products:", error);
        return [];
    }
    return data.map(p => {
        let imageUrl = p.image_url;
        if (p.id === 4) {
            imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
            p.brand = 'Partner Brand';
        }
        if (p.id === 5) {
            imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
            p.brand = 'Durex';
        }
        if (p.id === 6) {
            imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png';
            p.brand = 'Durex';
        }
        return {
          ...p,
          image_url: imageUrl,
          price_ghs: Number(p.price_ghs),
          student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
          savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
          brand: p.brand || 'Partner Brand',
        };
    });
}

export default async function WellnessPage() {
    const wellnessProducts = await getWellnessProducts();
    
    const productsByBrand = wellnessProducts.reduce((acc, product) => {
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
                    Wellness Essentials
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Explore contraception and personal care essentials. Carefully selected, discreetly delivered.
                </p>
            </div>

            <div className="space-y-12">
                {Object.entries(productsByBrand).map(([brand, products]) => (
                    <div key={brand}>
                        <h2 className="font-headline text-2xl font-bold text-foreground mb-6 border-b pb-2">{brand}</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
