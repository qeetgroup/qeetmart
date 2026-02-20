import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface DateFilterProps {
  label: string
  value: string
  onChange: (value: string) => void
  id: string
}

export function DateFilter({ label, value, onChange, id }: DateFilterProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-background"
      />
    </div>
  )
}
