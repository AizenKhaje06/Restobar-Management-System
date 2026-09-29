'use client'

import { useState } from "react"
import { format } from "date-fns"
import { Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { BookingDetailModal } from "./booking-detail-modal"

type Booking = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  event_date: string
  event_type: string
  guest_count: number
  status: string
  payment_status: string
  total_amount: number
  created_at: string
  event_packages?: { name: string }
  event_venues?: { name: string }
}

interface BookingsTableProps {
  bookings: Booking[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  partial: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>No bookings found</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{format(new Date(booking.event_date), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-muted-foreground">
                      Booked: {format(new Date(booking.created_at), 'MMM dd')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {booking.event_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {booking.event_packages?.name || '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {booking.event_venues?.name || '-'}
                </TableCell>
                <TableCell className="text-center">
                  {booking.guest_count}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={statusColors[booking.status as keyof typeof statusColors] || ""}
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={paymentStatusColors[booking.payment_status as keyof typeof paymentStatusColors] || ""}
                  >
                    {booking.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  ₱{Number(booking.total_amount).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedBookingId(booking.id)}>
                        <Eye className="size-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Booking Detail Modal */}
      {selectedBookingId && (
        <BookingDetailModal
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
        />
      )}
    </>
  )
}
