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

interface MenuItem {
  id: string
  name: string
  description?: string
  base_price: number
  is_active: boolean
}

interface MenuItemsTableProps {
  items: MenuItem[]
}

export function MenuItemsTable({ items }: MenuItemsTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No menu items found
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="max-w-md truncate">
                {item.description || "No description"}
              </TableCell>
              <TableCell>₱{Number(item.base_price).toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={item.is_active ? "default" : "secondary"}>
                  {item.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
