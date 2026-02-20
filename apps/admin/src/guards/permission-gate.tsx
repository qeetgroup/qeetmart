import type { PropsWithChildren, ReactNode } from 'react'
import type { Permission } from '@/services'
import { hasPermission, useAuthStore } from '@/stores/auth-store'

interface PermissionGateProps extends PropsWithChildren {
  permission: Permission
  fallback?: ReactNode
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const user = useAuthStore((state) => state.user)

  if (!hasPermission(user, permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
