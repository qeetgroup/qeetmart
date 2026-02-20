import type {
  AdminAccount,
  AdminNotification,
  CreateRolePayload,
  Customer,
  ModuleAccess,
  ModuleScope,
  Order,
  Permission,
  PredictiveInsight,
  Product,
  ProductCategory,
  RoleDefinition,
  SessionUser,
  Tenant,
  UserRole,
} from './types'

export const tenantsSeed: Tenant[] = [
  {
    id: 'tenant_west_coast',
    name: 'West Coast Flagship',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
  },
  {
    id: 'tenant_northeast',
    name: 'Northeast Hub',
    location: 'New York, NY',
    timezone: 'America/New_York',
    currency: 'USD',
  },
  {
    id: 'tenant_south',
    name: 'Southern Marketplace',
    location: 'Austin, TX',
    timezone: 'America/Chicago',
    currency: 'USD',
  },
]

export const moduleScopes: ModuleScope[] = [
  'dashboard',
  'analytics',
  'orders',
  'products',
  'customers',
  'inventory',
  'insights',
  'notifications',
  'admins',
  'settings',
]

export const modulePermissionMap: Record<ModuleScope, { read: Permission; write?: Permission }> = {
  dashboard: { read: 'dashboard.read' },
  analytics: { read: 'analytics.read' },
  orders: { read: 'orders.read', write: 'orders.write' },
  products: { read: 'products.read', write: 'products.write' },
  customers: { read: 'customers.read' },
  inventory: { read: 'inventory.read' },
  insights: { read: 'insights.read' },
  notifications: { read: 'notifications.read', write: 'notifications.write' },
  admins: { read: 'admins.read', write: 'admins.write' },
  settings: { read: 'settings.read' },
}

export function moduleAccessToPermissions(moduleAccess: ModuleAccess[]) {
  const permissionSet = new Set<Permission>()

  for (const moduleRule of moduleAccess) {
    const rule = modulePermissionMap[moduleRule.module]

    if (moduleRule.read) {
      permissionSet.add(rule.read)
    }

    if (moduleRule.write && rule.write) {
      permissionSet.add(rule.write)
      if (moduleRule.module === 'orders') {
        permissionSet.add('orders.refund')
      }
    }
  }

  return [...permissionSet]
}

function createModuleAccess(input: Partial<Record<ModuleScope, { read: boolean; write: boolean }>>): ModuleAccess[] {
  return moduleScopes.map((module) => ({
    module,
    read: input[module]?.read ?? false,
    write: input[module]?.write ?? false,
  }))
}

const systemRolesSeed: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full platform access across modules, stores, and admin controls.',
    moduleAccess: createModuleAccess({
      dashboard: { read: true, write: false },
      analytics: { read: true, write: false },
      orders: { read: true, write: true },
      products: { read: true, write: true },
      customers: { read: true, write: false },
      inventory: { read: true, write: false },
      insights: { read: true, write: false },
      notifications: { read: true, write: true },
      admins: { read: true, write: true },
      settings: { read: true, write: false },
    }),
    permissions: [],
    isSystem: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'ops_admin',
    name: 'Ops Admin',
    description: 'Operational control for orders, products, and inventory execution.',
    moduleAccess: createModuleAccess({
      dashboard: { read: true, write: false },
      analytics: { read: true, write: false },
      orders: { read: true, write: true },
      products: { read: true, write: true },
      customers: { read: true, write: false },
      inventory: { read: true, write: false },
      insights: { read: true, write: false },
      notifications: { read: true, write: true },
      admins: { read: true, write: false },
      settings: { read: true, write: false },
    }),
    permissions: [],
    isSystem: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'support_admin',
    name: 'Support Admin',
    description: 'Customer and order support workflows with limited modification rights.',
    moduleAccess: createModuleAccess({
      dashboard: { read: true, write: false },
      analytics: { read: false, write: false },
      orders: { read: true, write: false },
      products: { read: false, write: false },
      customers: { read: true, write: false },
      inventory: { read: false, write: false },
      insights: { read: false, write: false },
      notifications: { read: true, write: false },
      admins: { read: false, write: false },
      settings: { read: true, write: false },
    }),
    permissions: [],
    isSystem: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
].map(
  (role): RoleDefinition => ({
    ...role,
    id: role.id as UserRole,
    permissions: moduleAccessToPermissions(role.moduleAccess),
  }),
)

export const rolesSeed = [...systemRolesSeed]

function getRolePermissions(roleId: UserRole) {
  const role = rolesSeed.find((entry) => entry.id === roleId)
  return role ? [...role.permissions] : []
}

