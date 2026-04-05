import { getProductsWithStock } from "@/lib/client-actions";
import { ServiceCard } from "./service-card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Hospital, MapPin, CheckCircle2 } from "lucide-react";

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
            <p className="mt-1.5 max-w-lg mx-auto text-sm text-muted-foreground text-balance">
              Private, automated delivery of essential medications via our clinical partner network.
            </p>
          </div>

          {/* [NEW] UGMC Pilot Banner */}
          <div className="max-w-4xl mx-auto mb-10 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="flex-[3] p-8 md:p-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/20 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    Pilot Program
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Live in Ghana</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">ART Refills @ UGMC</h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    We've partnered with the <b>University of Ghana Medical Centre (UGMC)</b> to automate HIV medication refills. Enroll using your hospital-issued code for discreet, nationwide delivery.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Hospital className="h-4 w-4 text-primary" />
                    Partner Hospital Verified
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    Nationwide Logistics
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Zero-Storage Privacy
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-primary/5 flex items-center justify-center p-6 border-l border-primary/5">
                <div className="text-center">
                   <div className="text-3xl mb-1">🏦</div>
                   <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">UGMC Hub</div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-10 md:mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {[
                { step: "01", title: "Select Meds", desc: "Choose your supply." },
                { step: "02", title: "Hospital Auth", desc: "Use your partner code." },
                { step: "03", title: "Automated", desc: "Monthly delivery." },
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
