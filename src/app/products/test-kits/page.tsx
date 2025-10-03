import { getSupabaseClient } from '@/lib/supabase';
import { ProductCard } from '../(components)/product-card';
import type { Product } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Kits | DiscreetKit Ghana',
  description: 'Shop private, WHO-approved self-test kits for HIV, Pregnancy, Syphilis, and more. Get accurate results in minutes, delivered discreetly to your door.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate data every 60 seconds

// Define new test kits locally until backend is updated
export const allTestKits: Product[] = [
    {
        id: 17,
        name: 'Syphilis Self-Test Kit',
        description: 'A private, easy-to-use blood-spot test for detecting Syphilis antibodies.',
        price_ghs: 120.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png', // Placeholder
        brand: 'Partner Brand',
        featured: false,
    },
    {
        id: 18,
        name: 'Chlamydia & Gonorrhea Test Kit',
        description: 'A comprehensive 2-in-1 urine test for two of the most common STIs.',
        price_ghs: 250.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png', // Placeholder
        brand: 'Partner Brand',
        featured: false,
    },
];

async function getScreeningKits(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', [1, 2, 14]) // Fetch HIV Kit, Pregnancy Test, and Digital Pregnancy Test from DB
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching screening kits:", error);
        return [];
    }
    // Update images and cast numeric types
    return data.map(p => {
        let imageUrl = p.image_url;
        if (p.id === 1) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
        if (p.id === 2) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 14) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';

        const brand = p.id === 14 ? 'Partner Brand' : 'DiscreetKit';
        
        return {
          ...p,
          image_url: imageUrl,
          price_ghs: Number(p.price_ghs),
          student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
          savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
          brand,
        };
    });
}

export default async function TestKitsPage() {
    const dbKits = await getScreeningKits();
    const allKits = [...dbKits, ...allTestKits].sort((a, b) => a.id - b.id);

    const productsByBrand = allKits.reduce((acc, product) => {
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
                    Test Kits
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Get peace of mind with our confidential, WHO-approved self-test kits. Fast, accurate, and delivered to you with complete privacy.
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
