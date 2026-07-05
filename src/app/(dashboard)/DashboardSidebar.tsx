"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePharmacy } from "@/components/dashboard/pharmacy-context";
import { Icon } from "@/components/ui/icon";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isHub, loading } = usePharmacy();
  const [subdomain, setSubdomain] = React.useState<"admin" | "pharmacy" | null>(
    null,
  );
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (
        hostname.startsWith("pharmacy.") ||
        pathname.startsWith("/pharmacy")
      ) {
        setSubdomain("pharmacy");
      } else if (hostname.startsWith("admin.")) {
        setSubdomain("admin");
      } else {
        setSubdomain(null); // default
      }
    }
  }, [pathname]);

  const navItems = React.useMemo(() => {
    // Prevent flash of wrong content by returning empty or skeleton if needed,
    // but better to default to standard items if not mounted to support SEO/SSR if possible?
    // SSR usually implies standard domain. checking subdomain on server needs headers(),
    // but for client component "use client", we rely on client state.
    // We'll trust the default (null) usually means standard, or initial render.

    if (subdomain === "pharmacy") {
      const basePharmacyItems = [
        {
          href: "/pharmacy/dashboard",
          label: isHub ? "Privacy Cockpit" : "Dashboard",
          icon: isHub ? "radar" : "dashboard",
        },
        { href: "/pharmacy/ledger", label: "Ledger", icon: "assignment_turned_in" },
        { 
          href: "/pharmacy/refills", 
          label: isHub ? "Discreet Refills" : "Refills", 
          icon: "bolt" 
        },
        ...(isHub ? [
          { href: "/pharmacy/verification", label: "Identity Queue", icon: "fingerprint" },
          { href: "/pharmacy/partner-care", label: "Security Support", icon: "volunteer_activism" },
        ] : [
          { href: "/pharmacy/inventory", label: "Inventory", icon: "inventory_2" },
          { href: "/pharmacy/riders", label: "Riders", icon: "local_shipping" },
        ]),
        { href: "/pharmacy/settings", label: "Settings", icon: "settings" },
      ];

      return basePharmacyItems;
    }

    if (subdomain === "admin") {
      const baseItems = [
        { href: "/admin", label: "Dashboard", icon: "dashboard" },
        { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
        { href: "/admin/operations", label: "Operations", icon: "radar" },
        { href: "/admin/operations/logs", label: "Ledger", icon: "assignment_turned_in" },
        { href: "/admin/orders", label: "Orders", icon: "shopping_bag" },
        { href: "/admin/products", label: "Products", icon: "inventory_2" },
        { href: "/admin/categories", label: "Categories", icon: "layers" },
        { href: "/admin/partners", label: "Partners", icon: "group" },
        { href: "/admin/refills", label: "Refills", icon: "history_edu" },
        { href: "/admin/settings", label: "Settings", icon: "settings" },
      ];

      return baseItems;
    }

    // Default (probably client or initial server render of main site admin logic?)
    // Actually, if subdomain is null, we assume we might be on main site admin dashboard accessing via path?
    // The original logic defaulted to admin items if NOT pharmacy?
    // Original:
    // if (isPharmacy) { ... }
    // else { const baseItems = adminItems ... }
    // So default is Admin items.

    const baseItems = [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
      { href: "/admin/operations", label: "Operations", icon: "radar" },
      { href: "/admin/operations/logs", label: "Ledger", icon: "assignment_turned_in" },
      { href: "/admin/orders", label: "Orders", icon: "shopping_bag" },
      { href: "/admin/products", label: "Products", icon: "inventory_2" },
      { href: "/admin/categories", label: "Categories", icon: "layers" },
      { href: "/admin/partners", label: "Partners", icon: "group" },
      { href: "/admin/settings", label: "Settings", icon: "settings" },
      { href: "/admin/refills", label: "Refills", icon: "history_edu" },
    ];

    return baseItems;
  }, [subdomain, isHub]);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!isMounted)
    return <Sidebar variant="inset" className="border-r bg-white shadow-sm" />; // Prevent hydration mismatch flicker

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-r bg-white shadow-sm"
    >
      <SidebarHeader className="px-4 py-6 flex justify-center items-center border-b border-border/50">
        <Link href="/" className="flex items-center group">
          {/* DiscreetKit Wordmark */}
          <h2 className="hidden md:block font-headline text-2xl font-black tracking-tighter transition-transform group-hover:scale-105">
            Discreet<span className="text-primary">Kit</span>.
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col py-4 gap-2 px-2 lg:px-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin" || item.href === "/"
                ? pathname === "/admin" || pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  isActive={isActive}
                  size="lg"
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 overflow-hidden",
                    isActive
                      ? "text-primary"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50",
                  )}
                >
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className="flex items-center gap-3 w-full relative z-10"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-item"
                        className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    <Icon
                      name={item.icon}
                      fill={isActive}
                      weight={isActive ? 700 : 400}
                      className={cn(
                        "transition-all duration-200",
                        isActive
                          ? "text-primary"
                          : "text-zinc-400 group-hover:text-zinc-600",
                      )}
                    />
                    <span
                      className={cn(
                        "hidden lg:inline-block text-sm transition-all duration-200",
                        isActive ? "font-bold" : "font-medium",
                      )}
                    >
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
              className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              size="lg"
            >
              <Icon name="logout" className="h-5 w-5" />
              <span className="duration-200 group-data-[collapsible=icon]:opacity-0">
                Sign Out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
