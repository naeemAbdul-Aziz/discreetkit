
import { getSupabaseClient } from '@/lib/supabase';
import type { Product } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AddToCartManager } from './(components)/add-to-cart-manager';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Package, FileText, ShieldCheck, Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { ProductCard } from '../(components)/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


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
        .limit(4);

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
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Left Column: Image and Details */}
            <div className="space-y-8">
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

                <Tabs defaultValue="instructions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="instructions">
                      <FileText className="mr-2 h-4 w-4" /> Usage
                    </TabsTrigger>
                    <TabsTrigger value="contents">
                      <Package className="mr-2 h-4 w-4" /> In the Box
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="instructions" className="border rounded-lg p-6 mt-4">
                     <ul className="space-y-3 text-muted-foreground">
                        {instructions.map((step, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span>{step}</span>
                            </li>
                        ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="contents" className="border rounded-lg p-6 mt-4">
                    <ul className="space-y-3 text-muted-foreground">
                        {boxContents.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                 <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                 <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                  </TabsContent>
                </Tabs>
            </div>

            {/* Right Column: Sticky CTA */}
            <div className="md:sticky md:top-24">
                <div className="flex flex-col gap-6">
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

                    <Card className="bg-card">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col items-start gap-2">
                                {product.savings_ghs && product.savings_ghs > 0 && (
                                    <Badge variant="accent">
                                        Bundle & Save GHS {product.savings_ghs.toFixed(2)}
                                    </Badge>
                                )}
                                <p className="font-bold text-3xl text-foreground">
                                    GHS {product.price_ghs.toFixed(2)}
                                </p>
                            </div>
                            
                            <AddToCartManager product={product} />

                            <div className="space-y-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    <span>Discreet, unbranded shipping</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-primary" />
                                    <span>Secure online payment via Paystack</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-16 md:mt-24 border-t pt-16 md:pt-24">
                <h2 className="font-headline text-3xl font-bold text-foreground mb-8 text-center">
                    You Might Also Like
                </h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {relatedProducts.map((p) => (
                           <CarouselItem key={p.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <div className="h-full p-1">
                                    <ProductCard product={p} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2" />
                </Carousel>
            </div>
        )}
      </div>
    </div>
  );
}
