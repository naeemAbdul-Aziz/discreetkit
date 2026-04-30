import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-full border border-slate-100 bg-white px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 placeholder:text-slate-200 focus-visible:outline-none focus-visible:border-brand-teal focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-none file:border-0 file:bg-transparent file:text-sm file:font-medium shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
