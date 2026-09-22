"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageSquare,
  CheckCircle2
} from "lucide-react"

const eventTypes = [
  "Wedding",
  "Birthday",
  "Corporate Event",
  "Christening",
  "Graduation",
  "Anniversary",
  "Reunion",
  "Seminar",
  "Product Launch",
  "Team Building",
  "Other"
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    guestCount: "",
    preferredDate: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        guestCount: "",
        preferredDate: "",
        message: "",
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-sm font-medium mb-4">
            <MessageSquare className="size-4" />
            <span>Get In Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Contact{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Our Team
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Let's discuss your event and create something extraordinary together
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Let's Talk About Your Event</h2>
                <p className="text-muted-foreground mb-8">
                  Our event specialists are ready to help you plan the perfect celebration. 
                  Reach out and we'll get back to you within 24 hours.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <a 
                  href="tel:+639171234567"
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:shadow-lg transition-shadow"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-sm text-muted-foreground">Mon-Sun, 8:00 AM - 10:00 PM</p>
                    <p className="font-medium text-amber-600">+63 917 123 4567</p>
                  </div>
                </a>

                <a 
                  href="mailto:events@restaurant.com"
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 hover:shadow-lg transition-shadow"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                    <p className="font-medium text-rose-600">events@restaurant.com</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-sm text-muted-foreground">Visit us for a venue tour</p>
                    <p className="font-medium text-blue-600">123 Main Street, Manila, Philippines 1000</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Operating Hours</h3>
                    <p className="text-sm text-muted-foreground">Open 7 days a week</p>
                    <p className="font-medium text-purple-600">8:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/639171234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold transition-colors"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Message us on WhatsApp
              </a>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border bg-card p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                      <CheckCircle2 className="size-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground max-w-md">
                      Thank you for contacting us. Our team will get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+63 917 123 4567"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Event Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleChange}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select event type</option>
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Expected Guest Count
                        </label>
                        <Input
                          type="number"
                          name="guestCount"
                          value={formData.guestCount}
                          onChange={handleChange}
                          placeholder="e.g., 100"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Preferred Date
                        </label>
                        <Input
                          type="date"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your event..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="size-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By submitting this form, you agree to our privacy policy
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Visit Our Venue</h2>
            <p className="text-muted-foreground">
              Schedule a tour and see our beautiful spaces in person
            </p>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-xl h-[400px] bg-muted">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.4423!2d120.9842!3d14.5995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM1JzU4LjIiTiAxMjDCsDU5JzAzLjEiRQ!5e0!3m2!1sen!2sph!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-8">
            Check out our frequently asked questions or contact us directly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" asChild>
              <a href="/events#faq">View FAQ</a>
            </Button>
            <Button size="lg" asChild className="bg-gradient-to-r from-amber-600 to-orange-600">
              <a href="/events/book">Book Now</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
