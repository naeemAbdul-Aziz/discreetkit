
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type DiscountLocation, discounts, DELIVERY_FEES } from '@/lib/data';
import type { Product } from '@/lib/data';

export type CartItem = Product & {
  quantity: number;
};

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  studentDiscount: number;
  deliveryFee: number;
  totalPrice: number;
  isStudent: boolean;
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

  const subtotal = items.reduce((total, item) => {
    return total + (item.price_ghs || 0) * item.quantity;
  }, 0);

  const baseDeliveryFee = totalItems > 0 ? (discounts.some(d => d.campus === deliveryLocation) ? DELIVERY_FEES.campus : DELIVERY_FEES.standard) : 0;
  
  // New Logic: Students get free delivery.
  const studentDiscount = isStudent ? baseDeliveryFee : 0;
  const deliveryFee = baseDeliveryFee - studentDiscount;

  const totalPrice = subtotal + deliveryFee;

  return { totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      studentDiscount: 0,
      deliveryFee: DELIVERY_FEES.standard,
      totalPrice: 0,
      isStudent: false,
      deliveryLocation: null,

      setDeliveryLocation: (location) => {
        const { items } = get();
        const { totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent } = calculateTotals(items, location);
        set({ deliveryLocation: location, totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent });
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
          updatedItems = [...currentItems, { ...product, quantity: 1 }];
        }

        const { totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent } = calculateTotals(updatedItems, get().deliveryLocation);
        set({ items: updatedItems, totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent });
        try {
          window.dispatchEvent(new CustomEvent('cart:announce', { detail: { type: 'add', productName: product.name } }));
        } catch {}
      },

      removeItem: (productId) => {
        const current = get().items.find(i => i.id === productId);
        const updatedItems = get().items.filter((item) => item.id !== productId);
        const { totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent } = calculateTotals(updatedItems, get().deliveryLocation);
        set({ items: updatedItems, totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent });
        try {
          window.dispatchEvent(new CustomEvent('cart:announce', { detail: { type: 'remove', productName: current?.name } }));
        } catch {}
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
        const { totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent } = calculateTotals(updatedItems, get().deliveryLocation);
        set({ items: updatedItems, totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent });
      },

      clearCart: () => {
        set(state => {
          const { subtotal, studentDiscount, deliveryFee, totalPrice, isStudent } = calculateTotals([], state.deliveryLocation);
          return { items: [], totalItems: 0, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent };
        });
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
           const { totalItems, subtotal, studentDiscount, deliveryFee, totalPrice, isStudent } = calculateTotals(state.items, state.deliveryLocation);
          state.totalItems = totalItems;
          state.subtotal = subtotal;
          state.studentDiscount = studentDiscount;
          state.deliveryFee = deliveryFee;
          state.totalPrice = totalPrice;
          state.isStudent = isStudent;
        }
      }
    }
  )
);
