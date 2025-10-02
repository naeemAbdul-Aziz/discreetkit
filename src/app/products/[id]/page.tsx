
import { getSupabaseClient } from '@/lib/supabase';
import type { Product } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AddToCartManager } from './(components)/add-to-cart-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ClipboardList, Package, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { ProductCard } from '../(components)/product-card';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate data every 60 seconds

// This generates the metadata for the page (e.g., title, description).
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description || 'View details for our confidential health products.',
    openGraph: {
        title: product.name,
        description: product.description || '',
        images: product.image_url ? [product.image_url] : [],
    },
  };
}

// This function fetches the data for a single product.
async function getProduct(id: string): Promise<Product | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }
     return {
      ...data,
      price_ghs: Number(data.price_ghs),
      student_price_ghs: data.student_price_ghs ? Number(data.student_price_ghs) : null,
      savings_ghs: data.savings_ghs ? Number(data.savings_ghs) : null,
    };
}

async function getRelatedProducts(currentProductId: number): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('id', 'eq', currentProductId)
        .limit(3);

    if (error) {
        console.error("Error fetching related products:", error);
        return [];
    }
     return data.map(p => ({
      ...p,
      price_ghs: Number(p.price_ghs),
      student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
      savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
    }));
}


// Placeholder content for usage instructions - you would fetch this from your database.
const getUsageInstructions = (productId: number) => {
    switch(productId) {
        case 1: // Standard HIV Kit
        case 3: // Support Bundle
            return [
                "Open the pouch and lay out all components.",
                "Use the lancet to prick your finger and collect a blood sample.",
                "Apply the sample to the test cassette.",
                "Add the buffer solution and wait 15-20 minutes.",
                "Read the result based on the lines that appear."
            ];
        case 2: // Pregnancy Test
            return [
                "Open the package and remove the test stick.",
                "Hold the absorbent tip in your urine stream for 5-10 seconds.",
                "Lay the test flat with the result window facing up.",
                "Wait 3-5 minutes for the result to appear.",
                "Read the result: two lines for pregnant, one line for not pregnant."
            ]
        case 8: // All-in-one
             return [
                "This bundle contains multiple products.",
                "Please refer to the individual package insert for each item (HIV Kit, Pregnancy Test, Postpill) for detailed usage instructions.",
                "Ensure you read the instructions for each test carefully before use."
            ];
        default:
            return ["Please refer to the package insert for detailed instructions."];
    }
}

const getWhatsInTheBox = (productId: number) => {
     switch(productId) {
        case 1: // Standard HIV Kit
            return ["1 Test Cassette", "1 Lancet", "1 Buffer Solution Vial", "1 Alcohol Prep Pad", "1 Instruction Manual"];
        case 2: // Pregnancy Test
            return ["1 Pregnancy Test Stick", "1 Desiccant Packet", "1 Instruction Manual"];
        case 3: // Support Bundle
            return ["2 Test Cassettes", "2 Lancets", "2 Buffer Solution Vials", "2 Alcohol Prep Pads", "2 Instruction Manuals"];
        case 4: // Postpill
            return ["1 Tablet of Emergency Contraceptive", "1 Instruction Leaflet"];
         case 5: // Condom Pack
            return ["12 Ultra-thin Latex Condoms"];
        case 6: // Lubricant
            return ["1 Bottle of Aqua-based Lubricant"];
        case 7: // Weekend Ready Bundle
            return ["12 Ultra-thin Latex Condoms", "1 Bottle of Aqua-based Lubricant"];
        case 8: // All-in-one
            return ["1 Standard HIV Kit", "1 Pregnancy Test Kit", "1 Postpill (Emergency Contraceptive)"];
        default:
            return ["Contents as described on packaging."];
    }
}


export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);
    
    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.id);
    const instructions = getUsageInstructions(product.id);
    const boxContents = getWhatsInTheBox(product.id);


  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-24">
        
        {/* Main Product Section */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Left Column: Image and Details */}
            <div className="space-y-12">
                <div className="relative aspect-square w-full rounded-3xl bg-muted/50 p-8">
                    {product.image_url && (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            data-ai-hint="medical test kit"
                            priority
                        />
                    )}
                </div>

                <div className="space-y-8">
                    {/* Usage Instructions */}
                    <div className="border-t pt-8">
                        <h2 className="font-headline text-2xl font-bold flex items-center gap-3 mb-4">
                            <FileText />
                            Usage Instructions
                        </h2>
                        <ul className="space-y-3 text-muted-foreground">
                            {instructions.map((step, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* What's in the Box */}
                    <div className="border-t pt-8">
                        <h2 className="font-headline text-2xl font-bold flex items-center gap-3 mb-4">
                            <Package />
                           What's in the Box?
                        </h2>
                        <ul className="space-y-2 text-muted-foreground">
                            {boxContents.map((item, index) => (
                                <li key={index} className="flex items-center gap-3">
                                     <ClipboardList className="h-4 w-4 text-primary/70 flex-shrink-0" />
                                     <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right Column: Sticky CTA */}
            <div className="md:sticky md:top-24">
                 <div className="flex flex-col">
                    <div>
                        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                            {product.name}
                        </h1>
                        {product.description && (
                            <p className="mt-4 text-base text-muted-foreground md:text-lg">
                                {product.description}
                            </p>
                        )}
                    </div>

                    <div className="mt-8">
                        <Card className="bg-card">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Price</p>
                                        <p className="font-bold text-3xl text-foreground">
                                            GHS {product.price_ghs.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <AddToCartManager product={product} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-16 md:mt-24 border-t pt-16 md:pt-24">
                <h2 className="font-headline text-3xl font-bold text-foreground mb-8 text-center">
                    You Might Also Like
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
