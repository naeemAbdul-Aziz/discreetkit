import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.15em] transition-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800 border-none shadow-2xl shadow-slate-900/10",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 border-none shadow-2xl shadow-rose-600/10",
        outline: "border border-slate-100 bg-white text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm",
        secondary: "bg-brand-teal text-white hover:bg-brand-teal/90 border-none shadow-2xl shadow-brand-teal/10",
        accent: "bg-slate-100 text-slate-900 hover:bg-slate-200 border-none",
        ghost: "text-slate-400 hover:bg-slate-50 hover:text-slate-900 border-none",
        link: "text-brand-teal underline-offset-8 hover:underline border-none",
      },
      size: {
        default: "h-14 px-10 rounded-full",
        sm: "h-10 rounded-full px-6 text-[9px]",
        lg: "h-16 rounded-full px-12 text-[11px]",
        xl: "h-20 rounded-full px-16 text-[12px]",
        icon: "h-14 w-14 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
