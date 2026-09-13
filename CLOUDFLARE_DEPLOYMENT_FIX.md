# Cloudflare Deployment Error Fix

## Error
```
Service binding 'WORKER_SELF_REFERENCE' references Worker 'lumiere-restaurant-management' 
which was not found.
```

## Root Cause
- The Cloudflare Worker has a service binding configured that references the old worker name `lumiere-restaurant-management`
- The actual worker name is `restobar-management-system`
- This configuration is set in the Cloudflare Dashboard (remote config)

## Solution for Cloudflare Pages

### ✅ Correct Setup (No wrangler.toml needed!)

Cloudflare Pages **automatically detects Next.js** projects. You don't need a `wrangler.toml` file.

**Steps to deploy via Cloudflare Pages:**

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Navigate to **Workers & Pages** → **Create application** → **Pages**

2. **Connect to Git**
   - Choose **Connect to Git**
   - Select your GitHub repository: `Restobar-Management-System`
   - Click **Begin setup**

3. **Configure Build Settings**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: (leave empty)
   ```

4. **Environment Variables**
   Add these in the **Environment variables** section:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://szfvjfvukicjmuxogglt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_F0YFhnyT82KlMNny7t3hUg_i89JPklS
   ```
   
   **Important:** Add the **private** environment variables too:
   ```
   SUPABASE_SERVICE_ROLE_KEY = (your service role key from .env.local)
   NEXT_PUBLIC_RESTAURANT_NAME = Lydias Lechon
   ```

5. **Save and Deploy**
   - Click **Save and Deploy**
   - Cloudflare Pages will automatically build and deploy your app

### If Service Binding Error Persists

Go to your Pages project → **Settings** → **Functions** → **Bindings**
- Remove any `WORKER_SELF_REFERENCE` bindings if they exist

### Build Output Directory

For Next.js on Cloudflare Pages, the build output should be:
- **`.next`** (default Next.js output)

NOT `.vercel/output/static` - that's for Vercel deployments only.

## Notes

- **No wrangler.toml needed** - Cloudflare Pages handles everything automatically
- The service binding error was from old remote configuration
- After proper setup, deployments should work smoothly
- Use the Cloudflare Pages dashboard for all configuration

## Quick Summary

1. ❌ Don't use `wrangler.toml` for Pages
2. ✅ Use Cloudflare Pages dashboard for configuration  
3. ✅ Build output: `.next`
4. ✅ Framework: Next.js (auto-detected)
5. ✅ Set environment variables in dashboard
