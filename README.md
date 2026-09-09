"# Lumière Restaurant & Bar Management System

<div align="center">

![Lumière Logo](public/placeholder-logo.svg)

**A modern, full-stack restaurant and bar operations platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Features

### Core Operations
- 🏪 **Admin Dashboard** - Real-time revenue analytics, order management, and staff oversight
- 💳 **POS Terminal** - Fast order processing with multiple payment methods (cash, card, e-wallets)
- 🍽️ **Waiter Console** - Table management, order assistance, and kitchen coordination
- 📱 **QR Self-Ordering** - Contactless menu browsing and ordering via smartphone
- 👥 **Multi-User Sessions** - Shared table ordering with PIN-based access control
- 🧾 **Digital Receipts** - Automatic receipt generation with print support

### Management Features
- 📊 **Real-Time Analytics** - Live dashboard with revenue, covers, and trends
- 🍕 **Menu Management** - Categories, items, pricing, images, and availability
- 🪑 **Table Management** - QR codes, status tracking, and waiter assignments
- 📅 **Reservations** - Booking management with table assignments
- 👨‍💼 **Staff Management** - Role-based access control and invitation system
- 📝 **Activity Logging** - Complete audit trail for all operations
- ⚙️ **Restaurant Settings** - Branding, tax rates, hours, and receipts

### Technical Features
- ⚡ **Real-Time Sync** - WebSocket-based updates across all devices
- 🔒 **Row Level Security** - Database-level permission enforcement
- 📱 **Progressive Web App** - Installable, offline-capable mobile experience
- 🎮 **Mini-Games** - Customer entertainment during wait times
- 🌙 **Dark Mode** - Full theme support
- 🌐 **Responsive Design** - Optimized for desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** package manager (or npm/yarn)
- **Supabase** account (free tier available)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/restobar-management-system.git
   cd restobar-management-system
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up the database:**
   - Log in to your [Supabase Dashboard](https://app.supabase.com)
   - Navigate to SQL Editor
   - Copy and run the entire `COMPLETE_DATABASE_SCHEMA.sql` file
   - Verify all tables and policies were created

5. **Create your first admin user:**
   
   **Option A: Sign up via UI (Recommended)**
   ```bash
   pnpm dev
   ```
   - Navigate to `http://localhost:3000/signup`
   - Create an account
   - In Supabase SQL Editor, run:
   ```sql
   SELECT promote_to_admin('your-email@example.com');
   ```

   **Option B: Direct SQL**
   ```sql
   -- In Supabase SQL Editor
   SELECT promote_to_admin('admin@example.com');
   ```

6. **Start the development server:**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 User Roles

### 👨‍💼 Admin (`/admin`)
- Full system access and configuration
- Dashboard with revenue analytics
- Menu, table, and staff management
- Order oversight and reservations
- Activity logs and reporting

### 💰 POS Cashier (`/pos`)
- Order creation and processing
- Payment handling (cash, card, e-wallets)
- Receipt generation
- Table status management

### 🍽️ Waiter (`/waiter`)
- Assigned table management
- Order assistance and confirmation
- Status updates (pending → ready → served)
- Add/modify items
- Kitchen communication

### 👤 Customer (Anonymous via QR)
- Scan table QR code
- Create or join table session (PIN-based)
- Browse menu and add items
- Submit orders
- Track order status in real-time
- Play mini-games while waiting

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [SWR](https://swr.vercel.app/) - Data fetching and caching

**Backend:**
- [Supabase](https://supabase.com/) - PostgreSQL database
- [Supabase Auth](https://supabase.com/auth) - JWT authentication
- [Supabase Storage](https://supabase.com/storage) - File uploads
- [Supabase Realtime](https://supabase.com/realtime) - WebSocket subscriptions

**Key Features:**
- Server Actions for API operations
- Row Level Security (RLS) policies
- Real-time synchronization
- Progressive Web App (PWA)
- Image optimization

### Database Schema

16 core tables with comprehensive relationships:
- `profiles` - User accounts with role-based access
- `tables` - Restaurant table management
- `table_sessions` - Multi-user ordering sessions
- `menu_items` & `categories` - Menu catalog
- `orders` & `order_items` - Order management
- `payments` & `receipts` - Payment processing
- `reservations` - Booking management
- `staff_invitations` - Staff onboarding
- `activity_logs` - Audit trail
- `table_qr_codes` - QR code management
- `game_scores` - Mini-game leaderboard

See `COMPLETE_DATABASE_SCHEMA.sql` for full schema and RLS policies.

---

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Generate PWA icons
pnpm generate-icons
```

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions (business logic)
│   ├── admin/             # Admin console routes
│   ├── api/               # REST API endpoints
│   ├── pos/               # POS terminal routes
│   ├── waiter/            # Waiter console routes
│   └── order/             # Customer QR ordering
├── components/             # React components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication forms
│   ├── dashboard/         # Dashboard components
│   ├── pos/               # POS components
│   └── ui/                # shadcn/ui components
├── lib/                   # Shared utilities
│   ├── supabase/          # Supabase client config
│   ├── data/              # Data fetching utilities
│   ├── auth.ts            # Auth helpers
│   ├── types.ts           # TypeScript types
│   └── constants.ts       # App constants
├── public/                # Static assets
└── supabase/              # Database migrations
```

### Environment Variables

Required variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Configure domain** (optional):
   - Add custom domain in Vercel dashboard
   - Update DNS records

### Other Platforms

Compatible with:
- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Railway](https://railway.app/)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)

**Build command:** `pnpm build`  
**Output directory:** `.next`  
**Install command:** `pnpm install`

---

## 📱 PWA Installation

### iOS (iPhone/iPad)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm

### Android
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Install app" or "Add to Home Screen"
4. Confirm

### Desktop (Chrome/Edge)
1. Open the app in browser
2. Look for the install icon in the address bar
3. Click "Install"

---

## 🔒 Security

### Authentication
- JWT-based authentication via Supabase
- Session cookies with `@supabase/ssr`
- Automatic token refresh

### Authorization
- Role-based access control (RBAC)
- Row Level Security (RLS) on all tables
- Middleware guards for protected routes
- Server-side permission validation

### Data Protection
- HTTPS enforced in production
- Environment variables for secrets
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)
- File upload validation (type, size limits)

### Audit Trail
- All critical operations logged to `activity_logs`
- Actor tracking (user ID, name, role)
- IP address logging
- Timestamp precision

---

## 🧪 Testing

### Setup Testing (Coming Soon)

```bash
# Install test dependencies
pnpm add -D jest @testing-library/react @testing-library/jest-dom

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript for all new code
- Follow existing code style (ESLint)
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Vercel](https://vercel.com/) - Hosting platform
- [Lucide](https://lucide.dev/) - Icon library

---

## 📞 Support

### Documentation
- [Full Audit Report](./PROJECT_AUDIT_REPORT.md) - Comprehensive system analysis
- [Database Schema](./COMPLETE_DATABASE_SCHEMA.sql) - Complete database setup

### Issues
Found a bug? [Open an issue](https://github.com/yourusername/restobar-management-system/issues)

### Contact
- Email: support@yourrestaurant.com
- Website: https://yourrestaurant.com

---

<div align="center">

**Built with ❤️ for the hospitality industry**

[⭐ Star this repo](https://github.com/yourusername/restobar-management-system) | [🐛 Report Bug](https://github.com/yourusername/restobar-management-system/issues) | [✨ Request Feature](https://github.com/yourusername/restobar-management-system/issues)

</div>" 
