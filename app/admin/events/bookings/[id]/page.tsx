import { getBooking } from "@/app/actions/events"
import { BookingActions } from "./booking-actions"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  FileText,
  Package,
  UtensilsCrossed,
  Sparkles,
  ChevronLeft,
  DollarSign,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingTimeline } from "@/components/events/dashboard/booking-timeline"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { booking } = await getBooking(params.id)
  return {
    title: booking
      ? `${booking.booking_number} - Admin`
      : "Booking Details - Admin",
  }
}

const statusColors = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300",
  completed: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300",
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { booking, error } = await getBooking(params.id)

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Booking not found"}</p>
          <Link href="/admin/events/bookings">
            <Button>Back to Bookings</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/events/bookings">
          <Button variant="outline" size="icon">
            <ChevronLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Booking Details
          </h1>
          <p className="text-muted-foreground mt-1">
            {booking.booking_number}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${
            statusColors[booking.status as keyof typeof statusColors]
          }`}
        >
          {booking.status.toUpperCase()}
        </span>
      </div>

      {/* Action Buttons */}
      <BookingActions booking={booking} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="size-5 text-amber-600" />
              Event Details
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Event Type</p>
                <p className="font-semibold capitalize">{booking.event_type}</p>
              </div>

              {booking.event_name && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Event Name
                  </p>
                  <p className="font-semibold">{booking.event_name}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-semibold">
                  {new Date(booking.event_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Time</p>
                <p className="font-semibold">
                  {booking.event_start_time} - {booking.event_end_time}
                </p>
                <p className="text-xs text-muted-foreground">
                  {booking.duration_hours} hours
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Venue</p>
                <p className="font-semibold">{booking.venue_name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Number of Guests
                </p>
                <p className="font-semibold">{booking.num_guests} guests</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="size-5 text-amber-600" />
              Customer Information
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="size-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{booking.customer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${booking.customer_email}`}
                    className="font-semibold hover:text-amber-600 transition-colors"
                  >
                    {booking.customer_email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${booking.customer_phone}`}
                    className="font-semibold hover:text-amber-600 transition-colors"
                  >
                    {booking.customer_phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Package & Selections */}
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package className="size-5 text-amber-600" />
              Packages & Services
            </h2>

            <div className="space-y-4">
              {booking.package_name && (
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground mb-1">
                    Event Package
                  </p>
                  <p className="font-semibold">{booking.package_name}</p>
                </div>
              )}

              {booking.menu_package_name && (
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground mb-1">
                    Menu Package
                  </p>
                  <p className="font-semibold">{booking.menu_package_name}</p>
                </div>
              )}

              {booking.addons && booking.addons.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Add-ons</p>
                  <div className="space-y-2">
                    {booking.addons.map((addon: any) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border text-sm"
                      >
                        <span className="font-medium">{addon.addon_name}</span>
                        <span className="text-muted-foreground">
                          {addon.quantity}x ₱
                          {Number(addon.unit_price).toLocaleString()} = ₱
                          {Number(addon.total_price).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customization Details */}
          {(booking.decorations_theme ||
            booking.seating_arrangement ||
            booking.special_requests ||
            booking.dietary_restrictions) && (
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="size-5 text-amber-600" />
                Customization & Special Requests
              </h2>

              <div className="space-y-4">
                {booking.decorations_theme && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Decoration Theme
                    </p>
                    <p className="font-medium">{booking.decorations_theme}</p>
                    {booking.decorations_notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.decorations_notes}
                      </p>
                    )}
                  </div>
                )}

                {booking.seating_arrangement && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Seating Arrangement
                    </p>
                    <p className="font-medium">{booking.seating_arrangement}</p>
                  </div>
                )}

                {booking.dietary_restrictions && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Dietary Restrictions
                    </p>
                    <p className="font-medium">{booking.dietary_restrictions}</p>
                  </div>
                )}

                {booking.special_requests && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Special Requests
                    </p>
                    <p className="font-medium whitespace-pre-wrap">
                      {booking.special_requests}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {booking.notes && (
            <div className="p-6 rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <FileText className="size-5 text-amber-600" />
                Admin Notes
              </h2>
              <p className="text-sm whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="text-lg font-bold mb-4">Booking Status</h2>
            <BookingTimeline booking={booking} />
          </div>

          {/* Pricing Breakdown */}
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="size-5 text-amber-600" />
              Pricing
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Venue Cost</span>
                <span className="font-medium">
                  ₱{Number(booking.venue_cost).toLocaleString()}
                </span>
              </div>

              {booking.food_cost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Food Cost</span>
                  <span className="font-medium">
                    ₱{Number(booking.food_cost).toLocaleString()}
                  </span>
                </div>
              )}

              {booking.addons_cost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span className="font-medium">
                    ₱{Number(booking.addons_cost).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  ₱{Number(booking.subtotal).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service Charge (10%)</span>
                <span className="font-medium">
                  ₱{Number(booking.service_charge).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t-2 border-amber-200 dark:border-amber-900">
                <span className="font-bold">Total Amount</span>
                <span className="text-xl font-bold text-amber-600">
                  ₱{Number(booking.total_amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="size-5 text-amber-600" />
              Payment Status
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Payment Progress</span>
                  <span className="font-medium">
                    {((Number(booking.total_paid) / Number(booking.total_amount)) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-orange-600 transition-all"
                    style={{
                      width: `${(Number(booking.total_paid) / Number(booking.total_amount)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-bold text-green-600">
                    ₱{Number(booking.total_paid).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Balance Due</span>
                  <span className="font-bold text-orange-600">
                    ₱{Number(booking.balance_due).toLocaleString()}
                  </span>
                </div>

                {booking.payment_due_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">
                      {new Date(booking.payment_due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {booking.payments && booking.payments.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Payment History</p>
                  <div className="space-y-2">
                    {booking.payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="p-3 rounded-lg bg-muted/50 border text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            ₱{Number(payment.amount).toLocaleString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              payment.status === "verified"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                : payment.status === "rejected"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString()} •{" "}
                          {payment.payment_method}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="p-4 rounded-lg border bg-muted/30 text-xs text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(booking.created_at).toLocaleString()}
            </p>
            {booking.confirmed_at && (
              <p>
                <span className="font-medium">Confirmed:</span>{" "}
                {new Date(booking.confirmed_at).toLocaleString()}
              </p>
            )}
            {booking.cancelled_at && (
              <p>
                <span className="font-medium">Cancelled:</span>{" "}
                {new Date(booking.cancelled_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
