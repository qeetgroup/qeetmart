import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardOverview } from '@/services'
import { formatCurrency } from '@/lib/utils'

interface SalesTrendChartProps {
  data: DashboardOverview['salesTrend']
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.08} />
          </linearGradient>
        </defs>
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
          width={54}
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 1, strokeDasharray: '4 4' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.6rem',
            fontSize: '0.75rem',
          }}
          formatter={(value) => formatCurrency(Number(value ?? 0))}
        />
        <Area type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" fill="url(#salesGradient)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
