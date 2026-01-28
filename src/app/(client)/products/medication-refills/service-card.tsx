"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/data";

interface ServiceCardProps {
  product: Product;
}

export function ServiceCard({ product }: ServiceCardProps) {
  const isFree = product.price_ghs === 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary/20 text-muted-foreground">
            <ShieldCheck className="h-12 w-12 opacity-20" />
          </div>
        )}
        {product.stock_level === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive border border-destructive/20">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <Badge
            variant="secondary"
            className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            Refill Service
          </Badge>
          <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-foreground">
            {product.name}
          </h3>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground flex-1">
          {product.description || "Confidential monthly refill delivery."}
        </p>

        <div className="mt-auto space-y-4">
          <div className="flex items-baseline gap-2">
            {isFree ? (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-600 dark:text-green-500">
                  Free Enrollment
                </span>
                <span className="text-xs text-muted-foreground">
                  Subsidized by partners
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">
                    GHS {product.price_ghs.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / refill
                  </span>
                </div>
                {product.student_price_ghs && (
                  <span className="text-xs text-green-600 font-medium">
                    Student: GHS {product.student_price_ghs.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>

          <Button
            asChild
            className={`w-full gap-2 ${isFree ? "bg-green-600 hover:bg-green-700" : ""}`}
            disabled={product.stock_level === 0}
          >
            <Link
              href={
                product.stock_level === 0
                  ? "#"
                  : `/refills/enroll?productId=${product.id}&productName=${encodeURIComponent(product.name)}`
              }
            >
              <CheckCircle2 className="h-4 w-4" />
              {product.stock_level === 0
                ? "Currently Unavailable"
                : "Enroll Now"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
