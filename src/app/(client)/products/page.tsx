
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from './(components)/product-card';
import type { Product } from '@/lib/data';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase';
import { Separator } from '@/components/ui/separator';

const ITEMS_PER_PAGE = 12;

async function getProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }
    return products.map((p: any) => ({
        ...p,
        price_ghs: Number(p.price_ghs),
        student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
        savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
    }));
}


export default function ProductsPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [categoryFilter, setCategoryFilter] = useState('All');
    const [wellnessCategoryFilter, setWellnessCategoryFilter] = useState('All');
    const [brandFilter, setBrandFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        const fetchProducts = async () => {
            const products = await getProducts();
            setAllProducts(products);
            setIsLoading(false);
        }
        fetchProducts();
    }, []);

    const categories = useMemo(() => ['All', ...Array.from(new Set(allProducts.map((p: Product) => p.category).filter(Boolean))) as string[]], [allProducts]);
    const wellnessCategories = useMemo(() => ['All', ...Array.from(new Set(allProducts.filter((p: Product) => p.category === 'Wellness').map((p: Product) => p.sub_category).filter(Boolean))) as string[]], [allProducts]);
    const brands = useMemo(() => ['All', ...Array.from(new Set(allProducts.map((p: Product) => p.brand || 'DiscreetKit'))).filter(Boolean)], [allProducts]);
    
    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            let categoryMatch = categoryFilter === 'All' || product.category === categoryFilter;

            if (categoryFilter === 'Wellness' && wellnessCategoryFilter !== 'All') {
                categoryMatch = product.category === 'Wellness' && product.sub_category === wellnessCategoryFilter;
            }
            
            const brandMatch = brandFilter === 'All' || (product.brand || 'DiscreetKit') === brandFilter;
            
            return categoryMatch && brandMatch;
        });
    }, [allProducts, categoryFilter, wellnessCategoryFilter, brandFilter]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    const resetFilters = () => {
        setCategoryFilter('All');
        setWellnessCategoryFilter('All');
        setBrandFilter('All');
        setCurrentPage(1);
    };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Our Health Products
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Your complete source for confidential health and wellness products.
                </p>
            </div>
            
             <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 mb-12">
                <ToggleGroup
                    type="single"
                    value={categoryFilter}
                    onValueChange={(value) => { if (value) { setCategoryFilter(value); setCurrentPage(1); if (value !== 'Wellness') setWellnessCategoryFilter('All'); } }}
                    aria-label="Filter by category"
                    className="flex-wrap justify-center"
                >
                    {categories.map(cat => (
                        <ToggleGroupItem key={cat} value={cat} aria-label={`Show ${cat}`}>
                            {cat}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                <AnimatePresence>
                    {categoryFilter === 'Wellness' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden w-full flex flex-col items-center gap-4"
                        >
                            <Separator className="my-2" />
                             <ToggleGroup
                                type="single"
                                value={wellnessCategoryFilter}
                                onValueChange={(value) => { if (value) { setWellnessCategoryFilter(value); setCurrentPage(1); } }}
                                aria-label="Filter by wellness sub-category"
                                className="flex-wrap justify-center"
                            >
                                {wellnessCategories.map(cat => (
                                    <ToggleGroupItem key={cat} value={cat} aria-label={`Show ${cat}`}>
                                        {cat}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                            <Separator className="my-2" />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <Select value={brandFilter} onValueChange={(value) => { setBrandFilter(value); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by brand" />
                    </SelectTrigger>
                    <SelectContent>
                        {brands.map(brand => (
                            <SelectItem key={brand} value={brand!}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-3xl bg-muted h-[300px] animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div 
                    key={categoryFilter + wellnessCategoryFilter + brandFilter + currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {paginatedProducts.length > 0 ? (
                        paginatedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16">
                            <h3 className="text-xl font-semibold">No Products Found</h3>
                            <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                            <Button variant="link" onClick={resetFilters}>Clear Filters</Button>
                        </div>
                    )}
                </motion.div>
            )}

            {totalPages > 1 && (
                 <div className="flex items-center justify-center space-x-2 mt-16">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
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
