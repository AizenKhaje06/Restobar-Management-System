"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Clock,
  RefreshCw,
  Search,
  UtensilsCrossed,
  Eye,
  X,
  AlertCircle,
  Bell,
  Loader2,
  Timer,
  AlertTriangle,
  CreditCard,
  Star,
  Flame,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { StaffShell, type NavItem } from "@/components/staff-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssistModal, type WaiterOrderForModal } from "@/components/dashboard/assist-modal"
import { formatCurrency, formatTime, formatDateTime } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"
import type { Profile, OrderWithItems, OrderStatus } from "@/lib/types"
import {
  updateWaiterOrderStatus,
  assistWaiterOrder,
  confirmWaiterOrder,
} from "@/app/actions/waiter"
import { toast } from "sonner"

const NAV_ITEMS: NavItem[] = [
  { href: "/waiter", label: "My Tables", icon: "LayoutDashboard" },
  { href: "/waiter/orders", label: "Orders", icon: "ClipboardList" },
  { href: "/waiter/notifications", label: "Alerts", icon: "Bell" },
]

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",  icon: <AlertCircle className="size-3.5" /> },
  confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <CheckCircle2 className="size-3.5" /> },
  preparing:  { label: "Preparing",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <ChefHat className="size-3.5" /> },
  ready:      { label: "Ready",       color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle2 className="size-3.5" /> },
  served:     { label: "Served",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: <UtensilsCrossed className="size-3.5" /> },
  completed:  { label: "Completed",  color: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400", icon: <CheckCircle2 className="size-3.5" /> },
  cancelled:  { label: "Cancelled",  color: "bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500", icon: <X className="size-3.5" /> },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready:     "served",
  served:    "completed",
}

const STATUS_ACTION: Record<OrderStatus, { label: string; icon: React.ReactNode }> = {
  pending:   { label: "Confirm",        icon: <CheckCircle2 className="size-3.5" /> },
  confirmed: { label: "Start Preparing", icon: <ChefHat className="size-3.5" /> },
  preparing: { label: "Mark Ready",      icon: <CheckCircle2 className="size-3.5" /> },
  ready:     { label: "Mark Served",     icon: <UtensilsCrossed className="size-3.5" /> },
  served:    { label: "Complete",        icon: <CheckCircle2 className="size-3.5" /> },
  completed: { label: "Completed",        icon: <CheckCircle2 className="size-3.5" /> },
  cancelled: { label: "Cancelled",       icon: <X className="size-3.5" /> },
}

interface WaiterOrder extends OrderWithItems {
  tables?: { label: string | null; zone: string | null; assigned_waiter: string | null } | null
  payment_status?: string | null
  payment_method?: string | null
  priority?: "normal" | "high" | "urgent" | null
  special_requests?: string | null
}

