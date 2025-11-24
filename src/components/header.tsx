'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetDescription } from '@/components/ui/sheet';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Separator } from './ui/separator';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { BrandSpinner } from '@/components/brand-spinner';

const navLinks = [
  { href: '/products/test-kits', label: 'Screening Kits' },
  { href: '/products/bundles', label: 'Bundles' },
  { href: '/products/wellness', label: 'Wellness' },
  { href: '/products/medication', label: 'Medication' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/partner-care', label: 'Our Partners' },
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
      <Button variant="ghost" size="icon" className="relative" disabled aria-label="loading cart">
          <BrandSpinner size="sm" />
      </Button>
    )
  }

  return (
     <Button asChild variant="ghost" size="icon" className="relative hover:bg-transparent" id="cart-icon">
        <Link href="/cart" aria-label={`open cart with ${totalItems} items`}>
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in" aria-hidden="true">
              {totalItems}
              </span>
          )}
        </Link>
      </Button>
  );
}

const Logo = () => (
    <Image
        src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762345271/Artboard_2_3_fvyg9i.png"
        alt="DiscreetKit Logo"
        width={120}
        height={28}
        priority
        style={{ height: 'auto' }}
    />
);

export function Header() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const headerWidth = useTransform(scrollY, [0, 100], ["100%", "85%"]);
  const headerTop = useTransform(scrollY, [0, 100], ["0px", "16px"]);
  const headerRadius = useTransform(scrollY, [0, 100], ["0px", "9999px"]);
  const headerBorder = useTransform(scrollY, [0, 100], ["rgba(0,0,0,0)", "rgba(0,0,0,0.05)"]);
  const headerBackdrop = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]);
  const headerBg = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.8)"]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'relative px-3 py-1.5 text-sm font-medium transition-colors hover:text-primary',
        pathname === href ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {label}
      {pathname === href && isMounted && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute inset-0 rounded-full bg-primary/5 -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );

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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.header
        style={{
          width: isMounted ? headerWidth : "100%",
          marginTop: isMounted ? headerTop : "0px",
          borderRadius: isMounted ? headerRadius : "0px",
          borderColor: isMounted ? headerBorder : "rgba(0,0,0,0)",
          backdropFilter: isMounted ? headerBackdrop : "blur(0px)",
          backgroundColor: isMounted ? headerBg : "rgba(255,255,255,0.8)",
        }}
        className="pointer-events-auto flex h-16 max-w-7xl items-center justify-between border px-6 transition-all duration-300 bg-white/80 backdrop-blur-sm"
      >
          {/* desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" aria-label="DiscreetKit Homepage" className="mr-6">
              <Logo />
            </Link>
            {navLinks.slice(0, 4).map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.slice(4).map((link) => (
               <NavLink key={link.href} {...link} />
            ))}
            <div className="w-px h-6 bg-border mx-2" />
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
      </motion.header>
    </div>
  );
}
