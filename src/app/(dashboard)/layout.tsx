"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import * as React from "react"
import { DashboardSidebar } from "./DashboardSidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Page title can be derived client-side; keep server layout minimal.
  const [title, setTitle] = React.useState("Portal")
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
  }, [])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <DashboardSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <span className="font-semibold">{title}</span>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
