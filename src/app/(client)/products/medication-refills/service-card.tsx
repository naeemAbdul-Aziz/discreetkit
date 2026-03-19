"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  product: Product;
}

export function ServiceCard({ product }: ServiceCardProps) {
  const isFree = product.price_ghs === 0;

  return (
    <div className="group relative flex flex-col md:flex-row md:items-stretch overflow-hidden rounded-2xl md:border bg-[#f5f5f1] md:bg-card transition-all hover:shadow-lg">
      {/* Mobile Layout (Horizontal) / Desktop Layout (Stacked) */}
      <div className="flex flex-row md:flex-col w-full h-full">
        {/* Image Section */}
        <div className="relative w-24 h-24 min-w-[96px] md:w-full md:aspect-square m-3 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 96px, 300px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary/20 text-muted-foreground">
              <ShieldCheck className="h-8 w-8 opacity-20" />
            </div>
          )}
          {product.stock_level === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <span className="text-[10px] uppercase font-bold text-destructive">
                T/O
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-3 pl-1 md:p-5">
          <div className="mb-1 md:mb-2">
            <Badge
              variant="secondary"
              className="mb-1 md:mb-2 text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground bg-white/50 border-0"
            >
              Refill Service
            </Badge>
            <h3 className="line-clamp-1 md:line-clamp-2 text-sm md:text-lg font-bold tracking-tight text-foreground">
              {product.name}
            </h3>
          </div>

          <p className="hidden md:block mb-4 line-clamp-2 text-sm text-muted-foreground flex-1">
            {product.description || "Confidential monthly refill delivery."}
          </p>

          <div className="mt-auto space-y-2 md:space-y-4">
            <div className="flex flex-col">
              {isFree ? (
                <div className="flex flex-col">
                  <span className="text-sm md:text-xl font-bold text-green-600">
                    Free Enrollment
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-base md:text-xl font-bold">
                    GHS {product.price_ghs.toFixed(2)}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground font-medium">
                    / refill
                  </span>
                </div>
              )}
              {product.student_price_ghs && !isFree && (
                <span className="text-[10px] md:text-xs text-green-600 font-semibold">
                  Student: GHS {product.student_price_ghs.toFixed(2)}
                </span>
              )}
            </div>

            <Button
              asChild
              size="sm"
              className={cn(
                "w-full h-8 md:h-10 rounded-full text-xs md:text-sm font-bold shadow-sm",
                isFree ? "bg-green-600 hover:bg-green-700" : "bg-primary"
              )}
              disabled={product.stock_level === 0}
            >
              <Link
                href={
                  product.stock_level === 0
                    ? "#"
                    : `/refills/enroll?productId=${product.id}&productName=${encodeURIComponent(product.name)}`
                }
              >
                {product.stock_level === 0
                  ? "Unavailable"
                  : "Enroll Now"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
