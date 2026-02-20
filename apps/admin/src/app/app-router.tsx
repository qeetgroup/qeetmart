import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/guards/protected-route'
import { AdminsPage } from '@/pages/admins-page'
import { CustomersPage } from '@/pages/customers-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { InventoryPage } from '@/pages/inventory-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { OrdersPage } from '@/pages/orders-page'
import { ProductsPage } from '@/pages/products-page'
import { SettingsPage } from '@/pages/settings-page'
import { ForbiddenPage } from '@/pages/auth/forbidden-page'
import { LoginPage } from '@/pages/auth/login-page'

export const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="admins" element={<AdminsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </>,
  ),
)
