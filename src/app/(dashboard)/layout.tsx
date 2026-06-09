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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

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
            { href: "/pharmacy/ledger", label: "Ledger", icon: "assignment_turned_in" },
            { href: "/pharmacy/refills", label: "Refills", icon: "bolt" },
            { href: "/pharmacy/inventory", label: "Inventory", icon: "inventory_2" },
            { href: "/pharmacy/settings", label: "Settings", icon: "settings" },
            { href: "__logout__", label: "Logout", icon: "logout" },
        ]
    }
    return [
        { href: "/admin", label: "Overview", icon: "home" },
        { href: "/admin/orders", label: "Orders", icon: "shopping_bag" },
        { href: "/admin/products", label: "Products", icon: "inventory_2" },
        { href: "/admin/operations/logs", label: "Ledger", icon: "assignment_turned_in" },
        { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
        { href: "/admin/operations", label: "Operations", icon: "radar" },
        { href: "/admin/categories", label: "Categories", icon: "layers" },
        { href: "/admin/partners", label: "Partners", icon: "group" },
        { href: "/admin/refills", label: "Refills", icon: "history_edu" },
        { href: "/admin/settings", label: "Settings", icon: "settings" },
    ]
  }, [isPharmacy])

  const { visibleItems, overflowItems } = React.useMemo(() => {
    const validItems = navItems.filter(item => item.href !== "__logout__");
    let visible = [];
    if (isPharmacy) {
      visible = validItems.slice(0, 4); // Dashboard, Ledger, Refills, Inventory
    } else {
      visible = validItems.slice(0, 4); // Overview, Orders, Products, Ledger
    }
    const overflow = validItems.filter(item => !visible.includes(item));
    return { visibleItems: visible, overflowItems: overflow };
  }, [navItems, isPharmacy]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <PharmacyProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/20 flex-col md:flex-row">
          {/* Sidebar: hidden on mobile, visible on md+ */}
          <div className="hidden md:block h-screen sticky top-0">
            <DashboardSidebar />
          </div>
          <SidebarInset className="flex-1 w-full flex flex-col min-w-0">
            
            {/* Mobile Top Header & Tabs Carousel */}
            <div className="md:hidden sticky top-0 z-50 bg-white border-b border-border/50 shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-4 py-4">
                <Link href="/" className="flex items-center">
                  <h2 className="font-headline text-2xl font-black tracking-tighter">
                    Discreet<span className="text-primary">Kit</span>.
                  </h2>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-zinc-500 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors flex items-center justify-center"
                  aria-label="Logout"
                >
                  <Icon name="logout" className="h-5 w-5" />
                </button>
              </div>
              
              {/* Horizontal Scrollable Tabs */}
              <nav className="flex overflow-x-auto whitespace-nowrap px-4 pt-1 gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {visibleItems.map((item) => {
                  const isActive = (item.href === "/admin" || item.href === "/pharmacy/dashboard" || item.href === "/") 
                    ? pathname === item.href 
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative pb-3 pt-1 text-sm transition-all duration-200 ${
                        isActive 
                          ? "text-primary font-bold" 
                          : "text-zinc-500 hover:text-zinc-900 font-medium"
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary),0.5)]" />
                      )}
                    </Link>
                  )
                })}
                
                {overflowItems.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                      {(() => {
                        const isOverflowActive = overflowItems.some(item => 
                          (item.href === "/admin" || item.href === "/pharmacy/dashboard" || item.href === "/") 
                            ? pathname === item.href 
                            : pathname.startsWith(item.href)
                        );
                        return (
                          <div
                            className={`flex items-center gap-1 relative pb-3 pt-1 text-sm transition-all duration-200 ${
                              isOverflowActive 
                                ? "text-primary font-bold" 
                                : "text-zinc-500 hover:text-zinc-900 font-medium"
                            }`}
                          >
                            More <Icon name="expand_more" className="h-4 w-4" />
                            {isOverflowActive && (
                              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary),0.5)]" />
                            )}
                          </div>
                        );
                      })()}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-border/50 shadow-lg rounded-xl">
                      {overflowItems.map((item) => {
                        const isActive = (item.href === "/admin" || item.href === "/pharmacy/dashboard" || item.href === "/") 
                          ? pathname === item.href 
                          : pathname.startsWith(item.href);
                          
                        return (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link 
                              href={item.href}
                              className={`flex items-center gap-2 cursor-pointer w-full py-2.5 px-3 rounded-md transition-colors ${
                                isActive ? "bg-primary/10 text-primary font-medium" : "text-zinc-700 hover:bg-zinc-100"
                              }`}
                            >
                              <Icon name={item.icon} className="h-4 w-4" />
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </nav>
            </div>

            <div className="flex-1 w-full p-4 md:p-8">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PharmacyProvider>
  )
}
