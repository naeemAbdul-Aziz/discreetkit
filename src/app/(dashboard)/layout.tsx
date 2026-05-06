"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { DashboardSidebar } from "./DashboardSidebar"
import { PharmacyProvider } from "@/components/dashboard/pharmacy-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Page title can be derived client-side; keep server layout minimal.
  const [title, setTitle] = React.useState("Portal")
  // Defer to client for active route; update title on hydration.
  React.useEffect(() => {
    const path = window.location.pathname
    const map: Record<string, string> = {
      "/admin": "Overview",
      "/admin/analytics": "Analytics",
      "/admin/operations": "Operations",
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
  const router = useRouter()
  const pathname = usePathname()

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
            { href: "/pharmacy/dashboard", label: "Dashboard", icon: "home" },
            { href: "/pharmacy/inventory", label: "Inventory", icon: "inventory_2" },
            { href: "/pharmacy/settings", label: "Settings", icon: "settings" },
            { href: "__logout__", label: "Logout", icon: "logout" },
        ]
    }
    return [
        { href: "/admin", label: "Overview", icon: "home" },
        { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
        { href: "/admin/operations", label: "Operations", icon: "radar" },
        { href: "/admin/orders", label: "Orders", icon: "shopping_bag" },
        { href: "/admin/products", label: "Products", icon: "inventory_2" },
        { href: "/admin/categories", label: "Categories", icon: "layers" },
        { href: "/admin/partners", label: "Partners", icon: "group" },
        { href: "/admin/settings", label: "Settings", icon: "settings" },
    ]
  }, [isPharmacy])

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <PharmacyProvider>
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
              <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white/95 backdrop-blur border-t border-border/70 shadow-lg md:hidden px-1 py-1 pb-[calc(env(safe-area-inset-bottom)+6px)]">
                {navItems.map((item) => {
                  const isActive = item.href !== "__logout__" && pathname.startsWith(item.href)
                  const baseClasses = "flex flex-col items-center justify-center flex-1 rounded-xl py-2 text-[11px] font-medium transition-all"
                  const activeClasses = isActive ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:text-primary hover:bg-muted/50"

                  if (item.href === "__logout__") {
                    return (
                      <button
                        key={item.label}
                        onClick={handleLogout}
                        className={`${baseClasses} ${activeClasses}`}
                        aria-label={item.label}
                      >
                        <Icon name={item.icon} className="mb-1" fill={isActive} weight={isActive ? 700 : 400} />
                        {item.label}
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${baseClasses} ${activeClasses}`}
                      aria-label={item.label}
                    >
                      <Icon name={item.icon} className="mb-1" fill={isActive} weight={isActive ? 700 : 400} />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            )}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PharmacyProvider>
  )
}
