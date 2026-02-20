import { createRoleFromPayload, moduleAccessToPermissions, moduleScopes } from './mock-data'
import { mockDb, withLatency } from './mock-db'
import type { CreateRolePayload, ModuleAccess, RoleDefinition, UpdateRolePayload, UserRole } from './types'

export function defaultModuleAccess(): ModuleAccess[] {
  return moduleScopes.map((module) => ({
    module,
    read: false,
    write: false,
  }))
}

function ensureUniqueRoleId(candidate: UserRole): UserRole {
  if (!mockDb.roles.some((role) => role.id === candidate)) {
    return candidate
  }

  let suffix = 2
  while (mockDb.roles.some((role) => role.id === `${candidate}_${suffix}`)) {
    suffix += 1
  }

  return `${candidate}_${suffix}` as UserRole
}

export const rolesService = {
  async getRoles(): Promise<RoleDefinition[]> {
    return withLatency(() => [...mockDb.roles].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), 320)
  },

  async createRole(payload: CreateRolePayload): Promise<RoleDefinition> {
    return withLatency(() => {
      const role = createRoleFromPayload(payload)
      role.id = ensureUniqueRoleId(role.id)

      mockDb.roles.unshift(role)
      return role
    }, 450)
  },

  async updateRole(payload: UpdateRolePayload): Promise<RoleDefinition> {
    return withLatency(() => {
      const role = mockDb.roles.find((entry) => entry.id === payload.roleId)
      if (!role) {
        throw new Error('Role not found')
      }

      if (role.isSystem) {
        throw new Error('System roles cannot be modified in this demo.')
      }

      role.name = payload.name
      role.description = payload.description
      role.moduleAccess = payload.moduleAccess
      role.permissions = moduleAccessToPermissions(payload.moduleAccess)

      for (const admin of mockDb.admins.filter((entry) => entry.role === role.id)) {
        admin.permissions = [...role.permissions]
      }

      for (const user of mockDb.users.filter((entry) => entry.role === role.id)) {
        user.permissions = [...role.permissions]
      }

      return role
    }, 450)
  },

  async deleteRole(roleId: UserRole) {
    return withLatency(() => {
      const role = mockDb.roles.find((entry) => entry.id === roleId)
      if (!role) {
        throw new Error('Role not found')
      }

      if (role.isSystem) {
        throw new Error('System roles cannot be deleted.')
      }

      const assignedAdmins = mockDb.admins.filter((entry) => entry.role === roleId)
      if (assignedAdmins.length > 0) {
        throw new Error('Reassign admins before deleting this role.')
      }

      mockDb.roles = mockDb.roles.filter((entry) => entry.id !== roleId)
      return true
    }, 380)
  },
}
