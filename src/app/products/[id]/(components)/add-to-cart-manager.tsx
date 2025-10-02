
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/data';
import { useCart } from '@/hooks/use-cart';
import { Plus, Minus, Trash2 } from 'lucide-react';

export function AddToCartManager({ product }: { product: Product }) {
    const { addItem, getItemQuantity, updateQuantity } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Button disabled size="lg" className="w-full">
                Add to cart
            </Button>
        );
    }
    
    const quantity = getItemQuantity(product.id);
    const isInCart = quantity > 0;

    if (isInCart) {
        return (
            <div className="flex h-11 items-center justify-between rounded-full border bg-background p-1 shadow-sm w-full">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity - 1)}>
                    {quantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </Button>
                <span className="w-10 text-center font-bold text-foreground">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity + 1)}>
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={() => addItem(product)} size="lg" className="w-full">
            Add to Cart
        </Button>
    );
}
