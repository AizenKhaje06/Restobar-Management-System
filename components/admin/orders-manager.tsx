"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  Filter,
  Receipt,
  Search,
  Utensils,
  CalendarDays,
  RefreshCw,
  Plus,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency, formatDateTime, relativeTime } from "@/lib/constants"
import type { OrderWithItems, OrderStatus, PaymentStatus } from "@/lib/types"
import { updateOrderStatusAction } from "@/app/actions/admin"
import { DateRangePicker } from "@/components/ui/date-range-picker"

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
]

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  pending:    { label: "Pending",    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",   dot: "bg-amber-500" },
  confirmed:  { label: "Confirmed",  className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",       dot: "bg-cyan-500" },
  preparing:  { label: "Preparing",  className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",       dot: "bg-blue-500" },
  ready:      { label: "Ready",      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  served:     { label: "Served",     className: "bg-purple-500/10 text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
  completed:  { label: "Paid",       className: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",       dot: "bg-zinc-500" },
  cancelled:  { label: "Cancelled",  className: "bg-rose-500/10 text-rose-700 dark:text-rose-400",       dot: "bg-rose-500" },
}

const PAYMENT_STYLES: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  unpaid:   { label: "Unpaid",   variant: "destructive" },
  pending:  { label: "Pending",  variant: "outline" },
  paid:     { label: "Paid",     variant: "default" },
  refunded: { label: "Refunded", variant: "secondary" },
}

export function OrdersManager({ orders }: { orders: OrderWithItems[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all" | "addon">("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all")
  const [dateStart, setDateStart] = useState<Date | null>(null)
  const [dateEnd, setDateEnd] = useState<Date | null>(null)
  const [selected, setSelected] = useState<OrderWithItems | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Add-On filter
      if (statusFilter === "addon") {
        if (o.order_type !== "additional") return false
      } else if (statusFilter !== "all") {
        // Status filter
        if (o.status !== statusFilter) return false
      }
      
      // Payment filter
      if (paymentFilter !== "all" && o.payment_status !== paymentFilter) return false
      
      // Date range filter
      if (dateStart) {
        const orderDate = new Date(o.created_at)
        const startOfDay = new Date(dateStart)
        startOfDay.setHours(0, 0, 0, 0)
        if (orderDate < startOfDay) return false
      }
      if (dateEnd) {
        const orderDate = new Date(o.created_at)
        const endOfDay = new Date(dateEnd)
        endOfDay.setHours(23, 59, 59, 999)
        if (orderDate > endOfDay) return false
      }
      
      // Search filter
      if (!search) return true
      const q = search.toLowerCase()
      return (
        o.order_number.toString().includes(q) ||
        (o.tables?.label ?? "").toLowerCase().includes(q) ||
        (o.customer_name ?? "").toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      )
    })
  }, [orders, search, statusFilter, paymentFilter, dateStart, dateEnd])

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      pending: 0, confirmed: 0, preparing: 0, ready: 0, served: 0, completed: 0, cancelled: 0, addon: 0,
    }
    for (const o of orders) {
      c[o.status]++
      if (o.order_type === "additional") {
        c["addon"]++
      }
    }
    return c
  }, [orders])

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total), 0),
    [orders],
  )

  const changeStatus = (id: string, status: OrderStatus) => {
    startTransition(async () => {
      await updateOrderStatusAction(id, status)
      if (selected?.id === id) {
        setSelected({ ...selected, status })
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage and track all orders across the restaurant."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        actions={
          <div className="flex gap-2">
            <DateRangePicker
              onRangeChange={(start, end) => {
                setDateStart(start)
                setDateEnd(end)
              }}
              initialStartDate={dateStart}
              initialEndDate={dateEnd}
            />
            <Button size="sm" onClick={() => router.refresh()}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Status summary */}
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-8">
        {[...ORDER_STATUSES.slice(0, 6), "addon", ORDER_STATUSES[6]].map((status) => {
          const isAddon = status === "addon"
          const s = isAddon 
            ? { label: "Add-On", className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500" }
            : STATUS_STYLES[status as OrderStatus]
          const active = statusFilter === status
          
          // Active button gets colored background based on status with high-contrast text
          let activeClass = "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
          if (active) {
            switch(status) {
              case "pending":
                activeClass = "border-amber-600 bg-amber-500/20 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30"
                break
              case "confirmed":
                activeClass = "border-cyan-600 bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 ring-2 ring-cyan-500/30"
                break
              case "preparing":
                activeClass = "border-blue-600 bg-blue-500/20 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30"
                break
              case "ready":
                activeClass = "border-emerald-600 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30"
                break
              case "served":
                activeClass = "border-purple-600 bg-purple-500/20 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30"
                break
              case "completed":
                activeClass = "border-green-700 bg-green-600/20 text-green-900 dark:text-green-200 ring-2 ring-green-600/30"
                break
              case "addon":
                activeClass = "border-indigo-600 bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30"
                break
              case "cancelled":
                activeClass = "border-rose-600 bg-rose-500/20 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30"
                break
            }
          }
          
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(active ? "all" : status as any)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                active ? activeClass : "hover:bg-muted/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${s.dot}`} />
                <span className="font-medium">{s.label}</span>
              </span>
              <span className={`font-semibold tabular-nums ${active ? "" : "text-muted-foreground"}`}>
                {counts[status as string] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filters + summary */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order #, table, customer..."
              className="h-9 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentStatus | "all")}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          
          {(statusFilter !== "all" || paymentFilter !== "all" || search || dateStart || dateEnd) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("all")
                setPaymentFilter("all")
                setSearch("")
                setDateStart(null)
                setDateEnd(null)
              }}
            >
              <Filter className="mr-1 size-3" />
              Clear All
            </Button>
          )}
          
          <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
            {filtered.length} of {orders.length} • {formatCurrency(totalRevenue)} paid
          </div>
        </CardContent>
      </Card>

      {/* Orders table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Order Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No orders match your filters</p>
              <p className="mt-1 text-xs text-muted-foreground">Try clearing the filters above</p>
            </div>
          ) : (
            <div className="-mx-2 divide-y">
              {filtered.map((order) => {
                const status = STATUS_STYLES[order.status]
                const pay = PAYMENT_STYLES[order.payment_status as PaymentStatus] ?? PAYMENT_STYLES.unpaid
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className="flex w-full items-center gap-4 rounded-md px-2 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      #{order.order_number.toString().slice(-4)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-medium">
                          {order.tables?.label ?? "Take-Out"}{order.tables?.zone ? ` • ${order.tables.zone}` : ""}
                        </span>
                        {order.order_type === "additional" && (
                          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs">
                            <Plus className="mr-1 size-3" /> Add-On
                          </Badge>
                        )}
                        <Badge variant={pay.variant} className="text-xs">
                          {pay.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          • {order.order_items?.length ?? 0} items
                        </span>
                        <span className="text-xs text-muted-foreground">• {relativeTime(order.created_at)}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {order.customer_name ?? "—"} • {formatDateTime(order.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(Number(order.total))}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        <span className={`size-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order detail dialog */}
      <OrderDetailDialog
        order={selected}
        onClose={() => setSelected(null)}
        onChangeStatus={changeStatus}
        pending={pending}
      />
    </div>
  )
}

function OrderDetailDialog({
  order,
  onClose,
  onChangeStatus,
  pending,
}: {
  order: OrderWithItems | null
  onClose: () => void
  onChangeStatus: (id: string, status: OrderStatus) => void
  pending: boolean
}) {
  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {order && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="flex items-center gap-2 flex-wrap">
                    <Receipt className="size-4" />
                    Order #{order.order_number.toString().slice(-6)}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {formatDateTime(order.created_at)} • {relativeTime(order.created_at)}
                  </DialogDescription>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status].className}`}
                    >
                      <span className={`size-1.5 rounded-full ${STATUS_STYLES[order.status].dot}`} />
                      {STATUS_STYLES[order.status].label}
                    </span>
                    {order.order_type === "additional" && (
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <Plus className="mr-1 size-3" /> Add-On
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2">
                <Info label="Table" value={order.tables?.label ?? "Take-Out"} />
                <Info label="Customer" value={order.customer_name ?? "Walk-in"} />
                <Info label="Payment" value={PAYMENT_STYLES[order.payment_status as PaymentStatus]?.label ?? order.payment_status} />
                <Info label="Order #" value={order.order_number.toString().slice(-6)} mono />
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Items</h4>
                <div className="space-y-1.5 rounded-lg border">
                  {(order.order_items ?? []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(Number(item.unit_price))} × {item.quantity}
                          {item.notes ? ` • ${item.notes}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums">
                          {formatCurrency(Number(item.unit_price) * item.quantity)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="tabular-nums">{formatCurrency(Number(order.tax))}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(Number(order.total))}</span>
                </div>
              </div>

              {order.notes && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-50/50 p-3 text-sm dark:bg-amber-950/20">
                  <div className="font-medium text-amber-700 dark:text-amber-400">Notes</div>
                  <div className="mt-0.5 text-muted-foreground">{order.notes}</div>
                </div>
              )}

              <div>
                <h4 className="mb-2 text-sm font-semibold">Update Status</h4>
                <div className="flex flex-wrap gap-1.5">
                  {ORDER_STATUSES.map((s) => {
                    const active = order.status === s
                    
                    // Active button gets stronger colored highlight with ring and high-contrast text
                    let buttonClass = "border-border"
                    if (active) {
                      switch(s) {
                        case "pending":
                          buttonClass = "border-amber-600 bg-amber-500/20 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30 font-semibold"
                          break
                        case "confirmed":
                          buttonClass = "border-cyan-600 bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 ring-2 ring-cyan-500/30 font-semibold"
                          break
                        case "preparing":
                          buttonClass = "border-blue-600 bg-blue-500/20 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30 font-semibold"
                          break
                        case "ready":
                          buttonClass = "border-emerald-600 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30 font-semibold"
                          break
                        case "served":
                          buttonClass = "border-purple-600 bg-purple-500/20 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30 font-semibold"
                          break
                        case "completed":
                          buttonClass = "border-green-700 bg-green-600/20 text-green-900 dark:text-green-200 ring-2 ring-green-600/30 font-semibold"
                          break
                        case "cancelled":
                          buttonClass = "border-rose-600 bg-rose-500/20 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30 font-semibold"
                          break
                      }
                    }
                    
                    return (
                      <Button
                        key={s}
                        size="sm"
                        variant="outline"
                        className={buttonClass}
                        disabled={active || pending}
                        onClick={() => onChangeStatus(order.id, s)}
                      >
                        {s === "preparing" && <Utensils className="mr-1 size-3" />}
                        {s === "ready" && <CheckCircle2 className="mr-1 size-3" />}
                        {s === "served" && <Clock className="mr-1 size-3" />}
                        {STATUS_STYLES[s].label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  )
}
