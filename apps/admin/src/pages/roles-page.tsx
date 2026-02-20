import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useRoleActions, useRoles } from '@/hooks'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { defaultModuleAccess } from '@/services'
import type { ModuleAccess, ModuleScope, RoleDefinition } from '@/services'

interface RoleEditorState {
  name: string
  description: string
  moduleAccess: ModuleAccess[]
}

function createInitialState(): RoleEditorState {
  return {
    name: '',
    description: '',
    moduleAccess: defaultModuleAccess(),
  }
}

function moduleLabel(module: ModuleScope) {
  return module
    .split('_')
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(' ')
}

function applyAccessRule(moduleAccess: ModuleAccess[], module: ModuleScope, key: 'read' | 'write', value: boolean) {
  return moduleAccess.map((entry) => {
    if (entry.module !== module) {
      return entry
    }

    if (key === 'read') {
      return {
        ...entry,
        read: value,
        write: value ? entry.write : false,
      }
    }

    return {
      ...entry,
      read: value ? true : entry.read,
      write: value,
    }
  })
}

function mapRoleToEditor(role: RoleDefinition): RoleEditorState {
  return {
    name: role.name,
    description: role.description,
    moduleAccess: role.moduleAccess,
  }
}

export function RolesPage() {
  const roles = useRoles()
  const actions = useRoleActions()
  const [editingRoleId, setEditingRoleId] = useState<RoleDefinition['id'] | null>(null)
  const [formState, setFormState] = useState<RoleEditorState>(createInitialState)

  const editingRole = useMemo(
    () => roles.data?.find((role) => role.id === editingRoleId) ?? null,
    [editingRoleId, roles.data],
  )

  function resetForm() {
    setEditingRoleId(null)
    setFormState(createInitialState())
  }

  function handleSubmit() {
    if (!formState.name.trim()) {
      toast.error('Role name is required.')
      return
    }

    if (editingRole) {
      actions.updateRole.mutate(
        {
          roleId: editingRole.id,
          name: formState.name,
          description: formState.description,
          moduleAccess: formState.moduleAccess,
        },
        {
          onSuccess: () => {
            toast.success('Role updated.')
            resetForm()
          },
          onError: (error: Error) => toast.error(error.message),
        },
      )
      return
    }

    actions.createRole.mutate(
      {
        name: formState.name,
        description: formState.description,
        moduleAccess: formState.moduleAccess,
      },
      {
        onSuccess: () => {
          toast.success('Role created.')
          resetForm()
        },
        onError: (error: Error) => toast.error(error.message),
      },
    )
  }

  if (roles.isError) {
    return (
      <ErrorState
        title="Unable to load role definitions"
        description={roles.error instanceof Error ? roles.error.message : 'Roles request failed.'}
        onRetry={() => {
          void roles.refetch()
        }}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Role Management"
        description="Define custom roles with module-level read/write access and assign them to admin users."
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Role Definitions</CardTitle>
            <CardDescription>System and custom roles with permission scopes.</CardDescription>
          </CardHeader>
          <CardContent>
            {roles.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading roles…</p>
            ) : !roles.data || roles.data.length === 0 ? (
              <EmptyState
                title="No roles available"
                description="Create a role to start assigning module permissions."
                className="min-h-40"
              />
            ) : (
              <ul className="space-y-3">
                {roles.data.map((role) => (
                  <li key={role.id} className="rounded-md border border-border/70 p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={role.isSystem ? 'outline' : 'secondary'}>
                          {role.isSystem ? 'System' : 'Custom'}
                        </Badge>
                        {!role.isSystem && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingRoleId(role.id)
                              setFormState(mapRoleToEditor(role))
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {!role.isSystem && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              actions.deleteRole.mutate(role.id, {
                                onSuccess: () => {
                                  toast.success('Role deleted.')
                                  if (editingRoleId === role.id) {
                                    resetForm()
                                  }
                                },
                                onError: (error: Error) => toast.error(error.message),
                              })
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="font-mono text-[10px]">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{editingRole ? 'Edit Role' : 'Create Role'}</CardTitle>
            <CardDescription>
              Configure module read/write permissions. Write access implies read access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                value={formState.name}
                onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                placeholder="Fulfillment manager"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={formState.description}
                onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                placeholder="Manages packing and order dispatch operations"
              />
            </div>

            <div className="space-y-2">
              {formState.moduleAccess.map((entry) => (
                <div key={entry.module} className="rounded-md border border-border/70 p-3">
                  <p className="mb-2 text-sm font-medium">{moduleLabel(entry.module)}</p>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>Read</span>
                    <Switch
                      checked={entry.read}
                      onCheckedChange={(checked) =>
                        setFormState((current) => ({
                          ...current,
                          moduleAccess: applyAccessRule(current.moduleAccess, entry.module, 'read', checked),
                        }))
                      }
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>Write</span>
                    <Switch
                      checked={entry.write}
                      onCheckedChange={(checked) =>
                        setFormState((current) => ({
                          ...current,
                          moduleAccess: applyAccessRule(current.moduleAccess, entry.module, 'write', checked),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                disabled={actions.createRole.isPending || actions.updateRole.isPending}
              >
                {editingRole ? 'Save role' : 'Create role'}
              </Button>
              {editingRole ? (
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
