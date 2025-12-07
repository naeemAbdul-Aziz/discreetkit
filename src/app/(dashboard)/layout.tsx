"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Home, ShoppingBag, Package, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
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
            { href: "/pharmacy/dashboard", label: "Dashboard", icon: Home },
            { href: "/pharmacy/inventory", label: "Inventory", icon: Package },
            { href: "/pharmacy/settings", label: "Settings", icon: Settings },
            { href: "__logout__", label: "Logout", icon: LogOut },
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

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

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
                      <item.icon className="h-5 w-5 mb-1" />
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
                    <item.icon className="h-5 w-5 mb-1" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
