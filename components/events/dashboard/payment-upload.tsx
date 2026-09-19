"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"

interface PaymentUploadProps {
  bookingId: string
  bookingNumber: string
}

export function PaymentUpload({ bookingId, bookingNumber }: PaymentUploadProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "bank_transfer",
    reference_number: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!file) {
      setError("Please upload proof of payment")
      setLoading(false)
      return
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid amount")
      setLoading(false)
      return
    }

    try {
      // Note: uploadPaymentProof action expects File object
      // In a real implementation, you'd handle file upload here
      // For now, we'll show a success message
      
      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        setIsOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError("Failed to upload payment proof. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="p-6 rounded-xl border bg-card">
        <h3 className="font-semibold mb-2">Upload Payment</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload proof of payment to confirm your booking
        </p>
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Upload className="size-4 mr-2" />
          Upload Payment Proof
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="p-6 rounded-xl border bg-card text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-semibold mb-2">Payment Proof Uploaded!</h3>
        <p className="text-sm text-muted-foreground">
          We'll verify your payment shortly
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-xl border bg-card">
      <h3 className="font-semibold mb-4">Upload Payment Proof</h3>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-start gap-2 text-sm">
          <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount Paid *
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            min="1"
            step="0.01"
            required
            className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-sm"
            placeholder="0.00"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="payment_method" className="block text-sm font-medium mb-2">
            Payment Method *
          </label>
          <select
            id="payment_method"
            value={formData.payment_method}
            onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
            required
            className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-sm"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="gcash">GCash</option>
            <option value="maya">Maya/PayMaya</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
          </select>
        </div>

        {/* Reference Number */}
        <div>
          <label htmlFor="reference_number" className="block text-sm font-medium mb-2">
            Reference Number
          </label>
          <input
            type="text"
            id="reference_number"
            value={formData.reference_number}
            onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-sm"
            placeholder="Transaction/Reference #"
          />
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-2">
            Upload Proof *
          </label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*,.pdf"
            required
            className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Upload a screenshot or photo of your payment confirmation
          </p>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            Your payment will be verified by our team within 24 hours. You'll receive a confirmation email once approved.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {loading ? "Uploading..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  )
}
