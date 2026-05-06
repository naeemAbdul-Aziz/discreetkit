"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-12" aria-label="Breadcrumb">
      <ol className="flex items-center gap-6">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-6">
            {item.href ? (
              <Link href={item.href} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-none leading-none">
                {item.label}
              </Link>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none">{item.label}</span>
            )}
            {i < items.length - 1 && (
                <ChevronRight className="h-3 w-3 text-slate-200" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
