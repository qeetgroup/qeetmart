import type { LucideIcon } from 'lucide-react'
import {
  Boxes,
  ChartSpline,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { UserRole } from '@/services'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
  allowedRoles?: UserRole[]
}

export const navItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Orders', href: '/orders', icon: ClipboardList },
  { label: 'Products', href: '/products', icon: Boxes, allowedRoles: ['super_admin', 'ops_admin'] },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Inventory', href: '/inventory', icon: ChartSpline, allowedRoles: ['super_admin', 'ops_admin'] },
  { label: 'Admin Users', href: '/admins', icon: ShieldCheck, allowedRoles: ['super_admin'] },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export const routeTitles: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/orders': 'Order Management',
  '/products': 'Product Management',
  '/customers': 'Customer Management',
  '/inventory': 'Inventory Overview',
  '/admins': 'Role & User Administration',
  '/settings': 'Settings',
}
