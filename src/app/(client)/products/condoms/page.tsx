import { getProductsWithStock } from "@/lib/client-actions";
import { ProductCard } from "../(components)/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function CondomsPage() {
  const products = await getProductsWithStock("Condoms");

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Condoms
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
              Premium protection delivered in 100% plain, unbranded packaging. No questions asked, just safe and discreet delivery right to your door.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl">
              <div className="text-4xl">🛡️</div>
              <h3 className="text-xl font-bold">Temporarily Unavailable</h3>
              <p className="text-muted-foreground max-w-md">
                We are currently restocking our inventory. Please check back soon or browse our other categories.
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
