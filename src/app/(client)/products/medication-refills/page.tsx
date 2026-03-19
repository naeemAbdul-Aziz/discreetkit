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
          <div className="text-center mb-6 md:mb-8">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              Medication Refills
            </h1>
            <p className="mt-1.5 max-w-lg mx-auto text-sm text-muted-foreground">
              Private subscription delivery for your essential medications.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-10 md:mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {[
                { step: "01", title: "Select Meds", desc: "Choose your refill." },
                { step: "02", title: "Upload Info", desc: "Prescription required." },
                { step: "03", title: "Verify & Go", desc: "We deliver monthly." },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                  <span className="text-xs font-bold text-primary bg-primary/10 w-7 h-7 flex items-center justify-center rounded-full shrink-0">
                    {s.step}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold">{s.title}</h4>
                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
