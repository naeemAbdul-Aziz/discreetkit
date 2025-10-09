/**
 * @file admin-shell.tsx
 * @description The shell component for the admin dashboard, including a responsive
 *              sidebar navigation and main content area.
 */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Menu,
  Package,
  ShoppingCart,
  Users,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { logout } from '@/lib/actions';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
];

const Logo = () => (
    <span className="font-headline text-2xl font-bold tracking-tight text-primary">
        DiscreetKit
    </span>
);

const NavLink = ({ item, isMobile = false }: { item: NavItem, isMobile?: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary',
        isMobile ? 'text-lg' : 'text-sm'
      )}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
};

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
             <form action={logout}>
                <Button variant="ghost" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
           <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                 <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 -mx-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Logo />
                    </Link>
                </div>
              <nav className="grid gap-2 text-lg font-medium flex-1 py-4">
                {navItems.map(item => (
                  <NavLink key={item.href} item={item} isMobile />
                ))}
              </nav>
              <div className="mt-auto p-4 -mx-6 border-t">
                 <form action={logout}>
                    <Button variant="ghost" className="w-full justify-start text-lg">
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                    </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
             <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