export const loginUsers: Array<SessionUser & { password: string }> = [
  {
    id: 'u1',
    name: 'Nia Campbell',
    email: 'admin@qeetmart.com',
    password: 'Admin#1234',
    role: 'super_admin',
    permissions: getRolePermissions('super_admin'),
  },
  {
    id: 'u2',
    name: 'Mateo Ruiz',
    email: 'ops@qeetmart.com',
    password: 'Ops#1234',
    role: 'ops_admin',
    permissions: getRolePermissions('ops_admin'),
  },
  {
    id: 'u3',
    name: 'Jordan Lee',
    email: 'support@qeetmart.com',
    password: 'Support#1234',
    role: 'support_admin',
    permissions: getRolePermissions('support_admin'),
  },
]

const categories: ProductCategory[] = ['Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home']

const categoryImage: Record<ProductCategory, string> = {
  Apparel:
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
  Footwear:
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  Accessories:
    'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?auto=format&fit=crop&w=600&q=80',
  Electronics:
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  Home:
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80',
}

export const productsSeed: Product[] = Array.from({ length: 36 }).map((_, index) => {
  const category = categories[index % categories.length]
  const tenant = tenantsSeed[index % tenantsSeed.length]
  const price = 28 + index * 5
  const stock = index % 7 === 0 ? 4 : 44 - (index % 20)

  return {
    id: `p-${index + 1}`,
    tenantId: tenant.id,
    name: `${category} Product ${index + 1}`,
    sku: `SKU-${2000 + index}`,
    category,
    price,
    stock,
    imageUrl: categoryImage[category],
    updatedAt: `2026-02-${String(2 + (index % 18)).padStart(2, '0')}T10:00:00.000Z`,
  }
})

export const customersSeed: Customer[] = [
  {
    id: 'c-1',
    tenantId: 'tenant_west_coast',
    name: 'Ava Brooks',
    email: 'ava.brooks@example.com',
    phone: '+1 (415) 555-1042',
    city: 'San Francisco',
    totalSpent: 1840,
    joinedAt: '2025-03-18T10:10:00.000Z',
    lastOrderAt: '2026-02-16T09:20:00.000Z',
    activity: [
      {
        id: 'ac-1',
        type: 'order',
        detail: 'Placed order #ORD-1091 for $240',
        createdAt: '2026-02-16T09:20:00.000Z',
      },
      {
        id: 'ac-2',
        type: 'support',
        detail: 'Requested expedited shipping',
        createdAt: '2026-02-15T15:40:00.000Z',
      },
    ],
  },
  {
    id: 'c-2',
    tenantId: 'tenant_northeast',
    name: 'Noah Park',
    email: 'noah.park@example.com',
    phone: '+1 (646) 555-2201',
    city: 'New York',
    totalSpent: 920,
    joinedAt: '2025-07-11T09:30:00.000Z',
    lastOrderAt: '2026-02-17T11:10:00.000Z',
    activity: [
      {
        id: 'ac-4',
        type: 'order',
        detail: 'Placed order #ORD-1092 for $112',
        createdAt: '2026-02-17T11:10:00.000Z',
      },
    ],
  },
  {
    id: 'c-3',
    tenantId: 'tenant_northeast',
    name: 'Isabella Grant',
    email: 'isabella.grant@example.com',
    phone: '+1 (312) 555-7850',
    city: 'Chicago',
    totalSpent: 2550,
    joinedAt: '2024-11-02T08:05:00.000Z',
    lastOrderAt: '2026-02-18T14:15:00.000Z',
    activity: [
      {
        id: 'ac-6',
        type: 'order',
        detail: 'Placed order #ORD-1093 for $398',
        createdAt: '2026-02-18T14:15:00.000Z',
      },
    ],
  },
  {
    id: 'c-4',
    tenantId: 'tenant_west_coast',
    name: 'Liam Quinn',
    email: 'liam.quinn@example.com',
    phone: '+1 (206) 555-9311',
    city: 'Seattle',
    totalSpent: 1160,
    joinedAt: '2025-01-21T14:25:00.000Z',
    lastOrderAt: '2026-02-12T09:00:00.000Z',
    activity: [
      {
        id: 'ac-8',
        type: 'order',
        detail: 'Returned one apparel item',
        createdAt: '2026-02-12T09:00:00.000Z',
      },
    ],
  },
  {
    id: 'c-5',
    tenantId: 'tenant_south',
    name: 'Sophia Kim',
    email: 'sophia.kim@example.com',
    phone: '+1 (214) 555-2678',
    city: 'Dallas',
    totalSpent: 3020,
    joinedAt: '2024-08-29T11:45:00.000Z',
    lastOrderAt: '2026-02-19T13:30:00.000Z',
    activity: [
      {
        id: 'ac-9',
        type: 'order',
        detail: 'Placed order #ORD-1095 for $520',
        createdAt: '2026-02-19T13:30:00.000Z',
      },
    ],
  },
  {
    id: 'c-6',
    tenantId: 'tenant_south',
    name: 'Ethan Patel',
    email: 'ethan.patel@example.com',
    phone: '+1 (617) 555-6189',
    city: 'Houston',
    totalSpent: 780,
    joinedAt: '2025-09-03T09:00:00.000Z',
    lastOrderAt: '2026-02-10T10:30:00.000Z',
    activity: [
      {
        id: 'ac-11',
        type: 'order',
        detail: 'Placed order #ORD-1086 for $88',
        createdAt: '2026-02-10T10:30:00.000Z',
      },
    ],
  },
  {
    id: 'c-7',
    tenantId: 'tenant_south',
    name: 'Mia Hernandez',
    email: 'mia.hernandez@example.com',
    phone: '+1 (305) 555-3370',
    city: 'Miami',
    totalSpent: 1490,
    joinedAt: '2025-02-12T13:30:00.000Z',
    lastOrderAt: '2026-02-09T17:15:00.000Z',
    activity: [
      {
        id: 'ac-12',
        type: 'wishlist',
        detail: 'Moved 2 items from wishlist to cart',
        createdAt: '2026-02-09T17:15:00.000Z',
      },
    ],
  },
  {
    id: 'c-8',
    tenantId: 'tenant_west_coast',
    name: 'Oliver Stone',
    email: 'oliver.stone@example.com',
    phone: '+1 (702) 555-1154',
    city: 'Las Vegas',
    totalSpent: 640,
    joinedAt: '2025-10-18T12:00:00.000Z',
    lastOrderAt: '2026-02-08T15:20:00.000Z',
    activity: [
      {
        id: 'ac-13',
        type: 'order',
        detail: 'Placed order #ORD-1084 for $72',
        createdAt: '2026-02-08T15:20:00.000Z',
      },
    ],
  },
]

