"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { DashboardSidebar } from "./DashboardSidebar"
import { PharmacyProvider } from "@/components/dashboard/pharmacy-context"
import { CommandPalette } from "@/components/dashboard/command-palette"
import { Bell, User, Settings, ShieldCheck, Zap, Activity, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = React.useState("PORTAL_ROOT")
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    const path = window.location.pathname
    const map: Record<string, string> = {
      "/admin": "OVERVIEW_MATRIX",
      "/admin/orders": "LOGISTICS_STREAM",
      "/admin/products": "INVENTORY_REGISTRY",
      "/admin/partners": "NODE_NETWORK",
      "/admin/customers": "ENROLLEE_REGISTRY",
      "/admin/analytics": "INTELLIGENCE_PULSE",
      "/admin/settings": "TERMINAL_CONFIG",
      "/pharmacy/dashboard": "PHARMACY_TERMINAL",
      "/pharmacy/orders": "FULFILLMENT_STREAM",
      "/pharmacy/inventory": "INVENTORY_REGISTRY",
      "/pharmacy/ledger": "OPERATIONAL_ARCHIVE",
      "/pharmacy/riders": "DISPATCH_PERSONNEL",
      "/pharmacy/verification": "VERIFICATION_QUEUE",
      "/pharmacy/refills": "REFILL_MATRIX",
      "/pharmacy/settings": "TERMINAL_CONFIG",
    }
    const found = Object.entries(map).find(([href]) => path === href || path.startsWith(href + '/'))?.[1]
    if (found) setTitle(found)
  }, [pathname])

  return (
    <PharmacyProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-white">
          <DashboardSidebar />
          <SidebarInset>
            {/* Master Terminal Header */}
            <header className="sticky top-0 z-40 flex h-24 shrink-0 items-center justify-between gap-4 bg-white/95 backdrop-blur-2xl border-b border-slate-50 px-10 lg:px-16 transition-none shadow-sm">
                <div className="flex items-center gap-8">
                    <SidebarTrigger className="h-12 w-12 rounded-full border-slate-100 bg-white shadow-2xl shadow-slate-900/5 hover:bg-slate-50 transition-none" />
                    <div className="h-10 w-[1px] bg-slate-100 opacity-50" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 leading-none mb-3">Master_Terminal_v4.0</span>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-[0.1em] leading-none">{title}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <CommandPalette />
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-none border border-transparent hover:border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-none border border-transparent hover:border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5">
                            <ShieldCheck className="h-5 w-5" />
                        </Button>
                        <div className="h-8 w-[1px] bg-slate-100 opacity-50 mx-2" />
                        <div className="flex items-center gap-5 pl-2">
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1.5">Root_Admin_Node</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    Synchronized
                                </span>
                             </div>
                             <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-brand-teal border border-slate-800 shadow-2xl shadow-slate-900/20 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-brand-teal opacity-0 group-hover:opacity-10 transition-none" />
                                <User className="h-5 w-5" />
                             </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full overflow-auto p-10 lg:p-16 bg-white">
              <div className="max-w-[1800px] mx-auto space-y-20">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PharmacyProvider>
  )
}
