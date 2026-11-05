import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-none px-3 py-1 text-[11px] font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        destructive:
          "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        outline: "text-foreground ring-1 ring-inset ring-border bg-transparent",
        success:
          "border-transparent bg-success/15 text-success hover:bg-success/25",
        warning:
          "border-transparent bg-warning/15 text-warning hover:bg-warning/25",
        pending:
          "border-transparent bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 dark:bg-orange-500/20 dark:text-orange-300",
        info:
          "border-transparent bg-info/15 text-info hover:bg-info/25",
        neutral:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        accent:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
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
