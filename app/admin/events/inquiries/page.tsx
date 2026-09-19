import { getAllInquiries } from "@/app/actions/admin-events"
import { InquiryActions } from "./inquiry-actions"
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Inquiries - Admin",
  description: "Manage customer inquiries",
}

const statusColors = {
  new: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300",
  responded: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300",
  converted: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300",
  closed: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300",
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const { inquiries, error } = await getAllInquiries(searchParams.status)

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const newInquiries = inquiries?.filter((i) => i.status === "new") || []
  const allInquiries = inquiries || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Customer Inquiries
        </h1>
        <p className="text-muted-foreground mt-1">
          Respond to customer questions and requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">New</p>
              <p className="text-3xl font-bold text-amber-600">
                {newInquiries.length}
              </p>
            </div>
            <AlertCircle className="size-8 text-amber-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Responded</p>
              <p className="text-3xl font-bold text-blue-600">
                {
                  allInquiries.filter((i) => i.status === "responded")
                    .length
                }
              </p>
            </div>
            <CheckCircle className="size-8 text-blue-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Converted</p>
              <p className="text-3xl font-bold text-green-600">
                {
                  allInquiries.filter((i) => i.status === "converted")
                    .length
                }
              </p>
            </div>
            <CheckCircle className="size-8 text-green-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-3xl font-bold">{allInquiries.length}</p>
            </div>
            <MessageSquare className="size-8 text-muted-foreground/30" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-2 rounded-lg border bg-muted/30">
        <Link href="/admin/events/inquiries">
          <Button
            variant={!searchParams.status ? "default" : "ghost"}
            size="sm"
          >
            All
          </Button>
        </Link>
        <Link href="/admin/events/inquiries?status=new">
          <Button
            variant={searchParams.status === "new" ? "default" : "ghost"}
            size="sm"
          >
            New ({newInquiries.length})
          </Button>
        </Link>
        <Link href="/admin/events/inquiries?status=responded">
          <Button
            variant={
              searchParams.status === "responded" ? "default" : "ghost"
            }
            size="sm"
          >
            Responded
          </Button>
        </Link>
        <Link href="/admin/events/inquiries?status=converted">
          <Button
            variant={
              searchParams.status === "converted" ? "default" : "ghost"
            }
            size="sm"
          >
            Converted
          </Button>
        </Link>
        <Link href="/admin/events/inquiries?status=closed">
          <Button
            variant={searchParams.status === "closed" ? "default" : "ghost"}
            size="sm"
          >
            Closed
          </Button>
        </Link>
      </div>

      {/* Inquiries List */}
      {allInquiries.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-muted/30">
          <MessageSquare className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No inquiries found</h3>
          <p className="text-muted-foreground">
            {searchParams.status
              ? `No ${searchParams.status} inquiries at the moment`
              : "Customer inquiries will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`p-6 rounded-xl border ${
                inquiry.status === "new"
                  ? "border-2 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"
                  : "bg-card"
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Inquiry Details */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        statusColors[inquiry.status as keyof typeof statusColors]
                      }`}
                    >
                      {inquiry.status.toUpperCase()}
                    </span>
                    {inquiry.event_type && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted capitalize">
                        {inquiry.event_type}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      <Clock className="size-3 inline mr-1" />
                      {new Date(inquiry.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-semibold text-sm">{inquiry.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="font-semibold text-sm hover:text-amber-600 transition-colors"
                        >
                          {inquiry.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="font-semibold text-sm hover:text-amber-600 transition-colors"
                        >
                          {inquiry.phone}
                        </a>
                      </div>
                    </div>

                    {inquiry.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Event Date
                          </p>
                          <p className="font-semibold text-sm">
                            {new Date(inquiry.event_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {inquiry.num_guests && (
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Guests</p>
                          <p className="font-semibold text-sm">
                            {inquiry.num_guests}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm font-medium mb-1">Message:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Response Notes */}
                  {inquiry.response_notes && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                      <p className="text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                        Response Notes:
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap">
                        {inquiry.response_notes}
                      </p>
                      {inquiry.responded_at && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          Responded on{" "}
                          {new Date(inquiry.responded_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:w-64 flex-shrink-0">
                  <InquiryActions inquiry={inquiry} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
