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
      <div className="border-b pb-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="business" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Business
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Contact
          </TabsTrigger>
          <TabsTrigger value="hours" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Hours
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="hero" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Features
          </TabsTrigger>
        </TabsList>
      </div>

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
