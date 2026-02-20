import { modulePermissionMap } from './mock-data'
import { mockDb, withLatency } from './mock-db'
import type { AdminAccount, Permission, UserRole } from './types'

export const allPermissionOptions: Permission[] = [
  ...new Set(
    Object.values(modulePermissionMap)
      .flatMap((item) => [item.read, item.write])
      .filter(Boolean),
  ),
  'orders.refund',
] as Permission[]

export function resolveRoleOptions() {
  return mockDb.roles.map((role) => role.id)
}

export const adminsService = {
  async getAdmins(search = '') {
    return withLatency(() => {
      const query = search.toLowerCase().trim()

      return mockDb.admins.filter((admin) =>
        query
          ? admin.name.toLowerCase().includes(query) ||
            admin.email.toLowerCase().includes(query) ||
            admin.role.toLowerCase().includes(query)
          : true,
      )
    }, 350)
  },

  async updateRole(adminId: string, role: UserRole) {
    return withLatency(() => {
      const admin = mockDb.admins.find((entry) => entry.id === adminId)
      if (!admin) {
        throw new Error('Admin account not found')
      }

      const roleDefinition = mockDb.roles.find((entry) => entry.id === role)
      if (!roleDefinition) {
        throw new Error('Role definition not found')
      }

      admin.role = role
      admin.permissions = [...roleDefinition.permissions]

      const sessionUser = mockDb.users.find((user) => user.email === admin.email)
      if (sessionUser) {
        sessionUser.role = role
        sessionUser.permissions = [...roleDefinition.permissions]
      }

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

      const sessionUser = mockDb.users.find((user) => user.email === admin.email)
      if (sessionUser) {
        sessionUser.permissions = permissions
      }

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
