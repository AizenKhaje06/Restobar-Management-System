"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Banknote,
  CreditCard,
  Smartphone,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  History,
  Send,
  RefreshCw,
  Calendar,
  DollarSign,
  FileText,
  Users,
} from "lucide-react"
import { StaffShell, type NavItem } from "@/components/staff-shell"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/constants"
import type { Profile } from "@/lib/types"
import type { PosCashflowSummary } from "@/app/actions/pos-cashflow"
import { submitCashRemittance } from "@/app/actions/pos-cashflow"
import { toast } from "sonner"

const NAV_ITEMS: NavItem[] = [
  { href: "/pos", label: "POS Terminal", icon: "LayoutDashboard" },
  { href: "/pos/orders", label: "Orders", icon: "ShoppingCart" },
  { href: "/pos/tables", label: "Tables", icon: "Utensils" },
  { href: "/pos/receipts", label: "Receipts", icon: "Receipt" },
  { href: "/pos/cashflow", label: "Cashflow", icon: "Wallet" },
]

const PAYMENT_METHOD_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  cash: {
    label: "Cash",
    icon: <Banknote className="size-4" />,
    color: "text-emerald-600",
  },
  card: {
    label: "Card",
    icon: <CreditCard className="size-4" />,
    color: "text-blue-600",
  },
  gcash: {
    label: "GCash",
    icon: <Smartphone className="size-4" />,
    color: "text-cyan-600",
  },
  maya: {
    label: "Maya",
    icon: <Smartphone className="size-4" />,
    color: "text-green-600",
  },
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending Verification",
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

