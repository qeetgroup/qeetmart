import { useQuery } from '@tanstack/react-query'
import { ArrowDownUp, Clock3, Mail, MapPin, Phone, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { TableSkeleton } from '@/components/feedback/table-skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { customersService } from '@/services'
import type { CustomerSort } from '@/services'

const customerSortOptions: Array<{ value: CustomerSort; label: string }> = [
  { value: 'last_order_desc', label: 'Recent orders first' },
  { value: 'last_order_asc', label: 'Oldest orders first' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'spent_desc', label: 'Highest spend first' },
  { value: 'spent_asc', label: 'Lowest spend first' },
]

const defaultCustomerSort: CustomerSort = 'last_order_desc'

function CustomerDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="rounded-lg border bg-secondary/20 p-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-8 w-28" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={`activity-skeleton-${index}`} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

  const activeSort = useMemo<CustomerSort>(() => {
    const sort = searchParams.get('sort')
    if (customerSortOptions.some((option) => option.value === sort)) {
      return sort as CustomerSort
    }
    return defaultCustomerSort
  }, [searchParams])

  function updateSort(nextSort: CustomerSort) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextSort === defaultCustomerSort) {
      nextParams.delete('sort')
    } else {
      nextParams.set('sort', nextSort)
    }
    setSearchParams(nextParams, { replace: true })
  }

  const customersQuery = useQuery({
    queryKey: ['customers', search, activeSort],
    queryFn: () => customersService.getCustomers(search, activeSort),
  })

  const customers = customersQuery.data?.items ?? []

  const selectedCustomer = useMemo(() => {
    if (!customers.length) {
      return null
    }

    if (!selectedCustomerId) {
      return customers[0]
    }

    return customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0]
  }, [customers, selectedCustomerId])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Customers"
        description="Review customer records, value segments, and activity history."
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="space-y-3">
            <div>
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>Search customers by name or email</CardDescription>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers"
              />
              <Select value={activeSort} onValueChange={(value) => updateSort(value as CustomerSort)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort customers" />
                </SelectTrigger>
                <SelectContent>
                  {customerSortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="inline-flex items-center gap-2">
                        <ArrowDownUp className="size-3.5" aria-hidden="true" />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {customersQuery.isError ? (
              <ErrorState
                title="Unable to load customers"
                description={
                  customersQuery.error instanceof Error
                    ? customersQuery.error.message
                    : 'Customers request failed.'
                }
                onRetry={() => {
                  void customersQuery.refetch()
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Total spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersQuery.isLoading ? (
                    <TableSkeleton columns={3} rows={8} />
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-4">
                        <EmptyState
                          title="No customers found"
                          description="Try adjusting your search keywords or sorting strategy."
                          icon={<Users className="size-4" aria-hidden="true" />}
                          className="min-h-36"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className={selectedCustomer?.id === customer.id ? 'bg-secondary/60' : ''}
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        <TableCell>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </TableCell>
                        <TableCell>{customer.city}</TableCell>
                        <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>
              {selectedCustomer ? `Profile and timeline for ${selectedCustomer.name}` : 'Select a customer'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customersQuery.isLoading ? (
              <CustomerDetailSkeleton />
            ) : selectedCustomer ? (
              <div className="space-y-5 text-sm">
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" /> {selectedCustomer.email}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" /> {selectedCustomer.phone}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" /> {selectedCustomer.city}
                  </p>
                </div>

                <div className="rounded-lg border bg-secondary/20 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Value</p>
                  <p className="text-xl font-semibold">{formatCurrency(selectedCustomer.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDate(selectedCustomer.joinedAt)} · Last order {formatDate(selectedCustomer.lastOrderAt)}
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold">Activity timeline</h4>
                  <ol className="space-y-3">
                    {selectedCustomer.activity.map((item) => (
                      <li key={item.id} className="relative rounded-md border border-border/70 py-2 pl-9 pr-3">
                        <Clock3 className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.type}</p>
                        <p>{item.detail}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No customer selected"
                description="Select a customer from the table to review their profile and activity timeline."
                className="min-h-36"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
