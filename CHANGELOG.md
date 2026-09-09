# Changelog

All notable changes to the Lumière Restaurant Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Kitchen Display System (KDS) for real-time order management
- Comprehensive testing setup with Jest and React Testing Library
- CI/CD workflows with GitHub Actions
- Security headers in Next.js configuration
- Enhanced documentation (README, DEPLOYMENT, CONTRIBUTING)
- Pull request and issue templates
- Code quality checks (CodeQL security scanning)

### Changed
- Increased table session PIN from 4 to 6 digits for better security
- Enabled TypeScript strict checks (removed `ignoreBuildErrors`)
- Enabled image optimization in production
- Improved .gitignore to prevent sensitive file commits
- Updated package.json with proper metadata and test scripts

### Security
- Added security headers (CSP, HSTS, X-Frame-Options, etc.)
- Strengthened session PIN requirements
- Enhanced .gitignore for secrets protection

---

## [0.1.0] - 2026-09-09

### Added

#### Core Features
- **Admin Dashboard** - Real-time analytics with revenue tracking
- **POS Terminal** - Fast order processing with multiple payment methods
- **Waiter Console** - Table management and order coordination
- **Customer QR Ordering** - Contactless menu browsing and ordering
- **Multi-User Table Sessions** - PIN-based shared ordering

#### Management Features
- Menu management (categories, items, pricing, images)
- Table management with QR code generation
- Staff management with role-based access control
- Reservation system
- Restaurant settings configuration
- Activity logging and audit trail

#### Technical Features
- Next.js 16 with App Router
- Supabase backend (PostgreSQL + Auth + Storage + Realtime)
- Row Level Security (RLS) policies
- Real-time WebSocket updates
- Progressive Web App (PWA) support
- Mobile-responsive design
- Dark mode support

#### Database
- 16 core tables with comprehensive relationships
- Automated triggers and functions
- Activity logging
- Storage buckets for images and receipts

#### Security
- JWT-based authentication
- Role-based authorization
- Database-level RLS policies
- Middleware route guards
- Secure session management

### Documentation
- Initial README
- Complete database schema documentation
- Basic deployment instructions

---

## Release Types

### Major Version (x.0.0)
- Breaking changes
- Major architectural changes
- Database schema breaking changes

### Minor Version (0.x.0)
- New features
- Non-breaking enhancements
- New pages or major components

### Patch Version (0.0.x)
- Bug fixes
- Security patches
- Performance improvements
- Documentation updates

---

## Upgrade Notes

### From 0.1.0 to Unreleased

**Action Required:**

1. **Install new dev dependencies:**
   ```bash
   pnpm install
   ```

2. **Update environment variables:**
   - No new environment variables required
   - Existing variables remain the same

3. **Update Next.js configuration:**
   - TypeScript errors now fail builds (fix any errors before deploying)
   - Image optimization enabled (ensure remote patterns configured)

4. **Update table sessions:**
   - Existing 4-digit PINs still work
   - New sessions require 6-digit PINs
   - Consider prompting users to update their PINs

5. **Run tests:**
   ```bash
   pnpm test
   ```

**No database migrations required** for this update.

---

## Deprecation Warnings

None at this time.

---

## Known Issues

### v0.1.0
- TypeScript build errors ignored (resolved in Unreleased)
- Image optimization disabled (resolved in Unreleased)
- No automated testing (resolved in Unreleased)

---

## Links

- [GitHub Repository](https://github.com/yourusername/restobar-management-system)
- [Documentation](./README.md)
- [Issue Tracker](https://github.com/yourusername/restobar-management-system/issues)
- [Pull Requests](https://github.com/yourusername/restobar-management-system/pulls)

---

**Legend:**
- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements
