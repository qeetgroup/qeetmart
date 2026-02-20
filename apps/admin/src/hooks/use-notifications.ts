import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/services'
import { useTenantStore } from '@/stores/tenant-store'

export function useNotifications(unreadOnly = false) {
  const tenantId = useTenantStore((state) => state.tenantId)

  return useQuery({
    queryKey: ['notifications', tenantId, unreadOnly],
    queryFn: () => notificationsService.getNotifications({ tenantId, unreadOnly }),
  })
}

export function useNotificationActions() {
  const queryClient = useQueryClient()
  const tenantId = useTenantStore((state) => state.tenantId)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', tenantId] })
  }

  const markAsRead = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: invalidate,
  })

  const markAsUnread = useMutation({
    mutationFn: notificationsService.markAsUnread,
    onSuccess: invalidate,
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(tenantId),
    onSuccess: invalidate,
  })

  return {
    markAsRead,
    markAsUnread,
    markAllAsRead,
  }
}
