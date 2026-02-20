import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import { RouteFallback } from '@/components/feedback/route-fallback'
import { ProtectedRoute } from '@/guards/protected-route'

const DashboardLayout = lazy(async () => {
  const module = await import('@/components/layout/dashboard-layout')
  return { default: module.DashboardLayout }
})

const LoginPage = lazy(async () => {
  const module = await import('@/pages/auth/login-page')
  return { default: module.LoginPage }
})

const ForbiddenPage = lazy(async () => {
  const module = await import('@/pages/auth/forbidden-page')
  return { default: module.ForbiddenPage }
})

const DashboardPage = lazy(async () => {
  const module = await import('@/pages/dashboard-page')
  return { default: module.DashboardPage }
})

const OrdersPage = lazy(async () => {
  const module = await import('@/pages/orders-page')
  return { default: module.OrdersPage }
})

const ProductsPage = lazy(async () => {
  const module = await import('@/pages/products-page')
  return { default: module.ProductsPage }
})

const CustomersPage = lazy(async () => {
  const module = await import('@/pages/customers-page')
  return { default: module.CustomersPage }
})

const InventoryPage = lazy(async () => {
  const module = await import('@/pages/inventory-page')
  return { default: module.InventoryPage }
})

const SettingsPage = lazy(async () => {
  const module = await import('@/pages/settings-page')
  return { default: module.SettingsPage }
})

const AdminsPage = lazy(async () => {
  const module = await import('@/pages/admins-page')
  return { default: module.AdminsPage }
})

const NotFoundPage = lazy(async () => {
  const module = await import('@/pages/not-found-page')
  return { default: module.NotFoundPage }
})

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={withSuspense(<LoginPage />)} />
      <Route path="/forbidden" element={withSuspense(<ForbiddenPage />)} />

      <Route element={<ProtectedRoute />}>
        <Route element={withSuspense(<DashboardLayout />)}>
          <Route index element={withSuspense(<DashboardPage />)} />
          <Route path="orders" element={withSuspense(<OrdersPage />)} />
          <Route path="products" element={withSuspense(<ProductsPage />)} />
          <Route path="customers" element={withSuspense(<CustomersPage />)} />
          <Route path="inventory" element={withSuspense(<InventoryPage />)} />
          <Route path="settings" element={withSuspense(<SettingsPage />)} />

          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="admins" element={withSuspense(<AdminsPage />)} />
          </Route>

          <Route path="*" element={withSuspense(<NotFoundPage />)} />
        </Route>
      </Route>

      <Route path="*" element={withSuspense(<NotFoundPage />)} />
    </>,
  ),
)
