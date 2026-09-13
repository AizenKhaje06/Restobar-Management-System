"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Minus,
  ShoppingCart,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UtensilsCrossed,
  Grid3x3,
  Sparkles,
  ChevronLeft,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  category_id?: string
  description?: string
  image_url?: string
  is_available: boolean
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
}

interface WaiterAddonOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableId: string
  tableName: string
  orderNumber: string
  menuItems: MenuItem[]
  onConfirm: (items: CartItem[], notes: string) => Promise<void>
}

export function WaiterAddonOrderModal({
  open,
  onOpenChange,
  tableId,
  tableName,
  orderNumber,
  menuItems,
  onConfirm,
}: WaiterAddonOrderModalProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCartModal, setShowCartModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Get unique categories from menu items
  const categories = useMemo(() => {
    // Extract unique category names from menu items
    const cats = Array.from(
      new Set(
        menuItems
          .map((item) => item.category)
          .filter((cat) => cat && cat.trim() !== "") // Filter out empty/null categories
      )
    ).sort() // Sort alphabetically
    
    return ["all", ...cats]
  }, [menuItems])

  // Filter menu items - include unavailable items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [menuItems, search, selectedCategory])

  // Cart totals
  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.12 // 12% tax
    return { subtotal, tax, total: subtotal + tax }
  }, [cart])

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Add item to cart
  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menuItem.id)
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }]
    })
  }

  // Update quantity
  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta
            return newQty <= 0 ? null : { ...item, quantity: newQty }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  // Handle confirm
  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await onConfirm(cart, orderNotes)
      toast.success("Add-on order created successfully!")
      // Reset state
      setCart([])
      setOrderNotes("")
      setShowConfirmDialog(false)
      setShowCartModal(false)
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to create add-on order")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Main POS Menu Modal - Responsive Design */}
      <Dialog open={open && !showCartModal} onOpenChange={onOpenChange}>
        <DialogContent 
          className="w-screen h-screen sm:w-[95vw] sm:h-[95vh] sm:max-w-6xl sm:max-h-[900px] max-w-none p-3 sm:p-4 gap-0 flex flex-col"
          showCloseButton={false}
        >
          {/* Modal Container - Rounded on larger screens */}
          <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-sky-950/40">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/30 flex-shrink-0">
                    <Plus className="size-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      Add Items
                      <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="outline" className="font-semibold text-xs px-2 py-0">
                        <Grid3x3 className="size-3 mr-1" />
                        {tableName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground font-medium">
                        #{orderNumber}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full size-10 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex-shrink-0"
                >
                  <X className="size-5" />
                </Button>
              </div>

            {/* Search Bar */}
            <div className="px-4 pb-3 pt-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-indigo-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-b">
            <div className="overflow-x-auto scrollbar-hide px-4 py-3">
              <div className="flex gap-2 min-w-max">
                {categories.map((cat, index) => (
                  <button
                    key={`category-${index}-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 whitespace-nowrap capitalize",
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                        : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    )}
                  >
                    {cat}
                    {selectedCategory === cat && (
                      <span className="ml-1.5">✨</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems.map((item) => {
                  const cartItem = cart.find((c) => c.id === item.id)
                  const isInCart = !!cartItem
                  const isUnavailable = !item.is_available
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => !isUnavailable && addToCart(item)}
                      disabled={isUnavailable}
                      className={cn(
                        "group relative rounded-2xl overflow-hidden text-left transition-all duration-300",
                        "bg-white dark:bg-gray-900 border-2",
                        isUnavailable
                          ? "opacity-60 cursor-not-allowed border-gray-200 dark:border-gray-800"
                          : isInCart
                          ? "border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                          : "border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                      )}
                    >
                      {/* Unavailable Badge - Top Left */}
                      {isUnavailable && (
                        <div className="absolute top-2 left-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                          <Badge className="bg-red-600 text-white border-0 shadow-lg px-2 py-0.5 text-xs font-bold">
                            Unavailable
                          </Badge>
                        </div>
                      )}

                      {/* Item Image/Placeholder with Gradient Overlay */}
                      <div className={cn(
                        "relative aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 flex items-center justify-center overflow-hidden",
                        isUnavailable && "grayscale"
                      )}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                        <UtensilsCrossed className="size-16 text-gray-300 dark:text-gray-700 relative z-10" strokeWidth={1.5} />
                        
                        {/* Hover Shimmer Effect */}
                        {!isUnavailable && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        )}
                      </div>

                      {/* Item Info with Better Typography */}
                      <div className="p-3">
                        <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-2 text-foreground">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(item.price)}
                          </p>
                          {isInCart && !isUnavailable && (
                            <Badge className="bg-indigo-600 text-white border-0 shadow-md px-2 py-0.5">
                              <Plus className="size-3 mr-0.5" />
                              Add
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quantity Badge - Floating with Animation */}
                      {cartItem && !isUnavailable && (
                        <div className="absolute top-2 right-2 animate-in zoom-in-95 duration-200">
                          <div className="relative">
                            <div className="absolute inset-0 bg-indigo-600 blur-md opacity-50" />
                            <div className="relative bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-xl size-8 flex items-center justify-center font-bold text-sm shadow-xl">
                              {cartItem.quantity}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isInCart && !isUnavailable && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600" />
                      )}
                    </button>
                  )
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                    <AlertCircle className="size-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-1">No items found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </div>

          {/* Floating Cart Button */}
          {cart.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
              <Button
                size="lg"
                onClick={() => setShowCartModal(true)}
                className="w-full h-14 px-6 rounded-2xl shadow-2xl shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-700 hover:via-blue-700 hover:to-indigo-700 border-2 border-white/20 backdrop-blur-sm group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative flex items-center justify-center gap-3 w-full">
                  <div className="relative">
                    <ShoppingCart className="size-5" />
                    <span className="absolute -top-1 -right-1 size-2 bg-white rounded-full animate-ping" />
                  </div>
                  <span className="font-bold text-base">Review Order</span>
                  <Badge className="bg-white text-indigo-600 border-0 font-extrabold text-base px-2.5 py-0.5">
                    {cartItemCount}
                  </Badge>
                </div>
              </Button>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Review Modal - Responsive Design */}
      <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
        <DialogContent 
          className="w-screen h-screen sm:w-auto sm:h-auto sm:max-w-2xl sm:max-h-[90vh] max-w-none p-3 sm:p-4 gap-0 flex flex-col"
          showCloseButton={false}
        >
          {/* Modal Container - Rounded on larger screens */}
          <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40">
              <div className="flex items-center gap-3 px-4 pt-4 pb-4">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCartModal(false)}
                  className="rounded-full size-10 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex-shrink-0"
                >
                  <ChevronLeft className="size-5" />
                </Button>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <ShoppingCart className="size-6 text-emerald-600 dark:text-emerald-400" />
                    Order Review
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="font-semibold text-xs">
                      <Grid3x3 className="size-3 mr-1" />
                      {tableName}
                    </Badge>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Add-on to #{orderNumber}
                    </span>
                  </div>
                </div>
              </div>

            {/* Cart Summary Bar */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-emerald-200 dark:border-emerald-900/30">
                <span className="text-sm font-semibold text-foreground">
                  {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(cartTotal.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="p-4 space-y-3">
              {/* Cart Items List */}
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200 animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm mb-1.5 text-foreground line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                      </div>
                    </div>

                    {/* Quantity Controls - Enhanced */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="size-3.5" strokeWidth={3} />
                      </Button>
                      <span className="font-extrabold text-lg w-10 text-center text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="size-3.5" strokeWidth={3} />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="font-extrabold text-base text-emerald-600 dark:text-emerald-400 min-w-[80px] text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Order Notes Section - Enhanced */}
              <div className="pt-2">
                <label className="text-sm font-bold mb-2.5 block text-foreground flex items-center gap-2">
                  <Receipt className="size-4" />
                  Special Instructions
                  <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                </label>
                <Textarea
                  placeholder="E.g., No onions, extra spicy, allergies..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  className="resize-none bg-white dark:bg-gray-950 border-2 focus-visible:ring-emerald-500 rounded-xl"
                />
              </div>

              {/* Totals Card - Premium Design */}
              <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30 p-4 space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2 mb-3">
                  <Receipt className="size-4 text-emerald-600 dark:text-emerald-400" />
                  Payment Breakdown
                </h3>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-bold text-foreground">{formatCurrency(cartTotal.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Tax (12%)</span>
                    <span className="font-bold text-foreground">{formatCurrency(cartTotal.tax)}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-700 to-transparent" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-extrabold text-base text-foreground">Total Amount</span>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400">
                        {formatCurrency(cartTotal.total)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-3">
                <p className="text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">ℹ️</span>
                  <span>
                    This order will be automatically confirmed and sent to the kitchen immediately.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex-shrink-0 border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm p-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCartModal(false)}
              className="flex-1 h-12 font-semibold rounded-xl border-2"
            >
              <ChevronLeft className="size-4 mr-1.5" />
              Back to Menu
            </Button>
            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="flex-1 h-12 font-bold rounded-xl shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              <CheckCircle2 className="size-5 mr-2" />
              Confirm Order
            </Button>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Enterprise Grade */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 overflow-hidden sm:rounded-xl">
          {/* Success Header with Gradient & Animation */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20" />
            
            <div className="relative px-6 pt-6 pb-5">
              {/* Success Icon - Large and Prominent */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-30 animate-pulse" />
                  <div className="relative flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg animate-in zoom-in-95">
                    <CheckCircle2 className="size-9 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Confirm Add-On Order?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review your order before sending to the kitchen
                </p>
              </div>
            </div>

            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
          </div>

          {/* Order Summary Content */}
          <div className="px-6 py-5 space-y-4">
            {/* Table & Order Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/50">
              <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                <Grid3x3 className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Adding to</p>
                <p className="font-bold text-sm text-foreground">
                  {tableName} · Order #{orderNumber}
                </p>
              </div>
            </div>

            {/* Items Summary */}
            <div>
              <p className="text-sm font-bold mb-2.5 text-foreground">
                {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}:
              </p>
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold text-sm shadow-sm flex-shrink-0">
                          {item.quantity}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 ml-3">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Total Bar */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-t-2 border-emerald-200 dark:border-emerald-900/50 px-4 py-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-foreground">Order Total</span>
                    <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400">
                      {formatCurrency(cartTotal.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 p-3">
              <p className="text-xs text-green-900 dark:text-green-300 flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 text-sm flex-shrink-0">✓</span>
                <span>
                  Order will be <strong className="font-bold">auto-confirmed</strong> and sent directly to the kitchen.
                </span>
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm p-6 pt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={submitting}
              className="flex-1 h-11 font-semibold rounded-xl border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 h-11 font-bold rounded-xl shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-5 mr-2" />
                  Confirm Order
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
