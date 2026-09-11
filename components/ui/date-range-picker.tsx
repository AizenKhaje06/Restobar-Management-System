"use client"

import { useState, useEffect } from "react"
import { Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DateRangePickerProps {
  onRangeChange: (startDate: Date | null, endDate: Date | null) => void
  initialStartDate?: Date | null
  initialEndDate?: Date | null
}

export function DateRangePicker({ 
  onRangeChange, 
  initialStartDate = null, 
  initialEndDate = null 
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate)
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(initialStartDate)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(initialEndDate)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    setStartDate(initialStartDate)
    setEndDate(initialEndDate)
    setTempStartDate(initialStartDate)
    setTempEndDate(initialEndDate)
  }, [initialStartDate, initialEndDate])

  const handleDateClick = (date: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(date)
      setTempEndDate(null)
    } else {
      // Complete the range
      if (date >= tempStartDate) {
        setTempEndDate(date)
      } else {
        // Swap if end date is before start date
        setTempEndDate(tempStartDate)
        setTempStartDate(date)
      }
    }
  }

  const handleApply = () => {
    setStartDate(tempStartDate)
    setEndDate(tempEndDate)
    onRangeChange(tempStartDate, tempEndDate)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempStartDate(null)
    setTempEndDate(null)
    setStartDate(null)
    setEndDate(null)
    onRangeChange(null, null)
    setIsOpen(false)
  }

  const handleCancel = () => {
    // Reset temp dates to current selection
    setTempStartDate(startDate)
    setTempEndDate(endDate)
    setIsOpen(false)
  }

  const formatDateRange = () => {
    if (!startDate) return "Select date range"
    if (!endDate) return formatDate(startDate)
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Calendar className="size-4" />
        <span className="text-sm">{formatDateRange()}</span>
        {startDate && (
          <X 
            className="ml-1 size-3 hover:text-destructive" 
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
          />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Select Date Range</DialogTitle>
            <DialogDescription>
              Click on a start date, then click on an end date to select your range
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Selected range display */}
            {tempStartDate && (
              <div className="mb-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-3 text-center">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {tempEndDate ? (
                    <>
                      <span className="font-semibold">{formatDate(tempStartDate)}</span>
                      {" → "}
                      <span className="font-semibold">{formatDate(tempEndDate)}</span>
                    </>
                  ) : (
                    <>
                      Start: <span className="font-semibold">{formatDate(tempStartDate)}</span>
                      {" • "}
                      <span className="text-blue-600 dark:text-blue-400">Click end date</span>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Two-month calendar view */}
            <div className="grid gap-6 sm:grid-cols-2">
              <CalendarMonth
                month={currentMonth}
                startDate={tempStartDate}
                endDate={tempEndDate}
                onDateClick={handleDateClick}
                onPrevMonth={() => {
                  const prev = new Date(currentMonth)
                  prev.setMonth(prev.getMonth() - 1)
                  setCurrentMonth(prev)
                }}
              />
              <CalendarMonth
                month={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)}
                startDate={tempStartDate}
                endDate={tempEndDate}
                onDateClick={handleDateClick}
                onNextMonth={() => {
                  const next = new Date(currentMonth)
                  next.setMonth(next.getMonth() + 1)
                  setCurrentMonth(next)
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={!tempStartDate && !tempEndDate}
            >
              Clear
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleApply}
                disabled={!tempStartDate}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Apply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface CalendarMonthProps {
  month: Date
  startDate: Date | null
  endDate: Date | null
  onDateClick: (date: Date) => void
  onPrevMonth?: () => void
  onNextMonth?: () => void
}

function CalendarMonth({ 
  month, 
  startDate, 
  endDate, 
  onDateClick, 
  onPrevMonth, 
  onNextMonth 
}: CalendarMonthProps) {
  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  
  // Get days in month
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  // Generate calendar grid
  const days: (Date | null)[] = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(month.getFullYear(), month.getMonth(), i))
  }

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    return date >= startDate && date <= endDate
  }

  const isStartDate = (date: Date) => {
    if (!startDate) return false
    return date.toDateString() === startDate.toDateString()
  }

  const isEndDate = (date: Date) => {
    if (!endDate) return false
    return date.toDateString() === endDate.toDateString()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-3">
      {/* Month header */}
      <div className="flex items-center justify-between">
        {onPrevMonth && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onPrevMonth}
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        )}
        <h3 className="flex-1 text-center text-sm font-semibold">{monthName}</h3>
        {onNextMonth && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onNextMonth}
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
        {!onPrevMonth && !onNextMonth && <div className="w-8" />}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-8" />
          }

          const inRange = isInRange(date)
          const isStart = isStartDate(date)
          const isEnd = isEndDate(date)
          const today = isToday(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={`
                h-8 rounded-md text-sm font-medium transition-colors
                ${inRange || isStart || isEnd
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : today
                  ? "border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  : "hover:bg-muted"
                }
                ${isStart || isEnd ? "ring-2 ring-blue-600 ring-offset-2" : ""}
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
