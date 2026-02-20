import { mockDb, withLatency } from './mock-db'
import type { Tenant } from './types'

export const tenantsService = {
  async getTenants(): Promise<Tenant[]> {
    return withLatency(() => [...mockDb.tenants], 160)
  },
}
