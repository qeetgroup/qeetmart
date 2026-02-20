export type ModuleScope =
  | 'dashboard'
  | 'analytics'
  | 'orders'
  | 'products'
  | 'customers'
  | 'inventory'
  | 'insights'
  | 'notifications'
  | 'admins'
  | 'settings'

export type Permission =
  | 'dashboard.read'
  | 'analytics.read'
  | 'orders.read'
  | 'orders.write'
  | 'orders.refund'
  | 'products.read'
  | 'products.write'
  | 'customers.read'
  | 'inventory.read'
  | 'insights.read'
  | 'notifications.read'
  | 'notifications.write'
  | 'admins.read'
  | 'admins.write'
  | 'settings.read'

export type BuiltInRole = 'super_admin' | 'ops_admin' | 'support_admin'

export type UserRole = BuiltInRole | `custom_${string}`

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: Permission[]
}

export interface Tenant {
  id: string
  name: string
  location: string
  timezone: string
  currency: 'USD'
}

export interface DashboardOverview {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  salesTrend: SalesTrendPoint[]
  recentOrders: Order[]
}

export interface SalesTrendPoint {
  date: string
  sales: number
  orders: number
}

export interface AnalyticsKpi {
  id: 'sales' | 'orders' | 'avg_order_value' | 'conversion'
  label: string
  value: number
  trendPercent: number
  direction: 'up' | 'down' | 'flat'
  formatter: 'currency' | 'number' | 'percent'
}

export interface AnalyticsSnapshot {
  tenantId: string
  kpis: AnalyticsKpi[]
  salesTrend: SalesTrendPoint[]
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
  tenantId: string
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
  customer?: string
  page?: number
  pageSize?: number
  sort?: OrderSort
  tenantId?: string
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
  tenantId: string
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
  tenantId?: string
}

export interface ProductFilters {
  search?: string
  category?: ProductCategory | 'all'
  categories?: ProductCategory[]
  priceMin?: number
  priceMax?: number
  page?: number
  pageSize?: number
  sort?: ProductSort
  tenantId?: string
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
  tenantId: string
  name: string
  email: string
  phone: string
  city: string
  totalSpent: number
  joinedAt: string
  lastOrderAt: string
  activity: CustomerActivity[]
}

export interface CustomerFilters {
  search?: string
  tenantId?: string
  sort?: CustomerSort
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
  tenantId: string
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

export interface ModuleAccess {
  module: ModuleScope
  read: boolean
  write: boolean
}

export interface RoleDefinition {
  id: UserRole
  name: string
  description: string
  moduleAccess: ModuleAccess[]
  permissions: Permission[]
  isSystem: boolean
  createdAt: string
}

export interface CreateRolePayload {
  name: string
  description: string
  moduleAccess: ModuleAccess[]
}

export interface UpdateRolePayload {
  roleId: UserRole
  name: string
  description: string
  moduleAccess: ModuleAccess[]
}

export interface PredictiveInsight {
  id: string
  tenantId: string
  title: string
  summary: string
  metric: string
  confidence: number
  predictedChangePercent: number
  horizon: string
  impact: 'positive' | 'neutral' | 'negative'
  recommendations: string[]
  updatedAt: string
}

export interface RealtimeOrderEvent {
  id: string
  tenantId: string
  orderId: string
  type: 'created' | 'updated' | 'refunded'
  customerName: string
  status: OrderStatus
  total: number
  createdAt: string
}

export interface RealtimeSalesTick {
  id: string
  tenantId: string
  date: string
  sales: number
  orders: number
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface AdminNotification {
  id: string
  tenantId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
  actionUrl?: string
}
