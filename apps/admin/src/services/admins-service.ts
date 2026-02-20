import { rolePermissions } from './mock-data'
import { mockDb, withLatency } from './mock-db'
import type { AdminAccount, Permission, UserRole } from './types'

export const roleOptions: UserRole[] = ['super_admin', 'ops_admin', 'support_admin']

export const allPermissionOptions: Permission[] = [
  'orders.read',
  'orders.write',
  'orders.refund',
  'products.read',
  'products.write',
  'customers.read',
  'inventory.read',
  'admins.read',
  'admins.write',
]

export const adminsService = {
  async getAdmins() {
    return withLatency(() => mockDb.admins, 350)
  },

  async updateRole(adminId: string, role: UserRole) {
    return withLatency(() => {
      const admin = mockDb.admins.find((entry) => entry.id === adminId)
      if (!admin) {
        throw new Error('Admin account not found')
      }
      admin.role = role
      admin.permissions = [...rolePermissions(role)]
      return admin
    }, 400)
  },

  async updatePermissions(adminId: string, permissions: Permission[]) {
    return withLatency(() => {
      const admin = mockDb.admins.find((entry) => entry.id === adminId)
      if (!admin) {
        throw new Error('Admin account not found')
      }

      admin.permissions = permissions
      return admin
    }, 450)
  },

  async updateStatus(adminId: string, status: AdminAccount['status']) {
    return withLatency(() => {
      const admin = mockDb.admins.find((entry) => entry.id === adminId)
      if (!admin) {
        throw new Error('Admin account not found')
      }

      admin.status = status
      return admin
    }, 350)
  },
}
