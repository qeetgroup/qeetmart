import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type Loader<T extends ComponentType<unknown>> = () => Promise<{ default: T }>
type LazyWithPreload<T extends ComponentType<unknown>> = LazyExoticComponent<T> & {
  preload: Loader<T>
}

function lazyWithPreload<T extends ComponentType<unknown>>(loader: Loader<T>): LazyWithPreload<T> {
  const LazyComponent = lazy(loader) as LazyWithPreload<T>
  LazyComponent.preload = loader
  return LazyComponent
}

export const DashboardLayout = lazyWithPreload(async () => {
  const module = await import('@/components/layout/dashboard-layout')
  return { default: module.DashboardLayout }
})

export const LoginPage = lazyWithPreload(async () => {
  const module = await import('@/pages/auth/login-page')
  return { default: module.LoginPage }
})

export const ForbiddenPage = lazyWithPreload(async () => {
  const module = await import('@/pages/auth/forbidden-page')
  return { default: module.ForbiddenPage }
})

export const DashboardPage = lazyWithPreload(async () => {
  const module = await import('@/pages/dashboard-page')
  return { default: module.DashboardPage }
})

export const AnalyticsPage = lazyWithPreload(async () => {
  const module = await import('@/pages/analytics-page')
  return { default: module.AnalyticsPage }
})

export const InsightsPage = lazyWithPreload(async () => {
  const module = await import('@/pages/insights-page')
  return { default: module.InsightsPage }
})

export const OrdersPage = lazyWithPreload(async () => {
  const module = await import('@/pages/orders-page')
  return { default: module.OrdersPage }
})

export const ProductsPage = lazyWithPreload(async () => {
  const module = await import('@/pages/products-page')
  return { default: module.ProductsPage }
})

export const CustomersPage = lazyWithPreload(async () => {
  const module = await import('@/pages/customers-page')
  return { default: module.CustomersPage }
})

export const InventoryPage = lazyWithPreload(async () => {
  const module = await import('@/pages/inventory-page')
  return { default: module.InventoryPage }
})

export const NotificationsPage = lazyWithPreload(async () => {
  const module = await import('@/pages/notifications-page')
  return { default: module.NotificationsPage }
})

export const SettingsPage = lazyWithPreload(async () => {
  const module = await import('@/pages/settings-page')
  return { default: module.SettingsPage }
})

export const AdminsPage = lazyWithPreload(async () => {
  const module = await import('@/pages/admins-page')
  return { default: module.AdminsPage }
})

export const RolesPage = lazyWithPreload(async () => {
  const module = await import('@/pages/roles-page')
  return { default: module.RolesPage }
})

export const NotFoundPage = lazyWithPreload(async () => {
  const module = await import('@/pages/not-found-page')
  return { default: module.NotFoundPage }
})

const routePreloaders: Record<string, Array<() => Promise<unknown>>> = {
  '/': [DashboardLayout.preload, DashboardPage.preload],
  '/analytics': [DashboardLayout.preload, AnalyticsPage.preload],
  '/insights': [DashboardLayout.preload, InsightsPage.preload],
  '/orders': [DashboardLayout.preload, OrdersPage.preload],
  '/products': [DashboardLayout.preload, ProductsPage.preload],
  '/customers': [DashboardLayout.preload, CustomersPage.preload],
  '/inventory': [DashboardLayout.preload, InventoryPage.preload],
  '/notifications': [DashboardLayout.preload, NotificationsPage.preload],
  '/settings': [DashboardLayout.preload, SettingsPage.preload],
  '/admins': [DashboardLayout.preload, AdminsPage.preload],
  '/roles': [DashboardLayout.preload, RolesPage.preload],
  '/login': [LoginPage.preload],
  '/forbidden': [ForbiddenPage.preload],
}

export async function preloadRouteModule(path: string) {
  const normalizedPath = path.split('?')[0]
  const preloaders = routePreloaders[normalizedPath]
  if (!preloaders) {
    return
  }

  await Promise.allSettled(preloaders.map((preload) => preload()))
}
