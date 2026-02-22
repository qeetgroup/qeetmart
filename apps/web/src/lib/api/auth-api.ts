import { nanoid } from "nanoid";
import { createSessionForUser, getStoredUserByToken, mockDb, toPublicUser, clearSession } from "@/lib/api/mock-db";
import { delay } from "@/lib/utils";
import type { AuthResponse } from "@/types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  await delay(320);

  const normalizedEmail = normalizeEmail(email);
  const user = mockDb.users.find((candidate) => candidate.email === normalizedEmail);

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }

  const token = createSessionForUser(user.id);

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  await delay(360);

  const normalizedEmail = normalizeEmail(email);
  const existing = mockDb.users.find((candidate) => candidate.email === normalizedEmail);

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const newUser = {
    id: `user_${nanoid(8)}`,
    name,
    email: normalizedEmail,
    password,
    addresses: [],
  };

  mockDb.users.push(newUser);

  const token = createSessionForUser(newUser.id);

  return {
    token,
    user: toPublicUser(newUser),
  };
}

export async function getSessionUser(token: string | null | undefined) {
  await delay(120);

  const user = getStoredUserByToken(token);
  return user ? toPublicUser(user) : null;
}

export async function logout(token: string | null | undefined) {
  await delay(80);

  if (token) {
    clearSession(token);
  }

  return { success: true };
}
