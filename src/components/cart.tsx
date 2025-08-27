
'use client';

import { useCart } from '@/hooks/use-cart';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function Cart() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity } = useCart();
  const { toast } = useToast();

  const handleRemove = (productId: number) => {
    removeItem(productId);
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your cart.',
      variant: 'destructive',
    });
  };

  return (
    <SheetContent className="flex w-full flex-col sm:max-w-lg">
      <SheetHeader className="pr-6">
        <SheetTitle>My Cart ({totalItems})</SheetTitle>
      </SheetHeader>
      <Separator />

      {totalItems > 0 ? (
        <>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 p-4 pr-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      GHS {item.priceGHS.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">
                      GHS {(item.priceGHS * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <SheetFooter className="mt-auto flex-col gap-4 border-t p-4 pr-6">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>GHS {totalPrice.toFixed(2)}</span>
            </div>
            <Button asChild className="w-full">
              <Link href="/order">Proceed to Checkout</Link>
            </Button>
          </SheetFooter>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <ShoppingCart className="h-20 w-20 text-muted-foreground/30" />
          <div className="text-center">
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">
              Add some products to get started.
            </p>
          </div>
          <Button asChild>
            <Link href="/order">Start Shopping</Link>
          </Button>
        </div>
      )}
    </SheetContent>
  );
}
