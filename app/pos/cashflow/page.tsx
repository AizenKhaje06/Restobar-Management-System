import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { getPosCashflowSummary } from "@/app/actions/pos-cashflow"
import { PosCashflowClient } from "@/components/dashboard/pos-cashflow-client"

export default async function PosCashflowPage() {
  const profile = await getSessionProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "pos" && profile.role !== "admin") {
    redirect("/")
  }

  const result = await getPosCashflowSummary()

  if (result.error || !result.data) {
    // Check if it's a table not found error
    const isTableMissing = result.error?.includes("does not exist") || result.error?.includes("relation")
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          {isTableMissing ? (
            <>
              <div className="mb-4 p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 w-16 h-16 mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Setup Required</h1>
              <p className="text-muted-foreground mb-4">
                The cash remittances feature needs to be set up first.
              </p>
              <div className="text-left bg-muted/50 p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Ask your admin to:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Open Supabase Dashboard → SQL Editor</li>
                  <li>Run: <code className="text-xs bg-muted px-1 py-0.5 rounded">create_cash_remittances.sql</code></li>
                  <li>Then refresh this page</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
              <p className="text-muted-foreground">{result.error || "Failed to load cashflow data"}</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <PosCashflowClient
      profile={profile}
      initialData={result.data}
      restaurantName={process.env.NEXT_PUBLIC_RESTAURANT_NAME}
      restaurantLogo={process.env.NEXT_PUBLIC_RESTAURANT_LOGO}
    />
  )
}
