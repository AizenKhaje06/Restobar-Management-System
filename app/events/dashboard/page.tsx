import { requireAuth } from "@/lib/auth/customer-auth"
import { getCustomerBookings } from "@/app/actions/events"
import Link from "next/link"
import { 
  Calendar, 
  Package, 
  User, 
  FileText, 
  CreditCard,
  ChevronRight,
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Dashboard - Event Venue",
  description: "Manage your event bookings and profile",
}

export default async function DashboardPage() {
  const customer = await requireAuth()
  const { bookings } = await getCustomerBookings()

  // Calculate stats
  const totalBookings = bookings?.length || 0
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed" || b.status === "paid").length || 0
  const totalSpent = bookings?.reduce((sum, b) => sum + Number(b.total_paid || 0), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                Welcome back, {customer.full_name}!
              </h1>
              <p className="text-muted-foreground">
                Manage your event bookings and account settings
              </p>
            </div>
            <Link href="/events/book">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                <Calendar className="size-4 mr-2" />
                New Booking
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8 -mt-6">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Bookings */}
            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <CalendarCheck className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{totalBookings}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>

            {/* Pending */}
            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="size-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{pendingBookings}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>

            {/* Confirmed */}
            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{confirmedBookings}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>

            {/* Total Spent */}
            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <CreditCard className="size-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">₱{totalSpent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/events/dashboard/bookings">
              <div className="group p-6 rounded-xl border bg-card hover:shadow-lg hover:border-amber-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-600 dark:group-hover:bg-blue-600 transition-colors">
                    <FileText className="size-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold mb-1">My Bookings</h3>
                <p className="text-sm text-muted-foreground">View and manage your event bookings</p>
              </div>
            </Link>

            <Link href="/events/book">
              <div className="group p-6 rounded-xl border bg-card hover:shadow-lg hover:border-amber-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-600 dark:group-hover:bg-amber-600 transition-colors">
                    <Calendar className="size-6 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors" />
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold mb-1">New Booking</h3>
                <p className="text-sm text-muted-foreground">Book a new event venue or package</p>
              </div>
            </Link>

            <Link href="/events/dashboard/profile">
              <div className="group p-6 rounded-xl border bg-card hover:shadow-lg hover:border-amber-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-600 dark:group-hover:bg-purple-600 transition-colors">
                    <User className="size-6 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold mb-1">Profile Settings</h3>
                <p className="text-sm text-muted-foreground">Update your account information</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Bookings</h2>
            {bookings && bookings.length > 3 && (
              <Link href="/events/dashboard/bookings">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <Link
                  key={booking.id}
                  href={`/events/dashboard/bookings/${booking.id}`}
                  className="block p-6 rounded-xl border bg-card hover:shadow-lg hover:border-amber-600 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{booking.event_name || `${booking.event_type} Event`}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === "confirmed" || booking.status === "paid"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : booking.status === "pending"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            : "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>📅 {new Date(booking.event_date).toLocaleDateString()}</span>
                        <span>🏢 {booking.venue_name}</span>
                        <span>👥 {booking.num_guests} guests</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">
                        ₱{Number(booking.total_amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.booking_number}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-2xl bg-muted/30">
              <Calendar className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Link href="/events/book">
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                  Book Your First Event
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
