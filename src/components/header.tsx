/**
 * @file header.tsx
 * @description the main site header, including navigation links, the logo,
 *              and the cart icon. it is responsive and handles mobile and desktop layouts.
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetDescription } from '@/components/ui/sheet';
import { Menu, ShoppingCart, Loader2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Separator } from './ui/separator';
import { motion } from 'framer-motion';

// define navigation links for easy management.
const navLinks = [
  { href: '/products/test-kits', label: 'Screening Kits' },
  { href: '/products/bundles', label: 'Bundles' },
  { href: '/products/wellness', label: 'Wellness' },
  { href: '/products/medication', label: 'Medication' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/partner-care', label: 'Our Partners' },
  { href: '/track', label: 'Track Order' },
];


// a client component to display the cart icon with a badge for the number of items.
function CartLink() {
  const { totalItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // ensure the component is mounted on the client before accessing localstorage via the cart hook.
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled aria-label="loading cart">
          <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    )
  }

  return (
     <Button asChild variant="ghost" size="icon" className="relative" id="cart-icon">
        <Link href="/cart" aria-label={`open cart with ${totalItems} items`}>
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

// a simple component for the site logo.
const Logo = () => (
    <span className="font-headline text-2xl font-bold tracking-tight text-primary">
        DiscreetKit
    </span>
);

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(false);
  // header should remain visible while scrolling; no hide-on-scroll behavior

  // handle scroll and mount state.
  useEffect(() => {
    setIsMounted(true);
    
    if (sessionStorage.getItem('promoBannerDismissed') !== 'true') {
        setShowPromoBanner(true);
    }
    
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleDismissBanner = () => {
    setShowPromoBanner(false);
    sessionStorage.setItem('promoBannerDismissed', 'true');
  }

  // reusable navlink component for desktop.
  const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-sm transition-colors hover:text-primary',
        pathname === href ? 'font-semibold text-primary' : 'text-foreground/70'
      )}
    >
      {label}
    </Link>
  );

  // reusable navlink component for the mobile menu.
  const MobileNavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
    <Link
        href={href}
        onClick={onClick}
        className={cn(
            'rounded-lg p-3 text-lg transition-colors hover:bg-muted',
            pathname === href ? 'bg-muted font-semibold text-primary' : 'text-foreground/70'
        )}
    >
        {label}
    </Link>
  );

  // show a skeleton header before the component is mounted to prevent layout shifts.
  if (!isMounted) {
    return (
        <>
         <div className="bg-primary p-2 text-center text-sm text-primary-foreground h-[40px]"></div>
     <header className={cn('sticky top-0 z-50 w-full p-2')}>
       <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between rounded-3xl border-border/40 bg-background/95"></div>
         </header>
        </>
    );
  }

  return (
    <>
      {/* top promotional bar */}
      {showPromoBanner && (
        <div className="fixed inset-x-0 top-0 z-[60] flex h-10 items-center justify-center bg-primary px-10 text-center text-sm text-primary-foreground">
          <span>
            Free Delivery on UG Campus!{' '}
            <Link href="/products" className="font-semibold underline">
              Shop Now
            </Link>
          </span>
          <button
            onClick={handleDismissBanner}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-primary-foreground/80 transition-colors hover:bg-primary/50 hover:text-primary-foreground"
            aria-label="Dismiss promotional banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <header className={cn('sticky z-50 w-full p-2 transition-[top]', showPromoBanner ? 'top-10' : 'top-0')}>
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'container mx-auto flex h-14 max-w-7xl items-center justify-between rounded-3xl border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60',
            isScrolled ? 'shadow-md' : ''
          )}
        >
          {/* desktop navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" aria-label="DiscreetKit Homepage" className="mr-4">
              <Logo />
            </Link>
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1">
            <CartLink />
          </div>

          {/* mobile menu */}
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
                   <SheetHeader className="flex flex-row justify-between items-center text-left">
                     <div>
                        <SheetTitle>
                            <Link href="/" onClick={() => setMobileMenuOpen(false)} aria-label="DiscreetKit Homepage">
                                <Logo />
                            </Link>
                        </SheetTitle>
                        <SheetDescription className="sr-only">Main menu for site navigation.</SheetDescription>
                     </div>
                     <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                            <X className="h-6 w-6" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                     </SheetClose>
                   </SheetHeader>
                   <Separator className="my-4" />
                  <div className="mt-8 flex flex-col space-y-2">
                    {navLinks.map((link) => (
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
        </motion.div>
      </header>
    </>
  );
}
