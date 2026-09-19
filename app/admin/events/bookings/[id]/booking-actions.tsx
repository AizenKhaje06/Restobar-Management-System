"use client"

import { useState } from "react"
import { updateBookingStatus } from "@/app/actions/admin-events"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Ban, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { EventBooking } from "@/lib/types/events"

export function BookingActions({ booking }: { booking: EventBooking }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null)

  async function handleStatusChange(
    status: "confirmed" | "cancelled",
    requiresNotes: boolean = false
  ) {
    if (requiresNotes && !notes.trim()) {
      toast.error("Please provide a reason")
      return
    }

    setLoading(true)
    try {
      const result = await updateBookingStatus(booking.id, status, notes || undefined)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          status === "confirmed"
            ? "Booking confirmed successfully"
            : "Booking cancelled"
        )
        setShowNotesFor(null)
        setNotes("")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Don't show actions if already completed or cancelled
  if (booking.status === "completed" || booking.status === "cancelled") {
    return null
  }

  return (
    <div className="p-6 rounded-xl border bg-card space-y-4">
      <h2 className="text-lg font-bold">Quick Actions</h2>

      <div className="flex flex-wrap gap-3">
        {/* Approve/Confirm Button */}
        {booking.status === "pending" && (
          <Button
            onClick={() => handleStatusChange("confirmed")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="size-4 mr-2" />
            )}
            Approve Booking
          </Button>
        )}

        {/* Mark as Paid (manual override) */}
        {(booking.status === "confirmed" || booking.status === "pending") &&
          booking.payment_status !== "paid" && (
            <Button
              onClick={() => handleStatusChange("paid" as any)}
              disabled={loading}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            >
              Mark as Paid
            </Button>
          )}

        {/* Complete Booking */}
        {booking.status === "paid" && (
          <Button
            onClick={() => handleStatusChange("completed" as any)}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Mark as Completed
          </Button>
        )}

        {/* Cancel Button */}
        {booking.status !== "cancelled" && (
          <>
            {showNotesFor === "cancel" ? (
              <div className="flex-1 min-w-[300px] space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for cancellation (required)"
                  className="w-full p-3 rounded-lg border bg-background resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange("cancelled", true)}
                    disabled={loading || !notes.trim()}
                    variant="destructive"
                    size="sm"
                  >
                    {loading ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="size-4 mr-2" />
                    )}
                    Confirm Cancellation
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNotesFor(null)
                      setNotes("")
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowNotesFor("cancel")}
                variant="destructive"
              >
                <Ban className="size-4 mr-2" />
                Cancel Booking
              </Button>
            )}
          </>
        )}
      </div>

      {/* Add Notes (optional for approval) */}
      {booking.status === "pending" && showNotesFor !== "cancel" && (
        <div className="pt-4 border-t space-y-2">
          <label className="text-sm font-medium">
            Add Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this booking..."
            className="w-full p-3 rounded-lg border bg-background resize-none"
            rows={2}
          />
          {notes && (
            <Button
              onClick={() => handleStatusChange("confirmed")}
              disabled={loading}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Approve with Notes
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
