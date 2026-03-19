"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  Package,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/data";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductDetailContentProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailContent({
  product,
  relatedProducts,
}: ProductDetailContentProps) {
  const { addItem, getItemQuantity } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const quantity = getItemQuantity(product.id);
  const isInCart = quantity > 0;

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling 400px
      setShowStickyCTA(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      {/* Sticky CTA Bar */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b shadow-lg"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white shadow-sm shrink-0 hidden sm:block">
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm md:text-base truncate">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary">
                      GHS {product.price_ghs.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className={cn(
                    "h-12 px-6 md:px-8 font-semibold transition-all duration-300 shrink-0",
                    isAdded ? "bg-success hover:bg-success/90" : "",
                  )}
                  onClick={handleAddToCart}
                >
                  {isAdded ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-[13px] text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 mx-1.5 opacity-50" />
          <Link
            href="/products"
            className="hover:text-primary transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="h-3 w-3 mx-1.5 opacity-50" />
          <span className="font-medium text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square bg-[#f5f5f1] rounded-2xl overflow-hidden shadow-sm border-0 lg:sticky lg:top-8 lg:self-start"
          >
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/20">
                <Package className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}

            {product.savings_ghs && product.savings_ghs > 0 && (
              <Badge className="absolute top-6 left-6 bg-accent text-white border-0 px-4 py-2 text-base font-semibold shadow-lg">
                Save GHS {product.savings_ghs.toFixed(2)}
              </Badge>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              {product.category && (
                <Badge
                  variant="secondary"
                  className="text-xs uppercase tracking-wider font-medium"
                >
                  {product.category}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-[-0.02em] leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-primary tracking-[-0.02em]">
                  GHS {product.price_ghs.toFixed(2)}
                </span>
              </div>
              {product.student_price_ghs && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                  <span className="text-sm font-medium text-green-700">
                    Student Price: GHS {product.student_price_ghs.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Primary CTA */}
            <div className="space-y-4">
              <Button
                size="lg"
                className={cn(
                  "w-full h-12 md:h-14 text-base md:text-lg font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg",
                  isAdded ? "bg-success hover:bg-success/90" : "",
                )}
                onClick={handleAddToCart}
              >
                {isAdded ? (
                  <>
                    <Check className="mr-2 h-6 w-6" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-6 w-6" />
                    Add to Cart
                  </>
                )}
              </Button>

              {isInCart && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Link
                    href="/cart"
                    className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Cart ({quantity} {quantity === 1 ? "item" : "items"})
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}
            </div>

            <Separator />

            {/* Compliance & Trust Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-xs transition-colors group-hover:text-primary">Discreet Packaging</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Unlabeled boxes for privacy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-xs transition-colors group-hover:text-primary">Fast Delivery</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Delivered within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* What's in the box */}
            {product.in_the_box && product.in_the_box.length > 0 && (
              <div className="space-y-4 p-6 rounded-xl bg-muted/20 border border-border/50">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  What's in the box
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.in_the_box.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">You might also like</h2>
              <p className="text-muted-foreground">Explore similar products</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
