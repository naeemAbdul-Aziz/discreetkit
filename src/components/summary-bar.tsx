
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from './ui/button';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function SummaryBar() {
  const { items, totalItems, totalPrice, isStudent, subtotal, deliveryFee, studentDiscount } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-2 md:p-4"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between gap-2 rounded-xl border bg-background p-2 shadow-2xl md:gap-4 md:rounded-2xl md:p-4">
              <div className="flex items-center gap-2 md:gap-4">
                 <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 text-xs font-medium hover:text-primary md:text-sm">
                        <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                        <span>{totalItems} item(s)</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Your Cart</h4>
                            <p className="text-sm text-muted-foreground">
                                Review the items you've selected.
                            </p>
                        </div>
                        <div className="grid gap-2">
                        {items.map(item => (
                            <div key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 text-sm">
                               <div className="relative h-10 w-10 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                                  <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(40, 40))}`} />
                                </div>
                                <div className="truncate">
                                    <span className="font-semibold">{item.quantity}</span> x {item.name}
                                </div>
                                <div className="font-medium text-right">
                                  {isStudent && item.studentPriceGHS ? (
                                    <>
                                      <p className="text-success">GHS {(item.studentPriceGHS * item.quantity).toFixed(2)}</p>
                                      <p className="text-xs text-muted-foreground/80 line-through">GHS {(item.priceGHS * item.quantity).toFixed(2)}</p>
                                    </>
                                  ) : (
                                    <p>GHS {(item.priceGHS * item.quantity).toFixed(2)}</p>
                                  )}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
                <div className="text-right">
                  <p className="text-base font-bold md:text-lg">GHS {totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <Button asChild size="sm" className="md:size-lg">
                  <Link href="/order">
                    Continue
                    <ArrowRight />
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