export function PosCashflowClient({
  profile,
  initialData,
  restaurantName,
  restaurantLogo,
}: {
  profile: Profile
  initialData: PosCashflowSummary
  restaurantName?: string
  restaurantLogo?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [data, setData] = useState(initialData)
  const [showRemitDialog, setShowRemitDialog] = useState(false)
  const [declaredAmount, setDeclaredAmount] = useState("")
  const [posNotes, setPosNotes] = useState("")

  const handleRefresh = () => {
    router.refresh()
  }

  const handleSubmitRemittance = () => {
    if (!declaredAmount || parseFloat(declaredAmount) < 0) {
      toast.error("Please enter a valid amount")
      return
    }

    startTransition(async () => {
      const result = await submitCashRemittance({
        declaredAmount: parseFloat(declaredAmount),
        shiftStartAt: data.shiftStart || new Date().toISOString(),
        shiftEndAt: new Date().toISOString(),
        posNotes: posNotes || undefined,
      })

      if (result.error) {
        toast.error("Failed to submit remittance", {
          description: result.error,
        })
        return
      }

      toast.success("Remittance submitted successfully", {
        description: `Remittance #${result.data?.remittance_number} has been sent to admin for verification`,
      })

      setShowRemitDialog(false)
      setDeclaredAmount("")
      setPosNotes("")
      router.refresh()
    })
  }

  const openRemitDialog = () => {
    // Pre-fill with expected cash amount
    setDeclaredAmount(data.cashSales.toFixed(2))
    setShowRemitDialog(true)
  }

  // Quick amount buttons for numpad
  const addAmount = (amount: number) => {
    const current = parseFloat(declaredAmount) || 0
    setDeclaredAmount((current + amount).toFixed(2))
  }

  const clearAmount = () => {
    setDeclaredAmount("")
  }

  return (
    <StaffShell
      profile={profile}
      items={NAV_ITEMS}
      title="Cashflow & Remittance"
      restaurantName={restaurantName}
      restaurantLogo={restaurantLogo}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cashflow & Remittance</h1>
          <p className="text-sm text-muted-foreground">
            Track your transactions and submit cash remittance to admin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={pending}>
            <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openRemitDialog} className="bg-gradient-to-r from-emerald-600 to-teal-600">
            <Send className="size-4 mr-2" />
            Submit Remittance
          </Button>
        </div>
      </div>

      {/* Current Shift Info */}
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 text-blue-600" />
          <span className="font-medium text-blue-900 dark:text-blue-100">Current Shift Started:</span>
          <span className="text-blue-700 dark:text-blue-300">
            {data.shiftStart ? formatDateTime(data.shiftStart) : "Today"}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        {/* Total Sales */}
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(data.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.transactionCount} {data.transactionCount === 1 ? "transaction" : "transactions"}
            </p>
          </CardContent>
        </Card>

        {/* Cash */}
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Banknote className="size-4" />
              Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(data.cashSales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.cashTransactionCount} cash {data.cashTransactionCount === 1 ? "payment" : "payments"}
            </p>
          </CardContent>
        </Card>

        {/* Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="size-4" />
              Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.cardSales)}</div>
          </CardContent>
        </Card>

        {/* GCash */}
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Smartphone className="size-4" />
              GCash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.gcashSales)}</div>
          </CardContent>
        </Card>

        {/* Maya */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Smartphone className="size-4" />
              Maya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.mayaSales)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto">
              {data.recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="size-12 mx-auto mb-2 opacity-20" />
                  <p>No transactions yet in this shift</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">#{tx.order_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.table_label || tx.customer_name || "Takeout"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className={PAYMENT_METHOD_CONFIG[tx.payment_method]?.color}>
                              {PAYMENT_METHOD_CONFIG[tx.payment_method]?.icon}
                            </span>
                            <span className="text-sm">
                              {PAYMENT_METHOD_CONFIG[tx.payment_method]?.label || tx.payment_method}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Remittance History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5" />
              Remittance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {data.remittances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="size-12 mx-auto mb-2 opacity-20" />
                  <p>No remittances submitted yet</p>
                </div>
              ) : (
                data.remittances.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-lg">#{rem.remittance_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(rem.created_at)}
                        </p>
                      </div>
                      <Badge className={STATUS_CONFIG[rem.status]?.className}>
                        {STATUS_CONFIG[rem.status]?.icon}
                        <span className="ml-1">{STATUS_CONFIG[rem.status]?.label}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <p className="text-muted-foreground text-xs">Expected</p>
                        <p className="font-semibold">{formatCurrency(rem.cash_amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Declared</p>
                        <p className="font-semibold">{formatCurrency(rem.declared_amount)}</p>
                      </div>
                    </div>

                    {rem.variance !== 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Variance</p>
                        <p
                          className={`font-bold ${
                            rem.variance > 0
                              ? "text-emerald-600"
                              : rem.variance < 0
                              ? "text-rose-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {rem.variance > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(rem.variance))}
                          {rem.variance > 0 ? " Overage" : " Shortage"}
                        </p>
                      </div>
                    )}

                    {rem.received_by_name && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Received By</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Users className="size-3" />
                          {rem.received_by_name}
                        </p>
                      </div>
                    )}

                    {rem.admin_notes && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                        <p className="text-sm bg-muted/50 p-2 rounded">{rem.admin_notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Remittance Dialog */}
      <Dialog open={showRemitDialog} onOpenChange={setShowRemitDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5" />
              Submit Cash Remittance
            </DialogTitle>
            <DialogDescription>
              Submit your cash collection to admin for verification. Please count and verify your
              cash before submitting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Expected vs Declared */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Expected Cash (System)
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(data.cashSales)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  From {data.cashTransactionCount} cash transactions
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                  Actual Cash (Counted)
                </p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {declaredAmount ? formatCurrency(parseFloat(declaredAmount)) : "₱0.00"}
                </p>
                {declaredAmount && (
                  <p
                    className={`text-xs mt-1 font-medium ${
                      Math.abs(parseFloat(declaredAmount) - data.cashSales) < 0.01
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {Math.abs(parseFloat(declaredAmount) - data.cashSales) < 0.01
                      ? "✓ Matches system"
                      : `${
                          parseFloat(declaredAmount) > data.cashSales ? "Overage" : "Shortage"
                        }: ${formatCurrency(Math.abs(parseFloat(declaredAmount) - data.cashSales))}`}
                  </p>
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Actual Cash Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={declaredAmount}
                onChange={(e) => setDeclaredAmount(e.target.value)}
                placeholder="Enter actual cash counted"
                className="text-lg h-12"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quick Add</label>
              <div className="grid grid-cols-5 gap-2">
                {[1000, 500, 200, 100, 50, 20, 10, 5, 1].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAmount(amount)}
                    className="h-10"
                  >
                    +{amount}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearAmount}
                  className="h-10"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Textarea
                value={posNotes}
                onChange={(e) => setPosNotes(e.target.value)}
                placeholder="Add any notes about this remittance (e.g., reasons for discrepancies, denominations breakdown)"
                rows={3}
              />
            </div>

            {/* Shift Period */}
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-1">Shift Period</p>
              <p className="text-muted-foreground">
                {data.shiftStart ? formatDateTime(data.shiftStart) : "Today Start"} →{" "}
                {formatDateTime(new Date().toISOString())}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRemittance} disabled={pending || !declaredAmount}>
              {pending ? "Submitting..." : "Submit Remittance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffShell>
  )
}