export function WaiterOrdersClient({
  profile,
  initialOrders,
}: {
  profile: Profile
  initialOrders: WaiterOrder[]
}) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<OrderStatus | "all">("all")
  const [selectedOrder, setSelectedOrder] = useState<WaiterOrder | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [assisting, setAssisting] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [assistModalOrder, setAssistModalOrder] = useState<WaiterOrderForModal | null>(null)
  
  // New state for enterprise features
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sortBy, setSortBy] = useState<"time" | "priority" | "table" | "amount">("time")

  // Update current time every second for live timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel("waiter-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            setOrders((prev) => {
              const idx = prev.findIndex((o) => o.id === payload.new.id)
              if (idx >= 0) {
                const updated = [...prev]
                updated[idx] = { ...updated[idx], ...payload.new }
                return updated
              }
              // New order — add it
              return [{ ...payload.new, tables: prev[idx]?.tables }, ...prev]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleStatusUpdate = useCallback(
    async (order: WaiterOrder, newStatus: OrderStatus) => {
      setPending(order.id)
      try {
        const result = await updateWaiterOrderStatus(order.id, newStatus)
        if (result?.error) {
          alert(result.error)
          return
        }
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
        )
        if (selectedOrder?.id === order.id) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
        }
      } finally {
        setPending(null)
      }
    },
    [selectedOrder]
  )

  const handleAssist = useCallback(async (order: WaiterOrder) => {
    setAssisting(order.id)
    try {
      const result = await assistWaiterOrder(order.id)
      if (result?.error) {
        alert(result.error)
        return
      }
      // Refresh orders to get updated table assignment
      const { data } = await supabase
        .from("orders")
        .select("*, tables(label, zone, assigned_waiter), order_items(*)")
        .eq("id", order.id)
        .single()
      if (data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, ...data } : o))
        )
        // Open the POS assist modal
        setAssistModalOrder(data as WaiterOrderForModal)
      }
    } finally {
      setAssisting(null)
    }
  }, [supabase])

  const handleConfirm = useCallback(async (order: WaiterOrder) => {
    setConfirming(order.id)
    try {
      const result = await confirmWaiterOrder(order.id)
      if (result?.error) {
        alert(result.error)
        return
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "confirmed" } : o))
      )
      setSelectedOrder((prev) => (prev ? { ...prev, status: "confirmed" } : null))
      toast.success("Order confirmed! Sent to kitchen.")
    } finally {
      setConfirming(null)
    }
  }, [])

  // Calculate time elapsed for order (in minutes)
  const getOrderAge = useCallback((createdAt: string): number => {
    return Math.floor((currentTime.getTime() - new Date(createdAt).getTime()) / 60000)
  }, [currentTime])

  // Determine SLA status
  const getSLAStatus = useCallback((order: WaiterOrder): "normal" | "warning" | "critical" => {
    const age = getOrderAge(order.created_at)
    
    if (order.status === "pending") {
      if (age > 15) return "critical"
      if (age > 10) return "warning"
    } else if (order.status === "confirmed" || order.status === "preparing") {
      if (age > 30) return "critical"
      if (age > 20) return "warning"
    } else if (order.status === "ready") {
      if (age > 10) return "critical"
      if (age > 5) return "warning"
    }
    
    return "normal"
  }, [getOrderAge])

  // Determine order priority based on multiple factors
  const getOrderPriority = useCallback((order: WaiterOrder): "normal" | "high" | "urgent" => {
    // Check if manually set
    if (order.priority) return order.priority
    
    // Auto-detect priority
    const age = getOrderAge(order.created_at)
    const itemCount = order.order_items?.length ?? 0
    const totalAmount = Number(order.total)
    
    // Urgent: Old orders or high-value orders
    if (age > 20) return "urgent"
    if (totalAmount > 2000) return "urgent" // High-value orders
    
    // High: Multiple items or aging orders
    if (age > 10) return "high"
    if (itemCount > 5) return "high" // Large orders
    
    return "normal"
  }, [getOrderAge])

  // Smart sorting with priority
  const sortedAndFiltered = useMemo(() => {
    let result = orders.filter((o) => {
      if (o.status === "cancelled" || o.status === "completed") return false
      if (tab !== "all" && o.status !== tab) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        String(o.order_number).includes(q) ||
        (o.tables?.label ?? "").toLowerCase().includes(q) ||
        (o.customer_name ?? "").toLowerCase().includes(q)
      )
    })

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "priority": {
          const priorityOrder = { urgent: 3, high: 2, normal: 1 }
          const aPriority = priorityOrder[getOrderPriority(a)]
          const bPriority = priorityOrder[getOrderPriority(b)]
          return bPriority - aPriority // Urgent first
        }
        case "table": {
          const aLabel = a.tables?.label ?? ""
          const bLabel = b.tables?.label ?? ""
          return aLabel.localeCompare(bLabel)
        }
        case "amount": {
          return Number(b.total) - Number(a.total) // Highest first
        }
        case "time":
        default: {
          // Oldest first (default)
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
      }
    })

    return result
  }, [orders, tab, search, sortBy, getOrderPriority])

  const counts = orders.reduce(
    (acc, o) => {
      if (o.status === "cancelled" || o.status === "completed") return acc
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const activeTabCount = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <StaffShell profile={profile} items={NAV_ITEMS} title="Orders">
      {/* Header with Search and Sort */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order #, table, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="size-4 mr-2" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>Oldest First</span>
                  </div>
                </SelectItem>
                <SelectItem value="priority">
                  <div className="flex items-center gap-2">
                    <Flame className="size-4" />
                    <span>Priority</span>
                  </div>
                </SelectItem>
                <SelectItem value="table">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="size-4" />
                    <span>Table Number</span>
                  </div>
                </SelectItem>
                <SelectItem value="amount">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4" />
                    <span>Highest Amount</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="size-3.5" />
              <span className="ml-1.5">Refresh</span>
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-blue-500" />
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="mt-1 text-2xl font-bold">{activeTabCount}</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-500" />
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="mt-1 text-2xl font-bold">{counts["pending"] ?? 0}</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <div className="text-xs text-muted-foreground">Ready</div>
            </div>
            <div className="mt-1 text-2xl font-bold">{counts["ready"] ?? 0}</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-purple-500" />
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="mt-1 text-xl font-bold">
              {formatCurrency(
                sortedAndFiltered.reduce((sum, o) => sum + Number(o.total), 0)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as OrderStatus | "all")}>
        <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all">
            All ({activeTabCount})
          </TabsTrigger>
          {(["pending", "confirmed", "preparing", "ready", "served"] as OrderStatus[]).map(
            (s) =>
              counts[s] ? (
                <TabsTrigger key={s} value={s}>
                  {STATUS_CONFIG[s].label} ({counts[s]})
                </TabsTrigger>
              ) : null
          )}
        </TabsList>

        <TabsContent value={tab}>
          {sortedAndFiltered.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <ClipboardList className="mx-auto mb-3 size-8 opacity-40" />
              <p>No orders in this stage.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {sortedAndFiltered.map((order) => (
                <WaiterOrderCard
                  key={order.id}
                  order={order}
                  onView={() => {
                    const claimedByMe = order.tables?.assigned_waiter === profile.id
                    if (order.status === "pending" && claimedByMe) {
                      // Open POS assist modal
                      setAssistModalOrder(order as unknown as WaiterOrderForModal)
                    } else {
                      setSelectedOrder(order)
                    }
                  }}
                  onStatusUpdate={(s) => handleStatusUpdate(order, s)}
                  onAssist={() => handleAssist(order)}
                  pending={pending === order.id}
                  assisting={assisting === order.id}
                  profile={profile}
                  getOrderAge={getOrderAge}
                  getSLAStatus={getSLAStatus}
                  getOrderPriority={getOrderPriority}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* POS Assist Modal (for pending orders claimed by this waiter) */}
      {assistModalOrder && (
        <AssistModal
          open={true}
          onClose={() => setAssistModalOrder(null)}
          order={assistModalOrder}
          profile={profile}
          onConfirmed={(orderId) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: "confirmed" as OrderStatus } : o))
            )
            setAssistModalOrder(null)
          }}
          onOrderUpdated={(updated) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            )
            setAssistModalOrder(updated)
          }}
        />
      )}

      {/* Order Detail Dialog (for non-pending or non-claimed orders) */}
      <Dialog
        open={!!selectedOrder && !assistModalOrder}
        onOpenChange={(o) => !o && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order #{selectedOrder?.order_number}
              {selectedOrder && (
                <Badge className={STATUS_CONFIG[selectedOrder.status as OrderStatus]?.color}>
                  {STATUS_CONFIG[selectedOrder.status as OrderStatus]?.label}
                </Badge>
              )}
            </DialogTitle>
            {selectedOrder?.tables && (
              <p className="text-sm text-muted-foreground">
                {selectedOrder.tables.label}
                {selectedOrder.tables.zone ? ` (${selectedOrder.tables.zone})` : ""}
              </p>
            )}
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Items */}
              <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                {selectedOrder.order_items?.length > 0 ? (
                  selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span>{item.name}</span>
                        {item.notes && (
                          <span className="text-xs text-muted-foreground">({item.notes})</span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {formatCurrency(Number(item.unit_price) * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(Number(selectedOrder.tax))}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1.5">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(Number(selectedOrder.total))}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {formatDateTime(selectedOrder.created_at)}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
            {selectedOrder && NEXT_STATUS[selectedOrder.status as OrderStatus] && (
              <Button
                onClick={() =>
                  handleStatusUpdate(selectedOrder, NEXT_STATUS[selectedOrder.status as OrderStatus]!)
                }
                disabled={pending === selectedOrder.id}
              >
                {pending === selectedOrder.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  STATUS_ACTION[selectedOrder.status as OrderStatus]?.icon
                )}
                <span className="ml-1.5">
                  {STATUS_ACTION[selectedOrder.status as OrderStatus]?.label}
                </span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffShell>
  )
}

// ─── Order Card ─────────────────────────────────────────────────────────────

function WaiterOrderCard({
  order,
  onView,
  onStatusUpdate,
  onAssist,
  pending,
  assisting,
  profile,
  getOrderAge,
  getSLAStatus,
  getOrderPriority,
}: {
  order: WaiterOrder
  onView: () => void
  onStatusUpdate: (s: OrderStatus) => void
  onAssist: () => void
  pending: boolean
  assisting: boolean
  profile: Profile
  getOrderAge: (createdAt: string) => number
  getSLAStatus: (order: WaiterOrder) => "normal" | "warning" | "critical"
  getOrderPriority: (order: WaiterOrder) => "normal" | "high" | "urgent"
}) {
  const next = NEXT_STATUS[order.status as OrderStatus]
  const config = STATUS_CONFIG[order.status as OrderStatus]
  const isPending = order.status === "pending"
  const isClaimedByMe = order.tables?.assigned_waiter === profile.id
  
  // Enterprise features
  const age = getOrderAge(order.created_at)
  const slaStatus = getSLAStatus(order)
  const priority = getOrderPriority(order)
  const isPaid = order.payment_status === "paid"

  // Priority colors
  const priorityConfig = {
    urgent: { 
      color: "bg-red-500", 
      textColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-300 dark:border-red-800",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      icon: <Flame className="size-3" />,
      label: "Urgent"
    },
    high: { 
      color: "bg-amber-500", 
      textColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-300 dark:border-amber-800",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      icon: <Star className="size-3" />,
      label: "High Priority"
    },
    normal: { 
      color: "bg-gray-400", 
      textColor: "text-muted-foreground",
      borderColor: "",
      bgColor: "",
      icon: null,
      label: ""
    },
  }

  const priorityStyle = priorityConfig[priority]

  return (
    <Card className={`${
      slaStatus === "critical" 
        ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" 
        : slaStatus === "warning"
        ? "border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
        : priority === "urgent"
        ? "border-red-200 dark:border-red-900/50"
        : priority === "high"
        ? "border-amber-200 dark:border-amber-900/50"
        : ""
    }`}>
      <CardHeader className="pb-3">
        {/* Header: Order # + Status Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Order</p>
            <CardTitle className="text-base font-bold tracking-tight">
              #{order.order_number}
            </CardTitle>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <Badge className={config?.color ?? "bg-gray-100"}>
              <span className="mr-1">{config?.icon}</span>
              {config?.label}
            </Badge>
            {/* Timer Badge */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              slaStatus === "critical" 
                ? "bg-red-600 text-white animate-pulse" 
                : slaStatus === "warning"
                ? "bg-amber-500 text-white"
                : "bg-muted text-muted-foreground"
            }`}>
              {slaStatus === "critical" && <AlertTriangle className="size-3" />}
              <Timer className="size-3" />
              <span>{age}m</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Center: Table Number (Hero) */}
      <CardContent className="py-6 space-y-2">
        <div className="text-center">
          {order.tables && (
            <>
              <p className="text-4xl font-bold tracking-tight">
                {order.tables.label}
              </p>
              {order.tables.zone && (
                <p className="text-sm text-muted-foreground mt-2">
                  {order.tables.zone}
                </p>
              )}
            </>
          )}
          {!order.tables && order.customer_name && (
            <p className="text-3xl font-bold tracking-tight">
              {order.customer_name}
            </p>
          )}
          
          {/* Order Amount */}
          <div className="mt-3 text-2xl font-bold text-primary">
            {formatCurrency(Number(order.total))}
          </div>
        </div>
      </CardContent>

      {/* Bottom: Status Alerts & Buttons */}
      <CardContent className="pt-0 pb-4 space-y-3">
        {/* Priority Badge */}
        {priority !== "normal" && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${priorityStyle.borderColor} ${priorityStyle.bgColor}`}>
            <div className="flex items-center gap-1.5">
              {priorityStyle.icon}
              <span className={`text-xs font-semibold ${priorityStyle.textColor}`}>
                {priorityStyle.label}
              </span>
            </div>
            {priority === "urgent" && slaStatus === "critical" && (
              <span className="ml-auto text-xs font-medium text-red-600 dark:text-red-400">
                Over {age - 15}m late!
              </span>
            )}
          </div>
        )}

        {/* Payment Status */}
        {isPaid && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <CreditCard className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Paid - {order.payment_method === "cash" 
                ? "Cash"
                : order.payment_method === "card"
                ? "Card"
                : order.payment_method === "gcash"
                ? "GCash"
                : order.payment_method === "maya"
                ? "Maya"
                : "Paid"}
            </span>
          </div>
        )}

        {/* SLA Warning Message */}
        {slaStatus === "critical" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-800">
            <AlertCircle className="size-4 text-red-600 dark:text-red-400 shrink-0" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-300">
              {order.status === "pending" 
                ? "URGENT: Confirm immediately!"
                : order.status === "ready"
                ? "URGENT: Serve this order now!"
                : "This order is delayed!"}
            </span>
          </div>
        )}

        {/* Status alerts (if any) */}
        {isPending && !isClaimedByMe && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 shrink-0" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Needs assistance
            </span>
          </div>
        )}
        {isClaimedByMe && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-500 shrink-0" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
              My table
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {/* Pending orders: Assist or View (if already claimed) */}
          {isPending ? (
            isClaimedByMe ? (
              <Button size="sm" variant="outline" onClick={onView} className="flex-1">
                <Eye className="size-3.5" />
                <span className="ml-1.5">View & Confirm</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onAssist}
                disabled={assisting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {assisting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                <span className="ml-1.5">{assisting ? "Assisting..." : "Assist"}</span>
              </Button>
            )
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={onView} className="flex-1">
                <Eye className="size-3.5" />
                <span className="ml-1.5">View</span>
              </Button>
              {next && (
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(next)}
                  disabled={pending}
                  className="flex-1"
                >
                  {pending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    STATUS_ACTION[order.status as OrderStatus]?.icon
                  )}
                  <span className="ml-1.5">
                    {pending ? "Updating..." : STATUS_ACTION[order.status as OrderStatus]?.label}
                  </span>
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}