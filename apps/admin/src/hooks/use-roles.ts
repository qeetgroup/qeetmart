import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rolesService } from '@/services'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.getRoles,
  })
}

export function useRoleActions() {
  const queryClient = useQueryClient()

  const invalidateRoles = () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    queryClient.invalidateQueries({ queryKey: ['admins'] })
  }

  const createRole = useMutation({
    mutationFn: rolesService.createRole,
    onSuccess: invalidateRoles,
  })

  const updateRole = useMutation({
    mutationFn: rolesService.updateRole,
    onSuccess: invalidateRoles,
  })

  const deleteRole = useMutation({
    mutationFn: rolesService.deleteRole,
    onSuccess: invalidateRoles,
  })

  return {
    createRole,
    updateRole,
    deleteRole,
  }
}
