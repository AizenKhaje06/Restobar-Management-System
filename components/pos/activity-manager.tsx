"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  Package,
  Search,
  ShoppingCart,
  User,
  Users,
  Utensils,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime, relativeTime, formatCurrency } from "@/lib/constants"
import type { ActivityLog } from "@/lib/types"

const ACTION_STYLES: Record<string, { label: string; color: string; icon: typeof ShoppingCart }> = {
  "order.created": { label: "Order Created", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: ShoppingCart },
  "order.updated": { label: "Order Updated", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: Package },
  "order.completed": { label: "Order Completed", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: ShoppingCart },
  "order.cancelled": { label: "Order Cancelled", color: "bg-rose-500/10 text-rose-700 dark:text-rose-400", icon: X },
  "payment.processed": { label: "Payment Processed", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: CreditCard },
  "payment.refunded": { label: "Payment Refunded", color: "bg-rose-500/10 text-rose-700 dark:text-rose-400", icon: DollarSign },
  "session.created": { label: "Session Started", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400", icon: Users },
  "session.cancelled": { label: "Session Cancelled", color: "bg-rose-500/10 text-rose-700 dark:text-rose-400", icon: X },
  "session.paid": { label: "Session Paid", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: CreditCard },
}

const DEFAULT_STYLE = {
  label: "Activity",
  color: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
  icon: Activity,
}

export function PosActivityManager({
  activityLogs,
  staffName,
}: {
  activityLogs: ActivityLog[]
  staffName: string
}) {
  const [search, setSearch] = useState("")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [entityFilter, setEntityFilter] = useState<string>("all")

  // Filter logs
  const filtered = useMemo(() => {
    return activityLogs.filter((log) => {
      if (entityFilter !== "all" && log.entity !== entityFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      const detail = log.detail as Record<string, any> | null
      return (
        log.action.toLowerCase().includes(q) ||
        (log.entity || "").toLowerCase().includes(q) ||
        (detail?.table_label || "").toLowerCase().includes(q) ||
        (detail?.order_number || "").toLowerCase().includes(q) ||
        (detail?.customer_name || "").toLowerCase().includes(q)
      )
    })
  }, [activityLogs, search, entityFilter])

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; logs: ActivityLog[] }[] = []
    const dateMap = new Map<string, ActivityLog[]>()

    for (const log of filtered) {
      const date = new Date(log.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (!dateMap.has(date)) {
        dateMap.set(date, [])
      }
      dateMap.get(date)!.push(log)
    }

    dateMap.forEach((logs, date) => {
      groups.push({ date, logs })
    })

    return groups
  }, [filtered])

  // Entity counts for filter
  const entityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const log of activityLogs) {
      if (log.entity) {
        counts[log.entity] = (counts[log.entity] || 0) + 1
      }
    }
    return counts
  }, [activityLogs])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderQuickSummary = (log: ActivityLog) => {
    const detail = log.detail as Record<string, any> | null
    if (!detail) return null

    const parts: string[] = []

    // Table number first (highest priority)
    if (detail.table_label) {
      parts.push(`Table ${detail.table_label}`)
    }

    // Order number
    if (detail.order_number) {
      parts.push(`Order #${detail.order_number}`)
    }

    // Customer name
    if (detail.customer_name) {
      parts.push(detail.customer_name)
    }

    // Amount for payments
    if (detail.amount) {
      parts.push(formatCurrency(detail.amount))
    }

    // Payment method
    if (detail.method) {
      parts.push(detail.method.toUpperCase())
    }

    return parts.length > 0 ? (
      <span className="text-xs text-muted-foreground">
        {parts.join(" • ")}
      </span>
    ) : null
  }

  const formatDetail = (detail: Record<string, any> | null) => {
    if (!detail) return null

    return (
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
        {detail.table_label && (
          <>
            <dt className="font-medium text-muted-foreground">Table</dt>
            <dd className="text-foreground">{detail.table_label}</dd>
          </>
        )}
        {detail.order_number && (
          <>
            <dt className="font-medium text-muted-foreground">Order #</dt>
            <dd className="text-foreground">{detail.order_number}</dd>
          </>
        )}
        {detail.customer_name && (
          <>
            <dt className="font-medium text-muted-foreground">Customer</dt>
            <dd className="text-foreground">{detail.customer_name}</dd>
          </>
        )}
        {detail.guests && (
          <>
            <dt className="font-medium text-muted-foreground">Guests</dt>
            <dd className="text-foreground">{detail.guests}</dd>
          </>
        )}
        {detail.total && (
          <>
            <dt className="font-medium text-muted-foreground">Total</dt>
            <dd className="text-foreground">{formatCurrency(detail.total)}</dd>
          </>
        )}
        {detail.amount && (
          <>
            <dt className="font-medium text-muted-foreground">Amount</dt>
            <dd className="text-foreground">{formatCurrency(detail.amount)}</dd>
          </>
        )}
        {detail.method && (
          <>
            <dt className="font-medium text-muted-foreground">Payment Method</dt>
            <dd className="text-foreground uppercase">{detail.method}</dd>
          </>
        )}
        {detail.status && (
          <>
            <dt className="font-medium text-muted-foreground">Status</dt>
            <dd className="text-foreground capitalize">{detail.status}</dd>
          </>
        )}
        {detail.payment_status && (
          <>
            <dt className="font-medium text-muted-foreground">Payment Status</dt>
            <dd className="text-foreground capitalize">{detail.payment_status}</dd>
          </>
        )}
      </dl>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Activity Log"
        description={`Track your activities and actions • ${staffName}`}
        crumbs={[
          { label: "POS", href: "/pos" },
          { label: "Activity Log" },
        ]}
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Activity className="size-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold tabular-nums">{activityLogs.length}</p>
              <p className="truncate text-xs text-muted-foreground">Total Activities</p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <ShoppingCart className="size-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold tabular-nums">{entityCounts.order || 0}</p>
              <p className="truncate text-xs text-muted-foreground">Order Activities</p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
              <CreditCard className="size-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold tabular-nums">{entityCounts.payment || 0}</p>
              <p className="truncate text-xs text-muted-foreground">Payment Activities</p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Users className="size-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold tabular-nums">{entityCounts.table_session || 0}</p>
              <p className="truncate text-xs text-muted-foreground">Session Activities</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="h-9 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {(search || entityFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setEntityFilter("all")
                }}
              >
                <Filter className="mr-1 size-3" />
                Clear
              </Button>
            )}
          </div>

          {/* Entity filter buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={entityFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setEntityFilter("all")}
            >
              All
            </Button>
            <Button
              variant={entityFilter === "order" ? "default" : "outline"}
              size="sm"
              onClick={() => setEntityFilter("order")}
            >
              <ShoppingCart className="mr-1.5 size-3" />
              Orders ({entityCounts.order || 0})
            </Button>
            <Button
              variant={entityFilter === "payment" ? "default" : "outline"}
              size="sm"
              onClick={() => setEntityFilter("payment")}
            >
              <CreditCard className="mr-1.5 size-3" />
              Payments ({entityCounts.payment || 0})
            </Button>
            <Button
              variant={entityFilter === "table_session" ? "default" : "outline"}
              size="sm"
              onClick={() => setEntityFilter("table_session")}
            >
              <Users className="mr-1.5 size-3" />
              Sessions ({entityCounts.table_session || 0})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity logs grouped by date */}
      {filtered.length === 0 ? (
        <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm font-medium">No activities found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search || entityFilter !== "all" ? "Try adjusting your filters" : "Your activities will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Calendar className="size-4" />
                {group.date}
              </h3>
              <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {group.logs.map((log) => {
                      const style = ACTION_STYLES[log.action] || DEFAULT_STYLE
                      const Icon = style.icon
                      const isExpanded = expandedIds.has(log.id)
                      const detail = log.detail as Record<string, any> | null

                      return (
                        <li key={log.id} className="p-4 transition-colors hover:bg-muted/30">
                          <div className="flex items-start gap-3">
                            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${style.color}`}>
                              <Icon className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={style.color}>
                                  {style.label}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  {relativeTime(log.created_at)}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-col gap-1">
                                {renderQuickSummary(log)}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatDateTime(log.created_at)}
                              </p>

                              {/* Expandable detail */}
                              {detail && Object.keys(detail).length > 0 && (
                                <div className="mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => toggleExpanded(log.id)}
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="mr-1 size-3" />
                                        Hide details
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="mr-1 size-3" />
                                        Show details
                                      </>
                                    )}
                                  </Button>
                                  {isExpanded && (
                                    <div className="mt-2 rounded-md border bg-muted/30 p-3">
                                      {formatDetail(detail)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
