import type {
  AdminAccount,
  Customer,
  Order,
  Permission,
  Product,
  ProductCategory,
  SessionUser,
} from './types'

const basePermissions: Record<string, Permission[]> = {
  super_admin: [
    'orders.read',
    'orders.write',
    'orders.refund',
    'products.read',
    'products.write',
    'customers.read',
    'inventory.read',
    'admins.read',
    'admins.write',
  ],
  ops_admin: [
    'orders.read',
    'orders.write',
    'orders.refund',
    'products.read',
    'products.write',
    'customers.read',
    'inventory.read',
    'admins.read',
  ],
  support_admin: ['orders.read', 'customers.read', 'orders.refund'],
}

export const loginUsers: Array<SessionUser & { password: string }> = [
  {
    id: 'u1',
    name: 'Nia Campbell',
    email: 'admin@qeetmart.com',
    password: 'Admin#1234',
    role: 'super_admin',
    permissions: basePermissions.super_admin,
  },
  {
    id: 'u2',
    name: 'Mateo Ruiz',
    email: 'ops@qeetmart.com',
    password: 'Ops#1234',
    role: 'ops_admin',
    permissions: basePermissions.ops_admin,
  },
  {
    id: 'u3',
    name: 'Jordan Lee',
    email: 'support@qeetmart.com',
    password: 'Support#1234',
    role: 'support_admin',
    permissions: basePermissions.support_admin,
  },
]

const categories: ProductCategory[] = [
  'Apparel',
  'Footwear',
  'Accessories',
  'Electronics',
  'Home',
]

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

export const productsSeed: Product[] = Array.from({ length: 18 }).map((_, index) => {
  const category = categories[index % categories.length]
  const price = 24 + index * 7
  const stock = index % 6 === 0 ? 4 : 30 - index

  return {
    id: `p-${index + 1}`,
    name: `${category} Product ${index + 1}`,
    sku: `SKU-${1000 + index}`,
    category,
    price,
    stock,
    imageUrl: categoryImage[category],
    updatedAt: `2026-02-${String(2 + (index % 16)).padStart(2, '0')}T10:00:00.000Z`,
  }
})

export const customersSeed: Customer[] = [
  {
    id: 'c-1',
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
      {
        id: 'ac-3',
        type: 'wishlist',
        detail: 'Added 3 products to wishlist',
        createdAt: '2026-02-11T12:05:00.000Z',
      },
    ],
  },
  {
    id: 'c-2',
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
      {
        id: 'ac-5',
        type: 'support',
        detail: 'Updated delivery address',
        createdAt: '2026-02-13T09:10:00.000Z',
      },
    ],
  },
  {
    id: 'c-3',
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
      {
        id: 'ac-7',
        type: 'wishlist',
        detail: 'Saved new home collection',
        createdAt: '2026-02-14T10:50:00.000Z',
      },
    ],
  },
  {
    id: 'c-4',
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
      {
        id: 'ac-10',
        type: 'support',
        detail: 'Reported payment issue resolved',
        createdAt: '2026-02-16T08:45:00.000Z',
      },
    ],
  },
  {
    id: 'c-6',
    name: 'Ethan Patel',
    email: 'ethan.patel@example.com',
    phone: '+1 (617) 555-6189',
    city: 'Boston',
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

export const ordersSeed: Order[] = Array.from({ length: 24 }).map((_, index) => {
  const customer = customersSeed[index % customersSeed.length]
  const primaryProduct = productsSeed[index % productsSeed.length]
  const secondaryProduct = productsSeed[(index + 3) % productsSeed.length]
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

export const salesTrendSeed = [
  { date: '2026-02-01', sales: 12400, orders: 38 },
  { date: '2026-02-02', sales: 14100, orders: 44 },
  { date: '2026-02-03', sales: 15220, orders: 48 },
  { date: '2026-02-04', sales: 11800, orders: 35 },
  { date: '2026-02-05', sales: 16110, orders: 52 },
  { date: '2026-02-06', sales: 17400, orders: 58 },
  { date: '2026-02-07', sales: 16900, orders: 55 },
  { date: '2026-02-08', sales: 18640, orders: 62 },
  { date: '2026-02-09', sales: 19380, orders: 66 },
  { date: '2026-02-10', sales: 17620, orders: 57 },
  { date: '2026-02-11', sales: 20120, orders: 70 },
  { date: '2026-02-12', sales: 20980, orders: 72 },
]

export const adminAccountsSeed: AdminAccount[] = [
  {
    id: 'a-1',
    name: 'Nia Campbell',
    email: 'admin@qeetmart.com',
    role: 'super_admin',
    permissions: basePermissions.super_admin,
    status: 'active',
    lastLogin: '2026-02-20T09:10:00.000Z',
  },
  {
    id: 'a-2',
    name: 'Mateo Ruiz',
    email: 'ops@qeetmart.com',
    role: 'ops_admin',
    permissions: basePermissions.ops_admin,
    status: 'active',
    lastLogin: '2026-02-20T08:42:00.000Z',
  },
  {
    id: 'a-3',
    name: 'Jordan Lee',
    email: 'support@qeetmart.com',
    role: 'support_admin',
    permissions: basePermissions.support_admin,
    status: 'active',
    lastLogin: '2026-02-19T18:30:00.000Z',
  },
  {
    id: 'a-4',
    name: 'Riley Morgan',
    email: 'riley.morgan@qeetmart.com',
    role: 'ops_admin',
    permissions: basePermissions.ops_admin,
    status: 'active',
    lastLogin: '2026-02-19T17:20:00.000Z',
  },
  {
    id: 'a-5',
    name: 'Samira Collins',
    email: 'samira.collins@qeetmart.com',
    role: 'support_admin',
    permissions: basePermissions.support_admin,
    status: 'suspended',
    lastLogin: '2026-02-15T11:05:00.000Z',
  },
]

export function rolePermissions(role: SessionUser['role']) {
  return basePermissions[role]
}
