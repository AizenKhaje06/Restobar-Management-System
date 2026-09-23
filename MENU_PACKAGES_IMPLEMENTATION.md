# Menu Packages Implementation Plan

## Overview
Implementing a complete food/menu package management system for events.

## Components to Create

### 1. Admin Menu Package Management ✅ (In Progress)
- [x] Add admin actions to admin-events.ts
- [x] Add navigation link to admin layout
- [ ] Create admin menu packages list page
- [ ] Create new menu package page
- [ ] Create edit menu package page

### 2. Customer-Facing Menu Display
- [ ] Create /events/menu page (browse all menu packages)
- [ ] Menu packages organized by category (buffet, plated, drinks, dessert)
- [ ] Display detailed menu items
- [ ] Show dietary information

### 3. Booking Integration
- [ ] Add menu package selection to booking flow
- [ ] Calculate pricing with menu package
- [ ] Display selected menu in booking confirmation

## Database Schema (Already Exists)
```sql
event_menu_packages
- id
- name
- category (buffet, plated, drinks, dessert)
- description
- price_per_person
- min_order (minimum pax)
- items (JSONB) - array of menu items
- dietary_info (JSONB) - dietary flags
- photo
- is_active
- sort_order
```

## Features
- Admin can CRUD menu packages
- Customers can browse menu options
- Integration with event bookings
- File upload for menu photos
- Dietary information display
- Price per person calculation
- Minimum order validation

## Status
- Admin actions: ✅ Complete
- Admin UI: 🚧 In Progress
- Customer pages: ⏳ Pending
- Booking integration: ⏳ Pending
