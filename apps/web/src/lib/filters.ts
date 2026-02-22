import type { ProductQueryParams, SortOption } from "@/types";

export interface FilterState {
  query: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  rating: number | null;
  brands: string[];
  availability: "all" | "in-stock";
  sort: SortOption;
  page: number;
}

export function parseFilterState(searchParams: URLSearchParams): FilterState {
  return {
    query: searchParams.get("query") ?? "",
    category: searchParams.get("category") ?? "",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : null,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : null,
    rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : null,
    brands: (searchParams.get("brands") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    availability: searchParams.get("availability") === "in-stock" ? "in-stock" : "all",
    sort: (searchParams.get("sort") as SortOption) ?? "newest",
    page: Math.max(1, Number(searchParams.get("page") ?? "1")),
  };
}

export function filterStateToQuery(filters: FilterState) {
  const searchParams = new URLSearchParams();

  if (filters.query) {
    searchParams.set("query", filters.query);
  }

  if (filters.category) {
    searchParams.set("category", filters.category);
  }

  if (typeof filters.minPrice === "number") {
    searchParams.set("minPrice", String(filters.minPrice));
  }

  if (typeof filters.maxPrice === "number") {
    searchParams.set("maxPrice", String(filters.maxPrice));
  }

  if (typeof filters.rating === "number") {
    searchParams.set("rating", String(filters.rating));
  }

  if (filters.brands.length) {
    searchParams.set("brands", filters.brands.join(","));
  }

  if (filters.availability === "in-stock") {
    searchParams.set("availability", filters.availability);
  }

  if (filters.sort !== "newest") {
    searchParams.set("sort", filters.sort);
  }

  if (filters.page > 1) {
    searchParams.set("page", String(filters.page));
  }

  return searchParams;
}

export function toProductQueryParams(filters: FilterState): ProductQueryParams {
  return {
    query: filters.query || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    rating: filters.rating ?? undefined,
    brands: filters.brands,
    availability: filters.availability,
    sort: filters.sort,
    page: filters.page,
  };
}
