"use client"
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import Image from "next/image"

export function DashboardSidebar() {
  const pathname = usePathname()
  const navItems = React.useMemo(() => ([
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/partners", label: "Partners", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]), [])

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r bg-white shadow-sm">
      <SidebarHeader className="px-0 py-4 flex justify-center items-center border-b border-border/50">
        <SidebarMenuButton
          asChild
          tooltip="DiscreetKit Portal"
          className="pointer-events-none h-16 justify-start !p-2 group-data-[collapsible=icon]:justify-center hover:bg-transparent"
        >
          <Link href="/" className="flex items-center">
            {/* Icon for collapsed state */}
            <div className="relative h-10 w-10 shrink-0 hidden group-data-[collapsible=icon]:block">
                 <Image 
                    src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761571651/Artboard_6_oepbgq.svg" 
                    alt="DK" 
                    fill 
                    className="object-contain" 
                />
            </div>
            
            {/* Full Logo for expanded state */}
            <div className="relative h-10 w-48 group-data-[collapsible=icon]:hidden">
                <Image 
                    src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762345271/Artboard_2_3_fvyg9i.png" 
                    alt="DiscreetKit" 
                    fill 
                    className="object-contain object-left" 
                    priority
                />
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="flex flex-col items-center py-4 gap-2">
        <SidebarMenu>
          {navItems.map(item => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  isActive={isActive}
                  size="lg"
                  className={
                    `group flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200
                    ${isActive ? 'bg-green-100 text-green-900 shadow-sm' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}
                    `
                  }
                  style={{ boxShadow: isActive ? '0 0 0 2px #bbf7d0' : undefined }}
                >
                  <Link href={item.href} aria-current={isActive ? 'page' : undefined} className="flex items-center justify-center w-full h-full">
                    <item.icon className={`h-6 w-6 ${isActive ? 'stroke-[2] text-green-900' : 'stroke-[1.5] text-zinc-600 group-hover:text-zinc-900'}`} />
                    <span className="sr-only">{item.label}</span>
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
            <SidebarMenuButton className="text-destructive hover:text-destructive" size="lg">
              <LogOut className="h-5 w-5" />
              <span className="duration-200 group-data-[collapsible=icon]:opacity-0">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
