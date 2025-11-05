/**
 * @file floating-shop-button.tsx
 * @description A floating action button that provides a persistent link to the
 *              products page, designed to gently encourage conversion. It features
 *              a subtle animation to catch the user's eye.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from './ui/button';
import { ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function FloatingShopButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Effect to show the button after a short delay to not be intrusive on page load.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500); // Show after 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Do not show the button on cart or order pages to avoid distraction during checkout.
  if (pathname.startsWith('/cart') || pathname.startsWith('/order')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
            <Button asChild variant="accent" size="lg" className="h-14 rounded-full shadow-2xl pl-5 pr-6">
              <Link href="/products" aria-label="shop all products">
                <ShoppingBag className="h-6 w-6" />
                <span className="ml-2 font-bold">Shop Now</span>
              </Link>
            </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
