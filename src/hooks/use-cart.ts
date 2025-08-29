
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Product, discounts, type DiscountLocation } from '@/lib/data';
import { toast } from './use-toast';

export type CartItem = {
  id: number;
  name: string;
  priceGHS: number;
  studentPriceGHS?: number;
  imageUrl: string;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  deliveryLocation: string | null;
  setDeliveryLocation: (location: string | null) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

const isStudentLocation = (location: string | null): boolean => {
    if (!location) return false;
    return discounts.some(d => d.campus === location);
}

const calculateTotals = (items: CartItem[], deliveryLocation: string | null) => {
  const isStudent = isStudentLocation(deliveryLocation);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => {
    const price = isStudent && item.studentPriceGHS ? item.studentPriceGHS : item.priceGHS;
    return total + price * item.quantity;
  }, 0);
  return { totalItems, totalPrice };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      deliveryLocation: null,

      setDeliveryLocation: (location) => {
        const { items } = get();
        const { totalItems, totalPrice } = calculateTotals(items, location);
        set({ deliveryLocation: location, totalItems, totalPrice });
      },

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
            studentPriceGHS: product.studentPriceGHS,
            imageUrl: product.imageUrl,
            quantity: 1,
          };
          updatedItems = [...currentItems, newItem];
        }

        const { totalItems, totalPrice } = calculateTotals(updatedItems, get().deliveryLocation);
        set({ items: updatedItems, totalItems, totalPrice });
      },

      removeItem: (productId) => {
        const updatedItems = get().items.filter((item) => item.id !== productId);
        const { totalItems, totalPrice } = calculateTotals(updatedItems, get().deliveryLocation);
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
        const { totalItems, totalPrice } = calculateTotals(updatedItems, get().deliveryLocation);
        set({ items: updatedItems, totalItems, totalPrice });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0, deliveryLocation: null });
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
          const { totalItems, totalPrice } = calculateTotals(state.items, state.deliveryLocation);
          state.totalItems = totalItems;
          state.totalPrice = totalPrice;
        }
      }
    }
  )
);
