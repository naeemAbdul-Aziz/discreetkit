/**
 * @file product-selector.tsx
 * @description displays a selection of product categories, linking to the main shop page.
 *              It uses a carousel on mobile and a grid on desktop.
 */

'use client';

import { useState, useEffect, useCallback, useActionState, useRef } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Lightbulb, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveSuggestion } from '@/lib/actions';

const categories = [
    {
        name: 'Test Kits',
        description: 'Private, WHO-approved self-test kits.',
        examples: ['HIV Self-test', 'Pregnancy Test'],
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png',
        image_hint: 'HIV test kit',
        href: '/products/test-kits'
    },
    {
        name: 'Wellness Essentials',
        description: 'Contraception and personal care items.',
        examples: ['Emergency Contraception', 'Condoms & Lube'],
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png',
        image_hint: 'emergency contraception pill',
        href: '/products/wellness'
    },
    {
        name: 'Value Bundles',
        description: 'Save money with our curated bundles.',
        examples: ['The All-In-One', 'Support Bundle'],
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png',
        image_hint: 'health product bundle',
        href: '/products/bundles'
    },
    {
        name: 'Medication Refills',
        description: 'Confidential refill service for your essential prescriptions.',
        examples: ['HIV Treatment', 'Long-term Support'],
        image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1760350797/prophylaxis_care_kit_qoksc6.png',
        image_hint: 'prescription medication bottle',
        href: '/products/medication'
    }
]

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


export function ProductSelector() {
    const [api, setApi] = useState<EmblaCarouselType | undefined>();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const [state, formAction, isPending] = useActionState(saveSuggestion, null);

    useEffect(() => {
        if (state?.success) {
            toast({
                title: "Suggestion Received!",
                description: "Thank you for helping us improve our catalog.",
            });
            formRef.current?.reset();
        } else if (state?.message) {
            toast({
                variant: 'destructive',
                title: "Submission Failed",
                description: state.message,
            });
        }
    }, [state, toast]);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!api) return;
        onSelect(api);
        api.on('select', onSelect);
        api.on('reInit', onSelect);
        return () => {
            api.off('select', onSelect);
        };
    }, [api, onSelect]);

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
                
                {/* Mobile Carousel */}
                <div className="lg:hidden">
                    <Carousel
                        setApi={setApi}
                        opts={{ align: 'center', loop: false }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {categories.map((category) => (
                                <CarouselItem key={category.name} className="basis-4/5 md:basis-1/2">
                                    <div className="p-1 h-full">
                                        <Link href={category.href} className="h-full block group">
                                            <Card className="h-full flex flex-col rounded-2xl bg-card overflow-hidden">
                                                <div className="relative aspect-square w-full bg-muted/50">
                                                    <Image
                                                        src={category.image_url}
                                                        alt={category.name}
                                                        fill
                                                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                                        sizes="(max-width: 768px) 80vw, 50vw"
                                                        data-ai-hint={category.image_hint}
                                                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
                                                    />
                                                </div>
                                                <div className="p-6 flex flex-col flex-grow">
                                                    <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                                                    <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                                                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-grow">
                                                        {category.examples.map(example => (
                                                            <li key={example} className="flex items-center gap-2">
                                                                <Check className="h-4 w-4 text-primary" />
                                                                <span>{example}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-6 text-sm font-semibold text-primary flex items-center gap-2 group-hover:underline">
                                                        Shop Now <ArrowRight className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {categories.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => api?.scrollTo(index)}
                                className={cn(
                                    'h-2 w-2 rounded-full bg-border transition-all',
                                    index === selectedIndex ? 'w-4 bg-primary' : 'hover:bg-primary/50'
                                )}
                                aria-label={`go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="h-full"
                        >
                            <Link href={category.href} className="h-full block group">
                                <Card className="h-full flex flex-col rounded-2xl bg-card overflow-hidden">
                                     <div className="relative aspect-square w-full bg-muted/50">
                                        <Image
                                            src={category.image_url}
                                            alt={category.name}
                                            fill
                                            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                            sizes="25vw"
                                            data-ai-hint={category.image_hint}
                                            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                                        
                                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-grow">
                                            {category.examples.map(example => (
                                                <li key={example} className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-primary" />
                                                    <span>{example}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-6 text-sm font-semibold text-primary flex items-center gap-2 group-hover:underline">
                                            Shop Now <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <Button asChild variant="outline" size="lg">
                        <Link href="/products">
                            Shop All Products
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>

                 {/* Product Suggestion Box */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <Card className="p-6 sm:p-8 bg-card rounded-2xl shadow-lg">
                         <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
                            <Lightbulb className="h-12 w-12 sm:h-16 sm:w-16 text-primary flex-shrink-0" />
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-foreground">Can't Find What You're Looking For?</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Let us know what products you'd like to see in our catalog.
                                </p>
                                 <form ref={formRef} action={formAction} className="mt-4 flex flex-col sm:flex-row items-stretch gap-2">
                                    <Textarea
                                        name="suggestion"
                                        placeholder="Suggest a product or feature..."
                                        className="w-full sm:flex-grow"
                                        required
                                    />
                                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Suggest</>}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
