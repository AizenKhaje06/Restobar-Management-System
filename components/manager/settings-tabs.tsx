'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessInfoForm } from "./settings/business-info-form"
import { ContactInfoForm } from "./settings/contact-info-form"
import { BusinessHoursForm } from "./settings/business-hours-form"
import { SocialMediaForm } from "./settings/social-media-form"
import { HeroSectionForm } from "./settings/hero-section-form"
import { FeaturesToggle } from "./settings/features-toggle"

interface SettingsTabsProps {
  settings: any
}

export function SettingsTabs({ settings }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="business" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="hours">Hours</TabsTrigger>
        <TabsTrigger value="social">Social Media</TabsTrigger>
        <TabsTrigger value="hero">Hero Section</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
      </TabsList>

      <TabsContent value="business">
        <BusinessInfoForm settings={settings} />
      </TabsContent>

      <TabsContent value="contact">
        <ContactInfoForm settings={settings} />
      </TabsContent>

      <TabsContent value="hours">
        <BusinessHoursForm settings={settings} />
      </TabsContent>

      <TabsContent value="social">
        <SocialMediaForm settings={settings} />
      </TabsContent>

      <TabsContent value="hero">
        <HeroSectionForm settings={settings} />
      </TabsContent>

      <TabsContent value="features">
        <FeaturesToggle settings={settings} />
      </TabsContent>
    </Tabs>
  )
}
