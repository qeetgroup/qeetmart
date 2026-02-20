import { useQuery } from '@tanstack/react-query'
import { Clock3, Mail, MapPin, Phone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { customersService } from '@/services'

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

  const customersQuery = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersService.getCustomers(search),
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
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Total spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
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
                ))}
                {!customersQuery.isLoading && customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
            {selectedCustomer ? (
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
                      <li key={item.id} className="relative rounded-md border border-border/70 pl-9 pr-3 py-2">
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
              <p className="text-sm text-muted-foreground">No customer selected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
