import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Boxes,
  BrainCircuit,
  ChartSpline,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { Permission, UserRole } from '@/services'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
  allowedRoles?: UserRole[]
  requiredPermission?: Permission
}

export const navItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, requiredPermission: 'dashboard.read' },
  { label: 'Analytics', href: '/analytics', icon: LineChart, requiredPermission: 'analytics.read' },
  { label: 'Insights', href: '/insights', icon: BrainCircuit, requiredPermission: 'insights.read' },
  { label: 'Orders', href: '/orders', icon: ClipboardList, requiredPermission: 'orders.read' },
  { label: 'Products', href: '/products', icon: Boxes, requiredPermission: 'products.read' },
  { label: 'Customers', href: '/customers', icon: Users, requiredPermission: 'customers.read' },
  { label: 'Inventory', href: '/inventory', icon: ChartSpline, requiredPermission: 'inventory.read' },
  { label: 'Notifications', href: '/notifications', icon: Bell, requiredPermission: 'notifications.read' },
  { label: 'Admin Users', href: '/admins', icon: ShieldCheck, requiredPermission: 'admins.read' },
  { label: 'Roles', href: '/roles', icon: ShieldCheck, requiredPermission: 'admins.write' },
  { label: 'Settings', href: '/settings', icon: Settings, requiredPermission: 'settings.read' },
]

export const routeTitles: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/analytics': 'Real-Time Analytics',
  '/insights': 'AI-Assisted Insights',
  '/orders': 'Order Management',
  '/products': 'Product Management',
  '/customers': 'Customer Management',
  '/inventory': 'Inventory Overview',
  '/notifications': 'Notifications Center',
  '/admins': 'Admin Users',
  '/roles': 'Role Management',
  '/settings': 'Settings',
}
