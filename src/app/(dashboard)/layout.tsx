"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Home, ShoppingBag, Package, Users, Settings, LogOut, BarChart } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { DashboardSidebar } from "./DashboardSidebar"
import { PharmacyProvider } from "@/components/dashboard/pharmacy-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Page title can be derived client-side; keep server layout minimal.
  const [title, setTitle] = React.useState("Portal")
  const pathname = usePathname()
  const router = useRouter()

  // Defer to client for active route; update title on hydration.
  React.useEffect(() => {
    const path = window.location.pathname
    const map: Record<string, string> = {
      "/admin": "Overview",
      "/admin/orders": "Orders",
      "/admin/products": "Products",
      "/admin/partners": "Partners",
      "/admin/settings": "Settings",
    }
    const found = Object.entries(map).find(([href]) => path.startsWith(href))?.[1]
    if (found) setTitle(found)
  }, [pathname])


  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <PharmacyProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/20">
          <DashboardSidebar />
          <SidebarInset>
            {/* Mobile Top Header */}
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white/80 backdrop-blur-md border-b border-slate-100 md:hidden px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-0.5">DiscreetKit</span>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">{title}</h2>
                </div>
            </header>

            <div className="flex-1 w-full overflow-auto p-4 md:p-8">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PharmacyProvider>
  )
}
