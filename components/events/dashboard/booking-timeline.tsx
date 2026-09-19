import { CheckCircle, Circle, XCircle, Clock } from "lucide-react"

interface BookingTimelineProps {
  booking: any
}

export function BookingTimeline({ booking }: BookingTimelineProps) {
  const timeline = [
    {
      status: "submitted",
      label: "Booking Submitted",
      date: booking.created_at,
      completed: true,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      status: "confirmed",
      label: "Booking Confirmed",
      date: booking.confirmed_at,
      completed: booking.status !== "pending" && booking.status !== "cancelled",
      icon: booking.status === "cancelled" ? XCircle : booking.confirmed_at ? CheckCircle : Clock,
      color: booking.status === "cancelled" ? "text-red-600" : booking.confirmed_at ? "text-green-600" : "text-gray-400",
    },
    {
      status: "paid",
      label: "Payment Received",
      date: booking.payment_status === "paid" ? booking.updated_at : null,
      completed: booking.payment_status === "paid",
      icon: booking.payment_status === "paid" ? CheckCircle : Circle,
      color: booking.payment_status === "paid" ? "text-green-600" : "text-gray-400",
    },
    {
      status: "completed",
      label: "Event Completed",
      date: booking.status === "completed" ? booking.updated_at : null,
      completed: booking.status === "completed",
      icon: booking.status === "completed" ? CheckCircle : Circle,
      color: booking.status === "completed" ? "text-green-600" : "text-gray-400",
    },
  ]

  // If cancelled, show cancellation instead of completion
  if (booking.status === "cancelled") {
    timeline[3] = {
      status: "cancelled",
      label: "Booking Cancelled",
      date: booking.cancelled_at,
      completed: true,
      icon: XCircle,
      color: "text-red-600",
    }
  }

  return (
    <div className="space-y-4">
      {timeline.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={item.status} className="flex gap-4">
            {/* Icon with connecting line */}
            <div className="flex flex-col items-center">
              <div className={`flex size-10 items-center justify-center rounded-full border-2 ${
                item.completed 
                  ? "bg-background" 
                  : "bg-muted"
              }`}>
                <Icon className={`size-5 ${item.color}`} />
              </div>
              {index < timeline.length - 1 && (
                <div className={`w-0.5 flex-1 min-h-8 ${
                  item.completed ? "bg-green-600" : "bg-gray-300"
                }`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-semibold ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </h4>
                {item.date && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {/* Additional info */}
              {item.status === "confirmed" && booking.confirmed_by && (
                <p className="text-sm text-muted-foreground">
                  Confirmed by staff
                </p>
              )}
              {item.status === "paid" && booking.payment_status === "paid" && (
                <p className="text-sm text-muted-foreground">
                  Full payment received
                </p>
              )}
              {item.status === "cancelled" && booking.cancellation_reason && (
                <p className="text-sm text-muted-foreground">
                  Reason: {booking.cancellation_reason}
                </p>
              )}
              {item.status === "paid" && booking.payment_status === "partial" && (
                <p className="text-sm text-amber-600">
                  Deposit paid - Balance due: ₱{Number(booking.balance_due).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
