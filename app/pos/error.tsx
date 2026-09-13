"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function PosError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("POS Page Error:", error)
  }, [error])

  // Check if it's a ChunkLoadError (code splitting issue)
  const isChunkError = error.message?.includes("Failed to load chunk") || 
                       error.message?.includes("ChunkLoadError")

  const handleReload = () => {
    // For chunk errors, do a hard reload to clear cache
    if (isChunkError) {
      window.location.reload()
    } else {
      reset()
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-950/20 p-4">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {isChunkError ? "Loading Error" : "Something went wrong"}
          </h1>
          <p className="text-muted-foreground">
            {isChunkError
              ? "Failed to load some resources. This usually happens after an update."
              : "An error occurred while loading the POS terminal."}
          </p>
        </div>

        {error.message && !isChunkError && (
          <div className="rounded-lg bg-muted/50 p-4 text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleReload} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {isChunkError ? "Reload Page" : "Try Again"}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/pos"}
          >
            Go to POS Home
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          If the problem persists, please contact your system administrator.
        </p>
      </div>
    </div>
  )
}
