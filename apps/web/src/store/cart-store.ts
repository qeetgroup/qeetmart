import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { safeLocalStorage } from "@/store/storage";

interface CartState {
  items: CartItem[];
  couponCode: string;
  hasHydrated: boolean;
  setHydrated: (value: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string) => void;
  clearCoupon: () => void;
}

function isSameVariant(
  a?: Record<string, string>,
  b?: Record<string, string>,
) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: "",
      hasHydrated: false,
      setHydrated: (value) => set({ hasHydrated: value }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (entry) =>
              entry.productId === item.productId &&
              isSameVariant(entry.variantSelections, item.variantSelections),
          );

          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry === existing
                  ? {
                      ...entry,
                      quantity: entry.quantity + item.quantity,
                    }
                  : entry,
              ),
            };
          }

          return {
            items: [...state.items, item],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
                ),
        })),
      clearCart: () => set({ items: [], couponCode: "" }),
      setCoupon: (code) => set({ couponCode: code }),
      clearCoupon: () => set({ couponCode: "" }),
    }),
    {
      name: "qeetmart-cart",
      storage: safeLocalStorage,
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
