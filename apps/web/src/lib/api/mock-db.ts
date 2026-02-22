import { nanoid } from "nanoid";
import type { Order, User } from "@/types";
import { categoriesData, productsData, reviewsData } from "@/lib/api/sample-data";

interface StoredUser extends User {
  password: string;
}

interface MockDatabase {
  categories: typeof categoriesData;
  products: typeof productsData;
  reviews: typeof reviewsData;
  users: StoredUser[];
  sessions: Record<string, string>;
  orders: Order[];
}

declare global {
  var __QEETMART_DB__: MockDatabase | undefined;
}

const defaultUser: StoredUser = {
  id: "user_1",
  name: "Demo Shopper",
  email: "demo@qeetmart.com",
  password: "demo123",
  addresses: [
    {
      id: "addr_1",
      fullName: "Demo Shopper",
      line1: "221B Residency Road",
      line2: "Near MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
      phone: "+91 9876543210",
      isDefault: true,
    },
  ],
};

const initialToken = `mock-jwt-${nanoid(18)}`;

const db: MockDatabase =
  globalThis.__QEETMART_DB__ ??
  ({
    categories: categoriesData,
    products: productsData,
    reviews: reviewsData,
    users: [defaultUser],
    sessions: {
      [initialToken]: defaultUser.id,
    },
    orders: [],
  } as MockDatabase);

globalThis.__QEETMART_DB__ = db;

export const mockDb = db;

export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    addresses: user.addresses,
  };
}

export function getStoredUserByToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const userId = mockDb.sessions[token];
  if (!userId) {
    return null;
  }

  return mockDb.users.find((user) => user.id === userId) ?? null;
}

export function createSessionForUser(userId: string) {
  const token = `mock-jwt-${userId}-${nanoid(14)}`;
  mockDb.sessions[token] = userId;
  return token;
}

export function clearSession(token: string) {
  delete mockDb.sessions[token];
}
