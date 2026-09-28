# Google OAuth Setup Guide for Customer Accounts

## Overview
This guide shows how to enable Google Sign-In for customer accounts in the Events booking system (`/events` section).

## ✅ Code Implementation (COMPLETED)

### Files Added/Modified:
1. ✅ `lib/auth/google-oauth.ts` - Google OAuth helper function
2. ✅ `app/auth/callback/route.ts` - OAuth callback handler with auto profile creation
3. ✅ `app/events/signup/page.tsx` - Added "Continue with Google" button
4. ✅ `app/events/login/page.tsx` - Added "Continue with Google" button

## 🔧 Supabase Configuration (TODO)

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `Lydia's Lechon Events - Production` (or any name)
   
5. Add Authorized redirect URIs:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```
   
   For local development, also add:
   ```
   http://localhost:54321/auth/v1/callback
   ```

6. Click "Create" and save:
   - **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
   - **Client Secret** (random string)

### Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** provider
5. Enable it and configure:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
   - **Redirect URL**: Already shown (use this in Google Console)
6. Click **Save**

### Step 3: Update Site URL (Important!)

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain:
   ```
   https://yourdomain.com
   ```
   
3. Add **Redirect URLs** (whitelist):
   ```
   https://yourdomain.com/auth/callback
   http://localhost:3000/auth/callback (for development)
   ```

## 🧪 Testing

### Local Development:
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/events/signup` or `/events/login`
3. Click "Continue with Google"
4. Should redirect to Google sign-in
5. After sign-in, should redirect back to `/events/dashboard`

### What Happens:
1. User clicks "Continue with Google"
2. Redirects to Google OAuth consent screen
3. User approves access
4. Google redirects back to `/auth/callback` with code
5. Callback handler:
   - Exchanges code for session
   - Checks if `event_customers` profile exists
   - Creates profile if new user (auto-verified)
   - Redirects to `/events/dashboard`

## 📋 Features

### Auto Profile Creation:
When a user signs in with Google for the first time:
- ✅ Creates `event_customers` record automatically
- ✅ Uses Google email
- ✅ Uses Google name as `full_name`
- ✅ Auto-verifies user (`is_verified = true`)
- ✅ Phone field left empty (can be filled later)

### Security:
- ✅ Separate from staff login (staff use `/login`)
- ✅ Only creates customer profiles
- ✅ Validates OAuth tokens via Supabase
- ✅ Proper session management

## 🎨 UI/UX

### Signup Page (`/events/signup`):
- "Continue with Google" button with Google logo
- Divider: "Or sign up with email"
- Regular email/password form below

### Login Page (`/events/login`):
- "Continue with Google" button with Google logo
- Divider: "Or sign in with email"
- Regular email/password form below

## 🚨 Important Notes

1. **Staff Accounts NOT Affected**: 
   - Staff login (`/login`) remains email/password only
   - Google OAuth only for customers (`/events`)

2. **Email Verification**:
   - Google users are auto-verified
   - Email/password signups still need email verification

3. **Privacy**:
   - Only requests basic profile (email, name)
   - No access to Google Drive, Calendar, etc.

4. **Production Domain**:
   - Update Google Console redirect URIs with production domain
   - Update Supabase Site URL with production domain

## 🔍 Troubleshooting

### "OAuth callback error"
- Check if Google Client ID/Secret are correct in Supabase
- Verify redirect URIs match exactly in Google Console

### "Profile creation failed"
- Check `event_customers` table permissions (RLS policies)
- Verify database schema allows nullable phone field

### User stuck on callback
- Check browser console for errors
- Verify Supabase Site URL is set correctly
- Check that `/auth/callback` route exists

## ✨ Next Steps After Setup

1. Test Google Sign-In on localhost
2. Deploy to production
3. Update Google Console with production URLs
4. Test on production
5. Monitor sign-ups in Supabase dashboard

---

**Status**: Code implemented ✅ | Supabase configuration needed ⏳
