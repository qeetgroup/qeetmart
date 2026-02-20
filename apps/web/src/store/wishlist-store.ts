import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeLocalStorage } from "@/store/storage";

interface WishlistState {
  wishlistsByUser: Record<string, string[]>;
  hasHydrated: boolean;
  setHydrated: (value: boolean) => void;
  toggleWishlist: (userId: string, productId: string) => void;
  clearWishlist: (userId: string) => void;
  isWishlisted: (userId: string, productId: string) => boolean;
  getWishlistByUser: (userId: string) => string[];
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistsByUser: {},
      hasHydrated: false,
      setHydrated: (value) => set({ hasHydrated: value }),
      toggleWishlist: (userId, productId) =>
        set((state) => {
          const current = state.wishlistsByUser[userId] ?? [];
          const exists = current.includes(productId);
          return {
            wishlistsByUser: {
              ...state.wishlistsByUser,
              [userId]: exists
                ? current.filter((id) => id !== productId)
                : [...current, productId],
            },
          };
        }),
      clearWishlist: (userId) =>
        set((state) => ({
          wishlistsByUser: {
            ...state.wishlistsByUser,
            [userId]: [],
          },
        })),
      isWishlisted: (userId, productId) => {
        return (get().wishlistsByUser[userId] ?? []).includes(productId);
      },
      getWishlistByUser: (userId) => get().wishlistsByUser[userId] ?? [],
    }),
    {
      name: "qeetmart-wishlist",
      storage: safeLocalStorage,
      partialize: (state) => ({
        wishlistsByUser: state.wishlistsByUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
