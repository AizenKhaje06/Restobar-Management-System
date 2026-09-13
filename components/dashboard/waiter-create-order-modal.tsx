"use client"

import React, { useState, useMemo } from "react"
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
  ChevronLeft,
  Receipt,
  User,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  category_id?: string
  description?: string | null
  image_url?: string | null
  is_available: boolean
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
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
  categories: { id: string; name: string; sort_order: number }[]
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
  categories: rawCategories,
  menuItems,
  tables,
  onCreateOrder,
}: WaiterCreateOrderModalProps) {
  // Order details
  const [customerName, setCustomerName] = useState("")
  const [orderType, setOrderType] = useState<"dine-in" | "take-out">("dine-in")
  const [selectedTableId, setSelectedTableId] = useState("")

  // Generate preview order number once when modal opens
  const [previewOrderNumber] = useState(() => `#${Date.now().toString().slice(-8)}`)

  // Menu & cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCartModal, setShowCartModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Ref for category buttons container
  const categoryRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Get unique categories from menu items
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(
        menuItems
          .map((item) => item.category)
          .filter((cat) => cat && cat.trim() !== "")
      )
    ).sort()
    
    return ["all", ...cats]
  }, [menuItems])

  // Filter menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [menuItems, search, selectedCategory])

  // Available tables (no active orders AND not reserved/unavailable)
  const availableTables = useMemo(() => {
    return tables.filter(t => 
      (!t.active_orders || t.active_orders.length === 0) && 
      t.status !== 'reserved' && 
      t.status !== 'unavailable'
    )
  }, [tables])

  // Handle category navigation
  const navigateCategory = (direction: 'next' | 'prev') => {
    const currentIndex = categories.indexOf(selectedCategory)
    let newCategory: string
    
    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % categories.length
      newCategory = categories[nextIndex]
    } else {
      const prevIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1
      newCategory = categories[prevIndex]
    }
    
    setSelectedCategory(newCategory)
    
    setTimeout(() => {
      const buttonElement = categoryRefs.current.get(newCategory)
      if (buttonElement) {
        buttonElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }, 100)
  }

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      navigateCategory('next')
    } else if (isRightSwipe) {
      navigateCategory('prev')
    }
  }

  // Cart totals
  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.12
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

  // Validate before opening cart
  const handleOpenCart = () => {
    if (!customerName.trim()) {
      toast.error("Please enter customer name")
      return
    }
    if (orderType === "dine-in" && !selectedTableId) {
      toast.error("Please select a table")
      return
    }
    setShowCartModal(true)
  }

  // Handle confirm
  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await onCreateOrder({
        order_type: orderType,
        table_id: orderType === "dine-in" ? selectedTableId : undefined,
        customer_name: customerName,
        items: cart.map((c) => ({
          menu_item_id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
        })),
      })
      
      // Reset state - success toast is shown by parent
      setCart([])
      setOrderNotes("")
      setCustomerName("")
      setSelectedTableId("")
      setShowConfirmDialog(false)
      setShowCartModal(false)
      onClose()
    } catch (error: any) {
      console.error("Create order error:", error)
      toast.error(error?.message || "Failed to create order")
      setSubmitting(false) // Only reset on error, success will close modal
    }
  }

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setCart([])
      setOrderNotes("")
      setCustomerName("")
      setOrderType("dine-in")
      setSelectedTableId("")
      setSearch("")
      setSelectedCategory("all")
      setShowCartModal(false)
      setShowConfirmDialog(false)
    }
  }, [open])

  const selectedTable = availableTables.find(t => t.id === selectedTableId)

  return (
    <>
      {/* Main Menu Modal */}
      <Dialog open={open && !showCartModal} onOpenChange={onClose}>
        <DialogContent 
          className="w-screen h-screen sm:w-[95vw] sm:h-[95vh] sm:max-w-6xl sm:max-h-[900px] max-w-none p-3 sm:p-4 gap-0 flex flex-col"
          showCloseButton={false}
        >
          <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex-shrink-0">
                    <Plus className="size-5 text-white dark:text-slate-900" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-foreground">
                      Create New Order
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Walk-in customer order
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-lg size-10 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
                >
                  <X className="size-5" />
                </Button>
              </div>

              {/* Order Details Form */}
              <div className="px-4 pb-3 pt-3 space-y-2">
                {/* Customer Name - Full Width */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-9 h-10 bg-white dark:bg-gray-950 border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* Order Type and Table - Flexbox with gap */}
<div className="flex gap-2">
                  {/* Order Type */}
                  <div className="flex-1">
                    <Select value={orderType} onValueChange={(v) => setOrderType(v as "dine-in" | "take-out")}>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {orderType === "dine-in" ? "Dine-In" : "Take-Out"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dine-in">Dine-In</SelectItem>
                        <SelectItem value="take-out">Take-Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Table */}
                  <div className="flex-1">
                    {orderType === "dine-in" ? (
                      availableTables.length === 0 ? (
                        <div className="h-8 rounded-lg border border-input bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-xs text-amber-700 dark:text-amber-300 px-2.5">
                          No tables
                        </div>
                      ) : (
                        <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                          <SelectTrigger className="w-full">
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
                      <div className="h-8 rounded-lg border border-input bg-background flex items-center justify-center text-xs text-muted-foreground px-2.5">
                        No table needed
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-gray-950 border-slate-200 dark:border-slate-800 focus-visible:ring-slate-400 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-b border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto scrollbar-hide px-4 py-3">
                <div className="flex gap-2 min-w-max">
                  {categories.map((cat, index) => (
                    <button
                      key={`category-${index}-${cat}`}
                      ref={(el) => {
                        if (el) {
                          categoryRefs.current.set(cat, el)
                        }
                      }}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap capitalize border-2",
                        selectedCategory === cat
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center pb-2 sm:hidden">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {categories.indexOf(selectedCategory) + 1} / {categories.length}
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div 
              className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-950 dark:to-gray-900"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="p-3 sm:p-4">
                <div 
                  key={selectedCategory} 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-300"
                >
                  {filteredItems.map((item, index) => {
                    const cartItem = cart.find((c) => c.id === item.id)
                    const isInCart = !!cartItem
                    const isUnavailable = !item.is_available
                    
                    return (
                      <div
                        key={item.id}
                        style={{ 
                          animationDelay: `${index * 30}ms`,
                          animationFillMode: 'backwards'
                        }}
                        className={`group relative overflow-hidden rounded-xl border bg-card transition-all flex flex-row min-h-[140px] animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                          isUnavailable ? 'opacity-60' : 'hover:shadow-md hover:border-primary/30'
                        }`}
                      >
                        {/* Image */}
                        {item.image_url && (
                          <div className="w-36 sm:w-44 shrink-0 overflow-hidden bg-muted relative">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className={`h-full w-full object-cover transition-transform duration-300 ${
                                isUnavailable ? 'grayscale' : 'group-hover:scale-105'
                              }`}
                            />
                            {isUnavailable && (
                              <div className="absolute top-2 left-2">
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                                  Unavailable
                                </Badge>
                              </div>
                            )}
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
                          </div>
                        )}
                        {!item.image_url && (
                          <div className="w-20 sm:w-28 shrink-0 flex items-center justify-center bg-muted relative">
                            <UtensilsCrossed className="size-8 text-muted-foreground/40" />
                            {isUnavailable && (
                              <div className="absolute top-2 left-2">
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                                  Unavailable
                                </Badge>
                              </div>
                            )}
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
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm sm:text-base leading-tight flex-1 min-w-0 truncate">
                                {item.name}
                              </h3>
                              <p className="text-base sm:text-lg font-bold text-primary whitespace-nowrap tabular-nums shrink-0">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="mt-2">
                            <Button
                              size="sm"
                              className="h-8 w-full sm:w-auto font-medium text-xs"
                              onClick={() => !isUnavailable && addToCart(item)}
                              disabled={isUnavailable}
                            >
                              <Plus className="mr-1 size-3.5" />
                              {isUnavailable ? "Unavailable" : isInCart ? "Add More" : "Add"}
                            </Button>
                          </div>
                        </div>
                      </div>
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

            {/* Floating Review Order Button */}
            {cart.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 z-50">
                <Button
                  size="lg"
                  onClick={handleOpenCart}
                  className="w-full h-14 px-6 rounded-lg shadow-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 border font-semibold"
                >
                  <div className="flex items-center justify-center gap-3 w-full">
                    <ShoppingCart className="size-5" />
                    <span className="font-bold text-base">Review Order</span>
                    <Badge className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-0 font-bold text-base px-2.5 py-0.5">
                      {cartItemCount}
                    </Badge>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Review Modal */}
      <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
        <DialogContent 
          className="w-screen h-screen sm:w-auto sm:h-auto sm:max-w-2xl sm:max-h-[90vh] max-w-none p-3 sm:p-4 gap-0 flex flex-col"
          showCloseButton={false}
        >
          <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3 px-4 pt-4 pb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCartModal(false)}
                  className="rounded-lg size-10 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
                >
                  <ChevronLeft className="size-5" />
                </Button>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <ShoppingCart className="size-6" />
                    Order Review
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {selectedTable && (
                      <>
                        <Badge variant="outline" className="font-semibold text-xs">
                          {selectedTable.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">·</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground font-medium">
                      {orderType === "take-out" ? "Take-Out" : "Dine-In"} • {previewOrderNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-3">
                <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-semibold text-foreground">
                    {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {formatCurrency(cartTotal.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950">
              <div className="p-4 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
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

                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="size-3.5" strokeWidth={3} />
                        </Button>
                        <span className="font-bold text-lg w-10 text-center text-foreground">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="size-3.5" strokeWidth={3} />
                        </Button>
                      </div>

                      <div className="font-bold text-base text-foreground min-w-[80px] text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Order Notes */}
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
                    className="resize-none bg-white dark:bg-slate-950 border focus-visible:ring-slate-400 rounded-lg"
                  />
                </div>

                {/* Totals */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2 mb-3">
                    <Receipt className="size-4" />
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
                    <div className="h-px bg-slate-200 dark:bg-slate-800" />
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold text-base text-foreground">Total Amount</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(cartTotal.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                  <p className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <AlertCircle className="size-4 text-slate-600 dark:text-slate-400 mt-0.5 shrink-0" />
                    <span>
                      This order will be sent to the kitchen immediately.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex-shrink-0 border-t bg-white dark:bg-slate-950 p-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCartModal(false)}
                className="flex-1 h-12 font-semibold rounded-lg"
              >
                <ChevronLeft className="size-4 mr-1.5" />
                Back to Menu
              </Button>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="flex-1 h-12 font-bold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900"
              >
                <CheckCircle2 className="size-5 mr-2" />
                Confirm Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 overflow-hidden sm:rounded-lg">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900" />
            
            <div className="relative px-6 pt-6 pb-5">
              <div className="flex justify-center mb-4">
                <div className="relative flex items-center justify-center size-16 rounded-lg bg-slate-900 dark:bg-slate-100">
                  <CheckCircle2 className="size-9 text-white dark:text-slate-900" strokeWidth={2.5} />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Confirm New Order?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review order details before sending to kitchen
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Customer</p>
                <p className="font-bold text-sm text-foreground">
                  {customerName} · {orderType === "take-out" ? "Take-Out" : `${selectedTable?.label}`}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">{cartItemCount} Items</span>
                <span className="text-xl font-bold text-foreground">{formatCurrency(cartTotal.total)}</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={submitting}
              className="flex-1 h-12 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
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
