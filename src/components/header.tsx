
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowRight, Menu, ShoppingCart, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';

const navLinksLeft = [
  { href: '/#products', label: 'Shop' },
  { href: '/#how-it-works', label: 'How It Works' },
];

const navLinksRight = [
  { href: '/partners', label: 'Our Partners' },
  { href: '/track', label: 'Track Order' },
];

function CartLink() {
  const { totalItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return <div className="h-10 w-10" />
  }

  return (
     <Button asChild variant="ghost" size="icon" className="relative">
        <Link href="/order">
          <ShoppingCart />
          {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {totalItems}
              </span>
          )}
          <span className="sr-only">Open Cart</span>
        </Link>
      </Button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        'rounded-full px-3 py-1.5 text-sm transition-colors hover:text-foreground/80',
        pathname === href ? 'bg-muted font-semibold text-foreground' : 'text-foreground/60'
      )}
    >
      {label}
    </Link>
  );

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="bg-primary p-2 text-center text-sm text-primary-foreground">
        Free Delivery on UG Campus!{' '}
        <Link href="/order" className="font-semibold underline">
          Shop Now
        </Link>
      </div>
      <header className={cn('sticky top-0 z-50 w-full p-2')}>
        <div
          className={cn(
            'container mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
            isScrolled ? 'shadow-md' : ''
          )}
        >
          <nav className="hidden items-center gap-1 md:flex">
            {navLinksLeft.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <Link
            href="/"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center space-x-2 md:flex"
          >
            <Image
              src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756391917/discreetKit_tvvwkr.png"
              alt="DiscreetKit Logo"
              width={160}
              height={40}
            />
          </Link>

          <div className="hidden items-center justify-end gap-1 md:flex">
            {navLinksRight.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
            <CartLink />
          </div>

          {/* Mobile Menu */}
          <div className="flex w-full items-center justify-between md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756391917/discreetKit_tvvwkr.png"
                alt="DiscreetKit Logo"
                width={140}
                height={35}
              />
            </Link>

            <div className="flex items-center gap-2">
              <CartLink />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                  <Link href="/" className="flex items-center space-x-2">
                    <Image
                      src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756391917/discreetKit_tvvwkr.png"
                      alt="DiscreetKit Logo"
                      width={140}
                      height={35}
                    />
                  </Link>
                  <div className="mt-8 flex flex-col space-y-2">
                    {[...navLinksLeft, ...navLinksRight].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'rounded-lg p-3 text-lg transition-colors hover:bg-muted',
                          pathname === link.href ? 'bg-muted font-semibold text-foreground' : 'text-foreground/70'
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
        </div>
      </header>
    </>
  );
}
