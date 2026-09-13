"use client"

import { useState, useTransition, useCallback } from "react"
import {
  ChefHat,
  Check,
  Clock,
  CreditCard,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
  UtensilsCrossed,
  AlertCircle,
  Plus,
  ClipboardList,
} from "lucide-react"
import { StaffShell, type NavItem } from "@/components/staff-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import {
  CreditCard as CreditCardIcon,
  Banknote,
  Smartphone,
} from "lucide-react"
import { formatCurrency, formatDateTime, TAX_RATE } from "@/lib/constants"
import type { Profile, OrderWithItems, OrderStatus, OrderItem } from "@/lib/types"
import {
  updatePosOrderStatus,
  cancelPosOrder,
  processPosPayment,
  getPosMenu,
  addPosOrderItem,
  createPosAddonOrder,
} from "@/app/actions/pos"
import { MenuBrowserModal } from "@/components/dashboard/assist-modal"
import { CancelOrderModal } from "@/components/pos/cancel-order-modal"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { toast } from "sonner"

const NAV_ITEMS: NavItem[] = [
  { href: "/pos", label: "POS Terminal", icon: "LayoutDashboard" },
  { href: "/pos/orders", label: "Orders", icon: "ShoppingCart" },
  { href: "/pos/tables", label: "Tables", icon: "Utensils" },
  { href: "/pos/receipts", label: "Receipts", icon: "Receipt" },
]

