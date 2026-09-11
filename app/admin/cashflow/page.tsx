import { Suspense } from "react"
import { CashflowDashboard } from "@/components/admin/cashflow-dashboard"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Cashflow | Admin",
  description: "Financial analytics and cashflow management",
}

export default function CashflowPage() {
  return (
    <Suspense fallback={<CashflowLoadingSkeleton />}>
      <CashflowDashboard />
    </Suspense>
  )
}

function CashflowLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-80 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
