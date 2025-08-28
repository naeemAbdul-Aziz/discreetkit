
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from './ui/button';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function SummaryBar() {
  const { items, totalItems, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between gap-4 rounded-2xl border bg-background p-4 shadow-2xl">
              <div className="flex items-center gap-4">
                 <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                        <ShoppingCart className="h-5 w-5" />
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
                            <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-4">
                                <div className="truncate">
                                    <span className="font-semibold">{item.quantity}</span> x {item.name}
                                </div>
                                <div className="font-medium">
                                    GHS {(item.priceGHS * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold">GHS {totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total Price</p>
                </div>
                <Button asChild size="lg">
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
