import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PermissionGate } from '@/guards/permission-gate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { adminsService, allPermissionOptions, roleOptions } from '@/services'
import type { AdminAccount, Permission, UserRole } from '@/services'

export function AdminsPage() {
  const queryClient = useQueryClient()
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null)
  const [draftPermissions, setDraftPermissions] = useState<Permission[]>([])

  const adminsQuery = useQuery({
    queryKey: ['admins'],
    queryFn: adminsService.getAdmins,
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ adminId, role }: { adminId: string; role: UserRole }) => adminsService.updateRole(adminId, role),
    onSuccess: () => {
      toast.success('Role updated.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ adminId, status }: { adminId: string; status: AdminAccount['status'] }) =>
      adminsService.updateStatus(adminId, status),
    onSuccess: () => {
      toast.success('Account status updated.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ adminId, permissions }: { adminId: string; permissions: Permission[] }) =>
      adminsService.updatePermissions(adminId, permissions),
    onSuccess: () => {
      toast.success('Permissions updated.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      setSelectedAdmin(null)
    },
    onError(error: Error) {
      toast.error(error.message)
    },
  })

  const admins = adminsQuery.data ?? []

  const permissionCount = useMemo(() => draftPermissions.length, [draftPermissions])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Admin Accounts</CardTitle>
          <CardDescription>Assign roles, control statuses, and manage granular permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                  </TableCell>
                  <TableCell>
                    <PermissionGate permission="admins.write" fallback={<span className="capitalize">{admin.role.replace('_', ' ')}</span>}>
                      <Select
                        value={admin.role}
                        onValueChange={(value) =>
                          updateRoleMutation.mutate({ adminId: admin.id, role: value as UserRole })
                        }
                      >
                        <SelectTrigger className="w-[160px] capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role} className="capitalize">
                              {role.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </PermissionGate>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{admin.permissions.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.status === 'active' ? 'default' : 'destructive'}>{admin.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(admin.lastLogin)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <PermissionGate permission="admins.write" fallback={null}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setDraftPermissions(admin.permissions)
                          }}
                        >
                          Permissions
                        </Button>
                        <Button
                          size="sm"
                          variant={admin.status === 'active' ? 'destructive' : 'secondary'}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              adminId: admin.id,
                              status: admin.status === 'active' ? 'suspended' : 'active',
                            })
                          }
                        >
                          {admin.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!adminsQuery.isLoading && admins.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No admin accounts available.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedAdmin)} onOpenChange={(open) => !open && setSelectedAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> Permissions
            </DialogTitle>
            <DialogDescription>
              Adjust permissions for {selectedAdmin?.name}. Enabled: {permissionCount}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {allPermissionOptions.map((permission) => {
              const checked = draftPermissions.includes(permission)
              return (
                <div key={permission} className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor={permission} className="font-mono text-xs">
                    {permission}
                  </Label>
                  <Switch
                    id={permission}
                    checked={checked}
                    onCheckedChange={(nextChecked) => {
                      setDraftPermissions((current) => {
                        if (nextChecked) {
                          return [...new Set([...current, permission])]
                        }
                        return current.filter((item) => item !== permission)
                      })
                    }}
                  />
                </div>
              )
            })}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedAdmin(null)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedAdmin || updatePermissionsMutation.isPending}
              onClick={() => {
                if (!selectedAdmin) {
                  return
                }
                updatePermissionsMutation.mutate({
                  adminId: selectedAdmin.id,
                  permissions: draftPermissions,
                })
              }}
            >
              Save permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
