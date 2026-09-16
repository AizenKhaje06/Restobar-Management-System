"use client"

import React, { useMemo, useState } from "react"
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Download,
  Filter,
  History,
  Package,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDateTime, relativeTime } from "@/lib/constants"
import type { ActivityLog } from "@/lib/types"

const ENTITY_ICONS: Record<string, LucideIcon> = {
  order: ShoppingCart,
  menu_item: UtensilsCrossed,
  category: UtensilsCrossed,
  table: Database,
  reservation: Activity,
  profile: Users,
  receipt: Receipt,
  payment: Receipt,
  qr: Settings,
}

// Convert technical action names to readable labels
function formatActionLabel(action: string): string {
  // Remove dots and underscores, capitalize each word
  return action
    .split(/[._]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Convert technical entity names to readable labels
function formatEntityLabel(entity: string): string {
  // Replace underscores with spaces, capitalize words
  return entity
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function actionTone(action: string) {
  if (action.includes("deleted") || action.includes("cancelled")) return "destructive" as const
  if (action.includes("created")) return "default" as const
  if (action.includes("generated") || action.includes("logged")) return "secondary" as const
  return "outline" as const
}

export function ActivityManager({ logs }: { logs: ActivityLog[] }) {
  const [search, setSearch] = useState("")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [actorFilter, setActorFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tempDateFrom, setTempDateFrom] = useState<string>("")
  const [tempDateTo, setTempDateTo] = useState<string>("")

  const entities = useMemo(() => {
    const s = new Set<string>()
    for (const l of logs) if (l.entity) s.add(l.entity)
    return Array.from(s).sort()
  }, [logs])

  const actions = useMemo(() => {
    const s = new Set<string>()
    for (const l of logs) s.add(l.action)
    return Array.from(s).sort()
  }, [logs])

  const actors = useMemo(() => {
    const m = new Map<string, string>()
    for (const l of logs) {
      if (l.actor_id) m.set(l.actor_id, l.actor_name ?? "Unknown")
    }
    return Array.from(m.entries())
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (entityFilter !== "all" && l.entity !== entityFilter) return false
      if (actionFilter !== "all" && l.action !== actionFilter) return false
      if (actorFilter !== "all" && l.actor_id !== actorFilter) return false
      
      // Date filtering - convert to YYYY-MM-DD format for comparison
      const logDate = new Date(l.created_at).toISOString().split("T")[0]
      if (dateFrom && logDate < dateFrom) return false
      if (dateTo && logDate > dateTo) return false
      
      // Search filter
      if (!search) return true
      const q = search.toLowerCase()
      const detailStr = typeof l.detail === "object" ? JSON.stringify(l.detail) : String(l.detail || "")
      return (
        l.action.toLowerCase().includes(q) ||
        (l.actor_name ?? "").toLowerCase().includes(q) ||
        detailStr.toLowerCase().includes(q)
      )
    })
  }, [logs, search, entityFilter, actionFilter, actorFilter, dateFrom, dateTo])

  const grouped = useMemo(() => {
    const m = new Map<string, ActivityLog[]>()
    for (const log of filtered) {
      const day = new Date(log.created_at).toISOString().split("T")[0]
      if (!m.has(day)) m.set(day, [])
      m.get(day)!.push(log)
    }
    return Array.from(m.entries()).sort(([a], [b]) => (a < b ? 1 : -1))
  }, [filtered])

  const onExport = () => {
    const data = JSON.stringify(filtered, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDateRangeLabel = () => {
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const toDate = new Date(dateTo).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return `${fromDate} - ${toDate}`
    }
    if (dateFrom) {
      return `From ${new Date(dateFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    }
    if (dateTo) {
      return `To ${new Date(dateTo).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    }
    return "Date Range"
  }

  const clearDateRange = () => {
    setDateFrom("")
    setDateTo("")
    setTempDateFrom("")
    setTempDateTo("")
    setShowDatePicker(false)
  }

  const applyDateRange = () => {
    setDateFrom(tempDateFrom)
    setDateTo(tempDateTo)
    setShowDatePicker(false)
  }

  const openDatePicker = () => {
    setTempDateFrom(dateFrom)
    setTempDateTo(dateTo)
    setCurrentMonth(new Date())
    setShowDatePicker(true)
  }

  // Quick date range presets
  const applyQuickRange = (range: "today" | "yesterday" | "this_week" | "last_week" | "this_month") => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const day = today.getDate()
    
    let from = ""
    let to = ""
    
    switch (range) {
      case "today":
        from = to = formatDateToString(today)
        break
      case "yesterday":
        const yesterday = new Date(year, month, day - 1)
        from = to = formatDateToString(yesterday)
        break
      case "this_week":
        const weekStart = new Date(today)
        weekStart.setDate(day - today.getDay()) // Sunday
        from = formatDateToString(weekStart)
        to = formatDateToString(today)
        break
      case "last_week":
        const lastWeekEnd = new Date(today)
        lastWeekEnd.setDate(day - today.getDay() - 1) // Last Saturday
        const lastWeekStart = new Date(lastWeekEnd)
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6) // Previous Sunday
        from = formatDateToString(lastWeekStart)
        to = formatDateToString(lastWeekEnd)
        break
      case "this_month":
        from = formatDateToString(new Date(year, month, 1))
        to = formatDateToString(today)
        break
    }
    
    setTempDateFrom(from)
    setTempDateTo(to)
  }

  // Generate calendar days for a month
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: (Date | null)[] = []
    
    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }
    
    // Add actual days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleDateClick = (dateStr: string) => {
    if (!tempDateFrom || (tempDateFrom && tempDateTo)) {
      // Start new selection
      setTempDateFrom(dateStr)
      setTempDateTo("")
    } else {
      // Complete selection
      if (dateStr < tempDateFrom) {
        setTempDateTo(tempDateFrom)
        setTempDateFrom(dateStr)
      } else {
        setTempDateTo(dateStr)
      }
    }
  }

  const isDateInRange = (dateStr: string): boolean => {
    if (!tempDateFrom) return false
    if (!tempDateTo && !hoverDate) return dateStr === tempDateFrom
    
    const endDate = tempDateTo || hoverDate || tempDateFrom
    const from = tempDateFrom < endDate ? tempDateFrom : endDate
    const to = tempDateFrom < endDate ? endDate : tempDateFrom
    
    return dateStr >= from && dateStr <= to
  }

  const isDateRangeEnd = (dateStr: string): boolean => {
    return dateStr === tempDateFrom || dateStr === tempDateTo
  }

  const getNextMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const CalendarMonth = ({ date }: { date: Date }) => {
    const days = getCalendarDays(date)
    const monthName = date.toLocaleString("default", { month: "long", year: "numeric" })
    
    return (
      <div className="flex-1">
        <div className="mb-3 text-center font-semibold">{monthName}</div>
        <div className="grid grid-cols-7 gap-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="p-2" />
            }
            const dateStr = formatDateToString(day)
            const inRange = isDateInRange(dateStr)
            const isEnd = isDateRangeEnd(dateStr)
            const isToday = dateStr === formatDateToString(new Date())
            
            return (
              <button
                key={dateStr}
                onClick={() => handleDateClick(dateStr)}
                onMouseEnter={() => setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate(null)}
                className={`
                  p-2 text-sm rounded-md transition-colors
                  ${inRange ? "bg-primary/20" : "hover:bg-muted"}
                  ${isEnd ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                  ${isToday && !isEnd ? "border border-primary" : ""}
                `}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description={`${filtered.length} of ${logs.length} events tracked`}
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Activity" }]}
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={openDatePicker}
              className={`min-w-[170px] font-medium ${dateFrom || dateTo ? "border-primary bg-primary/5" : ""}`}
            >
              <Calendar className="mr-2 size-4" />
              {getDateRangeLabel()}
            </Button>
            <Button 
              variant="outline" 
              onClick={onExport} 
              disabled={filtered.length === 0}
              className="min-w-[170px] font-medium"
            >
              <Download className="mr-2 size-4" />
              Export JSON
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="border shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activities, staff, or details..."
              className="h-10 pl-10 text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={entityFilter} onValueChange={(v) => v && setEntityFilter(v)}>
            <SelectTrigger className="h-10 w-44 font-medium">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e} value={e}>
                  {formatEntityLabel(e)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(v) => v && setActionFilter(v)}>
            <SelectTrigger className="h-10 w-48 font-medium">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a}>
                  {formatActionLabel(a)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actorFilter} onValueChange={(v) => v && setActorFilter(v)}>
            <SelectTrigger className="h-10 w-44 font-medium">
              <SelectValue placeholder="All Staff">
                {actorFilter === "all" 
                  ? "All Staff" 
                  : actors.find(([id]) => id === actorFilter)?.[1] || "Select Staff"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {actors.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || entityFilter !== "all" || actionFilter !== "all" || actorFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setEntityFilter("all")
                setActionFilter("all")
                setActorFilter("all")
              }}
              className="font-medium"
            >
              <X className="mr-2 size-4" />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <Card className="border shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <History className="size-7 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold">No Activity Found</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {search || entityFilter !== "all" || actionFilter !== "all" || actorFilter !== "all" 
                ? "Try adjusting your filters to see more results" 
                : "Activity logs will appear here as your team works"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, items]) => {
            const label = new Date(day).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })
            const isToday = new Date().toISOString().split("T")[0] === day
            const isYesterday =
              new Date(Date.now() - 86_400_000).toISOString().split("T")[0] === day
            return (
              <section key={day}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="size-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {isToday ? "Today" : isYesterday ? "Yesterday" : label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{items.length} activities</p>
                  </div>
                </div>
                <Card className="border shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {items.map((log) => {
                        const Icon: LucideIcon = (log.entity ? ENTITY_ICONS[log.entity] : undefined) ?? Activity
                        const isOpen = expanded === log.id
                        return (
                          <li key={log.id} className="transition-colors hover:bg-muted/50">
                            <button
                              onClick={() => setExpanded(isOpen ? null : log.id)}
                              className="flex w-full items-start gap-4 p-4 text-left"
                            >
                              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                                <Icon className="size-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="text-sm font-bold">
                                    {log.actor_name ?? "System"}
                                  </span>
                                  <Badge variant={actionTone(log.action)} className="text-xs font-semibold px-2.5 py-0.5">
                                    {formatActionLabel(log.action)}
                                  </Badge>
                                  {log.entity && (
                                    <span className="text-xs text-muted-foreground font-medium">
                                      on {formatEntityLabel(log.entity)}
                                    </span>
                                  )}
                                </div>
                                {/* Quick preview of key details */}
                                {log.detail && renderQuickSummary(log)}
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                                  <span className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {formatDateTime(log.created_at)}
                                  </span>
                                  <span>•</span>
                                  <span>{relativeTime(log.created_at)}</span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {isOpen ? (
                                  <ChevronDown className="size-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="size-4 text-muted-foreground" />
                                )}
                              </div>
                            </button>
                            {isOpen && log.detail && (
                              <div className="mx-4 mb-4 rounded-lg border bg-muted/30 p-3 text-sm">
                                {formatDetail(log.entity ?? "", log.action ?? "", log.detail)}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            )
          })}
        </div>
      )}

      {/* Date Range Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Select Date Range
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <div className="text-sm font-medium">
                {tempDateFrom && tempDateTo && (
                  <span className="text-primary">
                    {new Date(tempDateFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - {new Date(tempDateTo).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
                {tempDateFrom && !tempDateTo && (
                  <span className="text-muted-foreground">
                    Select end date
                  </span>
                )}
                {!tempDateFrom && (
                  <span className="text-muted-foreground">
                    Select start date
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Two month calendars side by side */}
            <div className="flex gap-4">
              <CalendarMonth date={currentMonth} />
              <CalendarMonth date={getNextMonth(currentMonth)} />
            </div>

            {/* Quick Range Buttons */}
            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">Quick Select</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickRange("today")}
                  className="font-medium"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickRange("yesterday")}
                  className="font-medium"
                >
                  Yesterday
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickRange("this_week")}
                  className="font-medium"
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickRange("last_week")}
                  className="font-medium"
                >
                  Last Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickRange("this_month")}
                  className="font-medium"
                >
                  This Month
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={clearDateRange}
              disabled={!tempDateFrom && !tempDateTo}
            >
              Clear
            </Button>
            <Button onClick={applyDateRange} disabled={!tempDateFrom || !tempDateTo}>
              Apply Date Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function renderQuickSummary(log: ActivityLog): React.ReactNode {
  const detail = log.detail as Record<string, any> | null
  if (!detail) return null

  const parts: string[] = []

  // Always show table first if available
  if (detail.table_label) parts.push(`Table: ${detail.table_label}`)
  if (detail.customer_name) parts.push(`Customer: ${detail.customer_name}`)
  if (detail.order_number) parts.push(`Order #${detail.order_number}`)
  if (detail.name && log.entity === "menu_item") parts.push(`${detail.name}`)
  if (detail.label && log.entity === "table") parts.push(`${detail.label}`)
  if (detail.guests) parts.push(`${detail.guests} guests`)
  
  if (parts.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {parts.map((part, idx) => (
        <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {part}
        </span>
      ))}
    </div>
  )
}

