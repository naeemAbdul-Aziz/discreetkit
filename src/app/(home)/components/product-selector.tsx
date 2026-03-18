/**
 * @file product-selector.tsx
 * @description displays a selection of product categories, linking to the main shop page.
 *              It uses a carousel on mobile and a grid on desktop.
 */

"use client";

import {
  useState,
  useEffect,
  useCallback,
  useActionState,
  useRef,
} from "react";
import type { EmblaCarouselType } from "embla-carousel";
import Link from "next/link";
// import Image from 'next/image'; // Removing Image import
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Lightbulb, Send } from "lucide-react";
import { BrandSpinner } from "@/components/brand-spinner";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { CategoryShape } from "./category-shapes";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveSuggestion } from "@/lib/actions";

type Category = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
};

type DisplayCategory = {
  name: string;
  description: string;
  examples: string[];
  image_url: string;
  image_hint: string;
  href: string;
};

// Fallback hardcoded categories (used if database fetch fails)
const fallbackCategories: DisplayCategory[] = [
  {
    name: "Test Kits",
    description: "Private, WHO-approved self-test kits.",
    examples: ["HIV Self-test", "Pregnancy Test"],
    image_url:
      "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png",
    image_hint: "HIV test kit",
    href: "/products/test-kits",
  },
  {
    name: "Emergency Contraceptive",
    description: "Fast, discreet delivery of emergency contraception.",
    examples: ["Postpill", "Morning After Pill"],
    image_url:
      "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png",
    image_hint: "emergency contraception pill",
    href: "/products/emergency-contraceptives",
  },
  {
    name: "Condoms",
    description: "Premium protection delivered in 100% plain packaging.",
    examples: ["Durex", "Fiesta", "Kiss"],
    image_url:
      "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png",
    image_hint: "condoms",
    href: "/products/condoms",
  },
  {
    name: "Male Enhancement",
    description: "Boost confidence and performance with privacy.",
    examples: ["Delay Sprays", "Supplements"],
    image_url:
      "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png",
    image_hint: "male enhancement",
    href: "/products/male-enhancement",
  },
  {
    name: "Lubricants",
    description: "Enhance comfort and intimacy safely.",
    examples: ["K-Y Jelly", "Durex Play"],
    image_url:
      "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png",
    image_hint: "lubricants",
    href: "/products/lubricants",
  },
  {
    name: "Value Bundles",
    description: "Save money with our curated bundles.",
    examples: ["The All-In-One", "Support Bundle"],
    image_url:
      "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png",
    image_hint: "health product bundle",
    href: "/products/value-bundles",
  },
  {
    name: "Medication Refills",
    description:
      "Confidential refill service for your essential prescriptions.",
    examples: ["HIV Treatment", "Long-term Support"],
    image_url:
      "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1760350797/prophylaxis_care_kit_qoksc6.png",
    image_hint: "prescription medication bottle",
    href: "/products/medication-refills",
  },
];

