'use client'

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { X, MapPin, Phone, Mail, Calendar, Users, Package, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getBookingById, updateBookingStatus, updateBookingPaymentStatus, approveBooking, rejectBooking } from "@/app/actions/manager-bookings"
import { toast } from "sonner"

interface BookingDetailModalProps {
  bookingId: string
  onClose: () => void
}

export function BookingDetailModal({ bookingId, onClose }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const loadBooking = async () => {
    setLoading(true)
    const { booking, error } = await getBookingById(bookingId)
    if (error) {
      toast.error("Failed to load booking")
      onClose()
    } else {
      setBooking(booking)
    }
    setLoading(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    const { success, error } = await updateBookingStatus(bookingId, newStatus)
    if (success) {
      toast.success("Booking status updated")
      await loadBooking()
    } else {
      toast.error(error || "Failed to update status")
    }
    setUpdating(false)
  }

  const handlePaymentStatusChange = async (newStatus: string) => {
    setUpdating(true)
    const { success, error } = await updateBookingPaymentStatus(bookingId, newStatus)
    if (success) {
      toast.success("Payment status updated")
      await loadBooking()
    } else {
      toast.error(error || "Failed to update payment status")
    }
    setUpdating(false)
  }

  const handleApprove = async () => {
    setUpdating(true)
    const { success, error } = await approveBooking(bookingId)
    if (success) {
      toast.success("Booking approved successfully")
      await loadBooking()
    } else {
      toast.error(error || "Failed to approve booking")
    }
    setUpdating(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    setUpdating(true)
    const { success, error } = await rejectBooking(bookingId, rejectionReason)
    if (success) {
      toast.success("Booking rejected")
      setShowRejectDialog(false)
      await loadBooking()
    } else {
      toast.error(error || "Failed to reject booking")
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

  if (!booking) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(booking.created_at), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Actions for Pending Bookings */}
            {booking.status === 'pending' && (
              <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Button 
                  onClick={handleApprove}
                  disabled={updating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="size-4 mr-2" />
                  Approve Booking
                </Button>
                <Button 
                  onClick={() => setShowRejectDialog(true)}
                  disabled={updating}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="size-4 mr-2" />
                  Reject Booking
                </Button>
              </div>
            )}

            {/* Status Management */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Booking Status</label>
                <Select 
                  value={booking.status} 
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Status</label>
                <Select 
                  value={booking.payment_status} 
                  onValueChange={handlePaymentStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
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
                  <span>{booking.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4" />
                  <span className="font-medium min-w-24">Phone:</span>
                  <span>{booking.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4" />
                  <span className="font-medium min-w-24">Email:</span>
                  <span>{booking.customer_email}</span>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold mb-3">Event Details</h3>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4" />
                  <span className="font-medium min-w-24">Date:</span>
                  <span>{format(new Date(booking.event_date), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="size-4" />
                  <span className="font-medium min-w-24">Type:</span>
                  <Badge variant="outline" className="capitalize">{booking.event_type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="size-4" />
                  <span className="font-medium min-w-24">Guests:</span>
                  <span>{booking.guest_count} people</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4" />
                  <span className="font-medium min-w-24">Venue:</span>
                  <span>{booking.event_venues?.name || 'Not specified'}</span>
                </div>
                {booking.event_packages && (
                  <div className="flex items-start gap-2 text-sm">
                    <Package className="size-4 mt-0.5" />
                    <span className="font-medium min-w-24">Package:</span>
                    <div>
                      <p>{booking.event_packages.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {booking.event_packages.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Special Requests</h3>
                <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
              </div>
            )}

            {/* Payment Details */}
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
              <h3 className="font-semibold mb-3">Payment Details</h3>
              <div className="space-y-2">
                {booking.down_payment > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Down Payment</span>
                    <span>₱{Number(booking.down_payment).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Amount</span>
                  <span>₱{Number(booking.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking. The customer will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={updating}>
              {updating ? "Rejecting..." : "Reject Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
