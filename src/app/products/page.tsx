
'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from './(components)/product-card';
import type { Product, WellnessProduct } from '@/lib/data';
import { wellnessProducts } from '@/lib/data';
import type { Metadata } from 'next';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase';
import { allTestKits } from './test-kits/page';

// This is now a client component, so metadata should be exported from a layout or parent if needed.
// We'll keep a placeholder here for reference.
// export const metadata: Metadata = {
//   title: 'Shop All Products',
//   description: 'Browse our full range of confidential health products, including HIV self-test kits, pregnancy tests, value bundles, and wellness essentials. Order online for discreet delivery.',
// };

const ITEMS_PER_PAGE = 12;

// This function would ideally be a server-side fetch, but for now we do it on client
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
     // Map over products to update images and cast numeric types
    return products.map(p => {
        let imageUrl = p.image_url;
        if (p.id === 1) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
        if (p.id === 2) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 3) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
        if (p.id === 7) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png';
        if (p.id === 8) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        if (p.id === 14) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
        if (p.id === 15) imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
        
        return {
            ...p,
            image_url: imageUrl,
            price_ghs: Number(p.price_ghs),
            student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
            savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
        };
    });
}


export default function ProductsPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [categoryFilter, setCategoryFilter] = useState('All');
    const [brandFilter, setBrandFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Fetch products on mount
    useState(() => {
        const fetchProducts = async () => {
            const dbProducts = await getProducts();
            const products = [...dbProducts, ...wellnessProducts, ...allTestKits].sort((a, b) => a.id - b.id);
            const uniqueProducts = Array.from(new Map(products.map(p => [p.id, p])).values());
            setAllProducts(uniqueProducts);
            setIsLoading(false);
        }
        fetchProducts();
    }, []);

    const screeningKitIds = [1, 2, 14, 17, 18];
    const bundleIds = [3, 7, 8, 15];

    const categories = ['All', 'Test Kits', 'Bundles', 'Wellness'];
    const brands = useMemo(() => ['All', ...Array.from(new Set(allProducts.map(p => p.brand || 'DiscreetKit'))).filter(Boolean)], [allProducts]);
    
    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const categoryMatch = categoryFilter === 'All' ||
                (categoryFilter === 'Test Kits' && screeningKitIds.includes(product.id)) ||
                (categoryFilter === 'Bundles' && bundleIds.includes(product.id)) ||
                (categoryFilter === 'Wellness' && !screeningKitIds.includes(product.id) && !bundleIds.includes(product.id));
            
            const brandMatch = brandFilter === 'All' || (product.brand || 'DiscreetKit') === brandFilter;
            
            return categoryMatch && brandMatch;
        });
    }, [allProducts, categoryFilter, brandFilter]);

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
            
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12">
                <ToggleGroup
                    type="single"
                    value={categoryFilter}
                    onValueChange={(value) => { if (value) { setCategoryFilter(value); setCurrentPage(1); } }}
                    aria-label="Filter by category"
                    className="flex-wrap justify-center"
                >
                    {categories.map(cat => (
                        <ToggleGroupItem key={cat} value={cat} aria-label={`Show ${cat}`}>
                            {cat}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
                
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-muted h-[350px] animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div 
                    key={categoryFilter + brandFilter + currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {paginatedProducts.length > 0 ? (
                        paginatedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16">
                            <h3 className="text-xl font-semibold">No Products Found</h3>
                            <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
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
