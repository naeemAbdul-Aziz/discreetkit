
import { getSupabaseClient } from '@/lib/supabase';
import { ProductCard } from '../(components)/product-card';
import type { Product } from '@/lib/data';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function getMedications(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Medication')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching medications:", error);
        return [];
    }
    return data.map(p => ({
        ...p,
        price_ghs: Number(p.price_ghs),
        student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
        savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
    }));
}


export default async function MedicationPage() {
    const medications = await getMedications();
    
    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                            Medication Refills
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-base text-muted-foreground">
                            A confidential and reliable refill service for your essential long-term medications. Delivered with the same privacy and care you expect from DiscreetKit.
                        </p>
                    </div>

                    <Alert className="max-w-4xl mx-auto mb-12 bg-card">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Prescription Required</AlertTitle>
                        <AlertDescription>
                            A valid prescription from a licensed healthcare provider is required for all medication refills. You will be prompted to upload a photo of your prescription during the checkout process.
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
                        {medications.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
