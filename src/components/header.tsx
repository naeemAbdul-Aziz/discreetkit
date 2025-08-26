
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShieldCheck, ShoppingCart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navLinksLeft = [
  { href: '/order', label: 'Shop' },
  { href: '/#how-it-works', label: 'How It Works' },
];

const navLinksRight = [
  { href: '/partners', label: 'Our Partners' },
  { href: '/track', label: 'Track Order' },
]

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

  const NavLink = ({ href, label }: { href: string, label: string }) => (
    <Link
      href={href}
      className={cn(
        'transition-colors hover:text-foreground/80 px-3 py-1.5 rounded-full text-sm',
        pathname === href ? 'bg-muted text-foreground font-semibold' : 'text-foreground/60'
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
    <div className="bg-primary text-primary-foreground text-center text-sm p-2">
      Free Delivery on UG Campus! <Link href="/order" className="underline font-semibold">Shop Now</Link>
    </div>
    <header className={cn("sticky top-0 z-50 w-full p-2")}>
        <div className={cn("container mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", isScrolled ? "shadow-md" : "")}>
          
          <nav className="hidden md:flex items-center gap-1">
            {navLinksLeft.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <Link href="/" className="flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">DiscreetKit</span>
          </Link>

          <div className="hidden md:flex items-center justify-end gap-1">
            {navLinksRight.map((link) => (
               <NavLink key={link.href} {...link} />
            ))}
            <div className="flex items-center gap-2 pl-2">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                 <span className="sr-only">Cart</span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center md:hidden w-full justify-between">
             <Link href="/" className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="font-bold">DiscreetKit</span>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <Link href="/" className="flex items-center space-x-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <span className="font-bold">DiscreetKit</span>
                </Link>
                <div className="mt-8 flex flex-col space-y-2">
                  {[...navLinksLeft, ...navLinksRight].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'text-lg p-3 rounded-lg transition-colors hover:bg-muted',
                        pathname === link.href ? 'bg-muted text-foreground font-semibold' : 'text-foreground/70'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                 <div className="mt-8 border-t pt-4 flex items-center gap-4">
                  <Button variant="outline" className="flex-1">
                    My Account
                  </Button>
                  <Button className="flex-1">
                    My Cart
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
      </div>
    </header>
    </>
  );
}
