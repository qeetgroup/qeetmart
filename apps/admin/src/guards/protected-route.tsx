import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Permission, UserRole } from '@/services'
import { hasPermission, useAuthStore } from '@/stores/auth-store'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  requiredPermissions?: Permission[]
  requireAllPermissions?: boolean
}

export function ProtectedRoute({
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = true,
}: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const checks = requiredPermissions.map((permission) => hasPermission(user, permission))
    const allowed = requireAllPermissions ? checks.every(Boolean) : checks.some(Boolean)
    if (!allowed) {
      return <Navigate to="/forbidden" replace />
    }
  }

  return <Outlet />
}
