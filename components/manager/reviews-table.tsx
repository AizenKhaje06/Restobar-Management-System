'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { format } from "date-fns"

interface Review {
  id: string
  customer_name: string
  rating: number
  comment: string
  status: string
  created_at: string
}

interface ReviewsTableProps {
  reviews: Review[]
}

export function ReviewsTable({ reviews }: ReviewsTableProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No reviews found
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="font-medium">{review.customer_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span>{review.rating}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-md truncate">{review.comment}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    review.status === "approved"
                      ? "default"
                      : review.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {review.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(review.created_at), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
