import { BellRing } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useNotificationActions, useNotifications } from '@/hooks'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { formatDate } from '@/lib/utils'

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const notifications = useNotifications(unreadOnly)
  const { markAllAsRead, markAsRead, markAsUnread } = useNotificationActions()

  if (notifications.isError) {
    return (
      <ErrorState
        title="Unable to load notifications"
        description={
          notifications.error instanceof Error
            ? notifications.error.message
            : 'Notifications request failed.'
        }
        onRetry={() => {
          void notifications.refetch()
        }}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Notifications"
        description="Review operational alerts, acknowledge issues, and keep your team aligned on store events."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              markAllAsRead.mutate(undefined, {
                onSuccess: () => toast.success('All notifications marked as read.'),
                onError: (error: Error) => toast.error(error.message),
              })
            }}
          >
            Mark all as read
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between rounded-md border border-border/70 bg-secondary/30 p-3">
            <p className="text-sm font-medium">Show unread only</p>
            <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} />
          </div>

          {notifications.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading notifications…</p>
          ) : !notifications.data || notifications.data.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="You're all caught up. New alerts will appear here."
              icon={<BellRing className="size-4" aria-hidden="true" />}
              className="min-h-40"
            />
          ) : (
            <ul className="space-y-3">
              {notifications.data.map((notification) => (
                <li
                  key={notification.id}
                  className="flex flex-col gap-3 rounded-md border border-border/70 bg-card/70 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={notification.read ? 'outline' : 'secondary'}>
                      {notification.read ? 'Read' : 'Unread'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const mutation = notification.read ? markAsUnread : markAsRead
                        mutation.mutate(notification.id, {
                          onSuccess: () =>
                            toast.success(
                              notification.read
                                ? 'Notification marked as unread.'
                                : 'Notification marked as read.',
                            ),
                          onError: (error: Error) => toast.error(error.message),
                        })
                      }}
                    >
                      {notification.read ? 'Mark unread' : 'Mark read'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
