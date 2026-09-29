'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function OrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/manager/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/manager/orders')
  }

  const hasFilters = searchParams.toString() !== ''

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border">
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <h3 className="font-semibold">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="size-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          defaultValue={searchParams.get('status') || 'all'}
          onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Order Type Filter */}
        <Select
          defaultValue={searchParams.get('orderType') || 'all'}
          onValueChange={(value) => handleFilterChange('orderType', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
          </SelectContent>
        </Select>

        {/* Date From */}
        <Input
          type="date"
          defaultValue={searchParams.get('dateFrom') || ''}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        />
      </div>
    </div>
  )
}
