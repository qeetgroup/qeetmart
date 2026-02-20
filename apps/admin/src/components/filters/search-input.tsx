import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
  value?: string
  delay?: number
  placeholder?: string
  onDebouncedChange: (value: string) => void
}

export function SearchInput({
  value = '',
  delay = 350,
  placeholder = 'Search',
  onDebouncedChange,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      onDebouncedChange(internalValue)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, internalValue, onDebouncedChange])

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}
