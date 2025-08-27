
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from './ui/button';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export function SummaryBar() {
  const { items, totalItems, totalPrice, removeItem } = useCart();

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
            <div className="bg-background rounded-2xl border p-4 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 overflow-x-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-muted p-2 rounded-lg text-sm whitespace-nowrap">
                    <span>{item.quantity} x {item.name}</span>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="font-bold text-lg">GHS {totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{totalItems} item(s)</p>
                </div>
                <Button asChild size="lg">
                  <Link href="/order">Continue</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
