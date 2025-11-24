'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { hover } from '@/lib/motion';

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export function ProductCard({ product }: { product: Product; }) {
    const { addItem, getItemQuantity } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!product) return null;

    const quantity = isMounted ? getItemQuantity(product.id) : 0;
    const isInCart = quantity > 0;
    const savings = product.savings_ghs;

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            whileHover="scale"
            variants={hover as any}
            className="group relative flex flex-col h-full"
        >
            <Link href={`/products/${product.id}`} className="block h-full" passHref>
                <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-black/5 transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10">
                    {/* Background Gradient Blob */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
                    
                    {product.image_url && (
                        <motion.div 
                            className="relative w-full h-full p-6"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-contain drop-shadow-lg"
                                sizes="(max-width: 768px) 50vw, 30vw"
                                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(250, 188))}`}
                            />
                        </motion.div>
                    )}

                    {savings && savings > 0 && (
                        <Badge variant="accent" className="absolute top-4 left-4 shadow-sm backdrop-blur-md bg-accent/90 text-white border-0">
                            Save GHS {savings.toFixed(2)}
                        </Badge>
                    )}

                    {/* Quick Add Button - Slides up on hover */}
                    <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addItem(product);
                            }}
                            className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                isInCart 
                                    ? "bg-success text-success-foreground hover:bg-success/90" 
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                            aria-label={isInCart ? "In cart" : "Add to cart"}
                        >
                            {isInCart ? <Check className="h-5 w-5" /> : <Plus className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </Link>

            <div className="mt-4 px-2">
                <Link href={`/products/${product.id}`} className="block group-hover:text-primary transition-colors duration-300">
                    <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2 tracking-tight">
                        {product.name}
                    </h3>
                </Link>
                <p className="mt-1 font-medium text-muted-foreground">
                    GHS {product.price_ghs.toFixed(2)}
                </p>
            </div>
        </motion.div>
    );
}
