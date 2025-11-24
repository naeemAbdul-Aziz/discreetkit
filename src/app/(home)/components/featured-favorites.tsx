
/**
 * @file featured-favorites.tsx
 * @description A section to showcase top-rated products, using social proof
/**
 * @file featured-favorites.tsx
 * @description A section to showcase top-rated products, using social proof
 *              and urgency to encourage conversion.
 */

'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ProductCard } from '@/app/products/(components)/product-card';
import type { Product } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FeaturedFavoritesSection({ products }: { products: (Product & { badge: string })[] }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={targetRef} className="relative h-[200vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* Section Title Overlay */}
        <div className="absolute top-12 left-6 z-10 md:top-24 md:left-24 pointer-events-none">
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-foreground/5 uppercase"
           >
             Curated <br /> Collection
           </motion.h2>
        </div>

        <motion.div style={{ x }} className="flex gap-8 md:gap-12 pl-6 md:pl-24 items-center">
          
          {/* Intro Card */}
          <div className="flex h-[500px] w-[300px] md:w-[400px] shrink-0 flex-col justify-center pr-12">
            <span className="mb-4 inline-block h-1 w-12 bg-primary" />
            <h3 className="mb-6 font-headline text-4xl font-bold leading-tight tracking-tight">
              Our Most <br />
              <span className="text-primary italic">Trusted</span> Essentials.
            </h3>
            <p className="mb-8 text-lg text-muted-foreground">
              Hand-picked for privacy, reliability, and peace of mind. These are the products our community relies on.
            </p>
            <Link href="/products" className="group flex items-center text-lg font-semibold text-primary">
              View All Products 
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Product Cards */}
          {products.map((product) => (
            <div key={product.id} className="h-[500px] w-[350px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}

          {/* End Card - "Fulfilling Experience" */}
           <div className="relative h-[500px] w-[400px] shrink-0 overflow-hidden rounded-[2.5rem] bg-primary group cursor-pointer">
              <Link href="/products" className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground p-8 text-center">
                 <div className="mb-6 h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110">
                    <ArrowRight className="h-8 w-8" />
                 </div>
                 <h3 className="text-3xl font-bold mb-2">See Everything</h3>
                 <p className="text-primary-foreground/80">Explore our full range of discreet essentials.</p>
                 
                 {/* Decorative Circle */}
                 <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
              </Link>
           </div>

        </motion.div>
      </div>
    </section>
  );
}
