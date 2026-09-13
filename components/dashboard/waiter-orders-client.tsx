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
  LogOut,
  Grid3x3,
  Users,
  CalendarDays,
  Plus,
  Receipt,
  ShoppingBag,
} from "lucide-react"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssistModal, type WaiterOrderForModal } from "@/components/dashboard/assist-modal"
import { WaiterAddonOrderModal } from "@/components/dashboard/waiter-addon-order-modal"
import { formatCurrency, formatTime, formatDateTime } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"
import type { Profile, OrderWithItems, OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  updateWaiterOrderStatus,
  assistWaiterOrder,
  confirmWaiterOrder,
  getWaiterTables,
  getWaiterMenu,
} from "@/app/actions/waiter"
import { signOut } from "@/app/actions/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
import { DateRangePicker } from "@/components/ui/date-range-picker"

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",  icon: <AlertCircle className="size-3.5" /> },
  confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <CheckCircle2 className="size-3.5" /> },
  preparing:  { label: "Preparing",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <ChefHat className="size-3.5" /> },
  ready:      { label: "Ready",       color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle2 className="size-3.5" /> },
  served:     { label: "Served",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: <UtensilsCrossed className="size-3.5" /> },
  completed:  { label: "Paid",  color: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400", icon: <CheckCircle2 className="size-3.5" /> },
  cancelled:  { label: "Cancelled",  color: "bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500", icon: <X className="size-3.5" /> },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  // Waiters can only:
  // 1. Confirm pending orders → Goes directly to Preparing (sent to kitchen)
  // 2. Mark "Ready" orders as "Served"
  pending: "preparing",  // Skip "confirmed", go straight to kitchen
  ready: "served",
  // Kitchen/Chef handles: preparing → ready
  // POS/Admin handles: served → completed (paid)
}

const STATUS_ACTION: Record<OrderStatus, { label: string; icon: React.ReactNode }> = {
  pending:   { label: "Send to Kitchen",  icon: <ChefHat className="size-3.5" /> },
  confirmed: { label: "Start Preparing", icon: <ChefHat className="size-3.5" /> },
  preparing: { label: "Mark Ready",      icon: <CheckCircle2 className="size-3.5" /> },
  ready:     { label: "Mark Served",     icon: <UtensilsCrossed className="size-3.5" /> },
  served:    { label: "Served",          icon: <UtensilsCrossed className="size-3.5" /> },
  completed: { label: "Paid",            icon: <CheckCircle2 className="size-3.5" /> },
  cancelled: { label: "Cancelled",       icon: <X className="size-3.5" /> },
}
interface WaiterOrder extends Omit<OrderWithItems, 'tables' | 'payment_status'> {
  tables?: { label: string | null; zone: string | null; assigned_waiter: string | null } | null
  payment_status?: string | null
  payment_method?: string | null
  priority?: "normal" | "high" | "urgent" | null
  special_requests?: string | null
  assisted_by_profile?: { id: string; full_name: string | null; username: string } | null
  served_by_profile?: { id: string; full_name: string | null; username: string } | null
  session_id?: string | null
}

