
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

// This function now simulates fetching a wider range of wellness products.
async function getWellnessProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    // In a real application, you might fetch products by a 'wellness' category.
    // For this demonstration, we are creating mock data that reflects the desired structure.
    const mockProducts: Product[] = [
        {
            id: 4,
            name: 'Postpill (Emergency Contraceptive)',
            description: 'A single dose of emergency contraception to be taken after unprotected intercourse.',
            price_ghs: 90.00,
            student_price_ghs: 80.00,
            image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png',
            brand: 'Partner Brand',
            featured: false,
        },
        {
            id: 5,
            name: 'Extra Safe Condoms',
            description: 'Slightly thicker condoms for those who want ultimate reassurance.',
            price_ghs: 50.00,
            student_price_ghs: 40.00,
            image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
            brand: 'Durex',
            featured: false,
        },
        {
            id: 6,
            name: 'Performa Condoms',
            description: 'Designed to help him last longer for extended pleasure.',
            price_ghs: 55.00,
            student_price_ghs: null,
            image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
            brand: 'Durex',
            featured: false,
        },
        {
            id: 9,
            name: 'Flavored Condoms',
            description: 'A mix of banana and strawberry flavored condoms for extra fun.',
            price_ghs: 60.00,
            student_price_ghs: null,
            image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
            brand: 'Durex',
            featured: false,
        },
        {
            id: 10,
            name: 'Fiesta Classic Condoms',
            description: 'The original and trusted choice for safety and comfort.',
            price_ghs: 45.00,
            student_price_ghs: 35.00,
            image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
            brand: 'Fiesta',
            featured: false,
        },
        {
            id: 11,
            name: 'Fiesta Banana Condoms',
            description: 'Add a fun, fruity twist to your intimate moments.',
            price_ghs: 50.00,
            student_price_ghs: null,
            image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
            brand: 'Fiesta',
            featured: false,
        },
        {
            id: 12,
            name: 'Fiesta Premium Ribbed',
            description: 'Ribbed for extra sensation and pleasure.',
            price_ghs: 55.00,
            student_price_ghs: null,
            image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
            brand: 'Fiesta',
            featured: false,
        },
        {
            id: 13,
            name: 'Aqua-based Personal Lubricant',
            description: 'A gentle, water-based lubricant for enhanced comfort.',
            price_ghs: 60.00,
            student_price_ghs: null,
            image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png',
            brand: 'Durex',
            featured: false,
        },
    ];
    return mockProducts;
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
