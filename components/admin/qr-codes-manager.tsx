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
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { RestaurantTable } from "@/lib/types"
import { generateTableQRAction } from "@/app/actions/admin"
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants"

type TableWithWaiter = RestaurantTable & { assigned_waiter_profile: { full_name: string | null; email: string | null } | null }

export function QRCodesManager({ tables }: { tables: TableWithWaiter[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search) return tables
    const q = search.toLowerCase()
    return tables.filter(
      (t) => t.label.toLowerCase().includes(q) || (t.zone ?? "").toLowerCase().includes(q),
    )
  }, [tables, search])

  const onPrint = () => {
    window.print()
  }

  const onRegenerateAll = () => {
    if (!confirm("Regenerate QR for ALL tables? Old codes will stop working.")) return
    startTransition(async () => {
      for (const t of tables) {
        await generateTableQRAction(t.id)
      }
      router.refresh()
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

      <Card className="print:hidden">
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
        <Card className="print:hidden">
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
                startTransition(async () => {
                  await generateTableQRAction(table.id)
                  router.refresh()
                })
              }}
              pending={pending}
            />
          ))}
        </div>
      )}

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
  const [qrUrl, setQrUrl] = useState<string>("")
  const [token, setToken] = useState<string>("")

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

  return (
    <Card className="overflow-hidden print:break-inside-avoid print:shadow-none print:border-2 print:border-gray-300">
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
        <div className="mx-auto flex size-52 items-center justify-center rounded-xl border-4 border-gray-200 bg-white p-3 shadow-sm print:border-4 print:size-56">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt={`QR for ${table.label}`} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ScanLine className="size-16 opacity-30" />
            </div>
          )}
        </div>

        {/* Table Code - Corporate Style Badge */}
        <div className="mx-auto max-w-[200px] rounded-lg border-2 border-primary bg-primary/5 px-4 py-3 print:border-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Table Code
          </p>
          <p className="mt-1 text-3xl font-black tracking-wider text-primary print:text-4xl">
            {(table as any).table_code || "----"}
          </p>
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
