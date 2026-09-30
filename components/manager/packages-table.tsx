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

interface Package {
  id: string
  name: string
  description?: string
  base_price: number
  pax_capacity?: number
  is_active: boolean
}

interface PackagesTableProps {
  packages: Package[]
}

export function PackagesTable({ packages }: PackagesTableProps) {
  if (packages.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No packages found
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Package Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium">{pkg.name}</TableCell>
              <TableCell className="max-w-md truncate">
                {pkg.description || "No description"}
              </TableCell>
              <TableCell>₱{Number(pkg.base_price).toLocaleString()}</TableCell>
              <TableCell>{pkg.pax_capacity ? `${pkg.pax_capacity} pax` : "N/A"}</TableCell>
              <TableCell>
                <Badge variant={pkg.is_active ? "default" : "secondary"}>
                  {pkg.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
