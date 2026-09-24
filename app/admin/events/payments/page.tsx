import { getPendingPayments, getAllPayments } from "@/app/actions/admin-events"
import Link from "next/link"
import {
  CreditCard,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentVerificationActions } from "./payment-actions"

export const metadata = {
  title: "Payment Verification - Admin",
  description: "Verify customer payment proofs",
}

const statusColors = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300",
  verified: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300",
  rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300",
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const [pendingResult, allResult] = await Promise.all([
    getPendingPayments(),
    getAllPayments({ status: params.status }),
  ])

  if (pendingResult.error || allResult.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">
            {pendingResult.error || allResult.error}
          </p>
        </div>
      </div>
    )
  }

  const pendingPayments = pendingResult.payments || []
  const allPayments = allResult.payments || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">
          Review and verify customer payment proofs
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Pending Verification
              </p>
              <p className="text-3xl font-bold text-amber-600">
                {pendingPayments.length}
              </p>
            </div>
            <AlertCircle className="size-8 text-amber-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Verified Today
              </p>
              <p className="text-3xl font-bold text-green-600">
                {
                  allPayments.filter(
                    (p) =>
                      p.status === "verified" &&
                      p.verified_at &&
                      new Date(p.verified_at).toDateString() ===
                        new Date().toDateString()
                  ).length
                }
              </p>
            </div>
            <CheckCircle className="size-8 text-green-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Amount Pending
              </p>
              <p className="text-3xl font-bold text-orange-600">
                ₱
                {pendingPayments
                  .reduce((sum, p) => sum + Number(p.amount), 0)
                  .toLocaleString()}
              </p>
            </div>
            <DollarSign className="size-8 text-orange-600/30" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-2 rounded-lg border bg-muted/30">
        <Link href="/admin/events/payments">
          <Button
            variant={!params.status ? "default" : "ghost"}
            size="sm"
          >
            All Payments
          </Button>
        </Link>
        <Link href="/admin/events/payments?status=pending">
          <Button
            variant={params.status === "pending" ? "default" : "ghost"}
            size="sm"
          >
            Pending ({pendingPayments.length})
          </Button>
        </Link>
        <Link href="/admin/events/payments?status=verified">
          <Button
            variant={params.status === "verified" ? "default" : "ghost"}
            size="sm"
          >
            Verified
          </Button>
        </Link>
        <Link href="/admin/events/payments?status=rejected">
          <Button
            variant={params.status === "rejected" ? "default" : "ghost"}
            size="sm"
          >
            Rejected
          </Button>
        </Link>
      </div>

      {/* Pending Payments (Priority) */}
      {pendingPayments.length > 0 && !params.status && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-amber-600" />
            <h2 className="text-xl font-bold">
              Requires Verification ({pendingPayments.length})
            </h2>
          </div>

          <div className="grid gap-4">
            {pendingPayments.map((payment: any) => (
              <div
                key={payment.id}
                className="p-6 rounded-xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Payment Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold">
                        ₱{Number(payment.amount).toLocaleString()}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-200 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300">
                        PENDING REVIEW
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {payment.payment_number}
                      </span>
                    </div>

                    {/* Booking Info */}
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Booking</p>
                        <Link
                          href={`/admin/events/bookings/${payment.booking_id}`}
                          className="font-medium hover:text-amber-600 transition-colors"
                        >
                          {payment.booking?.booking_number}
                        </Link>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium">
                          {payment.booking?.customer_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Event Date</p>
                        <p className="font-medium">
                          {new Date(
                            payment.booking?.event_date
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Payment Method</p>
                        <p className="font-medium capitalize">
                          {payment.payment_method.replace("_", " ")}
                        </p>
                      </div>

                      {payment.reference_number && (
                        <div>
                          <p className="text-muted-foreground">Reference #</p>
                          <p className="font-mono text-xs">
                            {payment.reference_number}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">
                          {new Date(payment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Payment Proof */}
                    {payment.proof_url && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Payment Proof
                        </p>
                        <a
                          href={payment.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors"
                        >
                          <ImageIcon className="size-4" />
                          <span className="text-sm font-medium">
                            View Uploaded Proof
                          </span>
                          <Eye className="size-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:w-64 flex-shrink-0">
                    <PaymentVerificationActions payment={payment} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Payments List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {params.status
            ? `${params.status.charAt(0).toUpperCase() + params.status.slice(1)} Payments`
            : "All Payments"}
        </h2>

        {allPayments.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-muted/30">
            <CreditCard className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No payments found</h3>
            <p className="text-muted-foreground">
              {params.status
                ? `No ${params.status} payments at the moment`
                : "Payments will appear here once customers upload proof"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allPayments.map((payment: any) => (
              <div
                key={payment.id}
                className="p-5 rounded-xl border bg-card hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">
                        ₱{Number(payment.amount).toLocaleString()}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[
                            payment.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {payment.payment_number}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        {payment.booking?.booking_number} •{" "}
                        {payment.booking?.customer_name}
                      </span>
                      <span>•</span>
                      <span>{payment.payment_method.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                    </div>

                    {payment.verified_at && (
                      <p className="text-xs text-muted-foreground">
                        Verified on{" "}
                        {new Date(payment.verified_at).toLocaleString()}
                      </p>
                    )}

                    {payment.rejection_reason && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Reason: {payment.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.proof_url && (
                      <a
                        href={payment.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="size-4 mr-2" />
                          View Proof
                        </Button>
                      </a>
                    )}

                    <Link href={`/admin/events/bookings/${payment.booking_id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="size-4 mr-2" />
                        View Booking
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
