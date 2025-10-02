/**
 * @file product-selector.tsx
 * @description displays a selection of product categories, linking to the main shop page.
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, HeartPulse, Package, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
    {
        name: 'Test Kits',
        description: 'Private, WHO-approved self-test kits for HIV and pregnancy.',
        icon: HeartPulse,
        href: '/products#test-kits'
    },
    {
        name: 'Value Bundles',
        description: 'Save money with our curated bundles for complete peace of mind.',
        icon: Package,
        href: '/products#bundles'
    },
    {
        name: 'Wellness Essentials',
        description: 'Complete your health toolkit with contraception and personal care items.',
        icon: Sparkles,
        href: '/products#wellness'
    },
]

export function ProductSelector() {
    return (
        <section id="products" className="py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                        Our Products
                    </p>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                       Safe. Discreet. Sorted.
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Your confidential health essentials, delivered with trust. Browse our categories to get started.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link href={category.href} className="h-full block group">
                                <Card className="h-full flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-card hover:bg-muted transition-colors">
                                    <category.icon className="h-10 w-10 text-primary mb-4" />
                                    <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                                    <p className="mt-2 text-base text-muted-foreground flex-grow">{category.description}</p>
                                    <div className="mt-6 text-sm font-semibold text-primary flex items-center gap-2 group-hover:underline">
                                        Shop Now <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button asChild variant="outline" size="lg">
                        <Link href="/products">
                            Shop All Products
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
