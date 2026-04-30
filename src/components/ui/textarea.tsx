import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[160px] w-full rounded-3xl border border-slate-100 bg-white px-8 py-6 text-[12px] font-black uppercase tracking-widest text-slate-900 placeholder:text-slate-200 focus-visible:outline-none focus-visible:border-brand-teal focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-none resize-none leading-relaxed shadow-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
