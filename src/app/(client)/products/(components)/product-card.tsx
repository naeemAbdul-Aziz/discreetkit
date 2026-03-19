"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { hover } from "@/lib/motion";

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

export function ProductCard({ product }: { product: Product }) {
  const { addItem, getItemQuantity } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!product) return null;

  const quantity = isMounted ? getItemQuantity(product.id) : 0;
  const isInCart = quantity > 0;
  const savings = product.savings_ghs;
  const isOutOfStock =
    product.stock_level !== undefined && product.stock_level <= 0;
  const isLowStock =
    product.stock_level !== undefined &&
    product.stock_level > 0 &&
    product.stock_level < 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={hover as any}
      className="group"
    >
      {/* ─── MOBILE: Everlywell-style horizontal list card ─── */}
      <div className="md:hidden">
        <Link href={`/products/${product.id}`} className="block">
          <div
            className={cn(
              "flex items-center gap-3.5 rounded-2xl p-3.5 active:opacity-80 transition-opacity duration-75",
              isOutOfStock ? "bg-[#f2f2f2]" : "bg-[#f5f5f1]",
            )}
          >
            {/* ── Image box ── */}
            <div className="relative shrink-0 w-[88px] h-[88px] rounded-xl bg-white overflow-hidden">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-contain p-2.5",
                    isOutOfStock && "grayscale opacity-40",
                  )}
                  sizes="88px"
                  placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(88, 88))}`}
                />
              )}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {/* Name */}
              <h3
                className={cn(
                  "text-[14px] font-semibold leading-snug line-clamp-2 tracking-tight",
                  isOutOfStock ? "text-foreground/50" : "text-foreground",
                )}
              >
                {product.name}
              </h3>

              {/* Description */}
              {product.description && (
                <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Price + CTA row */}
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-[15px] font-bold leading-none",
                      isOutOfStock ? "text-foreground/40" : "text-foreground",
                    )}
                  >
                    GHS {product.price_ghs.toFixed(2)}
                  </span>
                  {product.student_price_ghs && !isOutOfStock && (
                    <span className="text-[10px] text-green-600 font-medium mt-0.5">
                      Student GHS {product.student_price_ghs.toFixed(2)}
                    </span>
                  )}
                  {savings && savings > 0 && !isOutOfStock && (
                    <span className="text-[10px] text-accent font-semibold mt-0.5">
                      Save GHS {savings.toFixed(2)}
                    </span>
                  )}
                  {isLowStock && (
                    <span className="text-[10px] text-amber-600 font-medium mt-0.5">
                      Only {product.stock_level} left
                    </span>
                  )}
                </div>

                {/* CTA — always visible */}
                {isOutOfStock ? (
                  <span className="shrink-0 text-[12px] font-medium text-foreground/40 bg-foreground/8 border border-foreground/10 px-3.5 py-[7px] rounded-full">
                    Out of stock
                  </span>
                ) : product.category === "Medication Refills" ? (
                  <Link
                    href={`/refills/enroll?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-[12px] font-semibold bg-primary text-primary-foreground px-4 py-[8px] rounded-full active:scale-95 transition-transform duration-100"
                  >
                    Enroll
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className={cn(
                      "shrink-0 text-[12px] font-semibold px-4 py-[8px] rounded-full active:scale-95 transition-all duration-150",
                      added || isInCart
                        ? "bg-primary/15 text-primary"
                        : "bg-primary text-primary-foreground",
                    )}
                    aria-label={isInCart ? "In cart" : "Add to cart"}
                  >
                    {added || isInCart ? "✓ In cart" : "Add to cart"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>


      {/* ─── DESKTOP: original square grid card ─── */}
      <div className="hidden md:block relative flex flex-col h-full">
        <Link href={`/products/${product.id}`} className="block h-full" passHref>
          <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-black/5 transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10">
            {/* Background Gradient Blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />

            {product.image_url && (
              <motion.div
                className="relative w-full h-full p-6"
                whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-contain drop-shadow-lg",
                    isOutOfStock && "grayscale opacity-50",
                  )}
                  sizes="(max-width: 768px) 50vw, 30vw"
                  placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(250, 188))}`}
                />
              </motion.div>
            )}

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {savings && savings > 0 && !isOutOfStock && (
                <Badge
                  variant="accent"
                  className="shadow-sm backdrop-blur-md bg-accent/90 text-white border-0"
                >
                  Save GHS {savings.toFixed(2)}
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="destructive" className="shadow-sm">
                  Out of Stock
                </Badge>
              )}
              {isLowStock && (
                <Badge
                  variant="warning"
                  className="shadow-sm bg-yellow-500 text-white border-none"
                >
                  Low Stock
                </Badge>
              )}
            </div>

            {/* Quick Add / Enroll Button - Slides up on hover */}
            {!isOutOfStock && (
              <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {product.category === "Medication Refills" ? (
                  <Link
                    href={`/refills/enroll?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-14 w-auto px-6 items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl font-semibold text-sm"
                  >
                    Enroll Now
                  </Link>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addItem(product);
                    }}
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:shadow-xl",
                      isInCart
                        ? "bg-success text-success-foreground hover:bg-success/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                    aria-label={isInCart ? "In cart" : "Add to cart"}
                  >
                    {isInCart ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </Link>

        <div className="mt-3 px-1 space-y-1">
          <Link
            href={`/products/${product.id}`}
            className="block group-hover:text-primary transition-colors duration-300"
          >
            <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 tracking-tight md:text-base">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2">
            <p className="text-base font-bold text-primary md:text-lg">
              GHS {product.price_ghs.toFixed(2)}
            </p>
            {product.student_price_ghs && (
              <span className="text-xs text-green-600 font-medium">
                Student: GHS {product.student_price_ghs.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
