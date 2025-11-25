"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Package, Truck, CheckCircle, Settings } from "lucide-react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import * as React from "react"

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const navItems = [
    { href: "/pharmacy/dashboard", label: "Dashboard", icon: Package },
    { href: "/pharmacy/orders", label: "Orders", icon: Truck },
    { href: "/pharmacy/completed", label: "Completed", icon: CheckCircle },
    { href: "/pharmacy/settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
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
