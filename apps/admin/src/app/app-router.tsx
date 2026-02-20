import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import {
  AdminsPage,
  CustomersPage,
  DashboardLayout,
  DashboardPage,
  ForbiddenPage,
  InventoryPage,
  LoginPage,
  NotFoundPage,
  OrdersPage,
  ProductsPage,
  SettingsPage,
} from '@/app/lazy-routes'
import { RouteFallback } from '@/components/feedback/route-fallback'
import { ProtectedRoute } from '@/guards/protected-route'

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
