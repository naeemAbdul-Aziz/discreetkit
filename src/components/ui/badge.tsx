import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-none px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] focus:outline-none transition-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white shadow-2xl shadow-slate-900/10",
        secondary:
          "bg-brand-teal text-white shadow-2xl shadow-brand-teal/10",
        destructive:
          "bg-rose-500/10 text-rose-600 border border-rose-500/20",
        outline: 
          "border border-slate-100 bg-white text-slate-400 hover:text-slate-900",
        success:
          "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-600 border border-amber-500/20",
        pending:
          "bg-orange-500/10 text-orange-600 border border-orange-500/20",
        info:
          "bg-sky-500/10 text-sky-600 border border-sky-500/20",
        neutral:
          "bg-slate-50 text-slate-400 border border-slate-100",
        accent:
          "bg-slate-900 text-white",
        brand:
          "bg-brand-teal/10 text-brand-teal border border-brand-teal/20",
        icon:
          "p-2 rounded-full aspect-square grid place-items-center bg-slate-50 text-slate-400 border border-slate-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
