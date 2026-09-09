"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  LayoutDashboard,
  ClipboardList,
  Bell,
  RefreshCw,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  UtensilsCrossed,
  AlertCircle,
  ChevronRight,
  Loader2,
  BarChart3,
  Search,
  Timer,
  UserCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  SlidersHorizontal,
  CreditCard,
  Banknote,
  TrendingUp,
  Target,
  Zap,
  StickyNote,
  Plus,
  Save,
  X as XIcon,
} from "lucide-react"
import Link from "next/link"
import { StaffShell, type NavItem } from "@/components/staff-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatCurrency, formatTime, formatDateTime } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"
import type { Profile, RestaurantTable, OrderStatus } from "@/lib/types"
import { updateWaiterOrderStatus } from "@/app/actions/waiter"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const NAV_ITEMS: NavItem[] = [
  { href: "/waiter", label: "My Tables", icon: "LayoutDashboard" },
  { href: "/waiter/orders", label: "Orders", icon: "ClipboardList" },
  { href: "/waiter/notifications", label: "Alerts", icon: "Bell" },
]

interface WaiterTable extends RestaurantTable {
  current_guests?: number | null
  orders?: {
    id: string
    order_number: number
    status: OrderStatus
    total: number
    created_at: string
    order_items?: { count: number }[]
  }[]
}

interface WaiterOrder {
  id: string
  order_number: number
  status: OrderStatus
  total: number
  subtotal: number
  tax: number
  customer_name: string | null
  created_at: string
  payment_status?: string | null
  payment_method?: string | null
  tables: { label: string | null; zone: string | null } | { label: string | null; zone: string | null }[] | null
  order_items?: { 
    id: string
    name: string
    quantity: number
    notes?: string | null
  }[]
}

