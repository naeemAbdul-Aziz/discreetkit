import { getProductsWithStock } from "@/lib/client-actions";
import { ServiceCard } from "./service-card";
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
      <div className="container mx-auto px-4 pt-8 pb-10 md:px-6 md:pt-12 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Medication Refills
            </h1>
            <p className="mt-2 max-w-lg mx-auto text-sm text-muted-foreground">
              Private subscription delivery for your essential medications. Enroll once, we handle the rest.
            </p>
          </div>

          <Alert className="max-w-4xl mx-auto mb-12 bg-card">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Enrollment & Verification</AlertTitle>
            <AlertDescription>
              To ensure compliance, you must upload a valid prescription or
              medical report during enrollment. Our partner pharmacies will
              verify your documents before the first delivery.
            </AlertDescription>
          </Alert>

          {medications.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {medications.map((product) => (
                <ServiceCard key={product.id} product={product} />
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