export function WaiterOrdersClient({
  profile,
  initialOrders,
  restaurantName = "Lydias Lechon",
  restaurantLogo,
}: {
  profile: Profile
  initialOrders: WaiterOrder[]
  restaurantName?: string
  restaurantLogo?: string
}) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<OrderStatus | "all" | "complete" | "urgent">("all")
  const [dateStart, setDateStart] = useState<Date | null>(null)
  const [dateEnd, setDateEnd] = useState<Date | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<WaiterOrder | null>(null)
  const [relatedOrders, setRelatedOrders] = useState<WaiterOrder[]>([]) // For combined view
  const [pending, setPending] = useState<string | null>(null)
  const [assisting, setAssisting] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [assistModalOrder, setAssistModalOrder] = useState<WaiterOrderForModal | null>(null)
  
  // Tables management
  const [showTablesSheet, setShowTablesSheet] = useState(false)
  const [tables, setTables] = useState<any[]>([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [tableStatusFilter, setTableStatusFilter] = useState<"all" | "available" | "occupied" | "reserved" | "unavailable">("all")

  // Add-on order modal
  const [showAddonModal, setShowAddonModal] = useState(false)
  const [addonModalOrder, setAddonModalOrder] = useState<WaiterOrder | null>(null)
  const [menuData, setMenuData] = useState<{ categories: any[]; menuItems: any[] }>({ categories: [], menuItems: [] })
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
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
                updated[idx] = { ...updated[idx], ...payload.new } as WaiterOrder
                return updated
              }
              // New order — add it
              return [{ ...payload.new, tables: prev[idx]?.tables } as WaiterOrder, ...prev]
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
      // After confirmation, order goes directly to "preparing" (sent to kitchen)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "preparing" } : o))
      )
    } finally {
      setConfirming(null)
    }
  }, [])

  // Handle opening add-on order modal
  const handleOpenAddonModal = useCallback(async (order: WaiterOrder) => {
    if (!order.table_id) return
    
    setAddonModalOrder(order)
    setShowAddonModal(true)
    
    // Fetch menu data if not already loaded
    if (menuData.menuItems.length === 0 && !loadingMenu) {
      setLoadingMenu(true)
      try {
        const data = await getWaiterMenu()
        console.log('Menu data fetched:', data) // Debug log
        setMenuData(data)
        
        if (data.menuItems.length === 0) {
          toast.error("No menu items available. Please add items to the menu first.")
        }
      } catch (error) {
        console.error('Error fetching menu:', error) // Debug log
        toast.error("Failed to load menu")
      } finally {
        setLoadingMenu(false)
      }
    }
  }, [menuData.menuItems.length, loadingMenu])

  // Handle creating add-on order
  const handleCreateAddonOrder = useCallback(async (items: any[], notes: string) => {
    if (!addonModalOrder || !addonModalOrder.table_id) {
      throw new Error("No table selected")
    }

    // Create the add-on order via Supabase
    const orderData = {
      table_id: addonModalOrder.table_id,
      session_id: addonModalOrder.session_id,
      customer_name: addonModalOrder.customer_name,
      status: "confirmed" as const,
      payment_status: "unpaid" as const,
      order_type: "additional",
      assisted_by: profile.id,
      notes,
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }

    const tax = orderData.subtotal * 0.12
    const total = orderData.subtotal + tax

    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([{ ...orderData, tax, total }])
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: newOrder.id,
      menu_item_id: item.id,
      name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      notes: item.notes || null,
      status: "pending",
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Refresh orders list
    const { data: updatedOrders } = await supabase
      .from("orders")
      .select(`
        *,
        tables(label, zone, assigned_waiter),
        order_items(*),
        assisted_by_profile:profiles!orders_assisted_by_fkey(id, username, full_name),
        served_by_profile:profiles!orders_served_by_fkey(id, username, full_name)
      `)
      .order("created_at", { ascending: false })

    if (updatedOrders) {
      setOrders(updatedOrders as WaiterOrder[])
    }
  }, [addonModalOrder, profile.id, supabase])

  // Fetch all related orders for the same table/session (for combined view)
  const fetchRelatedOrders = useCallback(async (order: WaiterOrder) => {
    if (!order.table_id) return [order] // Take-out: only show this order
    
    // If viewing an add-on order, show only that add-on order
    if (order.order_type === "additional") {
      return [order]
    }
    
    // If viewing main order, show combined view (all orders for table)
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        tables(label, zone, assigned_waiter),
        order_items(*),
        assisted_by_profile:profiles!orders_assisted_by_fkey(id, username, full_name),
        served_by_profile:profiles!orders_served_by_fkey(id, username, full_name)
      `)
      .eq("table_id", order.table_id)
      .neq("status", "cancelled")
      .neq("payment_status", "paid")
      .order("created_at", { ascending: true })
    
    return (data as WaiterOrder[]) || [order]
  }, [supabase])

  // Handle viewing order details with combined view
  const handleViewOrderDetails = useCallback(async (order: WaiterOrder) => {
    setSelectedOrder(order)
    
    // Fetch related orders for combined view
    if (order.table_id) {
      const related = await fetchRelatedOrders(order)
      setRelatedOrders(related)
    } else {
      setRelatedOrders([order]) // Take-out: only show this order
    }
  }, [fetchRelatedOrders])

  // Calculate time elapsed for order (in minutes)
  const getOrderAge = useCallback((createdAt: string): number => {
    return Math.floor((currentTime.getTime() - new Date(createdAt).getTime()) / 60000)
  }, [currentTime])

  // Determine SLA status
  const getSLAStatus = useCallback((order: WaiterOrder): "normal" | "warning" | "critical" => {
    // Orders that are served/completed/cancelled no longer have SLA urgency for waiters
    if (order.status === "served" || order.status === "completed" || order.status === "cancelled") {
      return "normal"
    }
    
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
    // Orders that are served/completed/cancelled are no longer waiter's priority
    if (order.status === "served" || order.status === "completed" || order.status === "cancelled") {
      return "normal"
    }
    
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
      // Hide served add-on orders from the list (they'll show in combined view)
      if (o.order_type === "additional" && o.status === "served") {
        return false
      }
      
      // Hide paid/completed orders from ACTIVE view (waiter's job is done)
      if (tab === "all" && (o.payment_status === "paid" || o.status === "completed")) {
        return false
      }
      
      // COMPLETE filter - show all served orders (ready for payment)
      if (tab === "complete") {
        if (o.status !== "served") return false
      } else if (tab === "urgent") {
        // Urgent filter - show orders with urgent priority
        if (getOrderPriority(o) !== "urgent") return false
      } else if (tab !== "all") {
        // Status filter
        if (o.status !== tab) return false
      }
      
      // Date range filter
      if (dateStart || dateEnd) {
        const orderDate = new Date(o.created_at)
        // Reset time to compare only dates
        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())
        
        // If only start date is set (single date selection), use it as both start and end
        const effectiveStartDate = dateStart
        const effectiveEndDate = dateEnd || dateStart // Use start date if end is null
        
        if (effectiveStartDate) {
          const startDateOnly = new Date(effectiveStartDate.getFullYear(), effectiveStartDate.getMonth(), effectiveStartDate.getDate())
          if (orderDateOnly < startDateOnly) return false
        }
        
        if (effectiveEndDate) {
          const endDateOnly = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate())
          if (orderDateOnly > endDateOnly) return false
        }
      }
      
      // Search filter
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
      // PRIORITY 1: ALWAYS put paid/completed/served orders at the bottom (in ACTIVE tab)
      const aIsBottom = a.payment_status === "paid" || a.status === "completed" || a.status === "served"
      const bIsBottom = b.payment_status === "paid" || b.status === "completed" || b.status === "served"
      
      if (aIsBottom && !bIsBottom) return 1 // a goes down
      if (!aIsBottom && bIsBottom) return -1 // b goes down
      
      // If both are at bottom (both served/paid), or both are active, apply secondary sorting
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
  }, [orders, tab, search, sortBy, getOrderPriority, dateStart, dateEnd])

  // Filter orders by date range first for accurate counts
  const dateFilteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Date range filter
      if (dateStart || dateEnd) {
        const orderDate = new Date(o.created_at)
        // Reset time to compare only dates
        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())
        
        // If only start date is set (single date selection), use it as both start and end
        const effectiveStartDate = dateStart
        const effectiveEndDate = dateEnd || dateStart // Use start date if end is null
        
        if (effectiveStartDate) {
          const startDateOnly = new Date(effectiveStartDate.getFullYear(), effectiveStartDate.getMonth(), effectiveStartDate.getDate())
          if (orderDateOnly < startDateOnly) return false
        }
        
        if (effectiveEndDate) {
          const endDateOnly = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate())
          if (orderDateOnly > endDateOnly) return false
        }
      }
      return true
    })
  }, [orders, dateStart, dateEnd])

  const counts = dateFilteredOrders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Count unique TABLES with served orders that will actually be displayed
  const completeCount = useMemo(() => {
    return dateFilteredOrders.filter(o => {
      // Count all served orders EXCEPT served add-ons (they're hidden from list)
      if (o.status === "served") {
        // Exclude served add-on orders (they're combined in the detail view)
        if (o.order_type === "additional") return false
        return true
      }
      return false
    }).length
  }, [dateFilteredOrders])

  // Count urgent orders (based on priority) - filtered by date
  const urgentCount = useMemo(() => {
    return dateFilteredOrders.filter(o => getOrderPriority(o) === "urgent").length
  }, [dateFilteredOrders, getOrderPriority])

  // Active count excludes paid/completed orders (waiter's job is done)
  const activeTabCount = useMemo(() => {
    return dateFilteredOrders.filter(o => 
      o.payment_status !== "paid" && 
      o.status !== "completed" &&
      !(o.order_type === "additional" && o.status === "served") // Also exclude served add-ons
    ).length
  }, [dateFilteredOrders])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      // signOut() will automatically redirect to /login
    } catch (error) {
      // Next.js redirect() throws NEXT_REDIRECT error - this is expected behavior
      // Check if it's a redirect error (which means logout was successful)
      if (error && typeof error === 'object' && 'digest' in error) {
        const digest = (error as { digest?: string }).digest
        if (digest?.includes('NEXT_REDIRECT')) {
          // This is a successful redirect, not an actual error
          return
        }
      }
      // Only show error toast for actual errors
      setIsLoggingOut(false)
      toast.error("Failed to logout. Please try again.")
    }
  }

  const confirmLogout = () => {
    setShowLogoutDialog(false)
    handleLogout()
  }

  const loadTables = useCallback(async () => {
    setLoadingTables(true)
    try {
      const result = await getWaiterTables()
      if (result?.tables) {
        setTables(result.tables)
      }
    } finally {
      setLoadingTables(false)
    }
  }, [])

  // Load tables when sheet opens
  useEffect(() => {
    if (showTablesSheet) {
      loadTables()
    }
  }, [showTablesSheet, loadTables])

  // Filter tables based on status filter
  const filteredTables = useMemo(() => {
    if (tableStatusFilter === "all") return tables
    
    if (tableStatusFilter === "available") {
      // Available means: NO active orders AND status is not reserved/unavailable
      return tables.filter(t => 
        (!t.active_orders || t.active_orders.length === 0) && 
        t.status !== 'reserved' && 
        t.status !== 'unavailable'
      )
    }
    
    if (tableStatusFilter === "occupied") {
      // Occupied means: has active orders
      return tables.filter(t => t.active_orders && t.active_orders.length > 0)
    }
    
    // For reserved/unavailable, use the status field
    return tables.filter(t => t.status === tableStatusFilter)
  }, [tables, tableStatusFilter])

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Consistent Brand Colors */}
      <header className="sticky top-0 z-50 w-full border-b bg-black dark:bg-gradient-to-r dark:from-yellow-600 dark:via-amber-500 dark:to-yellow-400 shadow-lg">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            {restaurantLogo ? (
              <img 
                src={restaurantLogo} 
                alt={restaurantName}
                className="h-8 w-auto object-contain rounded-md"
              />
            ) : (
              <UtensilsCrossed className="size-6 text-white" />
            )}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-none text-white">{restaurantName}</h1>
              <p className="text-xs text-white/80">Waiter: {profile.full_name || profile.username}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-white hover:bg-white/10" />
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="text-white hover:bg-white/10">
              <RefreshCw className="size-4" />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowLogoutDialog(true)} className="text-white hover:bg-white/10">
              <LogOut className="size-4" />
              <span className="ml-2 hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header with Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar - Half width on desktop */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order #, table, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Right Side Buttons - Reordered: Time, Date Range, Tables */}
          <div className="flex flex-row gap-2 items-center w-full sm:w-auto sm:flex-1 sm:justify-end">
            {/* Sort Dropdown (Time) - First */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger size="sm" className={`!h-9 py-0 ${
                dateStart || dateEnd 
                  ? dateStart && dateEnd && dateStart.toDateString() !== dateEnd.toDateString()
                    ? 'w-auto min-w-[48px] px-3 sm:w-[165px] sm:px-3' // Date range - icon only on mobile
                    : 'w-[120px] sm:w-[165px]' // Single date - show text on mobile
                  : 'w-[165px]'
              }`}>
                <ArrowUpDown className={`size-4 ${
                  dateStart && dateEnd && dateStart.toDateString() !== dateEnd.toDateString() 
                    ? 'sm:mr-2' 
                    : 'mr-2'
                }`} />
                <span className={
                  dateStart && dateEnd && dateStart.toDateString() !== dateEnd.toDateString()
                    ? 'hidden sm:inline'
                    : ''
                }>
                  <SelectValue placeholder="Sort by..." />
                </span>
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
            
            {/* Date Range Picker - Second */}
            <DateRangePicker
              onRangeChange={(start, end) => {
                setDateStart(start)
                setDateEnd(end)
              }}
              initialStartDate={dateStart}
              initialEndDate={dateEnd}
            />
            
            {/* Tables Button - Last */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTablesSheet(true)}
              className={`h-9 ${
                dateStart || dateEnd
                  ? dateStart && dateEnd && dateStart.toDateString() !== dateEnd.toDateString()
                    ? 'w-auto min-w-[48px] px-3 sm:px-4' // Date range - icon only on mobile
                    : 'w-auto' // Single date - show text on mobile
                  : ''
              }`}
            >
              <Grid3x3 className={`size-4 ${
                dateStart && dateEnd && dateStart.toDateString() !== dateEnd.toDateString()
                  ? 'sm:mr-2'
                  : 'mr-2'
              }`} />
              <span className={
                dateStart && dateEnd && dateStart.toDateString() !== dateEnd.toDateString()
                  ? 'hidden sm:inline'
                  : ''
              }>Tables</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Now Clickable Filters */}
      <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {/* ACTIVE - Show all active orders */}
        <button
          onClick={() => setTab("all")}
          className={`rounded-lg border p-3 text-left transition-all ${
            tab === "all"
              ? "border-blue-600 bg-blue-500/20 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-blue-500" />
            <div className="text-xs text-muted-foreground uppercase font-semibold">ACTIVE</div>
          </div>
          <div className="mt-1 text-2xl font-bold">{activeTabCount}</div>
        </button>

        {/* PENDING - Show pending orders */}
        <button
          onClick={() => setTab("pending")}
          className={`rounded-lg border p-3 text-left transition-all ${
            tab === "pending"
              ? "border-red-600 bg-red-500/20 text-red-900 dark:text-red-200 ring-2 ring-red-500/30"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            <div className="text-xs text-muted-foreground uppercase font-semibold">PENDING</div>
          </div>
          <div className="mt-1 text-2xl font-bold">{counts["pending"] ?? 0}</div>
        </button>

        {/* URGENT - Show orders with urgent priority */}
        <button
          onClick={() => setTab(tab === "urgent" ? "all" : "urgent")}
          className={`rounded-lg border p-3 text-left transition-all ${
            tab === "urgent"
              ? "border-red-600 bg-red-500/20 text-red-900 dark:text-red-200 ring-2 ring-red-500/30"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            <div className="text-xs text-muted-foreground uppercase font-semibold">URGENT</div>
          </div>
          <div className="mt-1 text-2xl font-bold">{urgentCount}</div>
        </button>

        {/* COMPLETE - Show all served orders ready for payment */}
        <button
          onClick={() => setTab("complete")}
          className={`rounded-lg border p-3 text-left transition-all ${
            tab === "complete"
              ? "border-green-600 bg-green-500/20 text-green-900 dark:text-green-200 ring-2 ring-green-500/30"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-500" />
            <div className="text-xs text-muted-foreground uppercase font-semibold">COMPLETE</div>
          </div>
          <div className="mt-1 text-2xl font-bold">{completeCount}</div>
        </button>
      </div>

      {/* Orders Grid */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as OrderStatus | "all")}>
        <TabsContent value={tab} className="mt-0">
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
                      handleViewOrderDetails(order) // Use new handler for combined view
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
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } as WaiterOrder : o))
            )
            setAssistModalOrder(updated as any)
          }}
        />
      )}

      {/* Add-On Order Modal - Enterprise POS Style */}
      {addonModalOrder && (
        <WaiterAddonOrderModal
          open={showAddonModal}
          onOpenChange={setShowAddonModal}
          tableId={addonModalOrder.table_id || ""}
          tableName={addonModalOrder.tables?.label || "Unknown Table"}
          orderNumber={String(addonModalOrder.order_number)}
          menuItems={menuData.menuItems}
          onConfirm={handleCreateAddonOrder}
        />
      )}

      {/* Order Detail Dialog (for non-pending or non-claimed orders) - Enterprise Grade */}
      <Dialog
        open={!!selectedOrder && !assistModalOrder}
        onOpenChange={(o) => !o && setSelectedOrder(null)}
      >
        <DialogContent className="w-screen h-screen sm:w-auto sm:h-auto sm:max-w-2xl sm:max-h-[90vh] max-w-none p-0 sm:p-3 gap-0 flex flex-col">
          <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950 rounded-none sm:rounded-2xl overflow-hidden">
          {selectedOrder && (
            <>
              {/* Hero Header with Gradient */}
              <div className="relative overflow-hidden flex-shrink-0">
                {/* Background Gradient */}
                <div className={cn(
                  "absolute inset-0 opacity-10",
                  selectedOrder.payment_status === "paid" 
                    ? "bg-gradient-to-br from-emerald-500 to-green-600"
                    : selectedOrder.priority === "urgent"
                    ? "bg-gradient-to-br from-red-500 via-orange-500 to-amber-500"
                    : Math.floor((Date.now() - new Date(selectedOrder.created_at).getTime()) / (1000 * 60)) >= 30
                    ? "bg-gradient-to-br from-amber-500 to-orange-600"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                )} />
                
                <div className="relative p-4 sm:p-6 pb-4 sm:pb-5">
                  {/* Order Number - Hero Element */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">ORDER</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      #{selectedOrder.order_number}
                    </h2>
                  </div>

                  {/* Location & Customer */}
                  <div className="flex items-center gap-2 mb-4">
                    {selectedOrder.tables?.label ? (
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <Grid3x3 className="size-4" />
                        <span>{selectedOrder.tables.label}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShoppingBag className="size-4" />
                        <span>Take-Out</span>
                      </div>
                    )}
                    {selectedOrder.customer_name && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm font-medium text-foreground">
                          {selectedOrder.customer_name}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Status Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={cn(
                      "font-semibold shadow-sm",
                      STATUS_CONFIG[selectedOrder.status as OrderStatus]?.color
                    )}>
                      {STATUS_CONFIG[selectedOrder.status as OrderStatus]?.label}
                    </Badge>
                    
                    {selectedOrder.order_type === "additional" && (
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold shadow-sm">
                        <Plus className="mr-1 size-3" /> Add-On
                      </Badge>
                    )}

                    {selectedOrder.payment_status === "paid" && (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold shadow-sm">
                        <CheckCircle2 className="mr-1 size-3" /> Paid
                      </Badge>
                    )}

                    {/* Time Badge */}
                    <Badge variant="outline" className="ml-auto font-semibold">
                      <Clock className="mr-1 size-3" />
                      {(() => {
                        const elapsed = Math.floor(
                          (Date.now() - new Date(selectedOrder.created_at).getTime()) / (1000 * 60)
                        )
                        const hours = Math.floor(elapsed / 60)
                        const mins = elapsed % 60
                        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
                      })()}
                    </Badge>
                  </div>

                  {/* Created Date - Subtle */}
                  <p className="text-xs text-muted-foreground mt-3">
                    {formatDateTime(selectedOrder.created_at)}
                  </p>
                </div>

                {/* Bottom Border Accent */}
                <div className={cn(
                  "h-1",
                  selectedOrder.payment_status === "paid"
                    ? "bg-gradient-to-r from-emerald-500 to-green-600"
                    : selectedOrder.priority === "urgent"
                    ? "bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"
                    : Math.floor((Date.now() - new Date(selectedOrder.created_at).getTime()) / (1000 * 60)) >= 30
                    ? "bg-gradient-to-r from-amber-500 to-orange-600"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                )} />
              </div>

              {/* Scrollable Content Area - Combined View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* All Orders for this Table */}
                {relatedOrders.map((order, orderIndex) => {
                  const isMainOrder = order.order_type !== "additional"
                  const totalItems = order.order_items?.length || 0
                  
                  return (
                    <div key={order.id}>
                      {/* Order Header */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            ━━ Order #{order.order_number} {isMainOrder ? "(Main)" : "(Add-On)"} ━━
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={cn("text-xs", STATUS_CONFIG[order.status as OrderStatus]?.color)}>
                            {order.status === "served" && "✓ "}
                            {STATUS_CONFIG[order.status as OrderStatus]?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(order.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="rounded-lg border bg-muted/20 divide-y mb-4">
                        {order.order_items && order.order_items.length > 0 ? (
                          order.order_items.map((item) => (
                            <div key={item.id} className="p-3 flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-flex items-center justify-center size-6 rounded bg-primary/10 text-primary text-xs font-bold">
                                    {item.quantity}
                                  </span>
                                  <span className="font-medium text-sm text-foreground">{item.name}</span>
                                </div>
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground pl-8 mt-0.5">
                                    Note: {item.notes}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">
                                  {formatCurrency(Number(item.unit_price) * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">No items</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Combined Payment Summary */}
                <div className="rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Receipt className="size-4" />
                    Total Payment Summary
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      const combinedSubtotal = relatedOrders.reduce((sum, o) => sum + Number(o.subtotal), 0)
                      const combinedTax = relatedOrders.reduce((sum, o) => sum + Number(o.tax), 0)
                      const combinedTotal = relatedOrders.reduce((sum, o) => sum + Number(o.total), 0)
                      
                      return (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">{formatCurrency(combinedSubtotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-medium">{formatCurrency(combinedTax)}</span>
                          </div>
                          <div className="pt-2 mt-2 border-t flex items-center justify-between">
                            <span className="font-semibold">Total Amount</span>
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(combinedTotal)}
                            </span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Service Staff Section */}
                {(selectedOrder.assisted_by_profile || selectedOrder.served_by_profile) && (
                  <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="size-4" />
                      Service Staff
                    </h3>
                    <div className="space-y-2.5">
                      {selectedOrder.assisted_by_profile && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center size-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Users className="size-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Assisted by</p>
                            <p className="text-xs font-semibold text-foreground truncate">
                              {selectedOrder.assisted_by_profile.full_name || selectedOrder.assisted_by_profile.username}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDateTime(selectedOrder.created_at)}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.served_by_profile && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <UtensilsCrossed className="size-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Served by</p>
                            <p className="text-xs font-semibold text-foreground truncate">
                              {selectedOrder.served_by_profile.full_name || selectedOrder.served_by_profile.username}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDateTime(selectedOrder.updated_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex-shrink-0 border-t bg-muted/30 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                
                {/* Add Order Button - Only show if order is not completed/cancelled/paid */}
                {selectedOrder.status !== "completed" && 
                 selectedOrder.status !== "cancelled" && 
                 selectedOrder.payment_status !== "paid" && 
                 selectedOrder.table_id && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(null) // Close detail modal first
                      handleOpenAddonModal(selectedOrder)
                    }}
                    className="flex-1 font-semibold"
                  >
                    <Plus className="size-4" />
                    <span className="ml-1.5 hidden sm:inline">Add Order</span>
                    <span className="ml-1.5 sm:hidden">Add</span>
                  </Button>
                )}

                {NEXT_STATUS[selectedOrder.status as OrderStatus] && (
                  <Button
                    onClick={() =>
                      handleStatusUpdate(selectedOrder, NEXT_STATUS[selectedOrder.status as OrderStatus]!)
                    }
                    disabled={pending === selectedOrder.id}
                    className="flex-1 font-semibold shadow-sm"
                  >
                    {pending === selectedOrder.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      STATUS_ACTION[selectedOrder.status as OrderStatus]?.icon
                    )}
                    <span className="ml-2">
                      {STATUS_ACTION[selectedOrder.status as OrderStatus]?.label}
                    </span>
                  </Button>
                )}
              </div>
            </>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tables Management Sheet */}
      <Sheet open={showTablesSheet} onOpenChange={setShowTablesSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="px-6">
            <SheetTitle className="flex items-center gap-2">
              <Grid3x3 className="size-5" />
              Table Management
            </SheetTitle>
            <SheetDescription>
              View all tables and their current status
            </SheetDescription>
          </SheetHeader>

          <div className="mt-2 px-6 pb-6">
            {loadingTables ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Grid3x3 className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No tables found</p>
              </div>
            ) : (
              <>
                {/* Interactive Filter Cards - 3x2 Grid Layout (Compact Half Size) */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* Row 1: All, Available, Occupied */}
                  {/* All Tables Filter */}
                  <button
                    onClick={() => setTableStatusFilter("all")}
                    className={`rounded-lg border-2 p-2 text-center transition-all duration-200 ${
                      tableStatusFilter === "all"
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                    }`}
                  >
                    <div className={`text-lg sm:text-xl font-bold transition-colors ${
                      tableStatusFilter === "all" ? "text-primary" : "text-foreground"
                    }`}>
                      {tables.length}
                    </div>
                    <div className={`text-[9px] sm:text-[10px] font-medium mt-0.5 transition-colors leading-tight ${
                      tableStatusFilter === "all" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      All
                    </div>
                  </button>

                  {/* Available Filter */}
                  <button
                    onClick={() => setTableStatusFilter("available")}
                    className={`rounded-lg border-2 p-2 text-center transition-all duration-200 ${
                      tableStatusFilter === "available"
                        ? "border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20"
                        : "border-border bg-card hover:border-emerald-500/50 hover:shadow-sm"
                    }`}
                  >
                    <div className={`text-lg sm:text-xl font-bold transition-colors ${
                      tableStatusFilter === "available" ? "text-emerald-600 dark:text-emerald-500" : "text-emerald-600"
                    }`}>
                      {tables.filter(t => t.status === 'available').length}
                    </div>
                    <div className={`text-[9px] sm:text-[10px] font-medium mt-0.5 transition-colors leading-tight ${
                      tableStatusFilter === "available" ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground"
                    }`}>
                      Available
                    </div>
                  </button>

                  {/* Occupied Filter */}
                  <button
                    onClick={() => setTableStatusFilter("occupied")}
                    className={`rounded-lg border-2 p-2 text-center transition-all duration-200 ${
                      tableStatusFilter === "occupied"
                        ? "border-blue-500 bg-blue-500/10 shadow-md ring-2 ring-blue-500/20"
                        : "border-border bg-card hover:border-blue-500/50 hover:shadow-sm"
                    }`}
                  >
                    <div className={`text-lg sm:text-xl font-bold transition-colors ${
                      tableStatusFilter === "occupied" ? "text-blue-600 dark:text-blue-500" : "text-blue-600"
                    }`}>
                      {tables.filter(t => t.status === 'occupied').length}
                    </div>
                    <div className={`text-[9px] sm:text-[10px] font-medium mt-0.5 transition-colors leading-tight ${
                      tableStatusFilter === "occupied" ? "text-blue-600 dark:text-blue-500" : "text-muted-foreground"
                    }`}>
                      Occupied
                    </div>
                  </button>

                  {/* Row 2: Reserved, Unavailable, Clear Filter */}
                  {/* Reserved Filter */}
                  <button
                    onClick={() => setTableStatusFilter("reserved")}
                    className={`rounded-lg border-2 p-2 text-center transition-all duration-200 ${
                      tableStatusFilter === "reserved"
                        ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20"
                        : "border-border bg-card hover:border-amber-500/50 hover:shadow-sm"
                    }`}
                  >
                    <div className={`text-lg sm:text-xl font-bold transition-colors ${
                      tableStatusFilter === "reserved" ? "text-amber-600 dark:text-amber-500" : "text-amber-600"
                    }`}>
                      {tables.filter(t => t.status === 'reserved').length}
                    </div>
                    <div className={`text-[9px] sm:text-[10px] font-medium mt-0.5 transition-colors leading-tight ${
                      tableStatusFilter === "reserved" ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"
                    }`}>
                      Reserved
                    </div>
                  </button>

                  {/* Unavailable Filter */}
                  <button
                    onClick={() => setTableStatusFilter("unavailable")}
                    className={`rounded-lg border-2 p-2 text-center transition-all duration-200 ${
                      tableStatusFilter === "unavailable"
                        ? "border-red-500 bg-red-500/10 shadow-md ring-2 ring-red-500/20"
                        : "border-border bg-card hover:border-red-500/50 hover:shadow-sm"
                    }`}
                  >
                    <div className={`text-lg sm:text-xl font-bold transition-colors ${
                      tableStatusFilter === "unavailable" ? "text-red-600 dark:text-red-500" : "text-red-600"
                    }`}>
                      {tables.filter(t => t.status === 'unavailable').length}
                    </div>
                    <div className={`text-[9px] sm:text-[10px] font-medium mt-0.5 transition-colors leading-tight ${
                      tableStatusFilter === "unavailable" ? "text-red-600 dark:text-red-500" : "text-muted-foreground"
                    }`}>
                      Unavailable
                    </div>
                  </button>

                  {/* Clear Filter Card */}
                  <button
                    onClick={() => setTableStatusFilter("all")}
                    className={`rounded-lg border-2 p-2 text-center transition-all duration-200 ${
                      tableStatusFilter === "all"
                        ? "border-border bg-muted/30"
                        : "border-muted-foreground/30 bg-muted/50 hover:border-muted-foreground/50 hover:bg-muted/70 hover:shadow-sm"
                    }`}
                    disabled={tableStatusFilter === "all"}
                  >
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <X className={`size-4 mx-auto mb-0.5 ${
                          tableStatusFilter === "all" ? "text-muted-foreground/40" : "text-muted-foreground"
                        }`} />
                        <div className={`text-[9px] sm:text-[10px] font-medium transition-colors leading-tight ${
                          tableStatusFilter === "all" ? "text-muted-foreground/40" : "text-muted-foreground"
                        }`}>
                          Clear
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Tables Grid */}
                {filteredTables.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground rounded-lg border-2 border-dashed">
                    <Grid3x3 className="size-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No {tableStatusFilter} tables</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setTableStatusFilter("all")}
                      className="mt-2"
                    >
                      View all tables
                    </Button>
                  </div>
                ) : (
                <div className="space-y-3">
                  {filteredTables.map((table) => {
                    // Determine actual status based on active_orders, not just the status field
                    let actualStatus = table.status
                    if (table.active_orders && table.active_orders.length > 0) {
                      actualStatus = 'occupied' // If there are active orders, it's occupied
                    } else if (table.status === 'occupied') {
                      actualStatus = 'available' // If no active orders but marked as occupied, it's actually available
                    }
                    
                    const statusColors = {
                      available: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20',
                      occupied: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20',
                      reserved: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
                      unavailable: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
                    }
                    const statusLabels = {
                      available: { label: 'Available', color: 'text-emerald-600 dark:text-emerald-400' },
                      occupied: { label: 'Occupied', color: 'text-blue-600 dark:text-blue-400' },
                      reserved: { label: 'Reserved', color: 'text-amber-600 dark:text-amber-400' },
                      unavailable: { label: 'Unavailable', color: 'text-red-600 dark:text-red-400' },
                    }
                    const status = statusLabels[actualStatus as keyof typeof statusLabels] || statusLabels.available

                    return (
                      <div 
                        key={table.id}
                        className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${statusColors[actualStatus as keyof typeof statusColors] || statusColors.available}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <h3 className="text-xl font-bold">{table.label}</h3>
                              {table.zone && (
                                <span className="text-sm text-muted-foreground">
                                  {table.zone}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="size-3.5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Capacity: {table.capacity || 4}
                              </span>
                            </div>
                          </div>
                          <Badge className={`${status.color} bg-transparent border-0`}>
                            {status.label}
                          </Badge>
                        </div>

                        {/* Active Orders */}
                        {table.active_orders && table.active_orders.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Active Orders:
                            </p>
                            {table.active_orders.slice(0, 2).map((order: any) => (
                              <div key={order.id} className="flex items-center justify-between text-sm mb-1">
                                <span>Order #{order.order_number}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(Number(order.total))}
                                </span>
                              </div>
                            ))}
                            {table.active_orders.length > 2 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                +{table.active_orders.length - 2} more
                              </p>
                            )}
                          </div>
                        )}

                        {/* Assigned Waiter */}
                        {table.assigned_waiter && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              Assigned: <span className="font-medium text-foreground">
                                {table.assigned_waiter === profile.id ? 'You' : 'Other waiter'}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                )}

                {/* Refresh Button */}
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={loadTables}
                    disabled={loadingTables}
                  >
                    {loadingTables ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4 mr-2" />
                    )}
                    Refresh Tables
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <LogOut className="size-5 text-amber-600" />
              Confirm Logout
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to log out of your waiter account?
            </p>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1 text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-medium mb-1">Before logging out:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-400">
                    <li>Ensure all orders are properly updated</li>
                    <li>Complete any pending customer assistance</li>
                    <li>Notify your supervisor if ending your shift</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
              className="h-9"
            >
              <X className="size-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={confirmLogout}
              disabled={isLoggingOut}
              className="h-9 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="size-4 mr-2" />
                  Yes, Logout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
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
    <Card 
      onClick={onView}
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${
      slaStatus === "critical" 
        ? "ring-2 ring-red-500 shadow-red-100 dark:shadow-red-950" 
        : slaStatus === "warning"
        ? "ring-2 ring-amber-400 shadow-amber-100 dark:shadow-amber-950"
        : priority === "urgent"
        ? "ring-1 ring-red-400"
        : "hover:ring-1 hover:ring-primary/20"
    }`}>
      {/* Colored Left Border Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        slaStatus === "critical" || priority === "urgent"
          ? "bg-gradient-to-b from-red-500 to-red-600"
          : slaStatus === "warning" || priority === "high"
          ? "bg-gradient-to-b from-amber-400 to-amber-500"
          : isPaid
          ? "bg-gradient-to-b from-emerald-400 to-emerald-500"
          : order.status === "ready"
          ? "bg-gradient-to-b from-emerald-400 to-emerald-500"
          : order.status === "preparing"
          ? "bg-gradient-to-b from-amber-400 to-amber-500"
          : "bg-gradient-to-b from-blue-400 to-blue-500"
      }`} />

      {/* Urgent Alert Banner */}
      {slaStatus === "critical" && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 flex items-center gap-2 text-white animate-pulse">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wide">
            {order.status === "pending" 
              ? `Urgent: Confirm Immediately`
              : order.status === "ready"
              ? `Urgent: Serve Now`
              : `High Priority Action Required`}
          </span>
        </div>
      )}

      <CardContent className="p-4">
        {/* Header Section - Table & Time */}
        <div className={`flex items-start justify-between gap-2 ${priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "mb-3" : "mb-1"}`}>
          <div className="flex-1 min-w-0">
            {/* Table Number / Take-Out */}
            {order.tables ? (
              <div className="flex items-baseline gap-2">
                <h2 className={`font-black tracking-tight text-foreground ${priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "text-3xl" : "text-[28px]"}`}>
                  {order.tables.label}
                </h2>
                {order.tables.zone && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {order.tables.zone}
                  </span>
                )}
              </div>
            ) : (
              <h2 className={`font-black tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent ${priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "text-3xl" : "text-[28px]"}`}>
                Take-Out
              </h2>
            )}
          </div>

          {/* Time Badge - Prominent */}
          <div className={`flex flex-col items-end gap-1.5 shrink-0`}>
            <div className={`flex items-center gap-1.5 rounded-lg text-sm font-bold shadow-sm ${
              priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "px-3 py-1.5" : "px-2.5 py-1"
            } ${
              slaStatus === "critical" 
                ? "bg-red-600 text-white ring-2 ring-red-400" 
                : slaStatus === "warning"
                ? "bg-amber-500 text-white ring-2 ring-amber-300"
                : "bg-muted/80 text-foreground"
            }`}>
              <Timer className={priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "size-4" : "size-3.5"} />
              <span className="tabular-nums">
                {age >= 60 ? `${Math.floor(age / 60)}h ${age % 60}m` : `${age}m`}
              </span>
            </div>
          </div>
        </div>

        {/* Status Row - Compact & Clean */}
        <div className={`flex items-center gap-2 flex-wrap ${priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "mb-3" : "mb-1"}`}>
          {/* Status Badge */}
          {!isPaid && (
            <Badge className={`${config?.color ?? "bg-gray-100"} px-2.5 py-1 text-xs font-semibold`}>
              {config?.icon}
              <span className="ml-1.5">{config?.label}</span>
            </Badge>
          )}
          
          {/* Priority Badge - Hidden (already shown in banner) */}
          {/* Removed: Redundant with HIGH PRIORITY banner at top */}
          
          {/* Add-On Badge */}
          {order.order_type === "additional" && (
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2.5 py-1 text-xs font-semibold">
              <Plus className="size-3" />
              <span className="ml-1">Add-On</span>
            </Badge>
          )}

          {/* Item Count */}
          <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ClipboardList className="size-3.5" />
            <span>{order.order_items?.length ?? 0} items</span>
          </div>
        </div>

        {/* Payment Status - Green Banner */}
        {isPaid && (
          <div className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800 ${
            priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "mb-3 px-3 py-2" : "mb-1 px-2.5 py-1.5"
          }`}>
            <CreditCard className={priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "size-4" : "size-3.5"} />
            <span className={`font-bold text-emerald-700 dark:text-emerald-300 ${
              priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "text-sm" : "text-xs"
            }`}>
              Paid via {order.payment_method === "cash" 
                ? "Cash"
                : order.payment_method === "card"
                ? "Card"
                : order.payment_method === "gcash"
                ? "GCash"
                : order.payment_method === "maya"
                ? "Maya"
                : "Payment"}
            </span>
          </div>
        )}

        {/* Special Requests */}
        {order.special_requests && (
          <div className={`flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 ${
            priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "mb-3 px-3 py-2" : "mb-1 px-2.5 py-1.5"
          }`}>
            <AlertCircle className={`text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 ${
              priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "size-4" : "size-3.5"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-0.5">
                Special Request
              </p>
              <p className="text-xs text-blue-600/90 dark:text-blue-400/90 line-clamp-2">
                {order.special_requests}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex gap-2 ${priority === "urgent" || priority === "high" || slaStatus === "critical" || slaStatus === "warning" ? "mt-4" : "mt-2"}`}>
          {isPending && !isClaimedByMe ? (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onAssist()
              }}
              disabled={assisting || pending}
              className="flex-1 h-10 text-sm font-semibold shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {assisting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Taking Order...
                </>
              ) : (
                <>
                  <Bell className="size-4 mr-2" />
                  Take This Order
                </>
              )}
            </Button>
          ) : (
            <>
              {next && !isPaid && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusUpdate(next)
                  }}
                  disabled={pending}
                  className="flex-1 h-9 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  size="default"
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    STATUS_ACTION[next]?.icon
                  )}
                  <span className="ml-2">
                    {STATUS_ACTION[next]?.label}
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
