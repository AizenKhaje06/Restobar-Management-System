"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Save,
  Plus,
  Trash2,
  Eye,
  Star,
  Users,
  Calendar,
  Award,
  MessageSquare
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type ContentSection = {
  hero: {
    title: string
    subtitle: string
    cta_primary: string
    cta_secondary: string
    background_image: string
  }
  stats: Array<{
    label: string
    value: string
    icon: string
  }>
  testimonials: Array<{
    name: string
    role: string
    content: string
    rating: number
    image?: string
  }>
  faq: Array<{
    question: string
    answer: string
    category: string
  }>
}

export default function ContentEditorPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'testimonials' | 'faq'>('hero')
  
  const [content, setContent] = useState<ContentSection>({
    hero: {
      title: "Create Unforgettable Moments at Lydia's Restobar & Events",
      subtitle: "Premium venues, exquisite catering, and professional event planning all in one place",
      cta_primary: "Book Your Event",
      cta_secondary: "View Packages",
      background_image: "/LydiasBG3.png"
    },
    stats: [
      { label: "Happy Clients", value: "500+", icon: "users" },
      { label: "Events Hosted", value: "1000+", icon: "calendar" },
      { label: "Years Experience", value: "15+", icon: "award" },
      { label: "Perfect Reviews", value: "4.9/5", icon: "star" }
    ],
    testimonials: [],
    faq: []
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    const supabase = createClient()
    
    // Load from event_settings table
    const { data } = await supabase
      .from("event_settings")
      .select("*")
      .single()

    if (data?.homepage_content) {
      setContent({
        ...content,
        ...data.homepage_content
      })
    }

    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("event_settings")
      .upsert({
        id: 1, // Single row for settings
        homepage_content: content
      })

    if (error) {
      toast.error("Failed to save content")
    } else {
      toast.success("Content saved successfully!")
    }

    setSaving(false)
  }

  // Testimonial handlers
  const addTestimonial = () => {
    setContent({
      ...content,
      testimonials: [
        ...content.testimonials,
        {
          name: "",
          role: "",
          content: "",
          rating: 5,
          image: ""
        }
      ]
    })
  }

  const updateTestimonial = (index: number, field: string, value: any) => {
    const updated = [...content.testimonials]
    updated[index] = { ...updated[index], [field]: value }
    setContent({ ...content, testimonials: updated })
  }

  const removeTestimonial = (index: number) => {
    setContent({
      ...content,
      testimonials: content.testimonials.filter((_, i) => i !== index)
    })
  }

  // FAQ handlers
  const addFaq = () => {
    setContent({
      ...content,
      faq: [
        ...content.faq,
        {
          question: "",
          answer: "",
          category: "general"
        }
      ]
    })
  }

  const updateFaq = (index: number, field: string, value: string) => {
    const updated = [...content.faq]
    updated[index] = { ...updated[index], [field]: value }
    setContent({ ...content, faq: updated })
  }

  const removeFaq = (index: number) => {
    setContent({
      ...content,
      faq: content.faq.filter((_, i) => i !== index)
    })
  }

  // Stats handlers
  const updateStat = (index: number, field: string, value: string) => {
    const updated = [...content.stats]
    updated[index] = { ...updated[index], [field]: value }
    setContent({ ...content, stats: updated })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block size-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Content Editor</h1>
          <p className="text-muted-foreground mt-1">
            Customize hero section, stats, testimonials, and FAQ
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/events"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              <Eye className="size-4 mr-2" />
              Preview
            </Button>
          </a>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'hero'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent hover:text-amber-600'
          }`}
        >
          Hero Section
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'stats'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent hover:text-amber-600'
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'testimonials'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent hover:text-amber-600'
          }`}
        >
          Testimonials ({content.testimonials.length})
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'faq'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent hover:text-amber-600'
          }`}
        >
          FAQ ({content.faq.length})
        </button>
      </div>

      {/* Hero Section Tab */}
      {activeTab === 'hero' && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-xl font-bold">Hero Section</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Main Title</label>
            <Input
              value={content.hero.title}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, title: e.target.value }
              })}
              placeholder="Your main headline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subtitle</label>
            <Textarea
              value={content.hero.subtitle}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, subtitle: e.target.value }
              })}
              placeholder="Supporting text"
              rows={3}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary CTA Text</label>
              <Input
                value={content.hero.cta_primary}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, cta_primary: e.target.value }
                })}
                placeholder="e.g., Book Your Event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Secondary CTA Text</label>
              <Input
                value={content.hero.cta_secondary}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, cta_secondary: e.target.value }
                })}
                placeholder="e.g., View Packages"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Background Image URL</label>
            <Input
              value={content.hero.background_image}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, background_image: e.target.value }
              })}
              placeholder="/LydiasBG3.png"
            />
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {content.stats.map((stat, index) => (
                <div key={index} className="p-4 rounded-lg border space-y-3">
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    placeholder="Label (e.g., Happy Clients)"
                  />
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    placeholder="Value (e.g., 500+)"
                  />
                  <Input
                    value={stat.icon}
                    onChange={(e) => updateStat(index, 'icon', e.target.value)}
                    placeholder="Icon name (users, calendar, award, star)"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Customer Testimonials</h2>
            <Button onClick={addTestimonial}>
              <Plus className="size-4 mr-2" />
              Add Testimonial
            </Button>
          </div>

          {content.testimonials.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl bg-muted/30">
              <MessageSquare className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No testimonials yet</h3>
              <p className="text-muted-foreground mb-6">
                Add customer reviews to build trust
              </p>
              <Button onClick={addTestimonial}>
                <Plus className="size-4 mr-2" />
                Add Your First Testimonial
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {content.testimonials.map((testimonial, index) => (
                <div key={index} className="rounded-xl border bg-card p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">Testimonial #{index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestimonial(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                      placeholder="Customer Name"
                    />
                    <Input
                      value={testimonial.role}
                      onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                      placeholder="Role/Event Type (e.g., Wedding Client)"
                    />
                  </div>

                  <Textarea
                    value={testimonial.content}
                    onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                    placeholder="Testimonial content..."
                    rows={3}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <select
                        value={testimonial.rating}
                        onChange={(e) => updateTestimonial(index, 'rating', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border bg-background"
                      >
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={2}>2 Stars</option>
                        <option value={1}>1 Star</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
                      <Input
                        value={testimonial.image || ''}
                        onChange={(e) => updateTestimonial(index, 'image', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
            <Button onClick={addFaq}>
              <Plus className="size-4 mr-2" />
              Add FAQ
            </Button>
          </div>

          {content.faq.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl bg-muted/30">
              <MessageSquare className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No FAQ items yet</h3>
              <p className="text-muted-foreground mb-6">
                Add common questions and answers
              </p>
              <Button onClick={addFaq}>
                <Plus className="size-4 mr-2" />
                Add Your First FAQ
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {content.faq.map((item, index) => (
                <div key={index} className="rounded-xl border bg-card p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">FAQ #{index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaq(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={item.category}
                      onChange={(e) => updateFaq(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                    >
                      <option value="general">General</option>
                      <option value="booking">Booking</option>
                      <option value="payment">Payment</option>
                      <option value="venue">Venue</option>
                      <option value="catering">Catering</option>
                    </select>
                  </div>

                  <Input
                    value={item.question}
                    onChange={(e) => updateFaq(index, 'question', e.target.value)}
                    placeholder="Question?"
                  />

                  <Textarea
                    value={item.answer}
                    onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                    placeholder="Answer..."
                    rows={3}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
