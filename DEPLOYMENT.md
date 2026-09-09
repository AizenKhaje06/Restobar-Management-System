# Deployment Guide - Lumière Restaurant Management System

This guide covers deploying the Lumière Restaurant Management System to production.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Supabase Setup](#supabase-setup)
3. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
4. [Alternative Platforms](#alternative-platforms)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Domain Configuration](#domain-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] ✅ All TypeScript errors resolved (`pnpm type-check`)
- [ ] ✅ Tests passing (`pnpm test`)
- [ ] ✅ Linting passed (`pnpm lint`)
- [ ] ✅ Production build successful (`pnpm build`)
- [ ] ✅ Environment variables documented
- [ ] ✅ Database schema applied to production Supabase
- [ ] ✅ Storage buckets configured
- [ ] ✅ First admin user created
- [ ] ✅ `.env.local` not committed to git
- [ ] ✅ Security headers configured

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name:** `lumiere-production`
   - **Database Password:** (Generate strong password - save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (for testing) or Pro (for production)
4. Wait for project to initialize (~2 minutes)

### 2. Apply Database Schema

1. Navigate to **SQL Editor** in Supabase dashboard
2. Click **"New Query"**
3. Copy entire contents of `COMPLETE_DATABASE_SCHEMA.sql`
4. Paste and click **"Run"**
5. Verify success:
   - Check **Table Editor** - should see 16 tables
   - Check **Authentication > Policies** - should see RLS policies

### 3. Configure Storage Buckets

Storage buckets are auto-created by the schema script. Verify in **Storage**:

- `receipts` - Public
- `menu-images` - Public
- `categories` - Public
- `qrcodes` - Public
- `avatars` - Public
- `restaurant` - Public

### 4. Get API Credentials

1. Navigate to **Settings > API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (long JWT token)
3. Save these for environment variables

### 5. Create First Admin User

**Option A: Via UI After Deployment**
1. Deploy the app (see below)
2. Navigate to `/signup`
3. Create account with your email
4. In Supabase SQL Editor, run:
   ```sql
   SELECT promote_to_admin('your-email@example.com');
   ```

**Option B: Direct SQL**
```sql
-- In Supabase SQL Editor
-- Create auth user first (if needed)
-- Then promote to admin
SELECT promote_to_admin('admin@yourrestaurant.com');
```

### 6. Configure Email Settings (Optional)

For production, configure SMTP for auth emails:

1. Go to **Settings > Auth**
2. Scroll to **SMTP Settings**
3. Configure your email provider (e.g., SendGrid, Mailgun)
4. Test email delivery

---

## Vercel Deployment (Recommended)

### Why Vercel?
- First-party Next.js support
- Automatic deployments on git push
- Preview deployments for PRs
- Built-in analytics
- Global CDN
- Serverless functions

### Step-by-Step Deployment

#### 1. Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add remote repository
git remote add origin https://github.com/yourusername/lumiere-restaurant.git

# Add all files
git add .

# Commit
git commit -m "Initial production deployment"

# Push to main branch
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `pnpm build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

#### 3. Configure Environment Variables

In the Vercel dashboard, add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | From Supabase Settings > API |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | (optional) | Auto-generated if you enable Analytics |

**Important:** Make sure to use the **Production** environment for these variables.

#### 4. Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide a URL: `https://your-project.vercel.app`
4. Test the deployment

#### 5. Enable Analytics (Optional)

1. Go to project settings in Vercel
2. Navigate to **Analytics**
3. Click **"Enable"**
4. Analytics will start collecting data automatically

---

## Alternative Platforms

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

### AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New App" > "Host web app"**
3. Connect your GitHub repository
4. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install -g pnpm
           - pnpm install
       build:
         commands:
           - pnpm build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```
5. Add environment variables
6. Deploy

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=your-url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Deploy
railway up
```

### DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Connect GitHub repository
4. Configure:
   - **Type:** Web Service
   - **Build Command:** `pnpm build`
   - **Run Command:** `pnpm start`
5. Add environment variables
6. Deploy

---

## Post-Deployment Setup

### 1. Verify Deployment

Test all critical paths:

- [ ] Landing page loads: `https://yourdomain.com`
- [ ] Sign up works: `https://yourdomain.com/signup`
- [ ] Login works: `https://yourdomain.com/login`
- [ ] Admin dashboard accessible: `https://yourdomain.com/admin`
- [ ] POS terminal works: `https://yourdomain.com/pos`
- [ ] QR ordering works: `https://yourdomain.com/order?qr=test`

### 2. Configure Restaurant Settings

1. Login as admin
2. Navigate to **Settings** (`/admin/settings`)
3. Configure:
   - Restaurant name and tagline
   - Address, phone, email
   - Tax rate (default: 12%)
   - Operating hours
   - Upload logo
   - Receipt footer message

### 3. Set Up Initial Data

**Add Menu Categories:**
1. Go to **Menu Management**
2. Create categories (e.g., Appetizers, Mains, Drinks, Desserts)
3. Set sort order

**Add Menu Items:**
1. Add items to each category
2. Set prices
3. Upload images
4. Mark as available

**Create Tables:**
1. Go to **Tables**
2. Add tables (e.g., A-1, A-2, B-1, etc.)
3. Set capacity (seats)
4. Assign zones (Indoor, Outdoor, Bar)
5. Generate QR codes
6. Print QR codes and place on tables

**Invite Staff:**
1. Go to **Staff Management**
2. Click **"Invite Staff Member"**
3. Enter email and select role (POS, Waiter)
4. Staff will receive invitation (if SMTP configured)

### 4. Test Complete Workflow

**Test POS Order:**
1. Login as POS user
2. Create order for a table
3. Add items
4. Process payment
5. Verify receipt generation

**Test Waiter Flow:**
1. Login as waiter
2. View assigned tables
3. Assist a customer order
4. Update status
5. Mark as served

**Test Customer QR Ordering:**
1. Open QR code URL in incognito/private browser
2. Create table session with 6-digit PIN
3. Browse menu
4. Add items to cart
5. Submit order
6. Verify real-time status updates

### 5. Configure Backups

**Supabase Backups:**
- Pro plan includes daily automated backups
- Point-in-time recovery available
- Manual snapshots before major changes

**Additional Backup Strategy:**
```bash
# Database dump (run periodically)
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Store in secure location
```

---

## Domain Configuration

### Custom Domain Setup

#### Vercel

1. Go to project **Settings > Domains**
2. Add your domain: `restaurant.com`
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for propagation (~1-24 hours)
5. SSL certificate auto-generated

#### Cloudflare (Optional CDN)

1. Add site to Cloudflare
2. Update nameservers at domain registrar
3. Configure DNS records to point to Vercel
4. Enable:
   - Always Use HTTPS
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3

---

## Monitoring & Maintenance

### Application Monitoring

**Vercel Analytics:**
- Real-time visitor tracking
- Performance metrics (Core Web Vitals)
- Top pages and referrers

**Supabase Dashboard:**
- Database usage and performance
- API request metrics
- Storage usage
- Auth activity

**Set Up Alerts:**
1. Configure Vercel notifications for:
   - Deployment failures
   - Build errors
   - Domain issues

2. Monitor Supabase:
   - Database size approaching limit
   - API request throttling
   - Storage quota warnings

### Regular Maintenance Tasks

**Weekly:**
- [ ] Review activity logs for unusual activity
- [ ] Check storage usage
- [ ] Verify backup completion

**Monthly:**
- [ ] Review analytics and performance
- [ ] Update dependencies (`pnpm update`)
- [ ] Test critical user flows
- [ ] Review and rotate access keys (if needed)

**Quarterly:**
- [ ] Full security audit
- [ ] Database optimization (vacuum, reindex)
- [ ] Review and update documentation
- [ ] User feedback review

### Performance Optimization

**Database:**
```sql
-- Run periodically to optimize performance
VACUUM ANALYZE;

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

**Application:**
- Enable Vercel Analytics Speed Insights
- Monitor Core Web Vitals
- Optimize images (use Next/Image)
- Minimize JavaScript bundles

---

## Troubleshooting

### Build Failures

**Error: TypeScript errors**
```bash
# Run type check locally
pnpm type-check

# Fix errors and redeploy
```

**Error: Dependency installation failed**
```bash
# Clear lock file and reinstall
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Update lock file"
git push
```

### Runtime Errors

**Error: Database connection failed**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- Ensure RLS policies are enabled

**Error: Authentication not working**
- Check Supabase Auth settings
- Verify redirect URLs in Supabase Auth > URL Configuration:
  - Add `https://yourdomain.com/auth/callback`
  - Add `https://yourdomain.com/**` as wildcard

**Error: Images not loading**
- Verify storage buckets are public
- Check CORS settings in Supabase Storage
- Ensure Next.js image domain is configured:
  ```js
  // next.config.mjs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  }
  ```

### Performance Issues

**Slow database queries:**
```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM orders 
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**High memory usage:**
- Check for memory leaks in real-time subscriptions
- Ensure proper cleanup in useEffect hooks
- Monitor Vercel function logs

### Rollback Procedure

**If deployment fails:**

1. **Vercel:**
   - Go to **Deployments**
   - Find last working deployment
   - Click **"..."** > **"Promote to Production"**

2. **Database:**
   ```sql
   -- Restore from backup
   -- (Requires Supabase Pro plan)
   ```

3. **Notify users** of temporary downtime if needed

---

## Security Checklist

Post-deployment security verification:

- [ ] HTTPS enabled and enforced
- [ ] Environment variables secured (not in git)
- [ ] RLS policies enabled on all tables
- [ ] CORS configured properly
- [ ] Security headers present (use [securityheaders.com](https://securityheaders.com))
- [ ] No admin credentials in code
- [ ] Rate limiting configured (Supabase provides basic rate limiting)
- [ ] Regular dependency updates scheduled
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting active

---

## Support & Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Documentation](https://vercel.com/docs)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)

### Professional Support
- Vercel Pro Support: [https://vercel.com/support](https://vercel.com/support)
- Supabase Support: [https://supabase.com/support](https://supabase.com/support)

---

**Deployment complete! 🎉**

Your Lumière Restaurant Management System is now live and ready to serve customers.
