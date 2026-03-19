import { getProductsWithStock } from "@/lib/client-actions";
import { ProductCard } from "../(components)/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Value Bundles | DiscreetKit Ghana",
  description:
    "Save on essential health products with our curated value bundles. Get everything you need in one discreet package.",
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function BundlesPage() {
  const bundles = await getProductsWithStock("Value Bundles");
  // Sort by biggest savings first, then by price as a tiebreaker
  const sorted = [...bundles].sort(
    (a, b) =>
      (b.savings_ghs || 0) - (a.savings_ghs || 0) || a.price_ghs - b.price_ghs,
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 pt-8 pb-10 md:px-6 md:pt-12 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Value Bundles
            </h1>
            <p className="mt-2 max-w-lg mx-auto text-sm text-muted-foreground">
              Everything you need, bundled and delivered discreetly. Save more.
            </p>
          </div>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl">
              <div className="text-4xl">📦</div>
              <h3 className="text-xl font-bold">Temporarily Unavailable</h3>
              <p className="text-muted-foreground max-w-md">
                We are putting together new value bundles. Please check back
                soon for great deals.
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
