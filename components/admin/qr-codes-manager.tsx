"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Download,
  Printer,
  QrCode,
  RefreshCw,
  ScanLine,
  Search,
  AlertTriangle,
  Loader2,
  ShieldAlert,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import type { RestaurantTable } from "@/lib/types"
import { generateTableQRAction } from "@/app/actions/admin"
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants"

type TableWithWaiter = RestaurantTable & { assigned_waiter_profile: { full_name: string | null; email: string | null } | null }

export function QRCodesManager({ tables }: { tables: TableWithWaiter[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [origin, setOrigin] = useState("")
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [regeneratingTable, setRegeneratingTable] = useState<string | null>(null)
  const [regeneratingAll, setRegeneratingAll] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const filtered = useMemo(() => {
    let result = tables
    
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) => t.label.toLowerCase().includes(q) || (t.zone ?? "").toLowerCase().includes(q),
      )
    }
    
    // Sort alphabetically by label (chronological order)
    return result.sort((a, b) => {
      const labelA = a.label.toLowerCase()
      const labelB = b.label.toLowerCase()
      
      // Extract numbers from labels if they exist (e.g., "T-1", "A-10")
      const numA = parseInt(labelA.match(/\d+/)?.[0] || '0')
      const numB = parseInt(labelB.match(/\d+/)?.[0] || '0')
      
      // If both have numbers, sort by number
      if (numA && numB && labelA.replace(/\d+/, '') === labelB.replace(/\d+/, '')) {
        return numA - numB
      }
      
      // Otherwise, sort alphabetically
      return labelA.localeCompare(labelB)
    })
  }, [tables, search])

  const onPrint = () => {
    window.print()
  }

  const onRegenerateAll = () => {
    setShowRegenerateDialog(true)
  }

  const confirmRegenerateAll = () => {
    setShowRegenerateDialog(false)
    setRegeneratingAll(true)
    startTransition(async () => {
      for (const t of tables) {
        await generateTableQRAction(t.id)
      }
      router.refresh()
      setRegeneratingAll(false)
      setToastMessage(`Successfully regenerated ${tables.length} QR codes!`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 5000)
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Codes"
        description="Print-ready QR codes for every table. Customers scan to open the menu and place orders."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "QR Codes" }]}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={onRegenerateAll} disabled={pending}>
              <RefreshCw className={`mr-2 size-4 ${pending ? "animate-spin" : ""}`} />
              Regenerate All
            </Button>
            <Button size="sm" variant="outline" onClick={onPrint}>
              <Printer className="mr-2 size-4" />
              Print All
            </Button>
          </>
        }
      />

      <Card className="print:hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tables..."
              className="h-9 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filtered.length} of {tables.length} tables
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="print:hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <QrCode className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm font-medium">No tables to show</p>
            <p className="mt-1 text-xs text-muted-foreground">Create tables first to generate QR codes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 print:gap-3">
          {filtered.map((table) => (
            <QRCard
              key={table.id}
              table={table}
              origin={origin}
              onRegenerate={() => {
                setRegeneratingTable(table.id)
                startTransition(async () => {
                  await generateTableQRAction(table.id)
                  router.refresh()
                  setRegeneratingTable(null)
                  setToastMessage(`QR code for ${table.label} regenerated successfully!`)
                  setShowToast(true)
                  setTimeout(() => setShowToast(false), 4000)
                })
              }}
              pending={regeneratingTable === table.id || regeneratingAll}
            />
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-[100] min-w-[320px] max-w-md rounded-lg border border-emerald-500/50 bg-white p-4 shadow-xl dark:bg-gray-950 dark:border-emerald-500/30 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                Success!
              </p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                {toastMessage}
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Enterprise-Grade Regenerate All Confirmation Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              Regenerate All QR Codes?
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              This action will regenerate QR codes for all {tables.length} tables in your system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Warning Box */}
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200">
                    Critical Security Impact
                  </h4>
                  <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">•</span>
                      <span>All existing QR codes will <strong>immediately stop working</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">•</span>
                      <span>Customers with saved links <strong>will not be able to order</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">•</span>
                      <span>Printed QR codes must be <strong>replaced at all tables</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">•</span>
                      <span>This action <strong>cannot be undone</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-primary">{tables.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Tables</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-primary">{tables.length}</p>
                <p className="text-xs text-muted-foreground mt-1">QR Codes</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">~{tables.length * 2}s</p>
                <p className="text-xs text-muted-foreground mt-1">Est. Time</p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong className="font-semibold">💡 Recommendation:</strong> Only regenerate if QR codes are compromised or stolen. 
                For single-table updates, use the individual regenerate button instead.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowRegenerateDialog(false)}
              disabled={pending}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRegenerateAll}
              disabled={pending}
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating {tables.length} QR Codes...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Yes, Regenerate All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

