"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus, ChevronRight, ChevronLeft, Check } from "lucide-react"
import type { BookingFormStep3, EventAddon } from "@/lib/types/events"
import { getEventAddons } from "@/app/actions/events"

interface BookingStep3Props {
  data: BookingFormStep3
  onUpdate: (data: BookingFormStep3) => void
  onNext: () => void
  onBack: () => void
}

export function BookingStep3({ data, onUpdate, onNext, onBack }: BookingStep3Props) {
  const [formData, setFormData] = useState<BookingFormStep3>(data)
  const [addons, setAddons] = useState<EventAddon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAddons()
  }, [])

  const loadAddons = async () => {
    const result = await getEventAddons()
    if (result.addons) {
      setAddons(result.addons)
    }
    setLoading(false)
  }

  const toggleAddon = (addonId: string) => {
    const isSelected = formData.addon_ids.includes(addonId)
    
    if (isSelected) {
      const newAddonIds = formData.addon_ids.filter(id => id !== addonId)
      const newQuantities = { ...formData.addon_quantities }
      delete newQuantities[addonId]
      
      setFormData({
        addon_ids: newAddonIds,
        addon_quantities: newQuantities,
      })
    } else {
      setFormData({
        addon_ids: [...formData.addon_ids, addonId],
        addon_quantities: {
          ...formData.addon_quantities,
          [addonId]: 1,
        },
      })
    }
  }

  const updateQuantity = (addonId: string, quantity: number) => {
    if (quantity < 1) return
    
    setFormData(prev => ({
      ...prev,
      addon_quantities: {
        ...prev.addon_quantities,
        [addonId]: quantity,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
    onNext()
  }

  // Group addons by category
  const addonsByCategory = addons.reduce((acc, addon) => {
    if (!acc[addon.category]) {
      acc[addon.category] = []
    }
    acc[addon.category].push(addon)
    return acc
  }, {} as Record<string, EventAddon[]>)

  const categoryLabels: Record<string, string> = {
    equipment: "Equipment & Tech",
    entertainment: "Entertainment",
    decoration: "Decorations",
    food: "Food & Beverages",
    service: "Additional Services",
    other: "Other",
  }

  const categoryIcons: Record<string, string> = {
    equipment: "🎤",
    entertainment: "🎭",
    decoration: "🎨",
    food: "🍽️",
    service: "👥",
    other: "✨",
  }

  // Calculate total add-ons cost
  const totalAddonsCost = formData.addon_ids.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId)
    if (!addon) return sum
    const quantity = formData.addon_quantities[addonId] || 1
    return sum + (Number(addon.price) * quantity)
  }, 0)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin size-12 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading add-ons...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
          <Plus className="size-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Enhance Your Event</h2>
        <p className="text-muted-foreground">
          Add optional extras to make your event even more special
        </p>
      </div>

      {/* Add-ons by Category */}
      {Object.entries(addonsByCategory).map(([category, categoryAddons]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[category]}</span>
            <h3 className="text-lg font-semibold">{categoryLabels[category]}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {categoryAddons.map((addon) => {
              const isSelected = formData.addon_ids.includes(addon.id)
              const quantity = formData.addon_quantities[addon.id] || 1

              return (
                <div
                  key={addon.id}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all
                    ${
                      isSelected
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                        : "border-border"
                    }
                  `}
                >
                  {/* Select Checkbox */}
                  <div className="flex items-start gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`
                        flex size-6 items-center justify-center rounded-md border-2 transition-all flex-shrink-0 mt-0.5
                        ${
                          isSelected
                            ? "border-amber-600 bg-amber-600"
                            : "border-muted"
                        }
                      `}
                    >
                      {isSelected && <Check className="size-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h4 className="font-semibold">{addon.name}</h4>
                      {addon.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {addon.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price and Quantity */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-amber-600">
                        ₱{Number(addon.price).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">per {addon.unit}</p>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(addon.id, quantity - 1)}
                          disabled={quantity <= 1}
                          className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(addon.id, quantity + 1)}
                          className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isSelected && quantity > 1 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Subtotal: <span className="font-semibold text-foreground">₱{(Number(addon.price) * quantity).toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {addons.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No add-ons available at this time
        </p>
      )}

      {/* Summary */}
      {formData.addon_ids.length > 0 && (
        <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Selected Add-ons:</span>
            <span className="text-sm text-muted-foreground">
              {formData.addon_ids.length} item{formData.addon_ids.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Add-ons Cost:</span>
            <span className="text-2xl font-bold text-amber-600">
              ₱{totalAddonsCost.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
        >
          <ChevronLeft className="size-5 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          Continue to Customization
          <ChevronRight className="size-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
