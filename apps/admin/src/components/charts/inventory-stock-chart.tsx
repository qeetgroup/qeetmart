import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { InventorySummary } from '@/services'

interface InventoryStockChartProps {
  items: InventorySummary['items']
}

export function InventoryStockChart({ items }: InventoryStockChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={items.slice(0, 10)} margin={{ left: 0, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="productName"
          angle={-18}
          textAnchor="end"
          height={72}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          interval={0}
        />
        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.6rem',
            fontSize: '0.75rem',
          }}
        />
        <Bar dataKey="stock" fill="hsl(var(--chart-4))" radius={[6, 6, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )
}
