import { createClient } from "@/lib/supabase/server"
import { 
  ShoppingCart, 
  Calendar, 
  Users, 
  Star,
  TrendingUp,
  Package,
  MessageSquare
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ManagerDashboard() {
  const supabase = await createClient()

  // Fetch dashboard stats
  const [
    { count: pendingOrders },
    { count: todayOrders },
    { count: pendingBookings },
    { count: totalCustomers },
    { count: pendingReviews },
  ] = await Promise.all([
    supabase.from("online_orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("online_orders").select("*", { count: "exact", head: true }).gte("created_at", new Date().toISOString().split('T')[0]),
    supabase.from("event_bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("event_customers").select("*", { count: "exact", head: true }),
    supabase.from("customer_reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ])

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from("online_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recent bookings
  const { data: recentBookings } = await supabase
    .from("event_bookings")
    .select("*, event_packages(name), event_venues(name)")
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    {
      title: "Pending Orders",
      value: pendingOrders || 0,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      href: "/manager/orders?status=pending"
    },
    {
      title: "Today's Orders",
      value: todayOrders || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      href: "/manager/orders"
    },
    {
      title: "Pending Bookings",
      value: pendingBookings || 0,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      href: "/manager/bookings?status=pending"
    },
    {
      title: "Total Customers",
      value: totalCustomers || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      href: "/manager/customers"
    },
    {
      title: "Pending Reviews",
      value: pendingReviews || 0,
      icon: MessageSquare,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      href: "/manager/reviews?status=pending"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your landing page, orders, and customer bookings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <a key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`size-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₱{Number(order.total_amount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Event Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{booking.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.event_packages?.name || 'No package'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(booking.event_date).toLocaleDateString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No bookings yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
