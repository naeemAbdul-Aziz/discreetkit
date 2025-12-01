"use client"
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package, Layers } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { getSupabaseClient } from "@/lib/supabase"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPharmacy, setIsPharmacy] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
       const hostname = window.location.hostname
       if (hostname.startsWith('pharmacy.') || pathname.startsWith('/pharmacy')) {
         setIsPharmacy(true)
       }
    }
  }, [pathname])

  const navItems = React.useMemo(() => {
    if (isPharmacy) {
        return [
            { href: "/", label: "Dashboard", icon: LayoutDashboard },
        ]
    }
    
    // Check if we are on admin subdomain
    let isAdminSubdomain = false;
    if (typeof window !== 'undefined') {
        isAdminSubdomain = window.location.hostname.startsWith('admin.');
    }

    const baseItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/categories", label: "Categories", icon: Layers },
        { href: "/admin/partners", label: "Partners", icon: Users },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]

    // If on admin subdomain, strip /admin prefix to avoid double nesting in middleware
    if (isAdminSubdomain) {
        return baseItems.map(item => ({
            ...item,
            href: item.href === '/admin' ? '/' : item.href.replace('/admin', '')
        }))
    }

    return baseItems
  }, [isPharmacy])

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r bg-white shadow-sm">
      <SidebarHeader className="px-4 py-6 flex justify-center items-center border-b border-border/50">
        <Link href="/" className="flex items-center">
          {/* DiscreetKit Wordmark - Hidden on mobile, shown on desktop */}
          <h2 className="hidden md:block font-headline text-2xl font-black tracking-tight uppercase">
            Discreet<span className="text-primary">Kit</span>.
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col py-4 gap-2 px-2 lg:px-4">
        <SidebarMenu>
          {navItems.map(item => {
            // Updated active logic to handle both / and /admin when using subdomains
            const isActive = item.href === "/admin" 
                ? (pathname === "/admin" || pathname === "/") 
                : pathname.startsWith(item.href);
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  isActive={isActive}
                  size="lg"
                  className={
                    `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}
                    `
                  }
                >
                  <Link href={item.href} aria-current={isActive ? 'page' : undefined} className="flex items-center gap-3 w-full">
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'stroke-[2]' : 'stroke-[1.5] group-hover:stroke-[2]'}`} />
                    <span className={`hidden lg:inline-block text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-3 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10" 
              size="lg"
            >
              <LogOut className="h-5 w-5" />
              <span className="duration-200 group-data-[collapsible=icon]:opacity-0">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
