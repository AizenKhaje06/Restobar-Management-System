import { requireAuth } from "@/lib/auth/customer-auth"
import { getBooking } from "@/app/actions/events"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Package,
  Plus,
  Palette,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingTimeline } from "@/components/events/dashboard/booking-timeline"
import { PaymentUpload } from "@/components/events/dashboard/payment-upload"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { booking } = await getBooking(params.id)
  
  if (!booking) {
    return { title: "Booking Not Found" }
  }

  return {
    title: `Booking ${booking.booking_number} - Event Venue`,
    description: `View details for ${booking.event_name || booking.event_type}`,
  }
}

const statusColors = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-600",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-600",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-600",
  completed: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-600",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-600",
}

const eventTypeLabels: Record<string, string> = {
  birthday: "Birthday Party",
  wedding: "Wedding",
  corporate: "Corporate Event",
  christening: "Christening",
  graduation: "Graduation",
  anniversary: "Anniversary",
  reunion: "Reunion",
  seminar: "Seminar/Workshop",
  product_launch: "Product Launch",
  team_building: "Team Building",
  other: "Other Event",
}

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const customer = await requireAuth()
  const { booking, error } = await getBooking(params.id)

  if (error || !booking) {
    notFound()
  }

  // Check if booking belongs to customer
  if (booking.customer_id !== customer.id) {
    notFound()
  }

  const isEventPast = new Date(booking.event_date) < new Date()
  const canUploadPayment = booking.status !== "cancelled" && booking.payment_status !== "paid"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-6 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 border-b">
        <div className="container mx-auto px-4">
          <Link
            href="/events/dashboard/bookings"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            <span>Back to My Bookings</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {booking.event_name || eventTypeLabels[booking.event_type]}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${statusColors[booking.status as keyof typeof statusColors]}`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-muted-foreground">
                Booking Number: <span className="font-mono font-semibold">{booking.booking_number}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Details */}
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="size-5" />
                  Event Details
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Event Type:</span>
                    <span className="font-medium text-right">{eventTypeLabels[booking.event_type]}</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="font-medium">{new Date(booking.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <span className="font-medium">{booking.event_start_time} - {booking.event_end_time}</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="font-medium">{booking.duration_hours} hours</span>
                  </div>
                  <div className="flex items-start justify-between py-2">
                    <span className="text-sm text-muted-foreground">Number of Guests:</span>
                    <span className="font-medium">{booking.num_guests} people</span>
                  </div>
                </div>
              </div>

              {/* Venue & Package */}
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="size-5" />
                  Venue & Package
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Venue:</span>
                    <span className="font-medium text-right">{booking.venue_name}</span>
                  </div>
                  {booking.package_name && (
                    <div className="flex items-start justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Package:</span>
                      <span className="font-medium text-right">{booking.package_name}</span>
                    </div>
                  )}
                  {booking.menu_package_name && (
                    <div className="flex items-start justify-between py-2">
                      <span className="text-sm text-muted-foreground">Menu Package:</span>
                      <span className="font-medium text-right">{booking.menu_package_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add-ons */}
              {booking.addons && booking.addons.length > 0 && (
                <div className="p-6 rounded-xl border bg-card">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus className="size-5" />
                    Add-ons ({booking.addons.length})
                  </h2>
                  <div className="space-y-2">
                    {booking.addons.map((addonItem: any) => (
                      <div key={addonItem.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <span className="font-medium">{addonItem.addon_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            (₱{Number(addonItem.unit_price).toLocaleString()} × {addonItem.quantity})
                          </span>
                        </div>
                        <span className="font-medium">₱{Number(addonItem.total_price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization */}
              {(booking.decorations_theme || booking.decorations_notes || booking.seating_arrangement || 
                booking.special_requests || booking.dietary_restrictions) && (
                <div className="p-6 rounded-xl border bg-card">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Palette className="size-5" />
                    Customization
                  </h2>
                  <div className="space-y-3">
                    {booking.decorations_theme && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Theme:</p>
                        <p className="font-medium">{booking.decorations_theme}</p>
                      </div>
                    )}
                    {booking.decorations_notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Decoration Notes:</p>
                        <p className="text-sm">{booking.decorations_notes}</p>
                      </div>
                    )}
                    {booking.seating_arrangement && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Seating Arrangement:</p>
                        <p className="font-medium capitalize">{booking.seating_arrangement.replace(/_/g, " ")}</p>
                      </div>
                    )}
                    {booking.special_requests && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Special Requests:</p>
                        <p className="text-sm">{booking.special_requests}</p>
                      </div>
                    )}
                    {booking.dietary_restrictions && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Dietary Restrictions:</p>
                        <p className="text-sm">{booking.dietary_restrictions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="text-xl font-bold mb-4">Booking Timeline</h2>
                <BookingTimeline booking={booking} />
              </div>
            </div>

            {/* Right Column - Payment & Actions */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="p-6 rounded-xl border bg-card sticky top-20">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="size-5" />
                  Payment Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Venue Cost:</span>
                    <span className="font-medium">₱{Number(booking.venue_cost).toLocaleString()}</span>
                  </div>
                  {Number(booking.food_cost) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Food Cost:</span>
                      <span className="font-medium">₱{Number(booking.food_cost).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(booking.addons_cost) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Add-ons:</span>
                      <span className="font-medium">₱{Number(booking.addons_cost).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">₱{Number(booking.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge:</span>
                    <span className="font-medium">₱{Number(booking.service_charge).toLocaleString()}</span>
                  </div>
                  <div className="border-t-2 border-amber-600 pt-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Total Amount:</span>
                    <span className="text-xl font-bold text-amber-600">
                      ₱{Number(booking.total_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Paid:</span>
                      <span className="font-bold text-green-600">
                        ₱{Number(booking.total_paid).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Balance Due:</span>
                      <span className="font-bold text-red-600">
                        ₱{Number(booking.balance_due).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Progress */}
                  {booking.payment_status !== "paid" && (
                    <div className="pt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Payment Progress</span>
                        <span>
                          {Math.round((Number(booking.total_paid) / Number(booking.total_amount)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                          style={{
                            width: `${(Number(booking.total_paid) / Number(booking.total_amount)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Status Badge */}
                  <div className="pt-3 flex items-center justify-center">
                    {booking.payment_status === "paid" ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="size-5" />
                        <span className="font-semibold">Fully Paid</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="size-5" />
                        <span className="font-semibold">Payment Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Upload */}
              {canUploadPayment && (
                <PaymentUpload bookingId={booking.id} bookingNumber={booking.booking_number} />
              )}

              {/* Actions */}
              <div className="space-y-3">
                {booking.contract_url && (
                  <a href={booking.contract_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <Download className="size-4 mr-2" />
                      Download Contract
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