function formatDetail(entity: string, action: string, detail: unknown): React.ReactNode {
  if (typeof detail !== "object" || detail === null) {
    return <span className="text-muted-foreground">{String(detail ?? "")}</span>
  }

  const data = detail as Record<string, unknown>

  // Build human-readable summary based on entity + action
  const parts: string[] = []

  // Entity-specific readable labels
  if (entity === "table_session") {
    if (data.customer_name) parts.push(`Customer: **${data.customer_name}**`)
    if (data.table_label) parts.push(`Table: **${data.table_label}**`)
    if (data.guests) parts.push(`Guests: ${data.guests}`)
    if (data.status) parts.push(`Status: ${data.status}`)
  } else if (entity === "table") {
    if (data.label) parts.push(`Table: **${data.label}**`)
    if (data.capacity) parts.push(`Capacity: ${data.capacity} people`)
    if (data.status) parts.push(`Status: ${data.status}`)
  } else if (entity === "menu_item") {
    if (data.name) parts.push(`Item: **${data.name}**`)
    if (data.price !== undefined) parts.push(`Price: ₱${Number(data.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`)
    if (data.category) parts.push(`Category: ${data.category}`)
  } else if (entity === "category") {
    if (data.name) parts.push(`Category: **${data.name}**`)
    if (data.type) parts.push(`Type: ${data.type}`)
  } else if (entity === "order") {
    if (data.order_number) parts.push(`Order: **#${data.order_number}**`)
    if (data.customer_name) parts.push(`Customer: **${data.customer_name}**`)
    if (data.table_label) parts.push(`Table: **${data.table_label}**`)
    if (data.total) parts.push(`Total: ₱${Number(data.total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`)
    if (data.status) parts.push(`Status: ${data.status}`)
    if (data.payment_status) parts.push(`Payment: ${data.payment_status}`)
  } else if (entity === "payment") {
    if (data.amount) parts.push(`Amount: ₱${Number(data.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`)
    if (data.method) parts.push(`Method: ${data.method}`)
    if (data.reference) parts.push(`Ref: ${data.reference}`)
  } else if (entity === "profile") {
    if (data.full_name) parts.push(`Name: **${data.full_name}**`)
    if (data.email) parts.push(`Email: ${data.email}`)
    if (data.role) parts.push(`Role: ${data.role}`)
  } else if (entity === "reservation") {
    if (data.customer_name) parts.push(`Customer: **${data.customer_name}**`)
    if (data.customer_phone) parts.push(`Phone: ${data.customer_phone}`)
    if (data.customer_email) parts.push(`Email: ${data.customer_email}`)
    if (data.table_label) parts.push(`Table: **${data.table_label}**`)
    if (data.date) parts.push(`Date: ${data.date}`)
    if (data.time) parts.push(`Time: ${data.time}`)
    if (data.guests) parts.push(`Guests: ${data.guests}`)
    if (data.status) parts.push(`Status: ${data.status}`)
  } else {
    // Generic: show key fields
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && value !== "") {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        const display = typeof value === "number" ? value.toLocaleString("en-PH") : String(value)
        parts.push(`${label}: **${display}**`)
      }
    }
  }

  if (parts.length === 0) {
    return <span className="text-muted-foreground">No additional details</span>
  }

  // Parse markdown-style **bold** to proper JSX
  return (
    <div className="space-y-1">
      {parts.map((part, i) => (
        <div key={i}>
          {part.split(/(\*\*[^*]+\*\*)/).map((segment, j) => {
            if (segment.startsWith("**") && segment.endsWith("**")) {
              return <strong key={j} className="font-medium">{segment.slice(2, -2)}</strong>
            }
            return <span key={j}>{segment}</span>
          })}
        </div>
      ))}
    </div>
  )
}
