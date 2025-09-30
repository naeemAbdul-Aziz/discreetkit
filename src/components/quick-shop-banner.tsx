/**
 * @file quick-shop-banner.tsx
 * @description a floating banner that remains visible, providing a persistent and
 *              engaging link to products to encourage conversion. It features an
 *              image and animated text to capture user attention.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { ArrowRight, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const animatedTexts = [
  "Need answers?",
  "Private Testing.",
  "Discreet Delivery.",
  "Your Health, Your Terms.",
];

export function QuickShopBanner() {
  const pathname = usePathname();
  const [textIndex, setTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // effect to cycle through the animated texts.
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % animatedTexts.length);
    }, 3000); // change text every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // effect to show the banner after a delay, but only once per session.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem('quickShopBannerDismissed') !== 'true') {
        setIsVisible(true);
      }
    }, 3000); // show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('quickShopBannerDismissed', 'true');
  };

  // hide the banner on checkout pages or if it has been dismissed.
  if (isDismissed || pathname.startsWith('/cart') || pathname.startsWith('/order') || pathname.startsWith('/track')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border bg-card p-4 shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/5"
              onClick={handleDismiss}
              aria-label="dismiss banner"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757958930/hiv-test-kit-on-white-background_l9jxyx.png"
                  alt="HIV Self-Test Kit"
                  fill
                  className="object-contain p-2"
                  sizes="64px"
                  data-ai-hint="medical test kit"
                />
              </div>
              <div className="flex-grow">
                <div className="h-6">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={textIndex}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-base font-semibold text-foreground"
                    >
                      {animatedTexts[textIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <Button asChild size="sm" className="mt-2">
                  <Link href="/products">
                    Shop Now <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
