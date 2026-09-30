import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import { ReviewsTable } from "@/components/manager/reviews-table"

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const statusFilter = params.status as string | undefined

  const supabase = await createClient()

  // Fetch reviews
  let query = supabase
    .from("customer_reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const { data: reviews, error } = await query

  // Calculate stats
  const totalReviews = reviews?.length || 0
  const pendingReviews = reviews?.filter(r => r.status === 'pending')?.length || 0
  const approvedReviews = reviews?.filter(r => r.status === 'approved')?.length || 0
  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  const stats = [
    {
      title: "Total Reviews",
      value: totalReviews,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Average Rating",
      value: avgRating,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      title: "Pending",
      value: pendingReviews,
      icon: XCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      title: "Approved",
      value: approvedReviews,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
        <p className="text-muted-foreground">
          Manage and moderate customer feedback
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
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
          )
        })}
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-center text-red-600">Error: {error.message}</p>
          ) : (
            <ReviewsTable reviews={reviews || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