const TABLE_STATUS_CONFIG = {
  available:   { label: "Available",   color: "bg-emerald-500" },
  occupied:    { label: "Occupied",    color: "bg-amber-500" },
  reserved:    { label: "Reserved",    color: "bg-blue-500" },
  unavailable: { label: "Unavailable", color: "bg-gray-400" },
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: "Pending",    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  confirmed: { label: "Confirmed",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  preparing: { label: "Preparing",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  ready:     { label: "Ready",       color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  served:    { label: "Served",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  completed: { label: "Completed",  color: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400" },
  cancelled: { label: "Cancelled",  color: "bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500" },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready:     "served",
}

const NEXT_LABELS: Record<string, string> = {
  pending:   "Confirm",
  confirmed: "Prepare",
  preparing: "Ready",
  ready:     "Served",
}

export function WaiterDashboard({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const [tables, setTables] = useState<WaiterTable[]>([])
  const [pendingOrders, setPendingOrders] = useState<WaiterOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // New filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [zoneFilter, setZoneFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showItemPreview, setShowItemPreview] = useState<Record<string, boolean>>({})
  
  // Performance metrics state
  const [showMetrics, setShowMetrics] = useState(false)
  
  // Table notes state
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; tableId: string | null; currentNote: string }>({
    open: false,
    tableId: null,
    currentNote: "",
  })
  const [savingNote, setSavingNote] = useState(false)

  // Update current time every second for live timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadData = useCallback(async () => {
    const profileId = profile.id

    // Fetch assigned tables with current guest count and notes
    const { data: tablesData } = await supabase
      .from("tables")
      .select("*, current_guests, notes")
      .or(`assigned_waiter.eq.${profileId},assigned_waiter.is.null`)
      .order("label")

    // Fetch active orders with order items and payment info for assigned/unassigned tables
    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        id, 
        order_number, 
        status, 
        total, 
        subtotal, 
        tax, 
        customer_name, 
        created_at,
        payment_status,
        payment_method,
        tables(label, zone),
        order_items(id, name, quantity, notes)
      `)
      .in("status", ["pending", "confirmed", "preparing", "ready", "served"])
      .order("created_at", { ascending: true })
      .limit(20)

    setTables(tablesData ?? [])
    setPendingOrders((ordersData ?? []) as any)
    setLoading(false)
  }, [profile.id, supabase])

  useEffect(() => {
    loadData()

    // Real-time subscription
    const channel = supabase
      .channel("waiter-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadData()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tables" }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleQuickUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId)
    try {
      const result = await updateWaiterOrderStatus(orderId, newStatus)
      if (result?.error) {
        alert(result.error)
        return
      }
      setPendingOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    } finally {
      setUpdating(null)
    }
  }

  // Get unique zones for filtering
  const availableZones = useMemo(() => {
    const zones = new Set<string>()
    tables.forEach((t) => {
      if (t.zone) zones.add(t.zone)
    })
    return Array.from(zones).sort()
  }, [tables])

  // Filter tables based on search, zone, and status
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesLabel = table.label?.toLowerCase().includes(query)
        const matchesZone = table.zone?.toLowerCase().includes(query)
        if (!matchesLabel && !matchesZone) return false
      }

      // Zone filter
      if (zoneFilter !== "all" && table.zone !== zoneFilter) return false

      // Status filter
      if (statusFilter !== "all" && table.status !== statusFilter) return false

      return true
    })
  }, [tables, searchQuery, zoneFilter, statusFilter])

  // Calculate time elapsed for order (in minutes)
  const getOrderAge = (createdAt: string): number => {
    return Math.floor((currentTime.getTime() - new Date(createdAt).getTime()) / 60000)
  }

  // Determine SLA status (red alert if > 15 min for pending, > 30 for others)
  const getSLAStatus = (order: WaiterOrder): "normal" | "warning" | "critical" => {
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
  }

  // Toggle item preview for an order
  const toggleItemPreview = (orderId: string) => {
    setShowItemPreview((prev) => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  // Open table note dialog
  const openNoteDialog = (tableId: string, currentNote: string) => {
    setNoteDialog({ open: true, tableId, currentNote })
  }

  // Save table note
  const saveTableNote = async () => {
    if (!noteDialog.tableId) return
    
    setSavingNote(true)
    try {
      const { error } = await supabase
        .from("tables")
        .update({ notes: noteDialog.currentNote || null })
        .eq("id", noteDialog.tableId)

      if (error) throw error

      // Update local state
      setTables((prev) =>
        prev.map((t) =>
          t.id === noteDialog.tableId ? { ...t, notes: noteDialog.currentNote || null } : t
        )
      )

      setNoteDialog({ open: false, tableId: null, currentNote: "" })
    } catch (error) {
      console.error("Error saving note:", error)
      alert("Failed to save note. Please try again.")
    } finally {
      setSavingNote(false)
    }
  }

  // Enhanced search - includes order numbers and customer names
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return pendingOrders

    const query = searchQuery.toLowerCase()
    return pendingOrders.filter((order) => {
      const matchesOrderNumber = String(order.order_number).includes(query)
      const matchesCustomer = order.customer_name?.toLowerCase().includes(query)
      const tableLabel = Array.isArray(order.tables) ? order.tables[0]?.label : order.tables?.label
      const matchesTable = tableLabel?.toLowerCase().includes(query)
      return matchesOrderNumber || matchesCustomer || matchesTable
    })
  }, [pendingOrders, searchQuery])

  // Performance Metrics Calculations
  const performanceMetrics = useMemo(() => {
    const now = currentTime.getTime()
    const startOfDay = new Date(currentTime)
    startOfDay.setHours(0, 0, 0, 0)

    // Average serving time (from created to served)
    const servedOrders = pendingOrders.filter((o) => o.status === "served")
    const avgServingTime =
      servedOrders.length > 0
        ? servedOrders.reduce((sum, o) => sum + getOrderAge(o.created_at), 0) / servedOrders.length
        : 0

    // Orders per hour (active orders / hours worked today)
    const hoursWorked = Math.max(1, (now - startOfDay.getTime()) / (1000 * 60 * 60))
    const ordersPerHour = pendingOrders.length / hoursWorked

    // Service efficiency (% of orders within SLA)
    const withinSLA = pendingOrders.filter((o) => getSLAStatus(o) === "normal").length
    const efficiency = pendingOrders.length > 0 ? (withinSLA / pendingOrders.length) * 100 : 100

    // Average check size
    const avgCheckSize =
      pendingOrders.length > 0
        ? pendingOrders.reduce((sum, o) => sum + Number(o.total), 0) / pendingOrders.length
        : 0

    return {
      avgServingTime: Math.round(avgServingTime),
      ordersPerHour: ordersPerHour.toFixed(1),
      efficiency: Math.round(efficiency),
      avgCheckSize,
    }
  }, [pendingOrders, currentTime])

  // Stats
  const activeCount = pendingOrders.length
  const pendingCount = pendingOrders.filter((o) => o.status === "pending").length
  const preparingCount = pendingOrders.filter((o) => o.status === "confirmed" || o.status === "preparing").length
  const readyCount = pendingOrders.filter((o) => o.status === "ready").length

  const todayRevenue = pendingOrders
    .filter((o) => {
      const d = new Date(o.created_at)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    })
    .reduce((sum, o) => sum + Number(o.total), 0)

  const today = new Date()
  const dateStr = today.toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <StaffShell profile={profile} items={NAV_ITEMS} title="Waiter Console">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Good {getGreeting()}, {profile.full_name?.split(" ")[0] ?? "Staff"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<ClipboardList className="size-5 text-blue-500" />}
            label="Active Orders"
            value={String(activeCount)}
            sub={pendingCount > 0 ? `${pendingCount} pending` : "All caught up"}
            highlight={pendingCount > 0}
          />
          <StatCard
            icon={<Clock className="size-5 text-amber-500" />}
            label="In Progress"
            value={String(preparingCount)}
            sub="Orders being prepared"
          />
          <StatCard
            icon={<CheckCircle2 className="size-5 text-emerald-500" />}
            label="Ready to Serve"
            value={String(readyCount)}
            sub={readyCount > 0 ? "Deliver to tables" : "No orders ready"}
            highlight={readyCount > 0}
          />
          <StatCard
            icon={<BarChart3 className="size-5 text-purple-500" />}
            label="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            sub="From your tables"
          />
        </div>

        {/* Performance Metrics Dashboard */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                <CardTitle className="text-base">Performance Metrics</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMetrics(!showMetrics)}
              >
                {showMetrics ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          {showMetrics && (
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  icon={<Timer className="size-4 text-blue-500" />}
                  label="Avg Serving Time"
                  value={`${performanceMetrics.avgServingTime}m`}
                  description="Time to serve orders"
                  status={
                    performanceMetrics.avgServingTime < 20
                      ? "good"
                      : performanceMetrics.avgServingTime < 30
                      ? "warning"
                      : "poor"
                  }
                />
                <MetricCard
                  icon={<Zap className="size-4 text-amber-500" />}
                  label="Orders Per Hour"
                  value={performanceMetrics.ordersPerHour}
                  description="Your velocity today"
                  status="good"
                />
                <MetricCard
                  icon={<Target className="size-4 text-emerald-500" />}
                  label="SLA Compliance"
                  value={`${performanceMetrics.efficiency}%`}
                  description="Within time targets"
                  status={
                    performanceMetrics.efficiency >= 90
                      ? "good"
                      : performanceMetrics.efficiency >= 70
                      ? "warning"
                      : "poor"
                  }
                />
                <MetricCard
                  icon={<CreditCard className="size-4 text-purple-500" />}
                  label="Avg Check Size"
                  value={formatCurrency(performanceMetrics.avgCheckSize)}
                  description="Average order value"
                  status="good"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Pending Attention Banner */}
        {pendingCount > 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-300">
                  {pendingCount} Order{pendingCount > 1 ? "s" : ""} Waiting for Confirmation
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Go to table and confirm customer orders immediately.
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link href="/waiter/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Grid: Tables + Orders */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Tables Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                My Tables
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredTables.length} of {tables.length} tables
              </span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={zoneFilter} onValueChange={(v) => setZoneFilter(v || "all")}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {availableZones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-24 bg-muted/30" />
                  </Card>
                ))}
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
                <Users className="mx-auto mb-2 size-6 opacity-40" />
                <p className="text-sm">
                  {searchQuery || zoneFilter !== "all" || statusFilter !== "all"
                    ? "No tables match your filters."
                    : "No tables assigned yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTables.map((table) => {
                  const statusConfig = TABLE_STATUS_CONFIG[table.status as keyof typeof TABLE_STATUS_CONFIG]
                  const tableOrders = pendingOrders.filter((o) => {
                    const tableLabel = Array.isArray(o.tables) ? o.tables[0]?.label : o.tables?.label
                    return tableLabel === table.label
                  })
                  const currentGuests = table.current_guests ?? 0
                  const maxSeats = table.seats
                  const occupancyPercent = maxSeats > 0 ? (currentGuests / maxSeats) * 100 : 0

                  return (
                    <Card key={table.id} className="overflow-hidden transition-colors hover:bg-muted/30">
                      <div className={`h-1 ${statusConfig?.color}`} />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{table.label}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                              {/* Capacity Indicator */}
                              <div className="flex items-center gap-1.5">
                                <UserCheck className="size-3" />
                                <span className={`font-medium ${
                                  occupancyPercent > 100 
                                    ? "text-red-600 dark:text-red-400" 
                                    : occupancyPercent >= 80 
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-foreground"
                                }`}>
                                  {currentGuests}/{maxSeats}
                                </span>
                                <span>guests</span>
                              </div>
                              {table.zone && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {table.zone}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {statusConfig?.label}
                          </Badge>
                        </div>

                        {/* Table orders summary */}
                        {tableOrders.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-1.5">
                            {tableOrders.slice(0, 2).map((o) => {
                              const cfg = ORDER_STATUS_CONFIG[o.status as OrderStatus]
                              const age = getOrderAge(o.created_at)
                              const slaStatus = getSLAStatus(o)
                              
                              return (
                                <div key={o.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold">#{o.order_number}</span>
                                    <Badge className={cfg?.color ?? "bg-gray-100"}>{cfg?.label}</Badge>
                                    {/* Timer */}
                                    <div className={`flex items-center gap-0.5 ${
                                      slaStatus === "critical" 
                                        ? "text-red-600 dark:text-red-400 font-semibold" 
                                        : slaStatus === "warning"
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-muted-foreground"
                                    }`}>
                                      <Timer className="size-3" />
                                      <span>{age}m</span>
                                    </div>
                                  </div>
                                  <span className="text-muted-foreground">{formatCurrency(o.total)}</span>
                                </div>
                              )
                            })}
                            {tableOrders.length > 2 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{tableOrders.length - 2} more orders
                              </p>
                            )}
                          </div>
                        )}

                        {/* Table Notes */}
                        {table.notes && (
                          <div className="mt-3 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                              <StickyNote className="size-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                {table.notes}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNoteDialog(table.id, table.notes || "")}
                            className="flex-shrink-0"
                          >
                            <StickyNote className="size-3.5" />
                          </Button>
                          <Button size="sm" className="flex-1" asChild>
                            <Link href={`/waiter/tables/${table.id}`}>
                              Manage Table
                              <ChevronRight className="size-3.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Orders Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Orders Requiring Action
              </h2>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/waiter/orders">View All</Link>
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-28 bg-muted/30" />
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-3 size-8 text-emerald-400" />
                <p className="font-medium">
                  {searchQuery ? "No orders match your search." : "All caught up!"}
                </p>
                <p className="text-sm mt-1">
                  {searchQuery ? "Try a different search term." : "No orders need your attention right now."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const cfg = ORDER_STATUS_CONFIG[order.status as OrderStatus]
                  const nextStatus = NEXT_STATUS[order.status as OrderStatus]
                  const isUpdating = updating === order.id
                  const age = getOrderAge(order.created_at)
                  const slaStatus = getSLAStatus(order)
                  const showPreview = showItemPreview[order.id] || false
                  const itemCount = order.order_items?.length ?? 0
                  const isPaid = order.payment_status === "paid"

                  return (
                    <Card 
                      key={order.id}
                      className={`${
                        slaStatus === "critical" 
                          ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" 
                          : slaStatus === "warning"
                          ? "border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xl font-bold">#{order.order_number}</span>
                              <Badge className={cfg?.color ?? "bg-gray-100"}>
                                {cfg?.label}
                              </Badge>
                              
                              {/* Payment Status Indicator */}
                              {isPaid && (
                                <Badge 
                                  variant="outline" 
                                  className="bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400"
                                >
                                  <CreditCard className="size-3 mr-1" />
                                  {order.payment_method === "cash" 
                                    ? "Paid - Cash"
                                    : order.payment_method === "card"
                                    ? "Paid - Card"
                                    : order.payment_method === "gcash"
                                    ? "Paid - GCash"
                                    : order.payment_method === "maya"
                                    ? "Paid - Maya"
                                    : "Paid"}
                                </Badge>
                              )}
                              
                              {/* Timer with SLA Warning */}
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                slaStatus === "critical" 
                                  ? "bg-red-600 text-white animate-pulse" 
                                  : slaStatus === "warning"
                                  ? "bg-amber-500 text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {slaStatus === "critical" && <AlertTriangle className="size-3" />}
                                <Timer className="size-3" />
                                <span>{age} min</span>
                              </div>
                            </div>

                            {/* SLA Alert Message */}
                            {slaStatus === "critical" && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                                <AlertCircle className="size-3" />
                                <span>
                                  {order.status === "pending" 
                                    ? "URGENT: Confirm this order immediately!"
                                    : order.status === "ready"
                                    ? "URGENT: Serve this order now!"
                                    : "This order is taking too long!"}
                                </span>
                              </div>
                            )}

                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              {(() => {
                                const tableLabel = Array.isArray(order.tables) ? order.tables[0]?.label : order.tables?.label
                                const tableZone = Array.isArray(order.tables) ? order.tables[0]?.zone : order.tables?.zone
                                return (
                                  <>
                                    {tableLabel && (
                                      <span className="font-medium text-foreground">
                                        {tableLabel}
                                      </span>
                                    )}
                                    {tableZone && <span>{tableZone}</span>}
                                  </>
                                )
                              })()}
                              {order.customer_name && (
                                <>
                                  <span>•</span>
                                  <span>{order.customer_name}</span>
                                </>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatTime(new Date(order.created_at))}
                            </div>

                            {/* Order Items Preview Toggle */}
                            {itemCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleItemPreview(order.id)}
                                className="mt-2 h-7 text-xs"
                              >
                                {showPreview ? (
                                  <>
                                    <EyeOff className="size-3 mr-1" />
                                    Hide Items
                                  </>
                                ) : (
                                  <>
                                    <Eye className="size-3 mr-1" />
                                    Show {itemCount} Item{itemCount > 1 ? "s" : ""}
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Order Items Preview */}
                            {showPreview && order.order_items && order.order_items.length > 0 && (
                              <div className="mt-2 p-3 rounded-lg bg-muted/50 border space-y-1.5">
                                {order.order_items.map((item) => (
                                  <div key={item.id} className="flex items-start gap-2 text-xs">
                                    <div className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0">
                                      {item.quantity}×
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium">{item.name}</p>
                                      {item.notes && (
                                        <p className="text-muted-foreground italic">Note: {item.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-primary">
                              {formatCurrency(order.total)}
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        {nextStatus && (
                          <Button
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => handleQuickUpdate(order.id, nextStatus)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <NextStatusIcon status={nextStatus} />
                            )}
                            <span className="ml-1.5">
                              {isUpdating ? "Updating..." : NEXT_LABELS[nextStatus]}
                            </span>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Notes Dialog */}
      <Dialog open={noteDialog.open} onOpenChange={(open) => !open && setNoteDialog({ open: false, tableId: null, currentNote: "" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Table Notes</DialogTitle>
            <DialogDescription>
              Add or edit notes for this table (e.g., special requests, VIP guests, celebrations)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter table notes here..."
              value={noteDialog.currentNote}
              onChange={(e) => setNoteDialog((prev) => ({ ...prev, currentNote: e.target.value }))}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setNoteDialog({ open: false, tableId: null, currentNote: "" })}
              disabled={savingNote}
            >
              Cancel
            </Button>
            <Button onClick={saveTableNote} disabled={savingNote}>
              {savingNote ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save Note
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffShell>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/10" : ""}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`text-xl font-bold ${highlight ? "text-amber-600" : ""}`}>{value}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

function MetricCard({
  icon,
  label,
  value,
  description,
  status,
}: {
  icon: React.ReactNode
  label: string
  value: string
  description: string
  status: "good" | "warning" | "poor"
}) {
  const statusColors = {
    good: "border-l-emerald-500",
    warning: "border-l-amber-500",
    poor: "border-l-red-500",
  }

  return (
    <div className={`rounded-lg border-l-4 ${statusColors[status]} bg-muted/30 p-4`}>
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-background">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  )
}

function NextStatusIcon({ status }: { status: OrderStatus }) {
  switch (status) {
    case "confirmed": return <CheckCircle2 className="size-3.5" />
    case "preparing": return <UtensilsCrossed className="size-3.5" />
    case "ready":     return <CheckCircle2 className="size-3.5" />
    case "served":    return <CheckCircle2 className="size-3.5" />
    default:          return <CheckCircle2 className="size-3.5" />
  }
}