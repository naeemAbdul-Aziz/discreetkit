"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes } from "react"

export const closeButtonClasses = cn(
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60",
  "bg-background/85 text-foreground/70 shadow-sm backdrop-blur",
  "transition-all hover:-translate-y-[1px] hover:text-foreground hover:border-border",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "active:scale-95 disabled:pointer-events-none disabled:opacity-60"
)

export function CloseIconButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(closeButtonClasses, className)} {...props}>
      {children ?? <X className="h-4 w-4" />}
      <span className="sr-only">Close</span>
    </button>
  )
}