const STATUS_CONFIG: Record<OrderStatus | "addon", { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  preparing: { label: "Preparing", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  ready: { label: "Ready", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  served: { label: "Served", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  completed: { label: "Paid", color: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400" },
  addon: { label: "Add-On", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
}

const STATUS_ACTION: Record<OrderStatus, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Confirm", icon: <Check className="size-3.5" />, variant: "default" },
  confirmed: { label: "Start Preparing", icon: <ChefHat className="size-3.5" />, variant: "default" },
  preparing: { label: "Mark Ready", icon: <Check className="size-3.5" />, variant: "default" },
  ready: { label: "Mark Served", icon: <UtensilsCrossed className="size-3.5" />, variant: "default" },
  served: { label: "Complete", icon: <Check className="size-3.5" />, variant: "default" },
  completed: { label: "Complete", icon: <Check className="size-3.5" />, variant: "secondary" },
  cancelled: { label: "Cancelled", icon: <X className="size-3.5" />, variant: "secondary" },
}

interface PayDialog {
  open: boolean
  method: "cash" | "card" | "gcash" | "maya"
  amountTendered: string
}

export function PosOrdersClient({
  profile,
  initialOrders,
  restaurantName,
  restaurantLogo,
}: {
  profile: Profile
  initialOrders: OrderWithItems[]
  restaurantName?: string
  restaurantLogo?: string
}) {
  const [pending, startTransition] = useTransition()
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<OrderStatus | "all" | "addon">("all")
  const [dateStart, setDateStart] = useState<Date | null>(null)
  const [dateEnd, setDateEnd] = useState<Date | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [relatedOrders, setRelatedOrders] = useState<OrderWithItems[]>([])
  const [payDialog, setPayDialog] = useState<PayDialog>({
    open: false,
    method: "cash",
    amountTendered: "",
  })
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<OrderWithItems | null>(null)

  // Fetch related orders for a table (main order + add-ons)
  const fetchRelatedOrders = useCallback(async (tableId: string | null) => {
    if (!tableId) return []
    
    const allTableOrders = orders.filter(o => o.table_id === tableId)
    return allTableOrders
  }, [orders])

  // Handle viewing order details with combined view
  const handleViewOrderDetails = async (order: OrderWithItems) => {
    // If clicked order is an add-on, only show that add-on order (not combined view)
    if (order.order_type === "additional") {
      setRelatedOrders([order]) // Only show this add-on order
    } else if (order.table_id) {
      // If main order, show combined view with all table orders
      const related = await fetchRelatedOrders(order.table_id)
      setRelatedOrders(related)
    } else {
      setRelatedOrders([])
    }
    setSelectedOrder(order)
  }

  const filtered = orders.filter((o) => {
    if (!o.status) return false
    
    // Hide served add-on orders from the main list (they'll show in combined view)
    if (o.order_type === "additional" && o.status === "served") {
      return false
    }
    
    // Add-On filter: only show orders with order_type === 'additional'
    if (tab === "addon") {
      if (o.order_type !== "additional") return false
    } else if (tab !== "all") {
      if (o.status !== tab) return false
    }
    
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
    
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.id.toLowerCase().includes(q) ||
      (o.tables?.label ?? "").toLowerCase().includes(q) ||
      (o.customer_name ?? "").toLowerCase().includes(q) ||
      String(o.order_number).includes(q)
    )
  })

  const counts = orders.reduce(
    (acc, o) => {
      if (!o.status) return acc
      acc[o.status] = (acc[o.status] ?? 0) + 1
      // Count add-on orders separately
      if (o.order_type === "additional") {
        acc["addon"] = (acc["addon"] ?? 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  const handleStatusUpdate = (order: OrderWithItems, newStatus: OrderStatus) => {
    startTransition(async () => {
      const result = await updatePosOrderStatus(order.id, newStatus)
      if (result?.error) {
        toast.error("Failed to update order", {
          description: result.error
        })
        return
      }
      
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      )
      
      // Show success notification
      const tableLabel = order.tables?.label || "Takeout"
      const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus
      
      toast.success(`${tableLabel} • Order #${order.order_number}`, {
        description: `Successfully marked as ${statusLabel.toLowerCase()}`
      })
      
      // Auto-close modal if status is "served"
      if (newStatus === "served") {
        setSelectedOrder(null)
        setRelatedOrders([])
      } else if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    })
  }

  const handleCancelSuccess = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null)
    }
    setOrderToCancel(null)
  }

  const openPayDialog = (order: OrderWithItems) => {
    setSelectedOrder(order)
    setPayDialog({ open: true, method: "cash", amountTendered: "" })
  }

  const handleMenuItemAdded = useCallback(
    async (addedItem: { name: string; price: number; id: string }) => {
      if (!selectedOrder) return
      // Optimistically update the local order list
      const newItem: OrderItem = {
        id: `temp-${Date.now()}`,
        order_id: selectedOrder.id,
        menu_item_id: null,
        name: addedItem.name,
        unit_price: addedItem.price,
        quantity: 1,
        notes: null,
        status: "pending" as OrderStatus,
        created_at: new Date().toISOString(),
      }
      const newSubtotal = (selectedOrder.subtotal || 0) + addedItem.price
      const tax = Math.round(newSubtotal * TAX_RATE * 100) / 100
      const newTotal = Math.round((newSubtotal + tax) * 100) / 100
      const updated = {
        ...selectedOrder,
        order_items: [...(selectedOrder.order_items ?? []), newItem],
        subtotal: newSubtotal,
        tax,
        total: newTotal,
      }
      setSelectedOrder(updated)
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? updated : o))
      )
    },
    [selectedOrder]
  )

  const confirmPayment = () => {
    if (!selectedOrder) return
    startTransition(async () => {
      const method = payDialog.method as "cash" | "card" | "gcash" | "maya"
      const amountTendered =
        payDialog.method === "cash" ? parseFloat(payDialog.amountTendered) || undefined : undefined

      const payResult = await processPosPayment({
        order_id: selectedOrder.id,
        method,
        amount_tendered: amountTendered,
      })
      if (payResult?.error) {
        alert(payResult.error)
        return
      }
      setPayDialog((d) => ({ ...d, open: false }))
      // Update order status to completed and mark as paid
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: "completed", payment_status: "paid" }
            : o
        )
      )
      setSelectedOrder(null)
    })
  }

  const changeDue =
    selectedOrder && payDialog.method === "cash" && payDialog.amountTendered
      ? Math.max(0, parseFloat(payDialog.amountTendered) - Number(selectedOrder.total))
      : null

  return (
    <StaffShell 
      profile={profile} 
      items={NAV_ITEMS} 
      title="Orders"
      restaurantName={restaurantName}
      restaurantLogo={restaurantLogo}
    >
      {/* Header Section with Date Picker + Refresh */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and track all orders across the restaurant</p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker
            onRangeChange={(start, end) => {
              setDateStart(start)
              setDateEnd(end)
            }}
            initialStartDate={dateStart}
            initialEndDate={dateEnd}
          />
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="h-9"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Kanban-style Order Queue - Enterprise Grade */}
      <div className="grid grid-cols-7 gap-3 h-[calc(100vh-280px)]">
        {(["pending", "preparing", "ready", "served", "completed", "addon", "cancelled"] as const).map((columnStatus) => {
          const columnOrders = orders.filter((o) => {
            if (columnStatus === "addon") {
              // Add-on column: show ALL add-ons that are NOT served, completed, or cancelled
              return o.order_type === "additional" && 
                     o.status !== "served" && 
                     o.status !== "completed" && 
                     o.status !== "cancelled"
            }
            
            // For status columns: 
            // - Show orders with matching status
            // - BUT exclude served add-on orders (they should only appear in combined view)
            if (o.order_type === "additional" && o.status === "served") {
              return false
            }
            
            return o.status === columnStatus
          }).filter((o) => {
            // Apply search and date filters
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
            if (search) {
              const q = search.toLowerCase()
              return (
                o.id.toLowerCase().includes(q) ||
                (o.tables?.label ?? "").toLowerCase().includes(q) ||
                (o.customer_name ?? "").toLowerCase().includes(q) ||
                String(o.order_number).includes(q)
              )
            }
            return true
          })

          const config = STATUS_CONFIG[columnStatus]
          const colorMap: Record<string, { header: string; card: string; glow: string; urgent: string }> = {
            pending: { 
              header: "bg-gradient-to-r from-amber-600 to-amber-500",
              card: "border-l-amber-500 hover:border-amber-400 hover:shadow-amber-500/20",
              glow: "group-hover:shadow-amber-500/30",
              urgent: "bg-gradient-to-r from-red-500 to-orange-600 animate-pulse"
            },
            preparing: { 
              header: "bg-gradient-to-r from-blue-600 to-blue-500",
              card: "border-l-blue-500 hover:border-blue-400 hover:shadow-blue-500/20",
              glow: "group-hover:shadow-blue-500/30",
              urgent: "bg-gradient-to-r from-red-500 to-orange-600 animate-pulse"
            },
            ready: { 
              header: "bg-gradient-to-r from-emerald-600 to-emerald-500",
              card: "border-l-emerald-500 hover:border-emerald-400 hover:shadow-emerald-500/20",
              glow: "group-hover:shadow-emerald-500/30",
              urgent: "bg-gradient-to-r from-red-500 to-orange-600 animate-pulse"
            },
            served: { 
              header: "bg-gradient-to-r from-indigo-600 to-indigo-500",
              card: "border-l-indigo-500 hover:border-indigo-400 hover:shadow-indigo-500/20",
              glow: "group-hover:shadow-indigo-500/30",
              urgent: "bg-gradient-to-r from-red-500 to-orange-600"
            },
            completed: { 
              header: "bg-gradient-to-r from-slate-600 to-slate-500",
              card: "border-l-slate-400 hover:border-slate-300 hover:shadow-slate-500/20",
              glow: "group-hover:shadow-slate-500/30",
              urgent: "bg-gradient-to-r from-slate-500 to-slate-600"
            },
            addon: { 
              header: "bg-gradient-to-r from-indigo-500 to-purple-600",
              card: "border-l-indigo-500 hover:border-indigo-400 hover:shadow-indigo-500/20",
              glow: "group-hover:shadow-indigo-500/30",
              urgent: "bg-gradient-to-r from-red-500 to-orange-600 animate-pulse"
            },
            cancelled: { 
              header: "bg-gradient-to-r from-red-600 to-red-500",
              card: "border-l-red-400 hover:border-red-300 hover:shadow-red-500/20 opacity-60",
              glow: "group-hover:shadow-red-500/30",
              urgent: "bg-gradient-to-r from-red-500 to-rose-600"
            },
          }

          // Helper function to calculate running time with urgency levels
          const getRunningTime = (createdAt: string) => {
            const now = new Date()
            const created = new Date(createdAt)
            const diffMs = now.getTime() - created.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            
            let urgencyLevel: 'normal' | 'warning' | 'critical' = 'normal'
            if (diffMins >= 30) {
              urgencyLevel = 'critical'
            } else if (diffMins >= 15) {
              urgencyLevel = 'warning'
            }
            
            if (diffMins < 60) {
              return { text: `${diffMins}m`, urgencyLevel }
            } else {
              const hours = Math.floor(diffMins / 60)
              const mins = diffMins % 60
              return { text: `${hours}h ${mins}m`, urgencyLevel }
            }
          }

          return (
            <div key={columnStatus} className="flex flex-col min-h-0">
              {/* Column Header - Gradient with shadow */}
              <div className={`rounded-t-xl ${colorMap[columnStatus].header} px-3 py-2.5 shadow-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-white tracking-wide uppercase">{config.label}</h3>
                  <div className="flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-white tabular-nums">{columnOrders.length}</span>
                  </div>
                </div>
              </div>

              {/* Column Body - Premium scrollable container */}
              <div className="flex-1 space-y-2 p-2.5 bg-gradient-to-b from-muted/30 to-muted/10 border-x border-b rounded-b-xl overflow-y-auto shadow-inner">
                {columnOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                      <ClipboardList className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground">No orders</p>
                  </div>
                ) : (
                  columnOrders.map((order) => {
                    const runningTime = getRunningTime(order.created_at)
                    
                    return (
                      <button
                        key={order.id}
                        onClick={() => handleViewOrderDetails(order)}
                        className={`
                          group relative w-full text-left 
                          bg-gradient-to-br from-card via-card to-card/95
                          rounded-xl border-l-4 border-r border-t border-b
                          ${colorMap[columnStatus].card}
                          p-3 
                          transition-all duration-300 ease-out
                          hover:scale-[1.02] hover:-translate-y-0.5
                          hover:shadow-xl
                          active:scale-[0.98]
                          ${runningTime.urgencyLevel === 'critical' && columnStatus !== 'completed' && columnStatus !== 'cancelled' ? 'ring-2 ring-red-500/50' : ''}
                        `}
                      >
                        {/* Critical indicator glow */}
                        {runningTime.urgencyLevel === 'critical' && columnStatus !== 'completed' && columnStatus !== 'cancelled' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                            </span>
                          </div>
                        )}

                        {/* Table Number + Running Time - Horizontal Layout */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Table Number - Hero Element */}
                          <h4 className="font-black text-2xl tracking-tight leading-none text-foreground group-hover:text-primary transition-colors">
                            {order.tables?.label ?? "TO"}
                          </h4>

                          {/* Running Time - Right side with 3-tier urgency coloring */}
                          <div className={`
                            inline-flex items-center gap-1 px-2 py-1 rounded-lg shrink-0
                            ${columnStatus === 'completed' || columnStatus === 'cancelled'
                              ? 'bg-muted/80 text-muted-foreground'
                              : runningTime.urgencyLevel === 'critical'
                                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md ring-1 ring-red-400/50' 
                                : runningTime.urgencyLevel === 'warning'
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm'
                            }
                            transition-all duration-300
                          `}>
                            {runningTime.urgencyLevel === 'critical' && columnStatus !== 'completed' && columnStatus !== 'cancelled' ? (
                              <AlertCircle className="size-3 animate-pulse" />
                            ) : (
                              <Clock className="size-3" />
                            )}
                            <span className="text-xs font-bold tabular-nums tracking-tight">
                              {runningTime.text}
                            </span>
                          </div>
                        </div>

                        {/* Hover effect gradient overlay */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder && !payDialog.open}
        onOpenChange={(o) => !o && setSelectedOrder(null)}
      >
        <DialogContent className="w-full sm:max-w-lg md:max-w-xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
          {selectedOrder && (
            <>
              {/* Header band */}
              <div className="px-6 py-4 border-b bg-muted/30 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold">
                        Order #{selectedOrder.order_number}
                      </h2>
                      <Badge
                        className={
                          STATUS_CONFIG[selectedOrder?.status as OrderStatus]?.color ?? "bg-gray-100"
                        }
                      >
                        {STATUS_CONFIG[selectedOrder?.status as OrderStatus]?.label ??
                          selectedOrder?.status}
                      </Badge>
                      {selectedOrder.order_type === "additional" && (
                        <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                          <Plus className="mr-1 size-3" /> Add-On
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
                      {selectedOrder.tables?.label && (
                        <span className="font-medium text-foreground">
                          {selectedOrder.tables.label}
                          {selectedOrder.tables.zone ? ` (${selectedOrder.tables.zone})` : ""}
                        </span>
                      )}
                      {selectedOrder.customer_name && (
                        <span>· {selectedOrder.customer_name}</span>
                      )}
                      <span>· {formatDateTime(selectedOrder.created_at)}</span>
                    </div>
                  </div>
                  {selectedOrder.payment_status === "paid" && (
                    <Badge variant="outline" className="shrink-0">
                      <CreditCard className="size-3 mr-1" /> Paid
                    </Badge>
                  )}
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-6 py-5 space-y-5">
                  {/* Items list - Combined view if there are related orders */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Order Items
                        {relatedOrders.length > 1 && <span className="ml-2 text-[10px] text-primary">(Combined View)</span>}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {relatedOrders.length > 1 
                          ? `${relatedOrders.reduce((sum, o) => sum + (o.order_items?.length ?? 0), 0)} items`
                          : `${selectedOrder.order_items?.length ?? 0} item${(selectedOrder.order_items?.length ?? 0) !== 1 ? "s" : ""}`
                        }
                      </span>
                    </div>
                    
                    {relatedOrders.length > 1 ? (
                      // Combined view - show all orders grouped (main order first, then add-ons)
                      <div className="space-y-3">
                        {relatedOrders
                          .sort((a, b) => {
                            // Main orders first, then add-ons
                            if (a.order_type === "additional" && b.order_type !== "additional") return 1
                            if (a.order_type !== "additional" && b.order_type === "additional") return -1
                            // If both same type, sort by created_at (oldest first)
                            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                          })
                          .map((relatedOrder) => (
                          <div key={relatedOrder.id} className="space-y-1.5 rounded-lg border bg-card overflow-hidden">
                            {/* Order header */}
                            <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground">
                                  Order #{relatedOrder.order_number}
                                </span>
                                {relatedOrder.order_type === "additional" && (
                                  <>
                                    <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] h-5 px-2 flex items-center gap-1">
                                      <Plus className="size-2.5" /> Add-On
                                    </Badge>
                                    {/* Status badge for add-on orders */}
                                    <Badge className={`${STATUS_CONFIG[relatedOrder.status as OrderStatus]?.color ?? "bg-gray-100"} text-[10px] h-5 px-2`}>
                                      {STATUS_CONFIG[relatedOrder.status as OrderStatus]?.label ?? relatedOrder.status}
                                    </Badge>
                                  </>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDateTime(relatedOrder.created_at)}
                              </span>
                            </div>
                            
                            {/* Order items */}
                            {relatedOrder.order_items?.map((item, idx) => (
                              <div
                                key={item.id}
                                className={`flex items-center gap-3 px-4 py-3 ${
                                  idx > 0 ? "border-t" : ""
                                }`}
                              >
                                <div className="flex items-center justify-center size-7 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                                  {item.quantity}×
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium leading-tight truncate">
                                    {item.name}
                                  </p>
                                  {item.notes && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                      {item.notes}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {formatCurrency(Number(item.unit_price))} each
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-semibold tabular-nums">
                                    {formatCurrency(Number(item.unit_price) * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Single order view
                      <div className="space-y-1.5 rounded-lg border bg-card overflow-hidden">
                        {selectedOrder.order_items?.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 px-4 py-3 ${
                              idx > 0 ? "border-t" : ""
                            }`}
                          >
                            <div className="flex items-center justify-center size-7 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                              {item.quantity}×
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight truncate">
                                {item.name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {item.notes}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatCurrency(Number(item.unit_price))} each
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold tabular-nums">
                                {formatCurrency(Number(item.unit_price) * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Totals - Combined if multiple related orders */}
                  <section className="rounded-lg border bg-muted/20 p-4 space-y-2">
                    {relatedOrders.length > 1 ? (
                      // Combined totals
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Combined Subtotal</span>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(relatedOrders.reduce((sum, o) => sum + Number(o.subtotal), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax (12%)</span>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(relatedOrders.reduce((sum, o) => sum + Number(o.tax), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline border-t pt-2 mt-2">
                          <span className="text-sm font-semibold">Combined Total</span>
                          <span className="text-xl font-bold text-primary tabular-nums">
                            {formatCurrency(relatedOrders.reduce((sum, o) => sum + Number(o.total), 0))}
                          </span>
                        </div>
                      </>
                    ) : (
                      // Single order totals
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(Number(selectedOrder.subtotal))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax (12%)</span>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(Number(selectedOrder.tax))}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline border-t pt-2 mt-2">
                          <span className="text-sm font-semibold">Total</span>
                          <span className="text-xl font-bold text-primary tabular-nums">
                            {formatCurrency(Number(selectedOrder.total))}
                          </span>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </div>

              {/* Footer actions — proper corporate layout */}
              <div className="border-t px-6 py-4 shrink-0 bg-muted/10">
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
                  {/* Left side: secondary actions */}
                  <div className="flex gap-2 flex-wrap">
                    {selectedOrder.payment_status !== "paid" &&
                      selectedOrder?.status !== "cancelled" && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setShowMenuModal(true)}
                            disabled={pending}
                            size="sm"
                          >
                            <Plus className="size-3.5" />
                            <span className="ml-1.5">Add Items</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setOrderToCancel(selectedOrder)
                              setShowCancelModal(true)
                            }}
                            disabled={pending}
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="size-3.5" />
                            <span className="ml-1.5">Cancel Order</span>
                          </Button>
                        </>
                      )}
                  </div>

                  {/* Right side: primary action + close */}
                  <div className="flex gap-2 sm:ml-auto">
                    <Button variant="ghost" onClick={() => setSelectedOrder(null)} size="sm">
                      Close
                    </Button>
                    {selectedOrder.payment_status !== "paid" &&
                      selectedOrder?.status !== "cancelled" && (
                        <>
                          {selectedOrder?.status &&
                            NEXT_STATUS[selectedOrder.status as OrderStatus] &&
                            selectedOrder.status !== "served" && (
                              <Button
                                onClick={() =>
                                  handleStatusUpdate(
                                    selectedOrder,
                                    NEXT_STATUS[selectedOrder.status as OrderStatus]!
                                  )
                                }
                                disabled={pending}
                                size="sm"
                              >
                                {STATUS_ACTION[selectedOrder.status as OrderStatus]?.icon}
                                <span className="ml-1.5">
                                  {STATUS_ACTION[selectedOrder.status as OrderStatus]?.label}
                                </span>
                              </Button>
                            )}
                          {selectedOrder?.status === "served" && (
                            <Button
                              onClick={() => openPayDialog(selectedOrder)}
                              disabled={pending}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CreditCard className="size-3.5" />
                              <span className="ml-1.5">Process Payment</span>
                            </Button>
                          )}
                          {selectedOrder?.status === "completed" && (
                            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400">
                              <Check className="size-3 mr-1" /> Completed
                            </Badge>
                          )}
                        </>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog - Redesigned to match reference */}
      <Dialog
        open={payDialog.open}
        onOpenChange={(o) => setPayDialog((d) => ({ ...d, open: o }))}
      >
        <DialogContent 
          showCloseButton={false}
          className="w-[920px] h-[820px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-48px)] p-0 gap-0 overflow-hidden flex flex-col rounded-2xl"
        >
          {selectedOrder && (
            <>
              {/* Dark Blue Header - Fixed at top - ~82px */}
              <div className="shrink-0 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <CreditCard className="size-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Process Payment</h2>
                    <p className="text-xs text-slate-300 leading-tight">Complete the payment to close the order</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">TABLE</p>
                    <p className="text-lg font-black text-white leading-tight">{selectedOrder.tables?.label || "TO"}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-600" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">ORDER</p>
                    <p className="text-lg font-black text-white leading-tight">#{selectedOrder.order_number}</p>
                  </div>
                  <button
                    onClick={() => setPayDialog((d) => ({ ...d, open: false }))}
                    className="ml-3 size-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="size-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Main Content - NO SCROLL, perfectly fitted - ~655px */}
              <div className="flex-1 px-6 py-3.5 space-y-2.5 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                {/* Amount Due + Order Summary Grid - ~145px */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Left: Amount Due */}
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-900 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className="size-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">₱</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide leading-tight">Amount Due</p>
                      </div>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-tight">
                      {formatCurrency(Number(selectedOrder.total)).replace('₱', '₱')}
                    </p>
                  </div>

                  {/* Right: Order Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Items</span>
                      <span className="font-black text-lg text-slate-900 dark:text-white">
                        {selectedOrder.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Subtotal</span>
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {formatCurrency(Number(selectedOrder.subtotal))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Service Charge (10%)</span>
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {formatCurrency(Number(selectedOrder.tax))}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t-2 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900 dark:text-white">Total</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          {formatCurrency(Number(selectedOrder.total))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection - ~155px */}
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Select Payment Method</h3>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">Choose a payment method to proceed.</p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { id: 'cash', label: 'Cash', img: '/Cash.png', color: 'emerald' },
                      { id: 'card', label: 'Card', img: '/Card.png', color: 'slate' },
                      { id: 'gcash', label: 'GCash', img: '/Gcash.png', color: 'blue' },
                      { id: 'maya', label: 'PayMaya', img: '/Paymaya.png', color: 'emerald' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayDialog((d) => ({ ...d, method: method.id as any, amountTendered: "" }))}
                        className={`relative rounded-xl border-2 p-2.5 transition-all duration-200 ${
                          payDialog.method === method.id
                            ? `border-${method.color}-600 bg-${method.color}-50 dark:bg-${method.color}-950/30 shadow-xl scale-105`
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:scale-102'
                        }`}
                      >
                        {payDialog.method === method.id && (
                          <div className={`absolute -top-2 -right-2 size-6 rounded-full bg-${method.color}-600 flex items-center justify-center shadow-lg z-10`}>
                            <Check className="size-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                        <div className="w-full h-20 mb-1.5 flex items-center justify-center">
                          <img src={method.img} alt={method.label} className="max-w-full max-h-full object-contain" />
                        </div>
                        <p className={`text-center text-xs font-black leading-tight ${
                          payDialog.method === method.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {method.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Amount Input - Dynamic height based on state */}
                {payDialog.method === "cash" && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Amount Tendered */}
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Amount Tendered</h3>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">Enter the cash amount received</p>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₱</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={payDialog.amountTendered}
                          onChange={(e) => setPayDialog((d) => ({ ...d, amountTendered: e.target.value }))}
                          className="pl-9 h-12 text-xl font-black tabular-nums border-2 rounded-xl"
                        />
                      </div>
                      <div className="flex gap-2">
                        {[100, 500, 1000].map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const current = parseFloat(payDialog.amountTendered) || 0
                              setPayDialog((d) => ({ ...d, amountTendered: String(current + amount) }))
                            }}
                            className="flex-1 h-8 text-xs font-bold rounded-lg"
                          >
                            +{amount}
                          </Button>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPayDialog((d) => ({ ...d, amountTendered: String(Math.ceil(Number(selectedOrder.total))) }))}
                          className="px-2.5 h-8 text-xs font-bold rounded-lg"
                        >
                          Exact
                        </Button>
                      </div>
                    </div>

                    {/* Change Due */}
                    {changeDue !== null && changeDue >= 0 && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-3 border-2 border-emerald-200 dark:border-emerald-900 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="size-6 rounded-full bg-emerald-600 flex items-center justify-center">
                            <Check className="size-3.5 text-white stroke-[3]" />
                          </div>
                          <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-400 leading-tight">Change Due</h3>
                        </div>
                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-tight">
                          {formatCurrency(changeDue)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Info */}
                {payDialog.method === "cash" && payDialog.amountTendered && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2.5 border border-blue-200 dark:border-blue-900 flex items-center gap-2">
                    <AlertCircle className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="text-xs leading-tight">
                      <span className="font-bold text-blue-900 dark:text-blue-200">Payment method: Cash</span>
                      <span className="text-blue-700 dark:text-blue-300"> • </span>
                      <span className="text-blue-700 dark:text-blue-300">
                        {formatCurrency(parseFloat(payDialog.amountTendered))} received
                        {changeDue !== null && changeDue > 0 && ` • ${formatCurrency(changeDue)} change`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Fixed at bottom - ~83px */}
              <div className="shrink-0 px-6 py-3 bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2.5">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-[10px]">1</kbd>
                    <span className="text-[10px]">Cash</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-[10px]">2</kbd>
                    <span className="text-[10px]">Card</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-[10px]">3</kbd>
                    <span className="text-[10px]">GCash</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-[10px]">4</kbd>
                    <span className="text-[10px]">PayMaya</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-[10px]">Esc</kbd>
                    <span className="text-[10px]">Cancel</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-[10px]">Enter</kbd>
                    <span className="text-[10px]">Complete</span>
                  </span>
                </div>
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => setPayDialog((d) => ({ ...d, open: false }))}
                    className="h-9 px-5 text-xs font-bold rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmPayment}
                    disabled={
                      pending ||
                      (payDialog.method === "cash" &&
                        (!payDialog.amountTendered ||
                          parseFloat(payDialog.amountTendered) < Number(selectedOrder.total)))
                    }
                    className="h-9 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    {pending ? (
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    ) : (
                      <CreditCard className="size-3.5 mr-1.5" />
                    )}
                    Complete Payment
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Menu Browser Modal */}
      {selectedOrder && (
        <MenuBrowserModal
          open={showMenuModal}
          onClose={() => setShowMenuModal(false)}
          orderId={selectedOrder?.id ?? ""}
          tableId={selectedOrder?.table_id ?? null}
          onItemAdded={handleMenuItemAdded}
          onAddonOrderCreated={(newOrderId) => {
            // Refresh orders list to show new add-on order
            window.location.reload()
          }}
          getMenu={getPosMenu}
          addItem={addPosOrderItem}
          createAddonOrder={createPosAddonOrder}
        />
      )}

      {/* Cancel Order Modal */}
      {orderToCancel && (
        <CancelOrderModal
          order={orderToCancel}
          open={showCancelModal}
          onClose={() => {
            setShowCancelModal(false)
            setOrderToCancel(null)
          }}
          onSuccess={handleCancelSuccess}
        />
      )}
    </StaffShell>
  )
}

function OrderCard({
  order,
  onView,
  onStatusUpdate,
  onPay,
  pending,
}: {
  order: OrderWithItems
  onView: () => void
  onStatusUpdate: (s: OrderStatus) => void
  onPay: () => void
  pending: boolean
}) {
  const next = order.status ? NEXT_STATUS[order.status as OrderStatus] : undefined

  return (
    <Card>
      <CardHeader className="pb-3">
        {/* Header: Order # + Status Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Order</p>
            <CardTitle className="text-base font-bold tracking-tight">
              #{order.order_number}
            </CardTitle>
          </div>
          <Badge className={STATUS_CONFIG[order.status as OrderStatus]?.color ?? "bg-gray-100"}>
            {STATUS_CONFIG[order.status as OrderStatus]?.label ?? order.status}
          </Badge>
        </div>
      </CardHeader>

      {/* Center: Table Number (Hero) */}
      <CardContent className="py-8 space-y-1">
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
        </div>
      </CardContent>

      {/* Bottom: Action Buttons */}
      <CardContent className="pt-0 pb-4">
        {/* Payment badge */}
        {order.payment_status === "paid" && (
          <div className="mb-3">
            <Badge variant="outline" className="w-full justify-center text-green-700 border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400">
              <CreditCard className="size-3 mr-1" /> Paid
            </Badge>
          </div>
        )}
        {order.payment_status === "pending" && (
          <div className="mb-3">
            <Badge variant="secondary" className="w-full justify-center">
              Payment Pending
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
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
              {STATUS_ACTION[order.status as OrderStatus]?.icon}
              <span className="ml-1.5">{STATUS_ACTION[order.status as OrderStatus]?.label}</span>
            </Button>
          )}
          {order.status === "served" && order.payment_status !== "paid" && (
            <Button size="sm" onClick={onPay} disabled={pending} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <CreditCard className="size-3.5" />
              <span className="ml-1.5">Pay</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}