
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShieldCheck, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/track', label: 'Track Order' },
  { href: '/partners', label: 'Partners' },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 p-4">
        <div className={cn(
            "container mx-auto flex h-16 items-center justify-between rounded-xl border border-transparent transition-all duration-300",
            isScrolled ? "bg-background/80 shadow-md backdrop-blur-sm border-border/20" : "bg-transparent",
        )}>
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">DiscreetKit</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground font-semibold' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center justify-end gap-4">
             <Button asChild>
                <Link href="/order">
                    Order a Kit
                    <ChevronRight />
                </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm">
                <Link href="/" className="flex items-center space-x-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <span className="font-bold">DiscreetKit</span>
                </Link>
                <div className="mt-8 flex flex-col space-y-4">
                  <Link href="/order" className="font-semibold text-lg text-primary">Order a Kit</Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'text-lg transition-colors hover:text-foreground/80',
                        pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
      </div>
    </header>
  );
}