const statusPattern: Order['status'][] = [
  'delivered',
  'processing',
  'shipped',
  'pending',
  'cancelled',
  'delivered',
  'processing',
  'delivered',
]

function productsByTenant(tenantId: string) {
  return productsSeed.filter((entry) => entry.tenantId === tenantId)
}

function customersByTenant(tenantId: string) {
  return customersSeed.filter((entry) => entry.tenantId === tenantId)
}

export const ordersSeed: Order[] = Array.from({ length: 48 }).map((_, index) => {
  const tenant = tenantsSeed[index % tenantsSeed.length]
  const tenantCustomers = customersByTenant(tenant.id)
  const tenantProducts = productsByTenant(tenant.id)

  const customer = tenantCustomers[index % tenantCustomers.length]
  const primaryProduct = tenantProducts[index % tenantProducts.length]
  const secondaryProduct = tenantProducts[(index + 2) % tenantProducts.length]

  const createdAt = new Date(2026, 1, 1 + (index % 19), 9 + (index % 6), 15)
  const itemAQty = (index % 3) + 1
  const itemBQty = (index % 2) + 1

  const items = [
    {
      id: `oi-${index + 1}-1`,
      productId: primaryProduct.id,
      productName: primaryProduct.name,
      quantity: itemAQty,
      unitPrice: primaryProduct.price,
    },
    {
      id: `oi-${index + 1}-2`,
      productId: secondaryProduct.id,
      productName: secondaryProduct.name,
      quantity: itemBQty,
      unitPrice: secondaryProduct.price,
    },
  ]

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  return {
    id: `ORD-${1080 + index}`,
    tenantId: tenant.id,
    customerId: customer.id,
    customerName: customer.name,
    email: customer.email,
    status: statusPattern[index % statusPattern.length],
    total,
    createdAt: createdAt.toISOString(),
    items,
    shippingAddress: `${20 + index} Market Street, ${customer.city}, USA`,
  }
})

