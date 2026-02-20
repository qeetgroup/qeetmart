import { mockDb, withLatency } from './mock-db'
import type { AdminNotification, NotificationType } from './types'

interface GetNotificationsOptions {
  tenantId?: string
  unreadOnly?: boolean
}

interface CreateNotificationPayload {
  tenantId: string
  title: string
  message: string
  type: NotificationType
  actionUrl?: string
}

function sortNotifications(items: AdminNotification[]) {
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export const notificationsService = {
  async getNotifications(options: GetNotificationsOptions = {}): Promise<AdminNotification[]> {
    return withLatency(() => {
      const resolvedTenantId = options.tenantId ?? mockDb.tenants[0]?.id

      return sortNotifications(
        mockDb.notifications.filter((entry) =>
          (resolvedTenantId ? entry.tenantId === resolvedTenantId : true) &&
          (options.unreadOnly ? !entry.read : true),
        ),
      )
    }, 240)
  },

  async markAsRead(notificationId: string) {
    return withLatency(() => {
      const notification = mockDb.notifications.find((entry) => entry.id === notificationId)
      if (!notification) {
        throw new Error('Notification not found')
      }
      notification.read = true
      return notification
    }, 220)
  },

  async markAsUnread(notificationId: string) {
    return withLatency(() => {
      const notification = mockDb.notifications.find((entry) => entry.id === notificationId)
      if (!notification) {
        throw new Error('Notification not found')
      }
      notification.read = false
      return notification
    }, 220)
  },

  async markAllAsRead(tenantId?: string) {
    return withLatency(() => {
      const resolvedTenantId = tenantId ?? mockDb.tenants[0]?.id
      for (const notification of mockDb.notifications) {
        if (!resolvedTenantId || notification.tenantId === resolvedTenantId) {
          notification.read = true
        }
      }
      return true
    }, 280)
  },

  async createNotification(payload: CreateNotificationPayload) {
    return withLatency(() => {
      const notification: AdminNotification = {
        id: `n-${mockDb.notifications.length + 1}`,
        tenantId: payload.tenantId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: payload.actionUrl,
      }

      mockDb.notifications.unshift(notification)
      return notification
    }, 200)
  },
}
