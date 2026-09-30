import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Activity, Clock } from "lucide-react"
import { ActivityLogTable } from "@/components/manager/activity-log-table"

export default async function ActivityLogPage() {
  const supabase = await createClient()

  // Fetch activity logs
  const { data: logs, error } = await supabase
    .from("content_updates_log")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100)

  // Calculate stats
  const totalLogs = logs?.length || 0
  const todayLogs = logs?.filter(l => {
    const today = new Date().toDateString()
    const logDate = new Date(l.created_at).toDateString()
    return today === logDate
  })?.length || 0

  const recentActivity = logs?.[0]
    ? new Date(logs[0].created_at).toLocaleString()
    : "No activity"

  const stats = [
    {
      title: "Total Activities",
      value: totalLogs,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Today's Activities",
      value: todayLogs,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Last Activity",
      value: recentActivity,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      isTime: true
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          View all content updates and changes
        </p>
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
                <div className={stat.isTime ? "text-sm font-medium" : "text-2xl font-bold"}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Activity Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-center text-red-600">Error: {error.message}</p>
          ) : logs && logs.length > 0 ? (
            <ActivityLogTable logs={logs} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No activity logs yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
