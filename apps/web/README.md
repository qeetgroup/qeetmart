# QeetMart Web Storefront

Enterprise-grade commerce storefront in `apps/web`, built for experimentation, personalization, conversion, and scale.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn-style component primitives
- React Query (TanStack Query)
- Zustand (cart/session/wishlist)
- Mock API + in-memory DB

## Core Commerce Capabilities

- Amazon-style home, PLP, PDP, cart, checkout, auth, account, wishlist
- Mock API with product/catalog/auth/order/review layers
- Responsive UX with sticky header, mega menu, search autocomplete, mini cart
- Route-level loading/error boundaries

## Phase Upgrades Implemented

### 1) Personalization Engine

- Interaction profile tracking (views, category affinity, cart adds)
- Weighted recommendation scoring and blending
- Personalized home recommendations
- Personalized PLP sort (`Recommended`)

### 2) Advanced Search

- In-memory inverted index
- Typo-tolerant query matching
- Category-aware search behavior
- Weighted ranking by text relevance, popularity, conversion, personal relevance
- Keyboard navigation support in search dropdown

### 3) A/B Testing Framework

- Experiment engine with feature flags and weighted bucket assignment
- Persistent variant assignment
- Exposure tracking events
- Active experiments:
  - Homepage hero layout A/B
  - Pricing presentation A/B
  - CTA styling A/B

### 4) Conversion Optimization

- Exit intent recovery modal
- Stock urgency countdown and pressure indicators
- Recently viewed products section
- Customers-also-bought recommendation block
- Cart upsell recommendations
- Free shipping progress indicator

### 5) Performance & Scalability

- Cached catalog/home/product data access (`unstable_cache`)
- PDP ISR simulation (`revalidate`)
- Suspense-based section loading
- Prefetch-on-hover product card behavior
- Bundle analyzer integration

### 6) PWA & Mobile

- Service worker registration
- Offline shell/runtime caching strategy
- Web app manifest
- Add-to-home-screen prompt
- Mobile swipe gestures in PDP gallery

### 7) Analytics

- Internal event tracker with local persistence
- Tracked events: page views, product clicks, add-to-cart, checkout steps, conversions, experiment exposure
- Debug analytics panel (open via floating icon or `Shift + A`)

### 8) Inventory Intelligence

- Dynamic stock pressure model
- Sell-out time estimation
- Low-stock urgency UI
- Restock suggestion logic

### 9) SEO

- Product JSON-LD
- Breadcrumb JSON-LD
- Dynamic metadata + canonical links
- `robots.ts`
- Dynamic sitemap generation (`sitemap.ts`)

### 10) Enterprise Architecture

- Added domain modules under `src/domains/*` for data/logic separation
- Shared typing upgraded for experiments/search/personalization/analytics
- Commerce utilities centralized in `src/lib/*`

## Key Folders

- `src/app`: App Router pages and route metadata/sitemap/robots
- `src/components`: UI, layout, commerce feature components
- `src/lib`: APIs, engines, query utilities, constants, performance helpers
- `src/hooks`: experiment, tracking, personalization hooks
- `src/domains`: domain-oriented data/logic modules
- `src/store`: Zustand stores
- `src/types`: shared commerce types

## Run Locally

From repository root:

```bash
pnpm install
pnpm --filter web dev
```

Open `http://localhost:3000`.

## Validate

```bash
pnpm --filter web lint
pnpm --filter web build
```

## Bundle Analysis

```bash
ANALYZE=true pnpm --filter web build
```

## PWA Notes

- Service worker: `public/sw.js`
- Manifest: `public/manifest.webmanifest`
- Install prompt appears when browser emits `beforeinstallprompt`

## Demo Credentials

- Email: `demo@qeetmart.com`
- Password: `demo123`

## Important Runtime Notes

- Mock DB is in-memory and resets on server restart.
- Personalized profile, analytics, experiments, and cart/session data persist in browser local storage.
