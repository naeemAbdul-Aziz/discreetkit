
import { getSupabaseClient } from '@/lib/supabase';
import { ProductCard } from '../(components)/product-card';
import type { Product } from '@/lib/data';

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
        category: 'STI Tests',
        usage_instructions: [
            "Use the lancet to collect a blood sample from your fingertip.",
            "Apply the blood sample to the designated area on the test cassette.",
            "Add the provided buffer solution.",
            "Wait 10-15 minutes for the result to appear.",
            "Consult a healthcare professional for confirmatory testing if the result is positive."
        ],
        in_the_box: ["1 Test Cassette", "1 Lancet", "1 Buffer Solution", "1 Alcohol Prep Pad", "1 Instruction Manual"],
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
        category: 'STI Tests',
        usage_instructions: [
            "Collect a urine sample in the provided sterile container.",
            "Use the pipette to transfer the specified amount of urine to the test device.",
            "Wait for the time indicated in the manual (usually 15-20 minutes).",
            "Read the results for both Chlamydia and Gonorrhea separately on the cassette."
        ],
        in_the_box: ["1 Test Cassette", "1 Urine Collection Cup", "1 Pipette", "1 Buffer Solution", "1 Instruction Manual"],
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

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {allKits.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
