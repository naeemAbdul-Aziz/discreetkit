"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./(components)/product-card";
import type { Product, Category } from "@/lib/data";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getFilteredProducts,
  getProductFilterOptions,
} from "@/lib/store-actions";
import { getSupabaseClient } from "@/lib/supabase"; // Keep for getCategories if not moved

// Helper to fetch categories (lightweight)
async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  return categories || [];
}

export default function ProductsPage() {
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // Filter Option State (Derived from DB)
  const [availableBrands, setAvailableBrands] = useState<string[]>(["All"]);
  const [availableWellnessCats, setAvailableWellnessCats] = useState<string[]>([
    "All",
  ]);

  // UI Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);

  // Active Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [wellnessCategoryFilter, setWellnessCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Initial Load: Fetch Filter Options & Categories
  useEffect(() => {
    const init = async () => {
      const [cats, options] = await Promise.all([
        getCategories(),
        getProductFilterOptions(),
      ]);
      setAllCategories(cats);
      setAvailableBrands(options.brands);
      setAvailableWellnessCats(options.wellnessCategories);
      setIsLoading(false);
    };
    init();
  }, []);

  // 2. Fetch Products when Filters/Page Change
  useEffect(() => {
    const fetch = async () => {
      setIsFetchingProducts(true);
      const data = await getFilteredProducts({
        page: currentPage,
        category: categoryFilter,
        sub_category: wellnessCategoryFilter,
        brand: brandFilter,
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setIsFetchingProducts(false);

      // Scroll to top if page changed ?? only if not first load?
      // window.scrollTo(0, 0);
    };

    // Debounce slightly to prevent flicker on rapid clicks? No, instant is fine.
    fetch();
  }, [categoryFilter, wellnessCategoryFilter, brandFilter, currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetFilters = () => {
    setCategoryFilter("All");
    setWellnessCategoryFilter("All");
    setBrandFilter("All");
    setCurrentPage(1);
  };

  const categoriesList = ["All", ...allCategories.map((c) => c.name)];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Our Health Products
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
              Your complete source for confidential health and wellness
              products.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 mb-12">
            {/* Main Categories */}
            <ToggleGroup
              type="single"
              value={categoryFilter}
              onValueChange={(value) => {
                if (value) {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                  if (value !== "Wellness") setWellnessCategoryFilter("All");
                }
              }}
              className="flex-wrap justify-center"
            >
              {categoriesList.map((cat) => (
                <ToggleGroupItem
                  key={cat}
                  value={cat}
                  aria-label={`Show ${cat}`}
                >
                  {cat}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* Sub Categories for Wellness */}
            <AnimatePresence>
              {categoryFilter === "Wellness" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden w-full flex flex-col items-center gap-4"
                >
                  <Separator className="my-2" />
                  <ToggleGroup
                    type="single"
                    value={wellnessCategoryFilter}
                    onValueChange={(value) => {
                      if (value) {
                        setWellnessCategoryFilter(value);
                        setCurrentPage(1);
                      }
                    }}
                    className="flex-wrap justify-center"
                  >
                    {availableWellnessCats.map((cat) => (
                      <ToggleGroupItem key={cat} value={cat}>
                        {cat}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <Separator className="my-2" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Brand Filter */}
            <Select
              value={brandFilter}
              onValueChange={(value) => {
                setBrandFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                {availableBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Grid */}
          {isFetchingProducts ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-muted h-[300px] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
            >
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <h3 className="text-xl font-semibold">No Products Found</h3>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your filters.
                  </p>
                  <Button variant="link" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-16">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isFetchingProducts}
              >
                Previous
              </Button>

              <span className="text-sm font-medium mx-4">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isFetchingProducts}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
