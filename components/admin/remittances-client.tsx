"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Banknote,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  CheckCheck,
  XCircle,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/constants"
import type { Profile } from "@/lib/types"
import { verifyRemittance } from "@/app/actions/pos-cashflow"
import { toast } from "sonner"

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Clock className="size-3" />,
  },
  verified: {
    label: "Verified",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle2 className="size-3" />,
  },
  discrepancy: {
    label: "Discrepancy",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
    icon: <AlertCircle className="size-3" />,
  },
}

interface RemittanceRow {
  id: string
  remittance_number: number
  cash_amount: number
  declared_amount: number
  variance: number
  total_transactions: number
  cash_transactions: number
  card_amount: number
  gcash_amount: number
  maya_amount: number
  shift_start_at: string
  shift_end_at: string
  status: string
  pos_notes: string | null
  admin_notes: string | null
  created_at: string
  remitter?: { id: string; full_name: string | null; email: string | null }
  receiver?: { id: string; full_name: string | null; email: string | null }
}

export function AdminRemittancesClient({
  profile,
  initialRemittances,
}: {
  profile: Profile
  initialRemittances: RemittanceRow[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [remittances, setRemittances] = useState(initialRemittances)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRemittance, setSelectedRemittance] = useState<RemittanceRow | null>(null)
  const [verifyDialog, setVerifyDialog] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState<"verified" | "discrepancy">("verified")
  const [adminNotes, setAdminNotes] = useState("")

  const handleRefresh = () => {
    router.refresh()
  }

  const openVerifyDialog = (remittance: RemittanceRow) => {
    setSelectedRemittance(remittance)
    setVerifyStatus(remittance.variance === 0 ? "verified" : "discrepancy")
    setAdminNotes(remittance.admin_notes || "")
    setVerifyDialog(true)
  }

  const handleVerify = () => {
    if (!selectedRemittance) return

    startTransition(async () => {
      const result = await verifyRemittance({
        remittanceId: selectedRemittance.id,
        status: verifyStatus,
        adminNotes: adminNotes || undefined,
      })

      if (result.error) {
        toast.error("Failed to verify remittance", {
          description: result.error,
        })
        return
      }

      toast.success("Remittance verified", {
        description: `Remittance #${selectedRemittance.remittance_number} marked as ${verifyStatus}`,
      })

      setVerifyDialog(false)
      setSelectedRemittance(null)
      router.refresh()
    })
  }

  // Filter remittances
  const filtered = remittances.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false

    if (search) {
      const q = search.toLowerCase()
      return (
        String(r.remittance_number).includes(q) ||
        r.remitter?.full_name?.toLowerCase().includes(q) ||
        r.remitter?.email?.toLowerCase().includes(q)
      )
    }

    return true
  })

  // Calculate summary stats
  const stats = {
    total: remittances.length,
    pending: remittances.filter((r) => r.status === "pending").length,
    verified: remittances.filter((r) => r.status === "verified").length,
    discrepancy: remittances.filter((r) => r.status === "discrepancy").length,
    totalCash: remittances.reduce((sum, r) => sum + r.cash_amount, 0),
    totalVariance: remittances.reduce((sum, r) => sum + r.variance, 0),
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cash Remittances</h1>
          <p className="text-sm text-muted-foreground">
            Review and verify cash remittances from POS staff
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={pending}>
          <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-l-4 border-l-purple-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(168,85,247,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(168,85,247,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="size-4" />
              Total Remittances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pending} pending verification
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(16,185,129,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully verified</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(244,63,94,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(244,63,94,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="size-4" />
              Discrepancies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{stats.discrepancy}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(59,130,246,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(59,130,246,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Banknote className="size-4" />
              Total Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCash)}</div>
            <p
              className={`text-xs mt-1 font-medium ${
                stats.totalVariance === 0
                  ? "text-emerald-600"
                  : stats.totalVariance > 0
                  ? "text-blue-600"
                  : "text-rose-600"
              }`}
            >
              {stats.totalVariance === 0
                ? "No variance"
                : `${stats.totalVariance > 0 ? "+" : ""}${formatCurrency(stats.totalVariance)} variance`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by remittance #, staff name, or email..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="discrepancy">Discrepancy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Remittances Table */}
      <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.3)_inset] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)_inset,0_1px_0_rgba(255,255,255,0.5)_inset] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_1px_0_rgba(255,255,255,0.1)_inset] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset,0_1px_0_rgba(255,255,255,0.2)_inset]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Remittance #</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Shift Period</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Declared</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <FileText className="size-12 mx-auto mb-2 opacity-20" />
                      <p>No remittances found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((rem) => (
                    <TableRow key={rem.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono font-bold">
                        #{rem.remittance_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {rem.remitter?.full_name || "Unknown Staff"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rem.remitter?.email || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium">
                            {new Date(rem.shift_start_at).toLocaleDateString()}
                          </p>
                          <p className="text-muted-foreground">
                            {new Date(rem.shift_start_at).toLocaleTimeString()} -{" "}
                            {new Date(rem.shift_end_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(rem.cash_amount)}
                        <p className="text-xs text-muted-foreground">
                          {rem.cash_transactions} txns
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(rem.declared_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {rem.variance === 0 ? (
                          <span className="text-emerald-600 font-medium">-</span>
                        ) : (
                          <span
                            className={`font-bold ${
                              rem.variance > 0 ? "text-blue-600" : "text-rose-600"
                            }`}
                          >
                            {rem.variance > 0 ? "+" : ""}
                            {formatCurrency(Math.abs(rem.variance))}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_CONFIG[rem.status]?.className}>
                          {STATUS_CONFIG[rem.status]?.icon}
                          <span className="ml-1">{STATUS_CONFIG[rem.status]?.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openVerifyDialog(rem)}
                        >
                          <Eye className="size-3 mr-1" />
                          {rem.status === "pending" ? "Verify" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Verify Dialog */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Remittance #{selectedRemittance?.remittance_number}
            </DialogTitle>
            <DialogDescription>
              Review and verify this cash remittance from POS staff
            </DialogDescription>
          </DialogHeader>

          {selectedRemittance && (
            <div className="space-y-4">
              {/* Staff Info */}
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="size-4" />
                  Staff Information
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedRemittance.remitter?.full_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {selectedRemittance.remitter?.email || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shift Period */}
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="size-4" />
                  Shift Period
                </p>
                <div className="text-sm">
                  <p>
                    <span className="text-muted-foreground">Start:</span>{" "}
                    {formatDateTime(selectedRemittance.shift_start_at)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">End:</span>{" "}
                    {formatDateTime(selectedRemittance.shift_end_at)}
                  </p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Expected Cash (System)
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(selectedRemittance.cash_amount)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    From {selectedRemittance.cash_transactions} cash transactions
                  </p>
                </div>

                <div className="p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                    Declared Cash (Staff)
                  </p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatCurrency(selectedRemittance.declared_amount)}
                  </p>
                  {selectedRemittance.variance !== 0 && (
                    <p
                      className={`text-xs mt-1 font-bold ${
                        selectedRemittance.variance > 0 ? "text-blue-600" : "text-rose-600"
                      }`}
                    >
                      {selectedRemittance.variance > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(selectedRemittance.variance))}{" "}
                      {selectedRemittance.variance > 0 ? "Overage" : "Shortage"}
                    </p>
                  )}
                </div>
              </div>

              {/* Other Payment Methods */}
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Other Payment Methods (Reference)</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Card</p>
                    <p className="font-medium">{formatCurrency(selectedRemittance.card_amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">GCash</p>
                    <p className="font-medium">{formatCurrency(selectedRemittance.gcash_amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Maya</p>
                    <p className="font-medium">{formatCurrency(selectedRemittance.maya_amount)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total transactions: {selectedRemittance.total_transactions}
                </p>
              </div>

              {/* POS Notes */}
              {selectedRemittance.pos_notes && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Staff Notes</label>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    {selectedRemittance.pos_notes}
                  </div>
                </div>
              )}

              {/* Verification */}
              {selectedRemittance.status === "pending" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Verification Status</label>
                    <Select value={verifyStatus} onValueChange={(v: any) => setVerifyStatus(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">
                          <div className="flex items-center gap-2">
                            <CheckCheck className="size-4 text-emerald-600" />
                            <span>Verified - Cash matches</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="discrepancy">
                          <div className="flex items-center gap-2">
                            <XCircle className="size-4 text-rose-600" />
                            <span>Discrepancy - Document issue</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about the verification (e.g., variance explanation, corrective actions)"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Existing Admin Notes */}
              {selectedRemittance.status !== "pending" && selectedRemittance.admin_notes && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    {selectedRemittance.admin_notes}
                  </div>
                </div>
              )}

              {/* Verified By */}
              {selectedRemittance.receiver && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                    Verified By
                  </p>
                  <p className="text-sm font-medium">
                    {selectedRemittance.receiver.full_name || selectedRemittance.receiver.email}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(false)}>
              Close
            </Button>
            {selectedRemittance?.status === "pending" && (
              <Button onClick={handleVerify} disabled={pending}>
                {pending ? "Verifying..." : "Verify Remittance"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
