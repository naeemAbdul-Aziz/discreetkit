
'use client';

import { useState } from 'react';
import { ProductCard } from '../(components)/product-card';
import type { Product } from '@/lib/data';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

type WellnessProduct = Product & {
  category: 'Contraception' | 'Condoms' | 'Personal Care';
};

const wellnessProducts: WellnessProduct[] = [
    {
        id: 4,
        name: 'Postpill (Emergency Contraceptive)',
        description: 'A single dose of emergency contraception to be taken after unprotected intercourse.',
        price_ghs: 90.00,
        student_price_ghs: 80.00,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png',
        brand: 'Partner Brand',
        featured: false,
        category: 'Contraception',
    },
    {
        id: 5,
        name: 'Extra Safe Condoms',
        description: 'Slightly thicker condoms for those who want ultimate reassurance.',
        price_ghs: 50.00,
        student_price_ghs: 40.00,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Durex',
        featured: false,
        category: 'Condoms',
    },
    {
        id: 6,
        name: 'Performa Condoms',
        description: 'Designed to help him last longer for extended pleasure.',
        price_ghs: 55.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Durex',
        featured: false,
        category: 'Condoms',
    },
    {
        id: 9,
        name: 'Flavored Condoms',
        description: 'A mix of banana and strawberry flavored condoms for extra fun.',
        price_ghs: 60.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Durex',
        featured: false,
        category: 'Condoms',
    },
    {
        id: 10,
        name: 'Fiesta Classic Condoms',
        description: 'The original and trusted choice for safety and comfort.',
        price_ghs: 45.00,
        student_price_ghs: 35.00,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Fiesta',
        featured: false,
        category: 'Condoms',
    },
    {
        id: 11,
        name: 'Fiesta Banana Condoms',
        description: 'Add a fun, fruity twist to your intimate moments.',
        price_ghs: 50.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Fiesta',
        featured: false,
        category: 'Condoms',
    },
    {
        id: 12,
        name: 'Fiesta Premium Ribbed',
        description: 'Ribbed for extra sensation and pleasure.',
        price_ghs: 55.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png',
        brand: 'Fiesta',
        featured: false,
        category: 'Condoms',
    },
    {
        id: 13,
        name: 'Aqua-based Personal Lubricant',
        description: 'A gentle, water-based lubricant for enhanced comfort.',
        price_ghs: 60.00,
        student_price_ghs: null,
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png',
        brand: 'Durex',
        featured: false,
        category: 'Personal Care',
    },
];

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
                    Explore contraception and personal care essentials. Carefully selected, discreetly delivered.
                </p>
            </div>
            
            {/* Filter Controls */}
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

            {/* Product Grid */}
            <motion.div 
                key={categoryFilter + brandFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
