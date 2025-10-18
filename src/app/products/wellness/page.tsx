
'use client';

import { useState } from 'react';
import { ProductCard } from '../(components)/product-card';
import type { WellnessProduct } from '@/lib/data';
import { wellnessProducts } from '@/lib/data';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const brands = ['All', ...Array.from(new Set(wellnessProducts.map(p => p.brand || ''))).filter(Boolean)];
const categories = ['All', 'Condoms', 'Contraception', 'Personal Care'];

export default function WellnessPage() {
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [brandFilter, setBrandFilter] = useState('All');

    const filteredProducts = wellnessProducts.filter(product => {
        const categoryMatch = categoryFilter === 'All' || product.category === categoryFilter;
        const brandMatch = brandFilter === 'All' || product.brand === brandFilter;
        return categoryMatch && brandMatch;
    });

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Wellness Essentials
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Explore contraception, personal care, and more. Carefully selected, discreetly delivered.
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
                    {categories.map(cat => (
                        <ToggleGroupItem key={cat} value={cat} aria-label={`Show ${cat}`}>
                            {cat}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
                
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by brand" />
                    </SelectTrigger>
                    <SelectContent>
                        {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            
            <motion.div 
                key={categoryFilter + brandFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
            >
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-16">
                        <h3 className="text-xl font-semibold">No Products Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                    </div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
}
