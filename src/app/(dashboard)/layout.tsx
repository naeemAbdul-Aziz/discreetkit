"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Home, ShoppingBag, Package, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
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

  const isMobile = useIsMobile();
  const [isPharmacy, setIsPharmacy] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
       const hostname = window.location.hostname
       if (hostname.startsWith('pharmacy.') || window.location.pathname.startsWith('/pharmacy')) {
         setIsPharmacy(true)
       }
    }
  }, [])

  const navItems = React.useMemo(() => {
    if (isPharmacy) {
        return [
            { href: "/", label: "Dashboard", icon: Home },
            { href: "/pharmacy/inventory", label: "Inventory", icon: Package },
            { href: "/pharmacy/settings", label: "Settings", icon: Settings },
            { href: "/login", label: "Logout", icon: LogOut },
        ]
    }
    return [
        { href: "/admin", label: "Overview", icon: Home },
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/categories", label: "Categories", icon: Package },
        { href: "/admin/partners", label: "Partners", icon: Users },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]
  }, [isPharmacy])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        {/* Sidebar: hidden on mobile, visible on md+ */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <SidebarInset>
          <div className="flex-1 w-full overflow-auto p-4 md:p-8 pb-20 md:pb-8">
            {children}
          </div>
          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white border-t border-border shadow md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  aria-label={item.label}
                >
                  <item.icon className="h-6 w-6 mb-1" />
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
