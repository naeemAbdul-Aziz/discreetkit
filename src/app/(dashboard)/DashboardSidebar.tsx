"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Home,
  LineChart,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Zap,
  Globe,
  Database,
  Search,
  Plus,
  Terminal,
  Activity,
  History,
  Repeat,
  ShieldAlert,
  Archive,
  Truck,
  ClipboardCheck,
  CalendarDays
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { getSupabaseClient } from "@/lib/supabase"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const adminNavLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "OVERVIEW_MATRIX" },
  { href: "/admin/orders", icon: ShoppingCart, label: "LOGISTICS_STREAM" },
  { href: "/admin/products", icon: Package, label: "INVENTORY_REGISTRY" },
  { href: "/admin/partners", icon: Globe, label: "NODE_NETWORK" },
  { href: "/admin/customers", icon: Users, label: "ENROLLEE_REGISTRY" },
  { href: "/admin/analytics", icon: LineChart, label: "INTELLIGENCE_PULSE" },
  { href: "/admin/settings", icon: Settings, label: "TERMINAL_CONFIG" },
]

const pharmacyNavLinks = [
    { href: "/pharmacy/dashboard", icon: LayoutDashboard, label: "COMMAND_CENTER" },
    { href: "/pharmacy/orders", icon: ShoppingCart, label: "FULFILLMENT_STREAM" },
    { href: "/pharmacy/inventory", icon: Package, label: "INVENTORY_REGISTRY" },
    { href: "/pharmacy/ledger", icon: Archive, label: "OPERATIONAL_ARCHIVE" },
    { href: "/pharmacy/riders", icon: Truck, label: "DISPATCH_PERSONNEL" },
    { href: "/pharmacy/verification", icon: ClipboardCheck, label: "VERIFICATION_QUEUE" },
    { href: "/pharmacy/refills", icon: CalendarDays, label: "REFILL_MATRIX" },
    { href: "/pharmacy/settings", icon: Settings, label: "TERMINAL_CONFIG" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname.startsWith('/admin')

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navLinks = isAdmin ? adminNavLinks : pharmacyNavLinks

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-50 bg-white">
      <SidebarHeader className="p-10">
        <Link href="/" className="flex items-center gap-6 group/logo">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center transition-none group-hover/logo:bg-brand-teal group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 shadow-2xl shadow-slate-900/10">
            <Zap className="h-6 w-6 text-brand-teal transition-none group-hover/logo:text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-[14px] font-black text-slate-900 uppercase tracking-widest leading-none">DiscreetKit</span>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mt-2.5">Master_Terminal_v4.0</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-6 gap-4">
        <SidebarMenu className="gap-2">
          {navLinks.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={pathname === item.href}
                className={cn(
                    "h-14 rounded-2xl px-6 transition-none group/btn border-none outline-none",
                    pathname === item.href 
                        ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/10" 
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Link href={item.href}>
                  <item.icon className={cn(
                    "h-5 w-5",
                    pathname === item.href ? "text-brand-teal" : "text-slate-300 group-hover/btn:text-slate-400"
                  )} />
                  <span className="group-data-[collapsible=icon]:hidden text-[10px] font-black uppercase tracking-[0.2em] ml-2">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-12 px-2 group-data-[collapsible=icon]:hidden">
           <div className="flex items-center justify-between mb-6 pl-4">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Operational_Uplinks</span>
           </div>
           <div className="grid gap-3">
              <Button variant="outline" className="w-full justify-start gap-5 h-12 border-none bg-slate-50/50 rounded-2xl text-[9px] font-black text-slate-400 hover:text-brand-teal hover:bg-white hover:shadow-2xl hover:shadow-slate-900/5 transition-none px-6">
                <Plus className="h-4 w-4" /> NEW_PROVISION
              </Button>
              <Button variant="outline" className="w-full justify-start gap-5 h-12 border-none bg-slate-50/50 rounded-2xl text-[9px] font-black text-slate-400 hover:text-brand-teal hover:bg-white hover:shadow-2xl hover:shadow-slate-900/5 transition-none px-6">
                <Search className="h-4 w-4" /> AUDIT_PULSE
              </Button>
           </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="h-14 rounded-2xl px-6 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-none group/btn"
              tooltip="TERMINATE_SESSION"
            >
              <LogOut className="h-5 w-5 text-slate-300 group-hover/btn:text-rose-500" />
              <span className="group-data-[collapsible=icon]:hidden text-[10px] font-black uppercase tracking-[0.2em] ml-2">TERMINATE_SESSION</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="mt-10 group-data-[collapsible=icon]:hidden">
            <div className="p-8 bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-brand-teal/5 rounded-bl-full -mr-8 -mt-8" />
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">SYSTEM_NOMINAL</span>
               </div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] leading-relaxed">
                  Terminal node operational. Secure telemetry uplink active. Matrix synchronized.
               </p>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
