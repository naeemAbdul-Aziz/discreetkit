
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/data';
import { toast } from './use-toast';

export type CartItem = {
  id: number;
  name: string;
  priceGHS: number;
  imageUrl: string;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.priceGHS * item.quantity, 0);
  return { totalItems, totalPrice };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        let updatedItems;
        if (existingItem) {
          updatedItems = currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            priceGHS: product.priceGHS,
            imageUrl: product.imageUrl,
            quantity: 1,
          };
          updatedItems = [...currentItems, newItem];
        }

        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        set({ items: updatedItems, totalItems, totalPrice });
        toast({ title: 'Item added to cart', description: product.name });
      },

      removeItem: (productId) => {
        const updatedItems = get().items.filter((item) => item.id !== productId);
        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        set({ items: updatedItems, totalItems, totalPrice });
      },

      updateQuantity: (productId, quantity) => {
        let updatedItems;
        if (quantity < 1) {
          updatedItems = get().items.filter((item) => item.id !== productId);
        } else {
            updatedItems = get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          );
        }
        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        set({ items: updatedItems, totalItems, totalPrice });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },
      
      getItemQuantity: (productId) => {
        return get().items.find(item => item.id === productId)?.quantity ?? 0;
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage), 
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { totalItems, totalPrice } = calculateTotals(state.items);
          state.totalItems = totalItems;
          state.totalPrice = totalPrice;
        }
      }
    }
  )
);
