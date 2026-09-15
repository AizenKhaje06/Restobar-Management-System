"use client"

import { useState, useTransition, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  Users,
  Receipt,
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
  { href: "/pos/cashflow", label: "Cashflow", icon: "Wallet" },
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

  // Real-time subscription for orders
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('pos-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('[POS Orders] Order change:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            // Fetch the complete order with items
            const { data } = await supabase
              .from('orders')
              .select(`
                *,
                order_items(*, menu_items(image_url)),
                tables(label, zone)
              `)
              .eq('id', payload.new.id)
              .single()
            
            if (data) {
              // Transform data
              const transformed = {
                ...data,
                order_items: (data.order_items ?? []).map((item: any) => ({
                  ...item,
                  image_url: item.menu_items?.image_url ?? null,
                  menu_items: undefined,
                })),
              } as OrderWithItems
              
              setOrders((prev) => [transformed, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const { data } = await supabase
              .from('orders')
              .select(`
                *,
                order_items(*, menu_items(image_url)),
                tables(label, zone)
              `)
              .eq('id', payload.new.id)
              .single()
            
            if (data) {
              const transformed = {
                ...data,
                order_items: (data.order_items ?? []).map((item: any) => ({
                  ...item,
                  image_url: item.menu_items?.image_url ?? null,
                  menu_items: undefined,
                })),
              } as OrderWithItems
              
              setOrders((prev) =>
                prev.map((o) => (o.id === transformed.id ? transformed : o))
              )
              
              // Update selected order if it's open
              if (selectedOrder?.id === transformed.id) {
                setSelectedOrder(transformed)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedOrder])

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
    
    // Hide SERVED MAIN orders if there are active additional orders for the same table
    if (o.order_type === "initial" && o.status === "served" && o.table_id) {
      const hasActiveAddons = orders.some(
        (other) =>
          other.table_id === o.table_id &&
          other.order_type === "additional" &&
          other.status !== "served" &&
          other.status !== "completed" &&
          other.status !== "cancelled"
      )
      if (hasActiveAddons) return false // Hide served main order, show only active add-ons
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
              {/* Header band - Amber/Orange gradient like Table Account */}
              <div className="px-6 py-4 border-b bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Order Account
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-primary mt-0.5">
                      #{selectedOrder.order_number}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {selectedOrder.tables?.label && (
                        <p className="text-xs text-muted-foreground">
                          {selectedOrder.tables.label}
                          {selectedOrder.tables.zone ? ` · ${selectedOrder.tables.zone}` : ""}
                        </p>
                      )}
                      {selectedOrder.order_type === "additional" && (
                        <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-[10px] h-4 px-1.5">
                          <Plus className="mr-1 size-2.5" /> Add-On
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={
                      STATUS_CONFIG[selectedOrder?.status as OrderStatus]?.color ?? "bg-gray-100"
                    }
                  >
                    {STATUS_CONFIG[selectedOrder?.status as OrderStatus]?.label ??
                      selectedOrder?.status}
                  </Badge>
                </div>
                {/* Order info card - like Session Host card */}
                <div className="mt-3 rounded-lg bg-white/60 dark:bg-black/20 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {selectedOrder.customer_name && (
                        <>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Customer
                          </p>
                          <p className="text-sm font-bold truncate">
                            {selectedOrder.customer_name}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Started {formatDateTime(selectedOrder.created_at)}
                      </p>
                    </div>
                    {selectedOrder.payment_status === "paid" && (
                      <Badge variant="outline" className="shrink-0 text-[10px] h-5">
                        <CreditCard className="size-2.5 mr-1" /> Paid
                      </Badge>
                    )}
                  </div>
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
                                {/* Item Image */}
                                <div className="size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                  {item.image_url ? (
                                    <img 
                                      src={item.image_url} 
                                      alt={item.name}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <div className="size-full flex items-center justify-center">
                                      <UtensilsCrossed className="size-5 text-muted-foreground/40" />
                                    </div>
                                  )}
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
                            {/* Item Image */}
                            <div className="size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="size-full flex items-center justify-center">
                                  <UtensilsCrossed className="size-5 text-muted-foreground/40" />
                                </div>
                              )}
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

                  {/* Totals - Combined if multiple related orders - Styled like Table Account */}
                  <section className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
                    {relatedOrders.length > 1 ? (
                      // Combined totals
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {relatedOrders.length} order{relatedOrders.length !== 1 ? "s" : ""} · {relatedOrders.reduce((sum, o) => sum + (o.order_items?.length ?? 0), 0)} items
                          </span>
                          <span className="tabular-nums font-semibold">
                            {formatCurrency(relatedOrders.reduce((sum, o) => sum + Number(o.subtotal), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(relatedOrders.reduce((sum, o) => sum + Number(o.tax), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline border-t pt-2 mt-1">
                          <span className="text-sm font-semibold">Amount Due</span>
                          <span className="text-2xl font-black text-primary tabular-nums">
                            {formatCurrency(relatedOrders.reduce((sum, o) => sum + Number(o.total), 0))}
                          </span>
                        </div>
                      </>
                    ) : (
                      // Single order totals
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            1 order · {selectedOrder.order_items?.length ?? 0} item{(selectedOrder.order_items?.length ?? 0) !== 1 ? "s" : ""}
                          </span>
                          <span className="tabular-nums font-semibold">
                            {formatCurrency(Number(selectedOrder.subtotal))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(Number(selectedOrder.tax))}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline border-t pt-2 mt-1">
                          <span className="text-sm font-semibold">Amount Due</span>
                          <span className="text-2xl font-black text-primary tabular-nums">
                            {formatCurrency(Number(selectedOrder.total))}
                          </span>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </div>

              {/* Footer - Matching Table Account style */}
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

      {/* Payment Dialog - Professional Layout */}
      <Dialog
        open={payDialog.open}
        onOpenChange={(o) => setPayDialog((d) => ({ ...d, open: o }))}
      >
        <DialogContent 
          showCloseButton={false}
          className="w-[1000px] !min-w-[1000px] max-h-[90vh] !max-w-[1000px] p-0 gap-0 overflow-hidden flex flex-col rounded-2xl"
        >
          {selectedOrder && (
            <>
              {/* Modern Header with Restaurant Branding */}
              <div className="shrink-0 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="size-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white leading-tight">Restaubar</h2>
                    <p className="text-xs text-slate-300 leading-tight">Good Food • Great Vibes</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="size-4" />
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Table</p>
                      <p className="text-base font-black leading-tight">{selectedOrder.tables?.label || "TO"}</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-600" />
                  <div className="flex items-center gap-2 text-white">
                    <Receipt className="size-4" />
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Order #</p>
                      <p className="text-base font-black leading-tight">{selectedOrder.order_number}</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-600" />
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="size-4" />
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-base font-black leading-tight">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPayDialog((d) => ({ ...d, open: false }))}
                    className="ml-2 size-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="size-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Main Content - Two Column Layout */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="flex h-full min-w-[1000px]">
                  {/* Left Column - Payment Input */}
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                    {/* Amount Due Card */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                          <CreditCard className="size-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Amount Due</p>
                          <p className="text-4xl font-black text-white tabular-nums mt-1">
                            {formatCurrency(Number(selectedOrder.total))}
                          </p>
                          <p className="text-[11px] text-blue-100 mt-1.5">
                            Total items: {selectedOrder.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} | Service charge: {formatCurrency(Number(selectedOrder.tax))}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">Select Payment Method</h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5">Choose a payment method to proceed.</p>
                      
                      <div className="grid grid-cols-4 gap-2.5">
                        {[
                          { id: 'cash', label: 'Cash', img: '/Cash.png' },
                          { id: 'card', label: 'Card', img: '/Card.png' },
                          { id: 'gcash', label: 'GCash', img: '/Gcash.png' },
                          { id: 'maya', label: 'Maya', img: '/Paymaya.png' },
                        ].map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPayDialog((d) => ({ ...d, method: method.id as any, amountTendered: "" }))}
                            className={`relative rounded-xl border-2 p-2.5 transition-all duration-200 ${
                              payDialog.method === method.id
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg scale-105'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {payDialog.method === method.id && (
                              <div className="absolute -top-2 -right-2 size-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg z-10">
                                <Check className="size-3.5 text-white stroke-[3]" />
                              </div>
                            )}
                            <div className="w-full h-12 mb-1.5 flex items-center justify-center">
                              <img src={method.img} alt={method.label} className="max-w-full max-h-full object-contain" />
                            </div>
                            <p className={`text-center text-xs font-black ${
                              payDialog.method === method.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {method.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cash Input with Numpad */}
                    {payDialog.method === "cash" && (
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">Amount Tendered</h3>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5">Enter the cash amount received.</p>
                        
                        <div className="relative mb-3">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">₱</span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={payDialog.amountTendered}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '')
                              setPayDialog((d) => ({ ...d, amountTendered: value }))
                            }}
                            className="pl-11 h-14 text-2xl font-black tabular-nums border-2 rounded-xl text-center"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Numpad */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '00', 0, '⌫'].map((num) => (
                            <Button
                              key={num}
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (num === '⌫') {
                                  setPayDialog((d) => ({ ...d, amountTendered: d.amountTendered.slice(0, -1) }))
                                } else {
                                  setPayDialog((d) => ({ ...d, amountTendered: d.amountTendered + num }))
                                }
                              }}
                              className="h-11 text-lg font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {num}
                            </Button>
                          ))}
                        </div>

                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                          {[100, 500, 1000].map((amount) => (
                            <Button
                              key={amount}
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const current = parseFloat(payDialog.amountTendered) || 0
                                setPayDialog((d) => ({ ...d, amountTendered: String(current + amount) }))
                              }}
                              className="h-9 text-sm font-bold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                            >
                              +{amount}
                            </Button>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPayDialog((d) => ({ ...d, amountTendered: String(Number(selectedOrder.total)) }))}
                            className="h-9 text-sm font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 border-emerald-200 dark:border-emerald-800"
                          >
                            Exact
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Summary */}
                  <div className="w-[400px] shrink-0 bg-white dark:bg-slate-900 border-l-4 border-emerald-500 flex flex-col h-full">
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                      {/* Items Summary */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">Items ({selectedOrder.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0})</h3>
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(Number(selectedOrder.subtotal))}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(Number(selectedOrder.subtotal))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Service Charge</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(Number(selectedOrder.tax))}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t-2 border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900 dark:text-white">Total</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                              {formatCurrency(Number(selectedOrder.total))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Change Due Card */}
                      {payDialog.method === "cash" && changeDue !== null && changeDue > 0 && (
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 shadow-lg">
                          <div className="flex items-start gap-3">
                            <div className="size-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                              <Check className="size-5 text-white stroke-[3]" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-black text-emerald-50">CHANGE DUE</h3>
                              <p className="text-4xl font-black text-white tabular-nums mt-2">
                                {formatCurrency(changeDue)}
                              </p>
                              <div className="mt-3 pt-3 border-t border-emerald-400/30 space-y-1 text-xs text-emerald-50">
                                <div className="flex justify-between">
                                  <span>{formatCurrency(parseFloat(payDialog.amountTendered))} received</span>
                                  <span>−</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{formatCurrency(Number(selectedOrder.total))} total</span>
                                  <span>=</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary Info */}
                      {payDialog.method === "cash" && payDialog.amountTendered && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                          <div className="flex gap-2">
                            <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">Payment Summary</h4>
                              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                <div className="flex justify-between gap-4">
                                  <span>Cash Received</span>
                                  <span className="font-bold">{formatCurrency(parseFloat(payDialog.amountTendered))}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Total Amount</span>
                                  <span className="font-bold">{formatCurrency(Number(selectedOrder.total))}</span>
                                </div>
                                <div className="flex justify-between gap-4 pt-1 border-t border-blue-200 dark:border-blue-800">
                                  <span className="font-bold">Change Due</span>
                                  <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(changeDue || 0)}</span>
                                </div>
                              </div>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                                <strong>Payment method:</strong> Cash<br/>
                                Please confirm the amount before completing.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <Button
                        onClick={confirmPayment}
                        disabled={
                          pending ||
                          (payDialog.method === "cash" &&
                            (!payDialog.amountTendered ||
                              parseFloat(payDialog.amountTendered) < Number(selectedOrder.total)))
                        }
                        className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                        size="lg"
                      >
                        {pending ? (
                          <Loader2 className="size-5 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="size-5 mr-2" />
                        )}
                        Complete Payment →
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPayDialog((d) => ({ ...d, open: false }))}
                        className="w-full h-10 text-sm font-bold rounded-lg"
                      >
                        <X className="size-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Keyboard Shortcuts */}
              <div className="shrink-0 px-6 py-3 bg-slate-800 border-t border-slate-700">
                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-slate-700 border border-slate-600 font-mono font-bold">1</kbd>
                    <span>Cash</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-slate-700 border border-slate-600 font-mono font-bold">2</kbd>
                    <span>Card</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-slate-700 border border-slate-600 font-mono font-bold">3</kbd>
                    <span>GCash</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-slate-700 border border-slate-600 font-mono font-bold">4</kbd>
                    <span>PayMaya</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-slate-700 border border-slate-600 font-mono font-bold">Esc</kbd>
                    <span>Cancel</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-slate-700 border border-slate-600 font-mono font-bold">Enter</kbd>
                    <span>Complete</span>
                  </span>
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