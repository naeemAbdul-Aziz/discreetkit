import { ProductCard } from '../(components)/product-card';
import { medications } from '@/lib/medications';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MedicationPage() {
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

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {medications.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
