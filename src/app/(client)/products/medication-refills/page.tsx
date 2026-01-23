import { getProductsWithStock } from "@/lib/client-actions";
import { ProductCard } from "../(components)/product-card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function MedicationPage() {
  // Filter by 'Medication Refills' category
  const medications = await getProductsWithStock("Medication Refills");

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Medication Refills
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-base text-muted-foreground">
              A confidential and reliable refill service for your essential
              long-term medications. Delivered with the same privacy and care
              you expect from DiscreetKit.
            </p>
          </div>

          <Alert className="max-w-4xl mx-auto mb-12 bg-card">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Prescription Required</AlertTitle>
            <AlertDescription>
              A valid prescription from a licensed healthcare provider is
              required for all medication refills. You will be prompted to
              upload a photo of your prescription during the checkout process.
            </AlertDescription>
          </Alert>

          {medications.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {medications.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl">
              <div className="text-4xl">💊</div>
              <h3 className="text-xl font-bold">Temporarily Unavailable</h3>
              <p className="text-muted-foreground max-w-md">
                We are currently restocking our medication inventory. Please
                check back soon.
              </p>
              <Button asChild variant="outline">
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
