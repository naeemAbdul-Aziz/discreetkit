
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/order', label: 'Order a Kit' },
  { href: '/track', label: 'Track Order' },
  { href: '/discounts', label: 'Discounts' },
  { href: '/partners', label: 'Partners' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">AnonTest Ghana</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <Link href="/" className="flex items-center space-x-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <span className="font-bold">AnonTest Ghana</span>
                </Link>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                  <div className="flex flex-col space-y-3">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'transition-colors hover:text-foreground/80',
                           pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add search or other actions here */}
          </div>
          <nav className="hidden md:flex items-center">
            <Button asChild>
              <Link href="/order">Get 14 Days Free Trial</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
