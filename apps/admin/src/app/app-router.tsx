import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import {
  AdminsPage,
  AnalyticsPage,
  CustomersPage,
  DashboardLayout,
  DashboardPage,
  ForbiddenPage,
  InsightsPage,
  InventoryPage,
  LoginPage,
  NotFoundPage,
  NotificationsPage,
  OrdersPage,
  ProductsPage,
  RolesPage,
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
          <Route element={<ProtectedRoute requiredPermissions={['dashboard.read']} />}>
            <Route index element={withSuspense(<DashboardPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['analytics.read']} />}>
            <Route path="analytics" element={withSuspense(<AnalyticsPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['insights.read']} />}>
            <Route path="insights" element={withSuspense(<InsightsPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['orders.read']} />}>
            <Route path="orders" element={withSuspense(<OrdersPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['products.read']} />}>
            <Route path="products" element={withSuspense(<ProductsPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['customers.read']} />}>
            <Route path="customers" element={withSuspense(<CustomersPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['inventory.read']} />}>
            <Route path="inventory" element={withSuspense(<InventoryPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['notifications.read']} />}>
            <Route path="notifications" element={withSuspense(<NotificationsPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['settings.read']} />}>
            <Route path="settings" element={withSuspense(<SettingsPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['admins.read']} />}>
            <Route path="admins" element={withSuspense(<AdminsPage />)} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={['admins.write']} />}>
            <Route path="roles" element={withSuspense(<RolesPage />)} />
          </Route>

          <Route path="*" element={withSuspense(<NotFoundPage />)} />
        </Route>
      </Route>

      <Route path="*" element={withSuspense(<NotFoundPage />)} />
    </>,
  ),
)
