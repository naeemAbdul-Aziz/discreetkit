'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingCart, Check, ShieldCheck, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/data';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';

interface ProductDetailContentProps {
    product: Product;
    relatedProducts: Product[];
}

export function ProductDetailContent({ product, relatedProducts }: ProductDetailContentProps) {
    const { addItem, getItemQuantity } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const quantity = getItemQuantity(product.id);
    const isInCart = quantity > 0;

    const handleAddToCart = () => {
        addItem(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="font-medium text-foreground">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
                {/* Product Image */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-lg border border-border/50"
                >
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-8"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-muted/20">
                            <Package className="h-24 w-24 text-muted-foreground/20" />
                        </div>
                    )}
                    
                    {product.savings_ghs && product.savings_ghs > 0 && (
                        <Badge className="absolute top-4 left-4 bg-accent text-white border-0 px-3 py-1 text-sm font-medium shadow-md">
                            Save GHS {product.savings_ghs.toFixed(2)}
                        </Badge>
                    )}
                </motion.div>

                {/* Product Details */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col"
                >
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-4">
                            <span className="text-3xl font-bold text-primary">
                                GHS {product.price_ghs.toFixed(2)}
                            </span>
                            {product.student_price_ghs && (
                                <Badge variant="outline" className="text-muted-foreground border-primary/20 bg-primary/5">
                                    Student: GHS {product.student_price_ghs.toFixed(2)}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="prose prose-neutral dark:prose-invert max-w-none mb-8 text-muted-foreground">
                        <p>{product.description}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <Button 
                            size="lg" 
                            className={cn(
                                "flex-1 text-lg h-14 rounded-xl transition-all duration-300",
                                isAdded ? "bg-success hover:bg-success/90" : ""
                            )}
                            onClick={handleAddToCart}
                        >
                            {isAdded ? (
                                <>
                                    <Check className="mr-2 h-5 w-5" />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Add to Cart
                                </>
                            )}
                        </Button>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold">Discreet Packaging</p>
                                <p className="text-muted-foreground text-xs">Plain, unlabeled boxes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold">Fast Delivery</p>
                                <p className="text-muted-foreground text-xs">Within 24 hours</p>
                            </div>
                        </div>
                    </div>

                    {product.in_the_box && product.in_the_box.length > 0 && (
                        <div className="mt-8">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                What's in the box
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {product.in_the_box.map((item, i) => (
                                    <li key={i} className="flex items-center text-sm text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-20">
                    <h2 className="text-2xl font-bold mb-8">You might also like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
