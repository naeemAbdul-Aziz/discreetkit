"use client";

import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "../(components)/product-card";
import type { Product } from "@/lib/data";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { getProductsWithStock } from "@/lib/client-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function IntimacyEssentialsPage() {
  const [wellnessProducts, setWellnessProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      // Map "Intimacy Essentials" to actual catalog categories
      // Includes Wellness (Lubricants, Condoms) and Emergency (Postpill)
      const products = await getProductsWithStock(["Wellness", "Emergency"]);
      const intimacy = products.filter((p) =>
        p.category === "Emergency" ||
        (p.category === "Wellness" && (p.sub_category === "Lubricants" || p.sub_category === "Condoms"))
      );
      setWellnessProducts(intimacy);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const brands = useMemo(
    () => [
      "All",
      ...Array.from(new Set(wellnessProducts.map((p) => p.brand || ""))).filter(
        Boolean,
      ),
    ],
    [wellnessProducts],
  );
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(wellnessProducts.map((p) => p.sub_category || "")),
      ).filter(Boolean),
    ],
    [wellnessProducts],
  );

  const filteredProducts = useMemo(() => {
    return wellnessProducts.filter((product) => {
      const categoryMatch =
        categoryFilter === "All" || product.sub_category === categoryFilter;
      const brandMatch = brandFilter === "All" || product.brand === brandFilter;
      return categoryMatch && brandMatch;
    });
  }, [wellnessProducts, categoryFilter, brandFilter]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Intimacy Essentials
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
              Condoms, lube, and emergency contraception. Carefully selected,
              discreetly delivered.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12">
            <ToggleGroup
              type="single"
              value={categoryFilter}
              onValueChange={(value) => value && setCategoryFilter(value)}
              aria-label="Filter by category"
              className="flex-wrap justify-center"
            >
              {categories.map((cat) => (
                <ToggleGroupItem
                  key={cat}
                  value={cat}
                  aria-label={`Show ${cat}`}
                >
                  {cat}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <motion.div
            key={categoryFilter + brandFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl">
                {isLoading ? (
                  <div className="animate-pulse">
                    Loading wellness products...
                  </div>
                ) : (
                  <>
                    <div className="text-4xl">🌿</div>
                    <h3 className="text-xl font-bold">
                      Temporarily Unavailable
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      We are currently restocking our wellness essentials.
                      Please check back soon.
                    </p>
                    <Button asChild variant="outline">
                      <Link href="/products">Browse All Products</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
