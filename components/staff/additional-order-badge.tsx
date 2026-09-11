"use client"

import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus } from "lucide-react"

export function AdditionalOrderBadge({ 
  orderType, 
  className = "",
  variant = "default"
}: { 
  orderType: "initial" | "additional"
  className?: string
  variant?: "default" | "outline"
}) {
  if (orderType === "initial") return null

  return (
    <Badge 
      variant={variant}
      className={`${className} bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1`}
    >
      <Plus className="size-3" />
      Additional
    </Badge>
  )
}

export function NewOrderIndicator() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
    </span>
  )
}
