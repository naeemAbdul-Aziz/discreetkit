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
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 5, // Wiggle every 5 seconds
              repeatType: 'loop',
            }}
          >
            <Button asChild size="icon" className="h-14 w-14 rounded-full shadow-2xl">
              <Link href="/products" aria-label="shop all products">
                <ShoppingBag className="h-7 w-7" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
