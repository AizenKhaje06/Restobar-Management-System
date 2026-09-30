import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, TrendingUp } from "lucide-react"
import { VenuesTable } from "@/components/manager/venues-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function VenuesPage() {
  const supabase = await createClient()

  // Fetch venues
  const { data: venues, error } = await supabase
    .from("event_venues")
    .select("*")
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalVenues = venues?.length || 0
  const activeVenues = venues?.filter(v => v.is_active)?.length || 0
  const totalCapacity = venues?.reduce((sum, v) => sum + (v.capacity || 0), 0) || 0

  const stats = [
    {
      title: "Total Venues",
      value: totalVenues,
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Active Venues",
      value: activeVenues,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Total Capacity",
      value: totalCapacity,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">
            Manage event venues and locations
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/venues/new">
            <Plus className="size-4 mr-2" />
            Add New Venue
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Venues Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Venues</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-center text-red-600">Error: {error.message}</p>
          ) : (
            <VenuesTable venues={venues || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
