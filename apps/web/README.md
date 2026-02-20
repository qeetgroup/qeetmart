# QeetMart Web Storefront

Production-grade eCommerce storefront foundation built in `apps/web`.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn-style UI primitives
- React Query (TanStack Query)
- Zustand (cart/session/wishlist persistence)
- Mock API + in-memory DB

## Feature Coverage

- Home page with hero, category grid, featured carousel, trending, recommendations, and promo banners
- Product listing (`/products`) with URL-synced filters, sorting, pagination, sticky desktop filters, mobile drawer filters, loading skeletons, and empty state
- Category route (`/products/category/[category]`)
- Product detail (`/products/[slug]`) with image gallery, zoom, variants, cart actions, buy now, delivery estimate, rating breakdown, reviews, trust badges, share actions, similar products, and JSON-LD
- Cart (`/cart`) with quantity updates, coupon validation, free shipping indicator, summary, and localStorage persistence
- Checkout (`/checkout`) with 5-step flow, validation, delivery/payment selection, order creation, and confirmation
- Authentication (`/auth/login`, `/auth/signup`) with mock JWT session
- Protected account dashboard (`/account`) with order history, profile, address management, wishlist, logout
- Wishlist page (`/wishlist`) persisted per user
- Global UX: sticky header, mega menu, debounced search + autocomplete, breadcrumbs, theme toggle, route transitions, route loading/error boundaries

## Mock API Layer

Located in `src/lib/api/`:

- `mock-db.ts` (in-memory DB)
- `sample-data.ts` (100+ products, 10+ categories, reviews)
- `products-api.ts`
- `categories-api.ts`
- `cart-api.ts`
- `orders-api.ts`
- `auth-api.ts`
- `reviews-api.ts`

## Key Architecture Folders

- `src/app` route structure (App Router)
- `src/components/layout` header/footer/mega menu/shell
- `src/components/product` PLP/PDP components
- `src/components/cart` cart + mini cart drawer
- `src/components/checkout` multi-step checkout
- `src/components/account` dashboard + wishlist views
- `src/components/search` debounced autocomplete UI
- `src/components/providers` query/theme providers
- `src/store` Zustand stores
- `src/lib` APIs, hooks, query client, constants, utilities
- `src/types` domain types

## Run Locally

From repository root:

```bash
pnpm install
pnpm --filter web dev
```

Open `http://localhost:3000`.

## Validation

```bash
pnpm --filter web lint
pnpm --filter web build
```

## Demo Login

Use seeded demo account:

- Email: `demo@qeetmart.com`
- Password: `demo123`

## Notes

- Data is mock-only and in-memory; restart clears runtime-created orders/users.
- Client persistence is handled via localStorage-backed Zustand stores.
