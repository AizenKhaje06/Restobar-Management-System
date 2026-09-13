"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Plus,
  Minus,
  X,
  Loader2,
  UtensilsCrossed,
  CheckCircle2,
  ShoppingCart,
  AlertCircle,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/constants"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  is_available: boolean
}

interface MenuCategory {
  id: string
  name: string
  sort_order: number
}

interface Table {
  id: string
  label: string
  zone: string | null
  status: string
}

interface WaiterCreateOrderModalProps {
  open: boolean
  onClose: () => void
  categories: MenuCategory[]
  menuItems: MenuItem[]
  tables: Table[]
  onCreateOrder: (data: {
    order_type: "dine-in" | "take-out"
    table_id?: string
    customer_name: string
    items: { menu_item_id: string; name: string; price: number; quantity: number }[]
  }) => Promise<void>
}

export function WaiterCreateOrderModal({
  open,
  onClose,
  categories,
  menuItems,
  tables,
  onCreateOrder,
}: WaiterCreateOrderModalProps) {
  // Order details
  const [orderType, setOrderType] = useState<"dine-in" | "take-out">("dine-in")
  const [selectedTableId, setSelectedTableId] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  
  // Menu selection
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number }>>([])
  const [creating, setCreating] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null) // For animation feedback
  const [showReviewModal, setShowReviewModal] = useState(false) // Review order modal
  const [specialInstructions, setSpecialInstructions] = useState("") // Special notes
  
  // Touch/swipe state for mobile
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setOrderType("dine-in")
      setSelectedTableId("")
      setCustomerName("")
      setActiveCategory("all")
      setSearch("")
      setCart([])
      setShowReviewModal(false)
      setSpecialInstructions("")
    }
  }, [open])

  // Filter available tables (not occupied)
  const availableTables = tables.filter(t => t.status === "available")

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category_id === activeCategory
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Handle add item to cart
  const handleAddItem = useCallback((item: MenuItem) => {
    if (!item.is_available) return
    
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
    
    // Visual feedback - flash animation
    setJustAdded(item.id)
    setTimeout(() => setJustAdded(null), 600)
  }, [])

  // Handle update cart item quantity
  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta
            return newQty > 0 ? { ...c, quantity: newQty } : null
          }
          return c
        })
        .filter((c) => c !== null) as Array<{ item: MenuItem; quantity: number }>
    })
  }, [])

  // Handle remove from cart
  const handleRemoveItem = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId))
  }, [])

  // Submit order - with validation
  const handleSubmitOrder = useCallback(async () => {
    // Validation
    if (!customerName.trim()) {
      alert("Please enter customer name")
      return
    }
    if (orderType === "dine-in" && !selectedTableId) {
      alert("Please select a table")
      return
    }
    if (cart.length === 0) {
      alert("Please add at least one item")
      return
    }

    setCreating(true)
    try {
      await onCreateOrder({
        order_type: orderType,
        table_id: orderType === "dine-in" ? selectedTableId : undefined,
        customer_name: customerName,
        items: cart.map((c) => ({
          menu_item_id: c.item.id,
          name: c.item.name,
          price: c.item.price,
          quantity: c.quantity,
        })),
      })
      onClose()
    } catch (error: any) {
      alert(error?.message || "Failed to create order")
    } finally {
      setCreating(false)
    }
  }, [cart, orderType, selectedTableId, customerName, onCreateOrder, onClose])

  // Open review modal
  const handleOpenReview = useCallback(() => {
    // Validation
    if (!customerName.trim()) {
      alert("Please enter customer name")
      return
    }
    if (orderType === "dine-in" && !selectedTableId) {
      alert("Please select a table")
      return
    }
    if (cart.length === 0) {
      alert("Please add at least one item")
      return
    }
    
    setShowReviewModal(true)
  }, [customerName, orderType, selectedTableId, cart])

  // Swipe handlers for category navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe || isRightSwipe) {
      const allCategories = ["all", ...categories.map((c) => c.id)]
      const currentIndex = allCategories.indexOf(activeCategory)
      
      let newIndex = currentIndex
      if (isLeftSwipe && currentIndex < allCategories.length - 1) {
        newIndex = currentIndex + 1
      } else if (isRightSwipe && currentIndex > 0) {
        newIndex = currentIndex - 1
      }

      if (newIndex !== currentIndex) {
        const newCategory = allCategories[newIndex]
        setActiveCategory(newCategory)
        
        // Auto-scroll category button into view
        setTimeout(() => {
          const button = document.getElementById(`category-btn-${newCategory}`)
          button?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
        }, 50)
      }
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)
  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0)
  const allCategories = ["all", ...categories.map((c) => c.id)]
  const currentCategoryIndex = allCategories.indexOf(activeCategory)
  
  // Calculate tax and total
  const subtotal = cartTotal
  const tax = Math.round(subtotal * 0.12 * 100) / 100
  const totalAmount = Math.round((subtotal + tax) * 100) / 100
  
  // Generate preview order number (random for preview)
  const previewOrderNumber = `#${Date.now().toString().slice(-8)}`
  const selectedTable = availableTables.find(t => t.id === selectedTableId)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="w-full sm:w-[95vw] md:max-w-6xl lg:max-w-7xl max-h-[95vh] sm:max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
        style={{ height: "min(90vh, 900px)" }}
      >
        {/* Single Modal with Form Header + Menu */}
        <div className="flex flex-col h-full">
          {/* LEFT: Menu Items - Full width on mobile, left side on desktop */}
          <div className="flex-1 flex flex-col min-h-0 md:flex-row">
            <div className="flex-1 flex flex-col min-h-0 md:border-r">
              {/* Header with Form Fields */}
              <div className="border-b px-4 sm:px-6 py-3 shrink-0 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                <h2 className="text-lg sm:text-xl font-bold">Create New Order</h2>
                
                {/* Form Fields in Header - Compact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Customer Name */}
                  <Input
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9"
                  />
                  
                  {/* Order Type */}
                  <Select value={orderType} onValueChange={(v) => setOrderType(v as "dine-in" | "take-out")}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">Dine-In</SelectItem>
                      <SelectItem value="take-out">Take-Out</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Table */}
                  {orderType === "dine-in" ? (
                    availableTables.length === 0 ? (
                      <div className="h-9 rounded-lg border bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-xs text-amber-700 dark:text-amber-300">
                        No tables
                      </div>
                    ) : (
                      <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select table">
                            {selectedTableId 
                              ? availableTables.find(t => t.id === selectedTableId)?.label || "Select table"
                              : "Select table"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableTables.map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                              {table.label}
                              {table.zone && ` (${table.zone})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  ) : (
                    <div className="h-9 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No table needed
                    </div>
                  )}
                </div>
              </div>

            {/* Search */}
            <div className="px-4 sm:px-6 py-3 border-b shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9 w-full"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="relative border-b shrink-0">
              <div className="flex gap-2 px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none">
                <button
                  id="category-btn-all"
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 border ${
                    activeCategory === "all"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    id={`category-btn-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 border ${
                      activeCategory === cat.id
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              {/* Category Indicator (Mobile) */}
              <div className="md:hidden px-4 pb-2 text-xs text-center text-muted-foreground">
                {allCategories.indexOf(activeCategory) + 1} / {allCategories.length}
              </div>
            </div>

            {/* Menu Grid with swipe support */}
            <div
              className="flex-1 min-h-0 overflow-y-auto"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
                  <UtensilsCrossed className="size-10 opacity-30 mb-3" />
                  <p className="text-base font-medium">No items found</p>
                </div>
              ) : (
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredItems.map((item, index) => {
                    const inCart = cart.find((c) => c.item.id === item.id)
                    const isUnavailable = !item.is_available

                    return (
                      <button
                        key={item.id}
                        onClick={() => !isUnavailable && handleAddItem(item)}
                        disabled={isUnavailable}
                        className={`group relative rounded-lg border p-3 flex gap-3 text-left transition-all hover:shadow-md active:scale-[0.98] ${
                          isUnavailable
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                        } ${justAdded === item.id ? "ring-2 ring-emerald-500 scale-105" : ""}`}
                        style={{
                          animation: `fadeInSlideUp 0.3s ease-out forwards`,
                          animationDelay: `${index * 30}ms`,
                          opacity: 0,
                        }}
                      >
                        {/* Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className={`w-full h-full object-cover ${
                                isUnavailable ? "grayscale" : ""
                              }`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UtensilsCrossed className="size-8 text-slate-300 dark:text-slate-700" />
                            </div>
                          )}
                          {isUnavailable && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                                Unavailable
                              </Badge>
                            </div>
                          )}
                          {inCart && !isUnavailable && (
                            <div className="absolute top-1 right-1 size-6 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shadow-lg">
                              {inCart.quantity}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                              {item.name}
                            </h3>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(item.price)}
                            </span>
                            {!isUnavailable && (
                              <div className="flex items-center justify-center size-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 transition-transform group-hover:scale-110">
                                <Plus className="size-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cart - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex md:w-80 lg:w-96 flex-col min-h-0 bg-muted/20">
            {/* Cart Header */}
            <div className="px-4 py-3 border-b bg-white dark:bg-slate-900 shrink-0">
              <h3 className="font-bold text-base">Order Items</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} added
              </p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
                  <ShoppingCart className="size-12 opacity-30 mb-3" />
                  <p className="text-sm font-medium">No items yet</p>
                  <p className="text-xs mt-1">Tap menu items to add</p>
                </div>
              ) : (
                cart.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="rounded-lg border bg-white dark:bg-slate-900 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight line-clamp-2">
                          {cartItem.item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(cartItem.item.price)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(cartItem.item.id)}
                        className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateQuantity(cartItem.item.id, -1)}
                          className="size-7 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="text-sm font-semibold w-8 text-center">
                          {cartItem.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateQuantity(cartItem.item.id, 1)}
                          className="size-7 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <span className="text-sm font-bold">
                        {formatCurrency(cartItem.item.price * cartItem.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            <div className="px-4 py-4 border-t bg-white dark:bg-slate-900 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">Total</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <Button
                onClick={handleOpenReview}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900"
                disabled={cart.length === 0}
              >
                <ShoppingCart className="size-4 mr-2" />
                Review Order
              </Button>
            </div>
          </div>
          </div>

          {/* Mobile: Floating Review Order Button - Only show when cart has items */}
          {cart.length > 0 && (
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
              <Button
                onClick={handleOpenReview}
                className={`w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-lg ${
                  justAdded ? "animate-pulse" : ""
                }`}
              >
                <ShoppingCart className="size-5 mr-2" />
                Review Order ({cartItemCount})
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Review Order Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="w-full max-w-md p-0 gap-0">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              <h3 className="font-bold text-lg">Order Review</h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {selectedTable && (
                <Badge variant="outline" className="text-xs font-semibold">
                  {selectedTable.label}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {orderType === "take-out" ? "Take-Out" : "Dine-In"} • Order {previewOrderNumber}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Summary */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{cartItemCount} Item{cartItemCount !== 1 ? "s" : ""}</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {cart.map((cartItem) => (
                <div key={cartItem.item.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight">
                        {cartItem.item.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCurrency(cartItem.item.price)} × {cartItem.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap">
                      {formatCurrency(cartItem.item.price * cartItem.quantity)}
                    </span>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateQuantity(cartItem.item.id, -1)}
                        className="size-7 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="text-sm font-semibold w-8 text-center">
                        {cartItem.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateQuantity(cartItem.item.id, 1)}
                        className="size-7 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(cartItem.item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Special Instructions (Optional)</label>
              <textarea
                placeholder="E.g., No onions, extra spicy, allergies..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-lg border bg-background resize-none"
              />
            </div>

            {/* Payment Breakdown */}
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-sm font-semibold">Payment Breakdown</h4>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax (12%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-base pt-2 border-t">
                  <span>Total Amount</span>
                  <span className="text-lg text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="flex gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
              <AlertCircle className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This order will be sent to the kitchen immediately.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-slate-50 dark:bg-slate-900/50 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              className="flex-1"
              disabled={creating}
            >
              Back to Menu
            </Button>
            <Button
              onClick={handleSubmitOrder}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={creating}
            >
              {creating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Confirm Order
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Dialog>
  )
}