export const predictiveInsightsSeed: PredictiveInsight[] = [
  {
    id: 'insight-1',
    tenantId: 'tenant_west_coast',
    title: 'Sales expected to grow 12% next week',
    summary:
      'The model detected rising repeat purchases in electronics and accessories with stable fulfillment SLAs.',
    metric: 'Revenue growth',
    confidence: 0.82,
    predictedChangePercent: 12,
    horizon: 'Next 7 days',
    impact: 'positive',
    recommendations: [
      'Increase ad budget for top 3 SKUs by 8%.',
      'Prepare a restock buffer for fast-moving accessories.',
      'Bundle electronics with warranty upsells in checkout.',
    ],
    updatedAt: '2026-02-20T09:42:00.000Z',
  },
  {
    id: 'insight-2',
    tenantId: 'tenant_northeast',
    title: 'Order cancellations may rise 6% this weekend',
    summary: 'Weekend shipping-delay patterns are correlated with increased cancellation rates in this region.',
    metric: 'Cancellation rate',
    confidence: 0.74,
    predictedChangePercent: -6,
    horizon: 'Next 3 days',
    impact: 'negative',
    recommendations: [
      'Show explicit delivery ETA before payment.',
      'Prioritize same-day picks for pending high-value orders.',
      'Trigger proactive support outreach for delayed shipments.',
    ],
    updatedAt: '2026-02-20T09:42:00.000Z',
  },
  {
    id: 'insight-3',
    tenantId: 'tenant_south',
    title: 'AOV likely to increase 9% with bundle prompts',
    summary: 'Customers in this store respond strongly to low-friction bundle suggestions on checkout.',
    metric: 'Average order value',
    confidence: 0.78,
    predictedChangePercent: 9,
    horizon: 'Next 14 days',
    impact: 'positive',
    recommendations: [
      'Enable checkout cross-sell cards for top categories.',
      'Offer 5% off bundles over $150.',
      'Place urgency indicators on low-stock companion items.',
    ],
    updatedAt: '2026-02-20T09:42:00.000Z',
  },
]

export const notificationsSeed: AdminNotification[] = [
  {
    id: 'n-1',
    tenantId: 'tenant_west_coast',
    title: 'Low stock alert',
    message: '4 SKUs are below reorder threshold.',
    type: 'warning',
    read: false,
    createdAt: '2026-02-20T10:05:00.000Z',
    actionUrl: '/inventory',
  },
  {
    id: 'n-2',
    tenantId: 'tenant_west_coast',
    title: 'Refund processed',
    message: 'Refund for ORD-1104 completed successfully.',
    type: 'success',
    read: false,
    createdAt: '2026-02-20T09:20:00.000Z',
    actionUrl: '/orders',
  },
  {
    id: 'n-3',
    tenantId: 'tenant_northeast',
    title: 'Shipping incident',
    message: 'Carrier API latency is causing delayed label creation.',
    type: 'error',
    read: false,
    createdAt: '2026-02-20T09:54:00.000Z',
    actionUrl: '/orders',
  },
  {
    id: 'n-4',
    tenantId: 'tenant_south',
    title: 'Forecast available',
    message: 'New weekly AI forecast was generated for your store.',
    type: 'info',
    read: true,
    createdAt: '2026-02-20T08:42:00.000Z',
    actionUrl: '/insights',
  },
]

export const adminAccountsSeed: AdminAccount[] = [
  {
    id: 'a-1',
    name: 'Nia Campbell',
    email: 'admin@qeetmart.com',
    role: 'super_admin',
    permissions: getRolePermissions('super_admin'),
    status: 'active',
    lastLogin: '2026-02-20T09:10:00.000Z',
  },
  {
    id: 'a-2',
    name: 'Mateo Ruiz',
    email: 'ops@qeetmart.com',
    role: 'ops_admin',
    permissions: getRolePermissions('ops_admin'),
    status: 'active',
    lastLogin: '2026-02-20T08:42:00.000Z',
  },
  {
    id: 'a-3',
    name: 'Jordan Lee',
    email: 'support@qeetmart.com',
    role: 'support_admin',
    permissions: getRolePermissions('support_admin'),
    status: 'active',
    lastLogin: '2026-02-19T18:30:00.000Z',
  },
  {
    id: 'a-4',
    name: 'Riley Morgan',
    email: 'riley.morgan@qeetmart.com',
    role: 'ops_admin',
    permissions: getRolePermissions('ops_admin'),
    status: 'active',
    lastLogin: '2026-02-19T17:20:00.000Z',
  },
  {
    id: 'a-5',
    name: 'Samira Collins',
    email: 'samira.collins@qeetmart.com',
    role: 'support_admin',
    permissions: getRolePermissions('support_admin'),
    status: 'suspended',
    lastLogin: '2026-02-15T11:05:00.000Z',
  },
]

export function rolePermissions(role: SessionUser['role']) {
  return getRolePermissions(role)
}

export function createRoleFromPayload(payload: CreateRolePayload): RoleDefinition {
  const slug = payload.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return {
    id: `custom_${slug || 'role'}`,
    name: payload.name,
    description: payload.description,
    moduleAccess: payload.moduleAccess,
    permissions: moduleAccessToPermissions(payload.moduleAccess),
    isSystem: false,
    createdAt: new Date().toISOString(),
  }
}
