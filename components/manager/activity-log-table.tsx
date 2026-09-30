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
import { format } from "date-fns"

interface ActivityLog {
  id: string
  action_type: string
  table_name: string
  record_id?: string
  old_values?: any
  new_values?: any
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

interface ActivityLogTableProps {
  logs: ActivityLog[]
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge
                  variant={
                    log.action_type === "INSERT"
                      ? "default"
                      : log.action_type === "UPDATE"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {log.action_type}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{log.table_name}</TableCell>
              <TableCell>
                {log.profiles?.full_name || "Unknown User"}
                <span className="block text-xs text-muted-foreground">
                  {log.profiles?.email}
                </span>
              </TableCell>
              <TableCell>
                {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
