import { mockDb } from "@/lib/api/mock-db";
import { delay } from "@/lib/utils";

export async function getCategories() {
  await delay(160);
  return mockDb.categories;
}

export async function getCategoryBySlug(slug: string) {
  await delay(120);
  return mockDb.categories.find((category) => category.slug === slug) ?? null;
}

export async function getTopCategories(limit = 8) {
  await delay(140);
  return mockDb.categories.slice(0, limit);
}
