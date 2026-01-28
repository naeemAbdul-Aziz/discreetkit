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
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Package,
  Layers,
  BarChart,
  Repeat,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        { href: "/pharmacy/refills", label: "Refills", icon: Repeat },
        { href: "/pharmacy/inventory", label: "Inventory", icon: Package },
        { href: "/pharmacy/settings", label: "Settings", icon: Settings },
      ];

      // Strip prefixes if on subdomain
      if (
        typeof window !== "undefined" &&
        window.location.hostname.startsWith("pharmacy.")
      ) {
        return basePharmacyItems.map((item) => ({
          ...item,
          href:
            item.href === "/pharmacy/dashboard"
              ? "/"
              : item.href.replace("/pharmacy", ""),
        }));
      }
      return basePharmacyItems;
    }

    if (subdomain === "admin") {
      const baseItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart },
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/categories", label: "Categories", icon: Layers },
        { href: "/admin/partners", label: "Partners", icon: Users },
        { href: "/admin/refills", label: "Refills", icon: Repeat },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ];

      // Strip prefixes if on subdomain
      if (
        typeof window !== "undefined" &&
        window.location.hostname.startsWith("admin.")
      ) {
        return baseItems.map((item) => ({
          ...item,
          href: item.href === "/admin" ? "/" : item.href.replace("/admin", ""),
        }));
      }

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
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Layers },
      { href: "/admin/partners", label: "Partners", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/refills", label: "Refills", icon: Repeat },
    ];

    return baseItems;
  }, [subdomain]);

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
          <h2 className="hidden md:block font-headline text-2xl font-black tracking-tight uppercase transition-transform group-hover:scale-105">
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

                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-all duration-200",
                        isActive
                          ? "stroke-[2.5]"
                          : "stroke-[1.5] group-hover:stroke-[2]",
                      )}
                    />
                    <span
                      className={cn(
                        "hidden lg:inline-block text-sm font-medium transition-all duration-200",
                        isActive ? "font-bold tracking-wide" : "font-medium",
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
              <LogOut className="h-5 w-5" />
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
