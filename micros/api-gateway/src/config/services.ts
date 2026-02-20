/**
 * Service Registry Configuration
 * Maps API routes to backend microservices
 */

export interface ServiceConfig {
  name: string;
  baseUrl: string;
  healthCheckPath?: string;
  timeout?: number;
}

export const services: Record<string, ServiceConfig> = {
  auth: {
    name: 'auth-service',
    baseUrl: process.env['AUTH_SERVICE_URL'] || 'http://localhost:8081',
    healthCheckPath: '/actuator/health',
    timeout: 5000,
  },
  users: {
    name: 'user-service',
    baseUrl: process.env['USER_SERVICE_URL'] || 'http://localhost:8082',
    healthCheckPath: '/actuator/health',
    timeout: 5000,
  },
  products: {
    name: 'product-service',
    baseUrl: process.env['PRODUCT_SERVICE_URL'] || 'http://localhost:8083',
    healthCheckPath: '/actuator/health',
    timeout: 5000,
  },
  orders: {
    name: 'order-service',
    baseUrl: process.env['ORDER_SERVICE_URL'] || 'http://localhost:8084',
    healthCheckPath: '/health',
    timeout: 5000,
  },
  payments: {
    name: 'payment-service',
    baseUrl: process.env['PAYMENT_SERVICE_URL'] || 'http://localhost:8085',
    healthCheckPath: '/health',
    timeout: 5000,
  },
  inventory: {
    name: 'inventory-service',
    baseUrl: process.env['INVENTORY_SERVICE_URL'] || 'http://localhost:8080',
    healthCheckPath: '/health',
    timeout: 5000,
  },
};

/**
 * Route configuration mapping API paths to services
 */
export const routeConfig: Array<{
  path: string;
  service: keyof typeof services;
  upstreamPath: string;
}> = [
  // Auth routes
  { path: '/api/v1/auth', service: 'auth', upstreamPath: '/auth' },
  
  // User routes
  { path: '/api/v1/users', service: 'users', upstreamPath: '/users' },
  
  // Product routes
  { path: '/api/v1/products', service: 'products', upstreamPath: '/products' },
  
  // Order routes
  { path: '/api/v1/orders', service: 'orders', upstreamPath: '/orders' },
  
  // Payment routes
  { path: '/api/v1/payments', service: 'payments', upstreamPath: '/payments' },
  
  // Inventory routes
  { path: '/api/v1/inventory', service: 'inventory', upstreamPath: '/inventory' },
];
