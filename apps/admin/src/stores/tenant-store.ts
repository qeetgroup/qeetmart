import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface TenantState {
  tenantId: string
  setTenantId: (tenantId: string) => void
}

const defaultTenantId = 'tenant_west_coast'

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantId: defaultTenantId,
      setTenantId: (tenantId) => set({ tenantId }),
    }),
    {
      name: 'qeetmart-admin-tenant',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