// ============================================================
// QR Card (also serves as the printable label)
// ============================================================
function QRCard({
  table,
  origin,
  onRegenerate,
  pending,
}: {
  table: TableWithWaiter
  origin: string
  onRegenerate: () => void
  pending: boolean
}) {
  const supabase = createClient()
  const [qrUrl, setQrUrl] = useState<string>("")
  const [token, setToken] = useState<string>("")
  const [accessCode, setAccessCode] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the active QR for this table
    let cancelled = false
    async function load() {
      const res = await fetch(`/api/admin/table-qr?table_id=${table.id}`)
      if (!res.ok) return
      const data = await res.json()
      if (cancelled) return
      if (data.qr?.token) {
        setToken(data.qr.token)
        const target = `${origin}/order?t=${data.qr.token}`
        // Use a free QR generator (no key needed)
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(target)}`
        setQrUrl(qr)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [table.id, origin])

  // Fetch active session's access code
  useEffect(() => {
    let cancelled = false
    async function loadSession() {
      const { data } = await supabase
        .from("table_sessions")
        .select("access_code")
        .eq("table_id", table.id)
        .eq("status", "active")
        .maybeSingle()
      
      if (cancelled) return
      setAccessCode(data?.access_code || null)
    }
    loadSession()

    // Poll every 5 seconds to update the access code in real-time
    const interval = setInterval(loadSession, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [table.id, supabase])

  return (
    <Card className="overflow-hidden print:break-inside-avoid print:shadow-none print:border-2 print:border-gray-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
      <CardContent className="space-y-4 p-6 text-center print:p-6">
        {/* Header Section - TABLE INFO */}
        <div className="space-y-1 border-b pb-4 print:border-b-2">
          <div className="text-4xl font-black tracking-tight text-emerald-500 dark:text-emerald-400 print:text-5xl">
            {table.label}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {table.seats} {table.seats === 1 ? "Seat" : "Seats"}
            {table.zone ? ` • ${table.zone}` : ""}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mx-auto flex size-52 items-center justify-center rounded-xl border-4 border-gray-200 bg-white p-3 shadow-sm print:border-4 print:size-56 relative">
          {pending ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="size-12 animate-spin text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Generating New QR...</p>
                <p className="text-xs text-muted-foreground mt-1">Please wait a moment</p>
              </div>
            </div>
          ) : qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt={`QR for ${table.label}`} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ScanLine className="size-16 opacity-30" />
            </div>
          )}
        </div>

        {/* Table Code - Shows customer's PIN when session is active */}
        <div className={`mx-auto max-w-[200px] rounded-lg border-2 px-4 py-3 print:border-3 transition-colors ${
          accessCode 
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
            : 'border-gray-300 bg-gray-50 dark:bg-gray-900/20'
        }`}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Table Code
          </p>
          <p className={`mt-1 text-3xl font-black tracking-wider print:text-4xl ${
            accessCode 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-gray-400 dark:text-gray-600'
          }`}>
            {accessCode || "------"}
          </p>
          {accessCode && (
            <p className="mt-1 text-[0.6rem] font-medium text-emerald-600 dark:text-emerald-400">
              Session Active
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-1 border-t pt-3 text-xs text-muted-foreground print:border-t-2 print:pt-4">
          <div className="flex items-center justify-center gap-2">
            <ScanLine className="size-4" />
            <span className="font-medium">Scan to view menu & place order</span>
          </div>
          {token && (
            <code className="mx-auto mt-2 block max-w-[200px] truncate rounded-md bg-muted px-2 py-1 font-mono text-[0.6rem] print:hidden">
              {token}
            </code>
          )}
        </div>

        {/* Action Buttons - Hidden on Print */}
        <div className="flex gap-2 pt-2 print:hidden">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9"
            onClick={() => {
              if (qrUrl) {
                const a = document.createElement("a")
                a.href = qrUrl
                a.download = `qr-${table.label}.png`
                a.target = "_blank"
                a.click()
              }
            }}
            disabled={!qrUrl}
          >
            <Download className="mr-2 size-4" />
            Download PNG
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-9 px-3"
            onClick={onRegenerate} 
            disabled={pending}
            title="Regenerate QR Code"
          >
            <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Footer - Print Only */}
        <div className="hidden print:block pt-3 border-t-2 text-[0.65rem] text-muted-foreground">
          <p>For assistance, please call your server</p>
        </div>
      </CardContent>
    </Card>
  )
}
