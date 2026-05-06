"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes } from "react"

export const closeButtonClasses = cn(
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100",
  "bg-white/90 text-slate-400 shadow-xl shadow-slate-900/5 backdrop-blur-md",
  "transition-none hover:text-slate-900 hover:border-slate-200",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900",
  "disabled:pointer-events-none disabled:opacity-50"
)

export function CloseIconButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(closeButtonClasses, className)} {...props}>
      {children ?? <X className="h-4 w-4" />}
      <span className="sr-only">Close Terminal</span>
    </button>
  )
}
