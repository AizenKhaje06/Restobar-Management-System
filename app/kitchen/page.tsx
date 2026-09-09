"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatTime, relativeTime } from "@/lib/constants"
import { ChefHat, Clock, CheckCircle2, AlertCircle, Flame } from "lucide-react"
import type { OrderWithItems } from "@/lib/types"

interface KitchenOrder extends OrderWithItems {
  elapsed_minutes?: number
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000)
    
    // Subscribe to real-time updates
    const supabase = createClient()
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: "status=in.(pending,confirmed,preparing)",
        },
        () => {
          fetchOrders()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      channel.unsubscribe()
    }
  }, [])

  async function fetchOrders() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(*),
        tables(label, zone)
      `)
      .in("status", ["pending", "confirmed", "preparing"])
      .order("created_at", { ascending: true })

    if (!error && data) {
      // Calculate elapsed time for each order
      const now = Date.now()
      const ordersWithTime = data.map((order) => ({
        ...order,
        elapsed_minutes: Math.floor((now - new Date(order.created_at).getTime()) / 60000),
      })) as KitchenOrder[]
      
      setOrders(ordersWithTime)
    }
    setLoading(false)
  }

  async function updateOrderStatus(orderId: string, status: "confirmed" | "preparing" | "ready") {
    const supabase = createClient()
    await supabase.from("orders").update({ status }).eq("id", orderId)
    fetchOrders()
  }

  async function updateItemStatus(itemId: string, status: "preparing" | "ready") {
    const supabase = createClient()
    await supabase.from("order_items").update({ status }).eq("id", itemId)
    fetchOrders()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-lg">Loading kitchen orders...</p>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const confirmedOrders = orders.filter((o) => o.status === "confirmed")
  const preparingOrders = orders.filter((o) => o.status === "preparing")

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-900 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Kitchen Display System</h1>
            <p className="text-sm text-slate-400">
              {orders.length} active order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums text-white">
            {new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-sm text-slate-400">{new Date().toLocaleDateString("en-PH")}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold text-white">All Clear! 🎉</h2>
            <p className="text-slate-400">No orders in queue. Great job!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Column 1: Pending (Needs Confirmation) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <h2 className="font-bold text-yellow-500">
                PENDING ({pendingOrders.length})
              </h2>
            </div>
            {pendingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={updateOrderStatus}
                onItemStatusChange={updateItemStatus}
              />
            ))}
          </div>

          {/* Column 2: Confirmed (Ready to Cook) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="font-bold text-blue-500">
                CONFIRMED ({confirmedOrders.length})
              </h2>
            </div>
            {confirmedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={updateOrderStatus}
                onItemStatusChange={updateItemStatus}
              />
            ))}
          </div>

          {/* Column 3: Preparing (Cooking) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 p-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="font-bold text-orange-500">
                PREPARING ({preparingOrders.length})
              </h2>
            </div>
            {preparingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={updateOrderStatus}
                onItemStatusChange={updateItemStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OrderCard({
  order,
  onStatusChange,
  onItemStatusChange,
}: {
  order: KitchenOrder
  onStatusChange: (orderId: string, status: "confirmed" | "preparing" | "ready") => void
  onItemStatusChange: (itemId: string, status: "preparing" | "ready") => void
}) {
  const isUrgent = (order.elapsed_minutes ?? 0) > 15
  const isWarning = (order.elapsed_minutes ?? 0) > 10

  return (
    <Card
      className={`border-2 transition-all ${
        isUrgent
          ? "border-red-500 bg-red-950/50"
          : isWarning
          ? "border-yellow-500 bg-yellow-950/30"
          : "border-slate-700 bg-slate-900"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-white">
                #{order.order_number.toString().slice(-4)}
              </h3>
              {isUrgent && <Badge variant="destructive">URGENT</Badge>}
            </div>
            {order.tables && (
              <p className="text-sm font-medium text-slate-300">
                Table: {order.tables.label}
                {order.tables.zone && ` (${order.tables.zone})`}
              </p>
            )}
          </div>
          <div className="text-right">
            <p
              className={`text-xl font-bold tabular-nums ${
                isUrgent ? "text-red-400" : isWarning ? "text-yellow-400" : "text-slate-400"
              }`}
            >
              {order.elapsed_minutes}m
            </p>
            <p className="text-xs text-slate-500">{relativeTime(order.created_at)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Order Items */}
        <div className="space-y-2">
          {order.order_items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {item.quantity}×
                </div>
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  {item.notes && (
                    <p className="text-xs text-yellow-400">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
              {order.status === "preparing" && (
                <Button
                  size="sm"
                  variant={item.status === "ready" ? "default" : "outline"}
                  onClick={() =>
                    onItemStatusChange(
                      item.id,
                      item.status === "ready" ? "preparing" : "ready"
                    )
                  }
                  className="h-8"
                >
                  {item.status === "ready" ? "✓ Ready" : "Mark Ready"}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
            <p className="text-sm font-semibold text-yellow-400">Special Instructions:</p>
            <p className="text-sm text-yellow-300">{order.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {order.status === "pending" && (
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => onStatusChange(order.id, "confirmed")}
            >
              ✓ Confirm Order
            </Button>
          )}
          {order.status === "confirmed" && (
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={() => onStatusChange(order.id, "preparing")}
            >
              🔥 Start Cooking
            </Button>
          )}
          {order.status === "preparing" && (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onStatusChange(order.id, "ready")}
            >
              ✓ Ready to Serve
            </Button>
          )}
        </div>

        {/* Time indicator */}
        <div className="mt-2 text-center text-xs text-slate-500">
          Ordered at {formatTime(order.created_at)}
        </div>
      </CardContent>
    </Card>
  )
}
