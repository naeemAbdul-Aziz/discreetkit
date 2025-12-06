"use client";

import React from "react";
import { AlertCircle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryAction?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  retryAction,
  showHomeButton = true,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center min-h-[300px] rounded-2xl bg-muted/20 border-2 border-dashed border-muted",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-[400px] mb-6">
        {description}
      </p>

      <div className="flex items-center gap-3">
        {retryAction && (
          <Button onClick={retryAction} variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        
        {showHomeButton && (
          <Button asChild variant="default" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