// Map database categories to display format
function mapCategoriesToDisplay(dbCategories: Category[]): DisplayCategory[] {
  const categoryExamples: Record<string, string[]> = {
    "Test Kits": ["HIV Self-test", "Pregnancy Test"],
    "Emergency Contraceptive": ["Postpill", "Morning After Pill"],
    "Condoms": ["Durex", "Fiesta", "Kiss"],
    "Male enhancement drugs": ["Delay Sprays", "Supplements"],
    "Lubricants": ["K-Y Jelly", "Durex Play"],
    "Value Bundles": ["Emergency Kit", "Couple Bundle", "The All-In-One"],
    "Medication Refills": ["HIV Treatment", "PrEP"],
  };

  return dbCategories.map((cat) => ({
    name: cat.name,
    description: cat.description,
    examples: categoryExamples[cat.name] || ["View Products"],
    image_url: cat.image_url,
    image_hint: cat.name.toLowerCase(),
    href: `/products/${cat.slug}`,
  }));
}

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
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export function ProductSelector({
  categories: dbCategories,
}: {
  categories: Category[];
}) {
  const [api, setApi] = useState<EmblaCarouselType | undefined>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(saveSuggestion, null);

  // Use database categories if available, otherwise fallback
  const allCategories =
    dbCategories.length > 0
      ? mapCategoriesToDisplay(dbCategories)
      : fallbackCategories;

  const mainCategories = allCategories.filter((c) => c.name !== "Medication Refills");
  const refillCategory = allCategories.find((c) => c.name === "Medication Refills");

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Suggestion Received!",
        description: "Thank you for helping us improve our catalog.",
      });
      formRef.current?.reset();
    } else if (state?.message) {
      toast({
        variant: "destructive",
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
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <section id="products" className="py-8 md:pt-8 md:pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Our Products
          </p>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Safe. Anonymous. Fast.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
            Your confidential health essentials, delivered with trust. Browse
            our categories to get started.
          </p>
        </div>

        {/* Unified Responsive Carousel */}
        <div className="w-full">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: false }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {mainCategories.map((category) => (
                <CarouselItem
                  key={category.name}
                  className="pl-4 basis-[85%] sm:basis-1/2 md:basis-[45%] lg:basis-[30%] xl:basis-[25%]"
                >
                  <div className="p-1 h-full">
                    <Link href={category.href} className="h-full block group">
                      <Card className="h-full flex flex-col rounded-3xl bg-card overflow-hidden">
                        <div className="relative aspect-square w-full bg-muted/50 rounded-3xl overflow-hidden p-0">
                          <CategoryShape category={category.name} />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold text-foreground">
                            {category.name}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {category.description}
                          </p>
                          <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-grow">
                            {category.examples.map((example) => (
                              <li
                                key={example}
                                className="flex items-center gap-2"
                              >
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
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
            {mainCategories.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 w-2 rounded-full bg-border transition-all",
                  index === selectedIndex
                    ? "w-6 bg-primary"
                    : "hover:bg-primary/50",
                )}
                aria-label={`go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid (Removed in favor of universal carousel) */}

        <div className="text-center mt-12 mb-16">
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 shadow-sm">
            <Link href="/products">
              Explore The Catalog
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Dedicated Medication Refills Section */}
        {refillCategory && (
          <div className="max-w-6xl mx-auto px-4 lg:px-0 mt-6 lg:mt-12">
            <Card className="relative overflow-hidden rounded-[2.5rem] group border-0 shadow-2xl">
              <div className="absolute inset-0 z-0 bg-black">
                <CategoryShape category="Medication Refills" className="w-full h-full opacity-60 transition-transform duration-[20s] ease-linear group-hover:scale-110" />
              </div>
              <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 bg-black/40 backdrop-blur-md">
                <div className="w-full md:w-2/3 text-center md:text-left text-white">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold tracking-tight">
                    {refillCategory.name}
                  </h3>
                  <p className="mt-4 text-lg text-white/90 max-w-2xl">
                    {refillCategory.description} Continuous confidential supply exactly when you need it.
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                    {refillCategory.examples.map((example) => (
                      <li key={example} className="flex items-center gap-2 bg-black/50 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 transition-colors shadow-sm">
                        <Check className="h-4 w-4 text-emerald-400 font-bold" />
                        <span className="text-sm font-medium">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-full md:w-1/3 flex justify-center md:justify-end">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white rounded-full px-10 py-7 text-xl font-bold shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-emerald-500/40 transition-all hover:scale-105 hover:-translate-y-1 block md:inline-flex border-0 text-center">
                    <Link href={refillCategory.href} className="justify-center">
                      Get Your Refill <ArrowRight className="ml-2 h-6 w-6" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Product Suggestion Box */}
        <div className="mt-20 max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 bg-card rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
              <Lightbulb className="h-12 w-12 sm:h-16 sm:w-16 text-primary flex-shrink-0" />
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-foreground">
                  Can&apos;t Find What You&apos;re Looking For?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Let us know what products you&apos;d like to see in our catalog.
                </p>
                <form
                  ref={formRef}
                  action={formAction}
                  className="mt-4 flex flex-col sm:flex-row items-stretch gap-2"
                >
                  <Textarea
                    name="suggestion"
                    placeholder="Suggest a product or feature..."
                    className="w-full sm:flex-grow"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto"
                  >
                    {isPending ? (
                      <BrandSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Suggest
                      </>
                    )}
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
