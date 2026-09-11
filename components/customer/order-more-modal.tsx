"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  UtensilsCrossed,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import type { Category, MenuItem } from "@/lib/types"
import { createAdditionalOrder } from "@/app/actions/customer-orders"
import { toast } from "sonner"

interface CartItem {
  item: MenuItem
  quantity: number
  notes?: string
}

export function OrderMoreModal({
  open,
  onClose,
  categories,
  menuItems,
  sessionId,
  tableId,
  customerName,
}: {
  open: boolean
  onClose: () => void
  categories: Category[]
  menuItems: MenuItem[]
  sessionId: string
  tableId: string
  customerName: string | null
}) {
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map())
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successOrder, setSuccessOrder] = useState<number | null>(null)

  // Filter menu items
  const filteredItems = useMemo(() => {
    let result = menuItems.filter(item => item.is_available)
    
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      )
    }
    
    if (selectedCategory) {
      result = result.filter(item => item.category_id === selectedCategory)
    }
    
    return result
  }, [menuItems, search, selectedCategory])

  // Cart totals
  const cartSubtotal = useMemo(() => {
    return Array.from(cart.values()).reduce(
      (sum, cartItem) => sum + cartItem.item.price * cartItem.quantity,
      0
    )
  }, [cart])

  const cartItemCount = useMemo(() => {
    return Array.from(cart.values()).reduce(
      (sum, cartItem) => sum + cartItem.quantity,
      0
    )
  }, [cart])

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const newCart = new Map(prev)
      const existing = newCart.get(item.id)
      
      if (existing) {
        newCart.set(item.id, { ...existing, quantity: existing.quantity + 1 })
      } else {
        newCart.set(item.id, { item, quantity: 1 })
      }
      
      return newCart
    })
  }

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const newCart = new Map(prev)
      const existing = newCart.get(itemId)
      
      if (!existing) return prev
      
      const newQuantity = existing.quantity + delta
      
      if (newQuantity <= 0) {
        newCart.delete(itemId)
      } else {
        newCart.set(itemId, { ...existing, quantity: newQuantity })
      }
      
      return newCart
    })
  }

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = new Map(prev)
      newCart.delete(itemId)
      return newCart
    })
  }

  const handleSubmitOrder = async () => {
    if (cart.size === 0) return

    setSubmitting(true)
    try {
      const items = Array.from(cart.values()).map(cartItem => ({
        menu_item_id: cartItem.item.id,
        name: cartItem.item.name,
        price: cartItem.item.price,
        quantity: cartItem.quantity,
        notes: cartItem.notes,
      }))

      const result = await createAdditionalOrder({
        session_id: sessionId,
        table_id: tableId,
        customer_name: customerName,
        items,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      // Show success
      setSuccessOrder(result.order_number!)
      setCart(new Map())
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setSuccessOrder(null)
        onClose()
      }, 3000)
    } catch (error) {
      toast.error("Failed to submit order")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    setSuccessOrder(null)
    setCart(new Map())
    setSearch("")
    setSelectedCategory(null)
    onClose()
  }

  // Success state
  if (successOrder !== null) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Sent! 🎉</h2>
            <p className="text-muted-foreground mb-1">
              Your additional order <span className="font-bold text-foreground">#{successOrder}</span> has been sent directly to the kitchen.
            </p>
            <p className="text-sm text-muted-foreground">
              Track its status in the order tracker above.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-amber-500" />
            Order More Items
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add more drinks, food, or snacks to your table
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left: Menu Browser */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredItems.map(item => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {item.image_url ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <UtensilsCrossed className="size-6 text-muted-foreground/40" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <p className="font-bold text-primary tabular-nums">
                            ₱{item.price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </p>
                          <Button
                            size="sm"
                            className="h-7 px-3 ml-auto"
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <UtensilsCrossed className="size-12 mx-auto mb-3 opacity-20" />
                <p>No items found</p>
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l bg-muted/30 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingCart className="size-4" />
                Your Cart
              </h3>
              {cart.size > 0 && (
                <Badge variant="secondary">
                  {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {cart.size === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <ShoppingCart className="size-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Cart is empty</p>
                  <p className="text-xs mt-1">Add items from the menu</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {Array.from(cart.values()).map(cartItem => (
                    <Card key={cartItem.item.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm flex-1">{cartItem.item.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() => handleRemoveFromCart(cartItem.item.id)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleUpdateQuantity(cartItem.item.id, -1)}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold">
                              {cartItem.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleUpdateQuantity(cartItem.item.id, 1)}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-bold tabular-nums">
                            ₱{(cartItem.item.price * cartItem.quantity).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold tabular-nums">
                      ₱{cartSubtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                    <div className="flex items-start gap-2">
                      <Clock className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium">Goes directly to kitchen</p>
                        <p className="text-blue-600/80 dark:text-blue-400/70 mt-0.5">
                          Your order will be prepared right away
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmitOrder}
                    disabled={submitting || cart.size === 0}
                  >
                    {submitting ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Sending Order...
                      </>
                    ) : (
                      <>
                        Send to Kitchen
                        <ArrowRight className="size-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
