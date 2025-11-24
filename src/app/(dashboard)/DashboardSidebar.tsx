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
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/partners", label: "Partners", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]), [])

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r bg-card md:bg-gradient-to-b md:from-muted/40 md:to-background/10 md:backdrop-blur md:supports-[backdrop-filter]:bg-background/40">
      <SidebarHeader className="px-4 py-3 border-b border-border/50">
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
      <SidebarContent className="px-2 py-3">
        <SidebarMenu>
          {navItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)}
                size="lg"
                className="rounded-xl px-3 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-bold"
              >
                <Link href={item.href} aria-current={pathname.startsWith(item.href) ? 'page' : undefined}>
                  <item.icon className="h-5 w-5" />
                  <span className="duration-200 group-data-[collapsible=icon]:opacity-0">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
