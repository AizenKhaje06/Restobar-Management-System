"use client"

import { useState } from "react"
import { updateInquiryStatus } from "@/app/actions/admin-events"
import { Button } from "@/components/ui/button"
import { CheckCircle, MessageCircle, XCircle, Loader2, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { EventInquiry } from "@/lib/types/events"

export function InquiryActions({ inquiry }: { inquiry: EventInquiry }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseNotes, setResponseNotes] = useState("")

  async function handleStatusChange(
    status: "new" | "responded" | "converted" | "closed"
  ) {
    if (status === "responded" && !responseNotes.trim()) {
      toast.error("Please add response notes")
      return
    }

    setLoading(true)
    try {
      const result = await updateInquiryStatus(
        inquiry.id,
        status,
        status === "responded" ? responseNotes : undefined
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Inquiry marked as ${status}`)
        setShowResponseForm(false)
        setResponseNotes("")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {inquiry.status === "new" && (
        <>
          {!showResponseForm ? (
            <>
              <Button
                onClick={() => setShowResponseForm(true)}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageCircle className="size-4 mr-2" />
                Mark as Responded
              </Button>

              <Button
                onClick={() => handleStatusChange("converted")}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="size-4 mr-2" />
                Mark as Converted
              </Button>

              <Button
                onClick={() => handleStatusChange("closed")}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <XCircle className="size-4 mr-2" />
                Close Inquiry
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Response Notes</label>
              <textarea
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Add notes about your response..."
                className="w-full p-3 rounded-lg border bg-background resize-none text-sm"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusChange("responded")}
                  disabled={loading || !responseNotes.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {loading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="size-4 mr-2" />
                  )}
                  Save Response
                </Button>
                <Button
                  onClick={() => {
                    setShowResponseForm(false)
                    setResponseNotes("")
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {inquiry.status === "responded" && (
        <>
          <Button
            onClick={() => handleStatusChange("converted")}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="size-4 mr-2" />
            )}
            Mark as Converted
          </Button>

          <Button
            onClick={() => handleStatusChange("closed")}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <XCircle className="size-4 mr-2" />
            Close Inquiry
          </Button>
        </>
      )}

      {inquiry.status === "converted" && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            ✓ This inquiry was converted to a booking
          </p>
        </div>
      )}

      {inquiry.status === "closed" && (
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-900">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            This inquiry has been closed
          </p>
        </div>
      )}

      {/* Contact Actions */}
      <div className="pt-3 border-t space-y-2">
        <a href={`mailto:${inquiry.email}`} className="block">
          <Button variant="outline" size="sm" className="w-full">
            Send Email
          </Button>
        </a>
        <a href={`tel:${inquiry.phone}`} className="block">
          <Button variant="outline" size="sm" className="w-full">
            Call Customer
          </Button>
        </a>
      </div>
    </div>
  )
}
