"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Armchair,
  Edit3,
  Filter,
  Grid3x3,
  MoreVertical,
  Plus,
  QrCode,
  Search,
  Trash2,
  Users,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RestaurantTable, TableStatus } from "@/lib/types"
import {
  createTableAction,
  updateTableAction,
  deleteTableAction,
  updateTableStatusAction,
  generateTableQRAction,
} from "@/app/actions/admin"

const STATUS_STYLES: Record<TableStatus, { label: string; className: string; dot: string; border: string }> = {
  available: {
    label: "Available",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/30",
  },
  occupied: {
    label: "Occupied",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    border: "border-rose-500/30",
  },
  reserved: {
    label: "Reserved",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/30",
  },
  unavailable: {
    label: "Unavailable",
    className: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
    dot: "bg-slate-500",
    border: "border-slate-500/30",
  },
}

export function TablesManager({
  tables,
}: {
  tables: RestaurantTable[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [zoneFilter, setZoneFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<TableStatus | "all">("all")
  const [localTables, setLocalTables] = useState<RestaurantTable[]>(tables)
  const [editDialog, setEditDialog] = useState<{ open: boolean; table: RestaurantTable | null }>({
    open: false,
    table: null,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Sync local state when server data changes
  useEffect(() => {
    setLocalTables(tables)
  }, [tables])

  const zones = useMemo(() => {
    const set = new Set<string>()
    for (const t of localTables) if (t.zone) set.add(t.zone)
    return Array.from(set).sort()
  }, [localTables])

  const filtered = useMemo(() => {
    let result = localTables.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (zoneFilter !== "all" && t.zone !== zoneFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return t.label.toLowerCase().includes(q) || (t.zone ?? "").toLowerCase().includes(q)
    })
    
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
  }, [localTables, search, statusFilter, zoneFilter])

  const stats = useMemo(() => {
    const total = localTables.length
    const occupied = localTables.filter((t) => t.status === "occupied").length
    const available = localTables.filter((t) => t.status === "available").length
    const reserved = localTables.filter((t) => t.status === "reserved").length
    const unavailable = localTables.filter((t) => t.status === "unavailable").length
    const utilization = total > 0 ? Math.round((occupied / total) * 100) : 0
    return { total, occupied, available, reserved, unavailable, utilization }
  }, [localTables])

  const onStatusChange = (id: string, status: TableStatus) => {
    // Update local state immediately
    setLocalTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    )
    startTransition(async () => {
      const result = await updateTableStatusAction(id, status)
      if (result?.error) {
        console.error("Failed to update status:", result.error)
        toast.error("Failed to update table status")
        // Revert local state on error
        setLocalTables(tables)
      } else {
        toast.success("Table status updated")
        router.refresh()
      }
    })
  }

  const onRegenerateQR = (tableId: string) => {
    startTransition(async () => {
      const result = await generateTableQRAction(tableId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("QR code regenerated successfully")
      }
      router.refresh()
    })
  }

  const onDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteTableAction(deleteId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Table deleted successfully")
      }
      setDeleteId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tables & Floor Plan"
        description={`${stats.total} tables • ${stats.occupied} occupied • ${stats.utilization}% utilization`}
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Tables" }]}
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/qr-codes">
                <QrCode className="mr-2 size-4" />
                All QR Codes
              </Link>
            </Button>
            <Button size="sm" onClick={() => setEditDialog({ open: true, table: null })}>
              <Plus className="mr-2 size-4" />
              New Table
            </Button>
          </>
        }
      />

      {/* Status summary */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(["available", "occupied", "reserved", "unavailable"] as TableStatus[]).map((status) => {
          const s = STATUS_STYLES[status]
          const value = stats[status as keyof typeof stats] as number
          const active = statusFilter === status
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(active ? "all" : status)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                active ? "border-primary bg-primary/5" : "hover:bg-muted/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${s.dot}`} />
                <span className="text-sm font-medium">{s.label}</span>
              </span>
              <span className="text-lg font-semibold tabular-nums">{value}</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by table label or zone..."
              className="h-9 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={zoneFilter} onValueChange={(v) => v && setZoneFilter(v)}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All zones</SelectItem>
              {zones.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TableStatus | "all")}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          {(search || zoneFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setZoneFilter("all")
                setStatusFilter("all")
              }}
            >
              <Filter className="mr-1 size-3" />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tables grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Grid3x3 className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm font-medium">No tables found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search || zoneFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Start by adding your first table"}
            </p>
            {!search && zoneFilter === "all" && statusFilter === "all" && (
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setEditDialog({ open: true, table: null })}
              >
                <Plus className="mr-2 size-4" />
                Add Table
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              pending={pending}
              onEdit={() => setEditDialog({ open: true, table })}
              onDelete={() => setDeleteId(table.id)}
              onStatusChange={(s) => onStatusChange(table.id, s)}
              onRegenerateQR={() => onRegenerateQR(table.id)}
            />
          ))}
        </div>
      )}

      {/* Edit/create dialog */}
      <TableFormDialog
        open={editDialog.open}
        table={editDialog.table}
        onClose={() => setEditDialog({ open: false, table: null })}
        onSaved={() => {
          setEditDialog({ open: false, table: null })
          router.refresh()
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete table?</DialogTitle>
            <DialogDescription>
              This will also remove any QR codes linked to this table. Active orders on this table will lose their table reference.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={pending}>
              <Trash2 className="mr-2 size-3.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================
// Table card - Enhanced UI/UX
// ============================================================
function TableCard({
  table,
  pending,
  onEdit,
  onDelete,
  onStatusChange,
  onRegenerateQR,
}: {
  table: RestaurantTable
  pending: boolean
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: TableStatus) => void
  onRegenerateQR: () => void
}) {
  const [currentStatus, setCurrentStatus] = useState<TableStatus>(table.status)
  const s = STATUS_STYLES[currentStatus]

  const handleStatusChange = (newStatus: TableStatus | null) => {
    if (!newStatus) return
    setCurrentStatus(newStatus)
    onStatusChange(newStatus)
  }
  
  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-md ${s.border} relative`}>
      {/* Status color strip on top */}
      <div className={`h-1 w-full ${s.dot.replace('size-1.5 rounded-full', '')}`} />
      
      <CardContent className="p-4">
        {/* Header: Table Label + Actions */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon with status color */}
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${s.className} transition-transform group-hover:scale-105`}>
              <Armchair className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-none tracking-tight">{table.label}</h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Users className="size-3.5" />
                {table.seats} {table.seats === 1 ? "Seat" : "Seats"}
                {table.zone && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-xs">{table.zone}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center size-8 rounded-md hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="size-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRegenerateQR} disabled={pending}>
                <QrCode className="size-4 mr-2" />
                Regenerate QR
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="size-4 mr-2" />
                Delete Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge - Larger and more prominent */}
        <div className="mb-3">
          <Badge variant="outline" className={`${s.className} text-xs font-semibold px-3 py-1`}>
            <span className={`mr-2 size-2 rounded-full ${s.dot} animate-pulse`} />
            {s.label}
          </Badge>
        </div>

        {/* Notes section - Better visibility */}
        {table.notes && (
          <div className="mb-3 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              💬 {table.notes}
            </p>
          </div>
        )}

        {/* Status selector - Enhanced design */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Quick Status Change
          </Label>
          <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            disabled={pending}
          >
            <SelectTrigger className="h-9 text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Available
                </span>
              </SelectItem>
              <SelectItem value="occupied">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-500" />
                  Occupied
                </span>
              </SelectItem>
              <SelectItem value="reserved">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Reserved
                </span>
              </SelectItem>
              <SelectItem value="unavailable">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-gray-400" />
                  Unavailable
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
// ============================================================
// Table form dialog
// ============================================================
function TableFormDialog({
  open,
  table,
  onClose,
  onSaved,
}: {
  open: boolean
  table: RestaurantTable | null
  onClose: () => void
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<TableStatus>(table?.status ?? "available")

  // Reset status when dialog opens with a different table
  useEffect(() => {
    if (table) {
      setStatus(table.status)
    }
  }, [table?.id])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = table
        ? await updateTableAction(table.id, fd)
        : await createTableAction(fd)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(table ? "Table updated successfully" : "Table created successfully")
      onSaved()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{table ? "Edit Table" : "New Table"}</DialogTitle>
          <DialogDescription>
            {table
              ? "Update table details. The QR code remains valid."
              : "A QR code will be auto-generated for new tables."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                name="label"
                required
                defaultValue={table?.label ?? ""}
                placeholder="e.g. A-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seats">Seats *</Label>
              <Input
                id="seats"
                name="seats"
                type="number"
                min="1"
                required
                defaultValue={table?.seats ?? 2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zone">Zone</Label>
              <Input
                id="zone"
                name="zone"
                defaultValue={table?.zone ?? ""}
                placeholder="e.g. Indoor"
              />
            </div>
            {table && (
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TableStatus)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground [&>option]:text-foreground [&>option]:bg-background"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            )}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                defaultValue={table?.notes ?? ""}
                placeholder="e.g. Window seat, near stage"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : table ? "Save Changes" : "Create Table"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
