"use client"

import { useState } from "react"
import { Calendar, X, CalendarDays, TrendingUp, Clock } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface DateRange {
  from: Date | null
  to: Date | null
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  onClear?: () => void
  className?: string
}

// Quick presets for common date ranges
const PRESETS = [
  {
    label: "Today",
    icon: Clock,
    getValue: () => ({
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    }),
  },
  {
    label: "Yesterday",
    icon: Calendar,
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        from: new Date(yesterday.setHours(0, 0, 0, 0)),
        to: new Date(yesterday.setHours(23, 59, 59, 999)),
      }
    },
  },
  {
    label: "Last 7 Days",
    icon: CalendarDays,
    getValue: () => {
      const today = new Date()
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return {
        from: new Date(weekAgo.setHours(0, 0, 0, 0)),
        to: new Date(today.setHours(23, 59, 59, 999)),
      }
    },
  },
  {
    label: "Last 30 Days",
    icon: TrendingUp,
    getValue: () => {
      const today = new Date()
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      return {
        from: new Date(monthAgo.setHours(0, 0, 0, 0)),
        to: new Date(today.setHours(23, 59, 59, 999)),
      }
    },
  },
  {
    label: "This Month",
    icon: Calendar,
    getValue: () => {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        from: new Date(firstDay.setHours(0, 0, 0, 0)),
        to: new Date(today.setHours(23, 59, 59, 999)),
      }
    },
  },
]

function formatDate(date: Date | null): string {
  if (!date) return ""
  return date.toISOString().split("T")[0]
}

function formatDisplayDate(date: Date | null): string {
  if (!date) return ""
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function DateRangePicker({
  value,
  onChange,
  onClear,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState(formatDate(value.from))
  const [customTo, setCustomTo] = useState(formatDate(value.to))

  const handlePreset = (preset: typeof PRESETS[0]) => {
    const range = preset.getValue()
    onChange(range)
    setCustomFrom(formatDate(range.from))
    setCustomTo(formatDate(range.to))
    setOpen(false)
  }

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return
    const from = new Date(customFrom)
    from.setHours(0, 0, 0, 0)
    const to = new Date(customTo)
    to.setHours(23, 59, 59, 999)
    
    if (from > to) {
      alert("Start date must be before end date")
      return
    }
    
    onChange({ from, to })
    setOpen(false)
  }

  const handleClear = () => {
    onChange({ from: null, to: null })
    setCustomFrom("")
    setCustomTo("")
    onClear?.()
  }

  const hasValue = value.from && value.to
  const displayText = hasValue
    ? `${formatDisplayDate(value.from)} - ${formatDisplayDate(value.to)}`
    : "All Time"

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start text-left font-normal",
              !hasValue && "text-muted-foreground",
              hasValue && "border-primary/50 bg-primary/5 pr-8"
            )}
          >
            <Calendar className="mr-2 size-4 shrink-0" />
            <span className="truncate">{displayText}</span>
          </Button>
        </PopoverTrigger>
        
        {hasValue && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 hover:bg-muted transition-colors"
            aria-label="Clear date range"
          >
            <X className="size-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}

        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Filter by Date Range</h4>
              <p className="text-xs text-muted-foreground">
                Select a preset or choose custom dates
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quick Presets</Label>
              <div className="grid gap-1.5">
                {PRESETS.map((preset) => {
                  const Icon = preset.icon
                  return (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start h-8 font-normal hover:bg-primary/10 hover:text-primary"
                      onClick={() => handlePreset(preset)}
                    >
                      <Icon className="mr-2 size-3.5 shrink-0" />
                      {preset.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Custom Range */}
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Custom Range</Label>
              
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label htmlFor="date-from" className="text-xs">
                    From
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date-to" className="text-xs">
                    To
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8"
                  onClick={() => {
                    setCustomFrom("")
                    setCustomTo("")
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={handleCustomApply}
                  disabled={!customFrom || !customTo}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
