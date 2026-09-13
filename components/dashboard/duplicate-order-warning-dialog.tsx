"use client"

import { AlertTriangle, Plus, ListPlus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DuplicateOrderWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
  existingOrderNumber: number | string
  customerName?: string | null
  onAddToExisting: () => void
  onCreateNew: () => void
  itemCount: number
}

export function DuplicateOrderWarningDialog({
  open,
  onOpenChange,
  tableName,
  existingOrderNumber,
  customerName,
  onAddToExisting,
  onCreateNew,
  itemCount,
}: DuplicateOrderWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 overflow-hidden">
        {/* Warning Header with Gradient */}
        <div className="relative overflow-hidden">
          {/* Animated warning gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 animate-pulse" />
          
          <div className="relative px-6 pt-6 pb-5">
            {/* Warning Icon - Large and Prominent */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-30 animate-pulse" />
                <div className="relative flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <AlertTriangle className="size-9 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Existing Order Detected
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                This table already has an active order
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Bottom accent line */}
          <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
        </div>

        {/* Content Section */}
        <div className="px-6 py-5 space-y-5">
          {/* Existing Order Info Card */}
          <div className="rounded-lg border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                <ListPlus className="size-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">
                    Table {tableName}
                  </h4>
                  <Badge variant="outline" className="font-mono text-xs">
                    #{existingOrderNumber}
                  </Badge>
                </div>
                {customerName && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Customer: <span className="font-medium text-foreground">{customerName}</span>
                  </p>
                )}
                <p className="text-xs text-amber-700 dark:text-amber-500 font-medium">
                  ⚠️ Active order in progress
                </p>
              </div>
            </div>
          </div>

          {/* New Items Info */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">
              You're about to add <span className="font-semibold text-foreground">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            </p>
          </div>

          {/* Recommendation Banner */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-3">
            <p className="text-sm text-blue-900 dark:text-blue-300 flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
              <span>
                <strong className="font-semibold">Recommended:</strong> Add items to the existing order to keep everything organized.
              </span>
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <DialogFooter className="flex-col sm:flex-col gap-2 p-6 pt-0">
          {/* Primary Action - Add to Existing (Recommended) */}
          <Button
            onClick={() => {
              onAddToExisting()
              onOpenChange(false)
            }}
            className="w-full h-11 font-semibold shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            size="lg"
          >
            <Plus className="size-5 mr-2" />
            Add to Existing Order
            <Badge className="ml-2 bg-white/20 text-white border-0 hover:bg-white/20">
              Recommended
            </Badge>
          </Button>

          {/* Secondary Actions Row */}
          <div className="flex gap-2 w-full">
            {/* Create New Order - Caution style */}
            <Button
              onClick={() => {
                onCreateNew()
                onOpenChange(false)
              }}
              variant="outline"
              className="flex-1 h-10 font-medium border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              <AlertTriangle className="size-4 mr-1.5" />
              Create New
            </Button>

            {/* Cancel */}
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="flex-1 h-10 font-medium"
            >
              <X className="size-4 mr-1.5" />
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
