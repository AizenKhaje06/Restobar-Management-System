"use client"

import { useState } from "react"
import { verifyPayment } from "@/app/actions/admin-events"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function PaymentVerificationActions({ payment }: { payment: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  async function handleVerify(verified: boolean) {
    if (!verified && !rejectReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    setLoading(true)
    try {
      const result = await verifyPayment(
        payment.id,
        verified,
        verified ? undefined : rejectReason
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          verified ? "Payment verified successfully" : "Payment rejected"
        )
        setShowRejectForm(false)
        setRejectReason("")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (payment.status !== "pending") {
    return null
  }

  return (
    <div className="space-y-3">
      {!showRejectForm ? (
        <>
          <Button
            onClick={() => handleVerify(true)}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="size-4 mr-2" />
            )}
            Approve Payment
          </Button>

          <Button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <XCircle className="size-4 mr-2" />
            Reject Payment
          </Button>
        </>
      ) : (
        <div className="space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (required)"
            className="w-full p-3 rounded-lg border bg-background resize-none text-sm"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleVerify(false)}
              disabled={loading || !rejectReason.trim()}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="size-4 mr-2" />
              )}
              Confirm Reject
            </Button>
            <Button
              onClick={() => {
                setShowRejectForm(false)
                setRejectReason("")
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
