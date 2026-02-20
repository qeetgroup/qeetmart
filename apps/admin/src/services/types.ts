export type Permission =
  | 'orders.read'
  | 'orders.write'
  | 'orders.refund'
  | 'products.read'
  | 'products.write'
  | 'customers.read'
  | 'inventory.read'
  | 'admins.read'
  | 'admins.write'

export type UserRole = 'super_admin' | 'ops_admin' | 'support_admin'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: Permission[]
}

export interface DashboardOverview {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  salesTrend: Array<{
    date: string
    sales: number
    orders: number
  }>
  recentOrders: Order[]
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  email: string
  status: OrderStatus
  total: number
  createdAt: string
  items: OrderItem[]
  shippingAddress: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface OrderFilters {
  status?: OrderStatus | 'all'
  from?: string
  to?: string
  page?: number
  pageSize?: number
  sort?: OrderSort
}

export type OrderSort =
  | 'date_desc'
  | 'date_asc'
  | 'amount_desc'
  | 'amount_asc'
  | 'customer_asc'
  | 'customer_desc'

export type ProductCategory =
  | 'Apparel'
  | 'Footwear'
  | 'Accessories'
  | 'Electronics'
  | 'Home'

export interface Product {
  id: string
  name: string
  sku: string
  category: ProductCategory
  price: number
  stock: number
  imageUrl: string
  updatedAt: string
}

export interface ProductPayload {
  name: string
  sku: string
  category: ProductCategory
  price: number
  stock: number
  imageUrl: string
}

export interface ProductFilters {
  search?: string
  category?: ProductCategory | 'all'
  page?: number
  pageSize?: number
  sort?: ProductSort
}

export type ProductSort =
  | 'updated_desc'
  | 'updated_asc'
  | 'name_asc'
  | 'name_desc'
  | 'price_desc'
  | 'price_asc'

export interface CustomerActivity {
  id: string
  type: 'order' | 'support' | 'wishlist'
  detail: string
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  totalSpent: number
  joinedAt: string
  lastOrderAt: string
  activity: CustomerActivity[]
}

export type CustomerSort =
  | 'last_order_desc'
  | 'last_order_asc'
  | 'name_asc'
  | 'name_desc'
  | 'spent_desc'
  | 'spent_asc'

export interface InventoryItem {
  productId: string
  productName: string
  category: ProductCategory
  stock: number
  reorderThreshold: number
}

export interface InventorySummary {
  totalUnits: number
  lowStockCount: number
  outOfStockCount: number
  items: InventoryItem[]
}

export interface AdminAccount {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: Permission[]
  status: 'active' | 'suspended'
  lastLogin: string
}
