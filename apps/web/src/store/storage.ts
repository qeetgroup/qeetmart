import { createJSONStorage } from "zustand/middleware";

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  get length() {
    return 0;
  },
};

export const safeLocalStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return noopStorage;
  }

  return window.localStorage;
});
