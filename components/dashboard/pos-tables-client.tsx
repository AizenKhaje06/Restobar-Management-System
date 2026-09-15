"use client"

import { useState, useTransition, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Users,
  CreditCard,
  XCircle,
  Receipt,
  Clock,
  Lock,
  Unlock,
  ChevronRight,
  Search,
  Banknote,
  CreditCard as CardIcon,
  Smartphone,
  AlertCircle,
  Check,
  Loader2,
  UtensilsCrossed,
} from "lucide-react"
import { StaffShell, type NavItem } from "@/components/staff-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDateTime } from "@/lib/constants"
import type { Profile } from "@/lib/types"
import { processTableSessionPayment, cancelTableSession } from "@/app/actions/table-sessions"

const NAV_ITEMS: NavItem[] = [
  { href: "/pos", label: "POS Terminal", icon: "LayoutDashboard" },
  { href: "/pos/orders", label: "Orders", icon: "ShoppingCart" },
  { href: "/pos/tables", label: "Tables", icon: "Utensils" },
  { href: "/pos/receipts", label: "Receipts", icon: "Receipt" },
  { href: "/pos/cashflow", label: "Cashflow", icon: "Wallet" },
]

const ORDER_STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  pending:    { label: "Pending",    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",   dot: "bg-amber-500" },
  confirmed:  { label: "Confirmed",  className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",       dot: "bg-cyan-500" },
  preparing:  { label: "Preparing",  className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",       dot: "bg-blue-500" },
  ready:      { label: "Ready",      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" },
  served:     { label: "Served",     className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20", dot: "bg-purple-500" },
  completed:  { label: "Paid",       className: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",       dot: "bg-zinc-500" },
  cancelled:  { label: "Cancelled",  className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",       dot: "bg-rose-500" },
}

interface TableRow {
  id: string
  label: string
  table_code: string
  seats: number
  zone: string | null
  status: "available" | "occupied" | "reserved" | "unavailable"
}

interface ActiveSession {
  id: string
  table_id: string
  customer_name: string
  created_at: string
  status: string
  order_status?: string | null  // Added: most recent order status for the table
}

interface OrderRow {
  id: string
  order_number: number
  table_id: string
  session_id: string | null
  customer_name: string | null
  status: string
  payment_status: string
  subtotal: number
  tax: number
  total: number
  created_at: string
  order_items?: {
    id: string
    name: string
    unit_price: number
    quantity: number
    image_url?: string | null
  }[]
}

export function PosTablesClient({
  profile,
  tables,
  sessions,
}: {
  profile: Profile
  tables: TableRow[]
  sessions: ActiveSession[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [tableStatusFilter, setTableStatusFilter] = useState<"all" | "available" | "occupied" | "reserved" | "unavailable">("all")
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | "all">("all")
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [tableOrders, setTableOrders] = useState<OrderRow[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showPayDialog, setShowPayDialog] = useState(false)
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "gcash" | "maya">("cash")
  const [payAmountTendered, setPayAmountTendered] = useState("")
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const [localTables, setLocalTables] = useState(tables)
  const [localSessions, setLocalSessions] = useState(sessions)

  // Sync with props
  useEffect(() => {
    setLocalTables(tables)
  }, [tables])

  useEffect(() => {
    setLocalSessions(sessions)
  }, [sessions])

  // Real-time subscription for tables
  useEffect(() => {
    const supabase = createClient()
    
    const tablesChannel = supabase
      .channel('pos-tables-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as TableRow
            setLocalTables((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tablesChannel)
    }
  }, [])

  // Real-time subscription for sessions
  useEffect(() => {
    const supabase = createClient()
    
    const sessionsChannel = supabase
      .channel('pos-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_sessions',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const session = payload.new as any
            if (session.status === 'active') {
              // Fetch with order status
              const { data } = await supabase
                .from('table_sessions')
                .select('id, table_id, customer_name, created_at, status, orders!inner(status)')
                .eq('id', session.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false, foreignTable: 'orders' })
                .limit(1, { foreignTable: 'orders' })
                .single()
              
              if (data) {
                const transformed = {
                  id: data.id,
                  table_id: data.table_id,
                  customer_name: data.customer_name,
                  created_at: data.created_at,
                  status: data.status,
                  order_status: (data.orders as any[])?.[0]?.status ?? null,
                }
                
                setLocalSessions((prev) => {
                  const filtered = prev.filter((s) => s.id !== transformed.id)
                  return [...filtered, transformed]
                })
              }
            } else {
              // Session closed
              setLocalSessions((prev) => prev.filter((s) => s.id !== session.id))
            }
          } else if (payload.eventType === 'DELETE') {
            setLocalSessions((prev) => prev.filter((s) => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sessionsChannel)
    }
  }, [])

  // Index sessions by table_id for quick lookup
  const sessionByTable = useMemo(() => {
    const map: Record<string, ActiveSession> = {}
    for (const s of localSessions) map[s.table_id] = s
    return map
  }, [localSessions])

  const filtered = localTables.filter((t) => {
    const session = sessionByTable[t.id]
    const isOccupied = !!session
    const isActuallyAvailable = !isOccupied && t.status !== "unavailable" && t.status !== "reserved"
    
    // Table status filter
    if (tableStatusFilter !== "all") {
      if (tableStatusFilter === "occupied" && !isOccupied) return false
      if (tableStatusFilter === "available" && !isActuallyAvailable) return false
      if (tableStatusFilter === "reserved" && t.status !== "reserved") return false
      if (tableStatusFilter === "unavailable" && t.status !== "unavailable") return false
    }
    
    // Order status filter - only applies to occupied tables
    if (orderStatusFilter !== "all") {
      if (!session || session.order_status !== orderStatusFilter) return false
    }
    
    // Search filter
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.label.toLowerCase().includes(q) ||
      t.table_code.toLowerCase().includes(q) ||
      (t.zone ?? "").toLowerCase().includes(q)
    )
  })

  const counts = useMemo(() => {
    let occupied = 0
    let available = 0
    let reserved = 0
    let unavailable = 0
    
    for (const t of localTables) {
      const hasSession = !!sessionByTable[t.id]
      if (hasSession) {
        occupied++
      } else if (t.status === "reserved") {
        reserved++
      } else if (t.status === "unavailable") {
        unavailable++
      } else {
        // Not occupied, not reserved, not unavailable = available
        available++
      }
    }
    
    return { 
      all: localTables.length,
      occupied, 
      available,
      reserved,
      unavailable,
    }
  }, [localTables, sessionByTable])

  // Count order statuses across all occupied tables
  const orderStatusCounts = useMemo(() => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      completed: 0,
      cancelled: 0,
    }
    
    // Count statuses from sessions
    for (const session of localSessions) {
      if (session.order_status && statusCounts[session.order_status] !== undefined) {
        statusCounts[session.order_status]++
      }
    }
    
    return statusCounts
  }, [localSessions])

  // When a table is selected, load its orders
  async function openTableAccount(tableId: string) {
    setSelectedTableId(tableId)
    setLoadingOrders(true)
    try {
      const res = await fetch(`/api/pos/table-orders?table_id=${tableId}`)
      const data = await res.json()
      setTableOrders(data.orders ?? [])
    } catch (err) {
      console.error("Failed to load table orders", err)
    } finally {
      setLoadingOrders(false)
    }
  }

  function closeTableAccount() {
    setSelectedTableId(null)
    setTableOrders([])
    setShowPayDialog(false)
    setPayAmountTendered("")
  }

  const selectedTable = tables.find((t) => t.id === selectedTableId)
  const selectedSession = selectedTableId ? sessionByTable[selectedTableId] : null
  const unpaidOrders = tableOrders.filter((o) => o.payment_status !== "paid")
  const grandTotal = unpaidOrders.reduce((s, o) => s + Number(o.total), 0)
  const grandSubtotal = unpaidOrders.reduce((s, o) => s + Number(o.subtotal), 0)
  const grandTax = unpaidOrders.reduce((s, o) => s + Number(o.tax), 0)
  const grandItemCount = unpaidOrders.reduce(
    (s, o) => s + (o.order_items?.reduce((c, i) => c + i.quantity, 0) ?? 0),
    0
  )

  const changeDue =
    payMethod === "cash" && payAmountTendered
      ? Math.max(0, parseFloat(payAmountTendered) - grandTotal)
      : null
  const insufficient =
    payMethod === "cash" && payAmountTendered
      ? parseFloat(payAmountTendered) < grandTotal
      : false

  async function handleConfirmPayment() {
    if (!selectedSession) return
    startTransition(async () => {
      const result = await processTableSessionPayment({
        session_id: selectedSession.id,
        method: payMethod,
        amount_tendered: payMethod === "cash" ? parseFloat(payAmountTendered) : null,
      })
      if (result?.error) {
        alert(result.error)
        return
      }
      // Refresh
      closeTableAccount()
      router.refresh()
    })
  }

  async function handleConfirmCancel() {
    if (!selectedSession) return
    startTransition(async () => {
      const result = await cancelTableSession({
        session_id: selectedSession.id,
        reason: "Cancelled by staff",
      })
      if (result?.error) {
        alert(result.error)
        return
      }
      setShowCancelDialog(false)
      closeTableAccount()
      router.refresh()
    })
  }

  return (
    <>
      <StaffShell 
        profile={profile} 
        items={NAV_ITEMS} 
        title="Tables"
        searchElement={
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by table label, code, or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-sm"
              aria-label="Search tables"
            />
          </div>
        }
      >
        {/* Table Status Filter Cards - 5 in 1 row */}
      <div className="mb-4 grid gap-2 grid-cols-5">
        <button
          onClick={() => setTableStatusFilter("all")}
          className={`rounded-lg border px-4 py-3 flex items-center justify-between transition-all ${
            tableStatusFilter === "all"
              ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4" /> All Tables
          </span>
          <span className={`text-xl font-black tabular-nums ${tableStatusFilter === "all" ? "" : "text-muted-foreground"}`}>
            {counts.all}
          </span>
        </button>
        
        <button
          onClick={() => setTableStatusFilter("occupied")}
          className={`rounded-lg border px-4 py-3 flex items-center justify-between transition-all ${
            tableStatusFilter === "occupied"
              ? "border-amber-600 bg-amber-500/20 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Lock className="size-4 text-amber-500" /> Occupied
          </span>
          <span className={`text-xl font-black tabular-nums ${
            tableStatusFilter === "occupied" ? "" : "text-muted-foreground"
          }`}>
            {counts.occupied}
          </span>
        </button>
        
        <button
          onClick={() => setTableStatusFilter("available")}
          className={`rounded-lg border px-4 py-3 flex items-center justify-between transition-all ${
            tableStatusFilter === "available"
              ? "border-emerald-600 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Unlock className="size-4 text-emerald-500" /> Available
          </span>
          <span className={`text-xl font-black tabular-nums ${
            tableStatusFilter === "available" ? "" : "text-muted-foreground"
          }`}>
            {counts.available}
          </span>
        </button>
        
        <button
          onClick={() => setTableStatusFilter("reserved")}
          className={`rounded-lg border px-4 py-3 flex items-center justify-between transition-all ${
            tableStatusFilter === "reserved"
              ? "border-blue-600 bg-blue-500/20 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4 text-blue-500" /> Reserved
          </span>
          <span className={`text-xl font-black tabular-nums ${
            tableStatusFilter === "reserved" ? "" : "text-muted-foreground"
          }`}>
            {counts.reserved}
          </span>
        </button>
        
        <button
          onClick={() => setTableStatusFilter("unavailable")}
          className={`rounded-lg border px-4 py-3 flex items-center justify-between transition-all ${
            tableStatusFilter === "unavailable"
              ? "border-rose-600 bg-rose-500/20 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30"
              : "bg-card hover:bg-muted/40"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <XCircle className="size-4 text-rose-500" /> Unavailable
          </span>
          <span className={`text-xl font-black tabular-nums ${
            tableStatusFilter === "unavailable" ? "" : "text-muted-foreground"
          }`}>
            {counts.unavailable}
          </span>
        </button>
      </div>

      {/* Order Status Summary Cards */}
      {/* Removed - not needed for table management */}

      {/* Tables grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No tables match your search.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((table) => {
            const session = sessionByTable[table.id]
            const isOccupied = !!session
            const isAvailable = !isOccupied && table.status !== "unavailable" && table.status !== "reserved"
            const isReserved = !isOccupied && table.status === "reserved"
            
            return (
              <button
                key={table.id}
                onClick={() => isOccupied && openTableAccount(table.id)}
                disabled={!isOccupied}
                className={`text-left rounded-xl border p-4 transition-all ${
                  isOccupied
                    ? "bg-card hover:border-primary hover:shadow-md cursor-pointer"
                    : isAvailable
                      ? "border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 hover:from-emerald-100 hover:to-teal-100/50 dark:hover:from-emerald-950/40 dark:hover:to-teal-950/30 cursor-not-allowed shadow-sm"
                      : isReserved
                        ? "border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/20 cursor-not-allowed shadow-sm"
                        : "bg-card opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {table.zone ?? "Restaurant"}
                    </p>
                    <p className={`text-2xl font-black mt-0.5 ${
                      isAvailable 
                        ? "text-emerald-600 dark:text-emerald-500" 
                        : isReserved
                          ? "text-blue-600 dark:text-blue-500"
                          : "text-primary"
                    }`}>
                      {table.label}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    {isOccupied ? (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <Lock className="size-3 mr-1" /> Occupied
                      </Badge>
                    ) : table.status === "reserved" ? (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="size-3 mr-1" /> Reserved
                      </Badge>
                    ) : table.status === "unavailable" ? (
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        <XCircle className="size-3 mr-1" /> Unavailable
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500 text-white dark:bg-emerald-600 shadow-sm">
                        <Unlock className="size-3 mr-1" /> Available
                      </Badge>
                    )}
                    {/* Order Status Badge */}
                    {session?.order_status && ORDER_STATUS_CONFIG[session.order_status] && (
                      <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium ${ORDER_STATUS_CONFIG[session.order_status].className}`}>
                        <span className={`size-1.5 rounded-full ${ORDER_STATUS_CONFIG[session.order_status].dot}`} />
                        {ORDER_STATUS_CONFIG[session.order_status].label}
                      </div>
                    )}
                  </div>
                </div>

                {session ? (
                  <>
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-2.5 mb-2">
                      <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        Host
                      </p>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-300 truncate">
                        {session.customer_name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {formatDateTime(session.created_at)}
                      </span>
                      <ChevronRight className="size-4" />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Tap to view when occupied
                  </p>
                )}

                <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>{table.seats} seats</span>
                  <span className="font-mono">#{table.table_code}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Table Account Dashboard Dialog */}
      <Dialog
        open={!!selectedTableId}
        onOpenChange={(o) => !o && closeTableAccount()}
      >
        <DialogContent className="w-full sm:max-w-lg md:max-w-xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
          {selectedTable && (
            <>
              {/* Header band */}
              <div className="px-6 py-4 border-b bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Table Account
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-primary mt-0.5">
                      {selectedTable.label}
                    </p>
                    {selectedTable.zone && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedTable.zone} · {selectedTable.seats} seats
                      </p>
                    )}
                  </div>
                  {selectedSession && (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
                      <Lock className="size-3 mr-1" /> Active
                    </Badge>
                  )}
                </div>
                {selectedSession && (
                  <div className="mt-3 rounded-lg bg-white/60 dark:bg-black/20 p-2.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Session Host
                    </p>
                    <p className="text-sm font-bold truncate">
                      {selectedSession.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Started {formatDateTime(selectedSession.created_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-6 py-5 space-y-5">
                  {loadingOrders ? (
                    <div className="py-12 flex flex-col items-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin mb-2" />
                      <p className="text-sm">Loading orders...</p>
                    </div>
                  ) : unpaidOrders.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                      <Receipt className="size-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No unpaid orders</p>
                      <p className="text-xs mt-1">All orders for this table are paid.</p>
                    </div>
                  ) : (
                    <>
                      {/* Orders list */}
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Open Orders
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {unpaidOrders.length} order
                            {unpaidOrders.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {unpaidOrders.map((order) => (
                            <div
                              key={order.id}
                              className="rounded-lg border bg-card p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold tabular-nums">
                                  #{order.order_number}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {(order.order_items ?? []).map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-2 text-xs"
                                  >
                                    <span className="text-muted-foreground shrink-0 font-medium">
                                      {item.quantity}×
                                    </span>
                                    {/* Item Image */}
                                    <div className="size-10 rounded-md overflow-hidden bg-muted shrink-0">
                                      {item.image_url ? (
                                        <img 
                                          src={item.image_url} 
                                          alt={item.name}
                                          className="size-full object-cover"
                                        />
                                      ) : (
                                        <div className="size-full flex items-center justify-center">
                                          <UtensilsCrossed className="size-4 text-muted-foreground/40" />
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-muted-foreground flex-1 min-w-0 truncate">
                                      {item.name}
                                    </span>
                                    <span className="tabular-nums font-medium shrink-0">
                                      {formatCurrency(
                                        Number(item.unit_price) * item.quantity
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t mt-2 pt-2 flex justify-between text-xs">
                                <span className="text-muted-foreground">Order Total</span>
                                <span className="font-bold tabular-nums">
                                  {formatCurrency(Number(order.total))}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Grand totals */}
                      <section className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {unpaidOrders.length} order{unpaidOrders.length !== 1 ? "s" : ""} ·{" "}
                            {grandItemCount} item{grandItemCount !== 1 ? "s" : ""}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatCurrency(grandSubtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(grandTax)}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline border-t pt-2 mt-1">
                          <span className="text-sm font-semibold">Amount Due</span>
                          <span className="text-2xl font-black text-primary tabular-nums">
                            {formatCurrency(grandTotal)}
                          </span>
                        </div>
                      </section>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4 shrink-0 bg-muted/10">
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={pending}
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="size-3.5" />
                      <span className="ml-1.5">Cancel Session</span>
                    </Button>
                  </div>
                  <div className="flex gap-2 sm:ml-auto">
                    <Button variant="ghost" onClick={closeTableAccount} size="sm">
                      Close
                    </Button>
                    {unpaidOrders.length > 0 && (
                      <Button
                        onClick={() => setShowPayDialog(true)}
                        disabled={pending}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CreditCard className="size-3.5" />
                        <span className="ml-1.5">Process Payment</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Payment Dialog - Professional Layout */}
      <Dialog
        open={showPayDialog}
        onOpenChange={(o) => setShowPayDialog(o)}
      >
        <DialogContent 
          showCloseButton={false}
          className="w-[1000px] !min-w-[1000px] max-h-[90vh] !max-w-[1000px] p-0 gap-0 overflow-hidden flex flex-col rounded-2xl"
        >
          {selectedTable && selectedSession && (
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
                      <p className="text-base font-black leading-tight">{selectedTable.label}</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-600" />
                  <div className="flex items-center gap-2 text-white">
                    <Receipt className="size-4" />
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Session</p>
                      <p className="text-base font-black leading-tight truncate max-w-[120px]">{selectedSession.customer_name}</p>
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
                    onClick={() => setShowPayDialog(false)}
                    className="ml-2 size-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <XCircle className="size-5 text-white" />
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
                            {formatCurrency(grandTotal)}
                          </p>
                          <p className="text-[11px] text-blue-100 mt-1.5">
                            Total items: {grandItemCount} | Service charge: {formatCurrency(grandTax)}
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
                            onClick={() => setPayMethod(method.id as any)}
                            className={`relative rounded-xl border-2 p-2.5 transition-all duration-200 ${
                              payMethod === method.id
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg scale-105'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {payMethod === method.id && (
                              <div className="absolute -top-2 -right-2 size-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg z-10">
                                <Check className="size-3.5 text-white stroke-[3]" />
                              </div>
                            )}
                            <div className="w-full h-12 mb-1.5 flex items-center justify-center">
                              <img src={method.img} alt={method.label} className="max-w-full max-h-full object-contain" />
                            </div>
                            <p className={`text-center text-xs font-black ${
                              payMethod === method.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {method.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cash Input with Numpad */}
                    {payMethod === "cash" && (
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">Amount Tendered</h3>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5">Enter the cash amount received.</p>
                        
                        <div className="relative mb-3">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">₱</span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={payAmountTendered}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '')
                              setPayAmountTendered(value)
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
                                  setPayAmountTendered((v) => v.slice(0, -1))
                                } else {
                                  setPayAmountTendered((v) => v + num)
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
                                const current = parseFloat(payAmountTendered) || 0
                                setPayAmountTendered(String(current + amount))
                              }}
                              className="h-9 text-sm font-bold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                            >
                              +{amount}
                            </Button>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPayAmountTendered(String(grandTotal))}
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
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">Items ({grandItemCount})</h3>
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(grandSubtotal)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(grandSubtotal)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Service Charge</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(grandTax)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t-2 border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900 dark:text-white">Total</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                              {formatCurrency(grandTotal)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Change Due Card */}
                      {payMethod === "cash" && changeDue !== null && changeDue > 0 && (
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
                                  <span>{formatCurrency(parseFloat(payAmountTendered))} received</span>
                                  <span>−</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{formatCurrency(grandTotal)} total</span>
                                  <span>=</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary Info */}
                      {payMethod === "cash" && payAmountTendered && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                          <div className="flex gap-2">
                            <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">Payment Summary</h4>
                              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                <div className="flex justify-between gap-4">
                                  <span>Cash Received</span>
                                  <span className="font-bold">{formatCurrency(parseFloat(payAmountTendered))}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Total Amount</span>
                                  <span className="font-bold">{formatCurrency(grandTotal)}</span>
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
                        onClick={handleConfirmPayment}
                        disabled={
                          pending ||
                          (payMethod === "cash" &&
                            (!payAmountTendered ||
                              parseFloat(payAmountTendered) < grandTotal))
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
                        onClick={() => setShowPayDialog(false)}
                        className="w-full h-10 text-sm font-bold rounded-lg"
                      >
                        <XCircle className="size-4 mr-2" />
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

      {/* Cancel Session Dialog */}
      <Dialog
        open={showCancelDialog}
        onOpenChange={(o) => setShowCancelDialog(o)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="size-5" />
              Cancel Table Session
            </DialogTitle>
            <DialogDescription>
              {selectedTable?.label} ·{" "}
              {selectedSession && (
                <span className="font-medium text-foreground">
                  {selectedSession.customer_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border-2 border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-800/40 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                    This will cancel the active session
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1">
                    The session will be archived and the table will return to Available.
                    All open orders will be marked as cancelled.
                  </p>
                </div>
              </div>
            </div>

            {unpaidOrders.length > 0 && (
              <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1.5 text-muted-foreground">
                <p className="font-semibold text-foreground text-sm">
                  {unpaidOrders.length} open order{unpaidOrders.length !== 1 ? "s" : ""} will be cancelled:
                </p>
                <ul className="space-y-0.5 pl-4 list-disc">
                  {unpaidOrders.map((o) => (
                    <li key={o.id}>
                      Order #{o.order_number} · {formatCurrency(Number(o.total))}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-md border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 p-3 text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold">No payment will be recorded.</p>
              <p className="mt-1 text-amber-700/80 dark:text-amber-400/70">
                Use this only for walk-outs, system errors, or staff-initiated closures. For
                paid bills, use <strong>Process Payment</strong> instead.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={pending}
            >
              Keep Session Active
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={pending}
              variant="destructive"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
              <span className="ml-1.5">Cancel Session</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </StaffShell>
    </>
  )
}
