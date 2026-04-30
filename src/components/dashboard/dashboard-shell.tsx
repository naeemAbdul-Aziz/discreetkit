import { ReactNode } from "react"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: ReactNode
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  headerAction?: ReactNode
  className?: string
}

/**
 * FAANG-Level Dashboard Shell
 * Strictly professional, no animations, high-performance layout.
 */
export function DashboardShell({
  children,
  title,
  subtitle,
  breadcrumbs,
  headerAction,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("space-y-16 pb-24", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 border-b border-slate-50 pb-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase leading-none">
            {title}
          </h1>
          {subtitle && (
            <div className="flex items-center gap-4">
                <div className="h-1 w-8 bg-brand-teal rounded-full" />
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">
                    {subtitle}
                </p>
            </div>
          )}
        </div>
        {headerAction && <div className="flex items-center gap-6">{headerAction}</div>}
      </div>

      <div className="space-y-20">{children}</div>
    </div>
  )
}
