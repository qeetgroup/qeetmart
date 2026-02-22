import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, User } from "@/types";
import { safeLocalStorage } from "@/store/storage";

interface SessionState {
  token: string | null;
  user: User | null;
  recentSearches: string[];
  hasHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  updateProfile: (payload: Pick<User, "name" | "email">) => void;
  upsertAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      recentSearches: [],
      hasHydrated: false,
      setHydrated: (value) => set({ hasHydrated: value }),
      setSession: (token, user) => set({ token, user }),
      logout: () =>
        set({
          token: null,
          user: null,
        }),
      addRecentSearch: (query) =>
        set((state) => {
          const normalized = query.trim();
          if (!normalized) {
            return state;
          }

          const withoutDuplicate = state.recentSearches.filter(
            (entry) => entry.toLowerCase() !== normalized.toLowerCase(),
          );

          return {
            recentSearches: [normalized, ...withoutDuplicate].slice(0, 6),
          };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
      updateProfile: ({ name, email }) =>
        set((state) => {
          if (!state.user) {
            return state;
          }

          return {
            user: {
              ...state.user,
              name,
              email,
            },
          };
        }),
      upsertAddress: (address) =>
        set((state) => {
          if (!state.user) {
            return state;
          }

          const exists = state.user.addresses.some((item) => item.id === address.id);
          return {
            user: {
              ...state.user,
              addresses: exists
                ? state.user.addresses.map((item) =>
                    item.id === address.id ? address : item,
                  )
                : [...state.user.addresses, address],
            },
          };
        }),
      removeAddress: (addressId) =>
        set((state) => {
          if (!state.user) {
            return state;
          }

          return {
            user: {
              ...state.user,
              addresses: state.user.addresses.filter(
                (address) => address.id !== addressId,
              ),
            },
          };
        }),
    }),
    {
      name: "qeetmart-session",
      storage: safeLocalStorage,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        recentSearches: state.recentSearches,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
