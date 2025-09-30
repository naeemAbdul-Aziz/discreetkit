/**
 * @file sticky-shop-link.tsx
 * @description a floating action button that remains visible on most pages,
 *              providing a persistent link to the main products page to encourage conversion.
 *              it includes an animation to draw user attention and is hidden on checkout pages.
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';

export function StickyShopLink() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  // hide the button on cart, order, and success pages to avoid distraction during checkout.
  if (pathname.startsWith('/cart') || pathname.startsWith('/order') || pathname.startsWith('/track')) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link href="/products" passHref>
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 10, 0],
          }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 5,
          }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl"
        >
          <ShoppingBag size={28} />
           {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-accent text-xs font-bold text-accent-foreground" aria-hidden="true">
              {totalItems}
              </span>
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
}
