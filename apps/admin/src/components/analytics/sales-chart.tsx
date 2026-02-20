import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { SalesTrendPoint } from '@/services'

interface SalesChartProps {
  data: SalesTrendPoint[]
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={310}>
      <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 2 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => value.slice(5)}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 1, strokeDasharray: '4 4' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.6rem',
            fontSize: '0.75rem',
          }}
          formatter={(value, name) => {
            if (name === 'sales') {
              return formatCurrency(Number(value ?? 0))
            }
            return `${Number(value ?? 0)} orders`
          }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2.3}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line type="monotone" dataKey="orders" stroke="hsl(var(--chart-2))" strokeWidth={1.8} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
