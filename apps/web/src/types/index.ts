export type SortOption = "price-asc" | "price-desc" | "rating" | "newest";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  bannerColor: string;
  icon: string;
}

export interface ProductVariantGroup {
  name: string;
  values: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  brand: string;
  tags: string[];
  price: number;
  originalPrice: number;
  currency: "INR";
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  variants: ProductVariantGroup[];
  specs: ProductSpec[];
  features: string[];
  trustBadges: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface RatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  addresses: Address[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variantSelections?: Record<string, string>;
}

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image: string;
  variantSelections?: Record<string, string>;
}

export type DeliveryMethod = "standard" | "express" | "same-day";
export type PaymentMethod = "card" | "upi" | "cod";

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingAddress: Address;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  status: "confirmed" | "processing" | "shipped" | "delivered";
  createdAt: string;
  estimatedDelivery: string;
}

export interface ProductQueryParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brands?: string[];
  availability?: "all" | "in-stock";
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableBrands: string[];
  minAvailablePrice: number;
  maxAvailablePrice: number;
}

export interface HomePagePayload {
  heroProducts: Product[];
  featuredProducts: Product[];
  trendingProducts: Product[];
  recommendedProducts: Product[];
}

export interface DeliveryEstimate {
  earliestDate: string;
  latestDate: string;
}

export interface CouponResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  message: string;
}

export interface CheckoutDraft {
  shippingAddress: Address;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export interface SearchSuggestion {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  price: number;
}
