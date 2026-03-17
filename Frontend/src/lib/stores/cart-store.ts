import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

// --------------- Types ---------------

interface CartState {
  items: CartItem[];
}

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (templateId: string) => void;
  clearCart: () => void;
  isInCart: (templateId: string) => boolean;
  getTotal: () => number;
  getCount: () => number;
}

// --------------- Store ---------------

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // State
      items: [],

      // Actions

      addItem: (item) => {
        const { items } = get();
        // Prevent duplicates
        if (items.some((i) => i.templateId === item.templateId)) return;
        set({ items: [...items, item] });
      },

      removeItem: (templateId) => {
        set({ items: get().items.filter((i) => i.templateId !== templateId) });
      },

      clearCart: () => set({ items: [] }),

      isInCart: (templateId) => {
        return get().items.some((i) => i.templateId === templateId);
      },

      getTotal: () => {
        return get().items.reduce((sum, i) => sum + i.price, 0);
      },

      getCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'flavor-cart',
    },
  ),
);
