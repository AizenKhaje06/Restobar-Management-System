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

interface Venue {
  id: string
  name: string
  location?: string
  capacity?: number
  is_active: boolean
}

interface VenuesTableProps {
  venues: Venue[]
}

export function VenuesTable({ venues }: VenuesTableProps) {
  if (venues.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No venues found
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venue Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell className="font-medium">{venue.name}</TableCell>
              <TableCell>{venue.location || "N/A"}</TableCell>
              <TableCell>
                {venue.capacity ? `${venue.capacity} guests` : "N/A"}
              </TableCell>
              <TableCell>
                <Badge variant={venue.is_active ? "default" : "secondary"}>
                  {venue.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
