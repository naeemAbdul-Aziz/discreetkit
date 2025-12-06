import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 dark:bg-purple-500/20 dark:text-purple-300",
        destructive:
          "border-transparent bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/20 dark:text-red-300",
        outline: "text-foreground border-border",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-300",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300",
        pending:
          "border-transparent bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 dark:bg-orange-500/20 dark:text-orange-300",
        info:
          "border-transparent bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/20 dark:text-blue-300",
        neutral:
          "border-transparent bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 dark:bg-slate-500/20 dark:text-slate-300",
        icon:
          "p-1.5 rounded-full aspect-square grid place-items-center border-transparent bg-primary/10 text-primary hover:bg-primary/20",
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
