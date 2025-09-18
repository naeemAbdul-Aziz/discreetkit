
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, ShoppingCart, Loader2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Separator } from './ui/separator';

const navLinksLeft = [
  { href: '/products', label: 'Shop' },
  { href: '/#how-it-works', label: 'How It Works' },
];

const navLinksRight = [
  { href: '/partner-care', label: 'Our Partners' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/track', label: 'Track Order' },
];

function CartLink() {
  const { totalItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled aria-label="Loading Cart">
          <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    )
  }

  return (
     <Button asChild variant="ghost" size="icon" className="relative">
        <Link href="/cart" aria-label={`Open Cart with ${totalItems} items`}>
          <ShoppingCart />
          {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground" aria-hidden="true">
              {totalItems}
              </span>
          )}
        </Link>
      </Button>
  );
}

const Logo = () => (
    <span className="font-headline text-2xl font-bold tracking-tighter text-primary">
        DiscreetKit
    </span>
);

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-sm transition-colors hover:text-foreground/80',
        pathname === href ? 'bg-muted font-semibold text-foreground' : 'text-foreground/60'
      )}
    >
      {label}
    </Link>
  );

  const MobileNavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
    <Link
        href={href}
        onClick={onClick}
        className={cn(
            'rounded-lg p-3 text-lg transition-colors hover:bg-muted',
            pathname === href ? 'bg-muted font-semibold text-foreground' : 'text-foreground/70'
        )}
    >
        {label}
    </Link>
  );

  if (!isMounted) {
    return (
        <>
         <div className="bg-primary p-2 text-center text-sm text-primary-foreground h-[40px]"></div>
         <header className={cn('sticky top-0 z-50 w-full p-2')}>
             <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border-border/40 bg-background/95"></div>
         </header>
        </>
    );
  }

  return (
    <>
      <div className="bg-primary p-2 text-center text-sm text-primary-foreground">
        Free Delivery on UG Campus!{' '}
        <Link href="/cart" className="font-semibold underline">
          Shop Now
        </Link>
      </div>
      <header className={cn('sticky top-0 z-50 w-full p-2')}>
        <div
          className={cn(
            'container mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60',
            isScrolled ? 'shadow-md' : ''
          )}
        >
          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:w-1/3 justify-start items-center gap-1">
            {[...navLinksLeft, navLinksRight[0]].map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <div className="hidden md:flex md:w-1/3 justify-center">
            <Link href="/" aria-label="DiscreetKit Homepage">
              <Logo />
            </Link>
          </div>
          
          <nav className="hidden md:flex md:w-1/3 justify-end items-center gap-1">
            {navLinksRight.slice(1).map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
            <CartLink />
          </nav>

          {/* Mobile Menu */}
          <div className="flex w-full items-center justify-between md:hidden">
            <Link href="/" className="flex items-center" aria-label="DiscreetKit Homepage">
              <Logo />
            </Link>

            <div className="flex items-center gap-2">
              <CartLink />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                   <SheetHeader className="flex flex-row justify-between items-center">
                     <SheetTitle className="text-left">
                       <Link href="/" onClick={() => setMobileMenuOpen(false)} aria-label="DiscreetKit Homepage">
                        <Logo />
                      </Link>
                     </SheetTitle>
                     <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                     </SheetClose>
                   </SheetHeader>
                   <Separator className="my-4" />
                  <div className="mt-8 flex flex-col space-y-2">
                    {[...navLinksLeft, ...navLinksRight].map((link) => (
                      <MobileNavLink
                        key={link.href}
                        href={link.href}
                        label={link.label}
                        onClick={() => setMobileMenuOpen(false)}
                      />
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
