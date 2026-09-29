'use client'

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { X, MapPin, Phone, Mail, Calendar, Package, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getOrderById, updateOrderStatus, updatePaymentStatus } from "@/app/actions/manager-orders"
import { toast } from "sonner"

interface OrderDetailModalProps {
  orderId: string
  onClose: () => void
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    setLoading(true)
    const { order, error } = await getOrderById(orderId)
    if (error) {
      toast.error("Failed to load order")
      onClose()
    } else {
      setOrder(order)
    }
    setLoading(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    const { success, error } = await updateOrderStatus(orderId, newStatus)
    if (success) {
      toast.success("Order status updated")
      await loadOrder()
    } else {
      toast.error(error || "Failed to update status")
    }
    setUpdating(false)
  }

  const handlePaymentStatusChange = async (newStatus: string) => {
    setUpdating(true)
    const { success, error } = await updatePaymentStatus(orderId, newStatus)
    if (success) {
      toast.success("Payment status updated")
      await loadOrder()
    } else {
      toast.error(error || "Failed to update payment status")
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!order) return null

  const items = JSON.parse(order.items || '[]')

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{order.order_number}</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.created_at), 'MMMM dd, yyyy HH:mm')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Management */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Order Status</label>
              <Select 
                value={order.status} 
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Payment Status</label>
              <Select 
                value={order.payment_status} 
                onValueChange={handlePaymentStatusChange}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium min-w-24">Name:</span>
                <span>{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4" />
                <span className="font-medium min-w-24">Phone:</span>
                <span>{order.customer_phone}</span>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4" />
                  <span className="font-medium min-w-24">Email:</span>
                  <span>{order.customer_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="size-4" />
                <span className="font-medium">Type:</span>
                <Badge variant="outline" className="capitalize">{order.order_type}</Badge>
              </div>
              {order.order_type === 'delivery' && order.delivery_address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="size-4 mt-0.5" />
                  <span className="font-medium min-w-24">Address:</span>
                  <span className="flex-1">{order.delivery_address}</span>
                </div>
              )}
              {order.delivery_notes && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-medium min-w-24">Notes:</span>
                  <span className="flex-1">{order.delivery_notes}</span>
                </div>
              )}
              {order.scheduled_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4" />
                  <span className="font-medium">Scheduled:</span>
                  <span>{format(new Date(order.scheduled_time), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="size-4" />
                <span className="font-medium">Payment:</span>
                <span className="capitalize">{order.payment_method?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {items.map((item: any, index: number) => (
                <div key={index} className="flex items-start justify-between pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    {item.addons && item.addons.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Add-ons: {item.addons.join(', ')}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">₱{Number(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₱{Number(order.subtotal).toLocaleString()}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>₱{Number(order.delivery_fee).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>₱{Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
