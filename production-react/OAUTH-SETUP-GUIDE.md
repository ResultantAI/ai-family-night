# 🔐 Google & Apple Single Sign-On Setup Guide

**Date:** February 13, 2026
**Status:** ✅ Code Complete - Ready for OAuth Configuration

---

## 📋 Overview

Google and Apple single sign-on (SSO) have been integrated using Supabase Auth. Users can now sign in with one click using their Google or Apple accounts.

**What's Already Implemented:**
- ✅ Login page with Google/Apple SSO buttons
- ✅ Signup page with Google/Apple SSO buttons
- ✅ OAuth callback handler (`/auth/callback`)
- ✅ Supabase Auth integration
- ✅ Automatic session management

**What You Need to Configure:**
1. Supabase project setup
2. Google OAuth app
3. Apple Sign In service ID
4. Environment variables

---

## 🚀 Step 1: Set Up Supabase (15 minutes)

### 1.1 Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign in with GitHub (recommended)

### 1.2 Create New Project

1. Click **"New Project"**
2. Configure:
   - **Name:** `ai-family-night`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan:** Free tier is fine to start
3. Click **"Create new project"**
4. Wait 2-3 minutes for database to spin up

### 1.3 Get Supabase Credentials

1. In your project dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL:** `https://your-project.supabase.co`
   - **Project API keys → anon public:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Add to `.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 1.4 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"+ New query"**
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste into the query editor
5. Click **"Run"**
6. Verify tables created: **Database → Tables** should show:
   - customers
   - subscriptions
   - game_plays
   - gallery
   - gift_subscriptions

---

## 🔵 Step 2: Set Up Google OAuth (20 minutes)

### 2.1 Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `AI Family Night`
4. Click **"Create"**

### 2.2 Enable Google+ API

1. In the sidebar, go to **APIs & Services → Library**
2. Search for **"Google+ API"**
3. Click on it → Click **"Enable"**

### 2.3 Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**
4. Fill in required fields:
   - **App name:** `AI Family Night`
   - **User support email:** Your email
   - **App logo:** (optional - upload your app icon)
   - **App domain:**
     - Homepage: `https://production-react-62oocu7d9-chris-projects-16eb8f38.vercel.app`
     - Privacy policy: `https://production-react-62oocu7d9-chris-projects-16eb8f38.vercel.app/privacy`
     - Terms of service: `https://production-react-62oocu7d9-chris-projects-16eb8f38.vercel.app/terms`
   - **Developer contact:** Your email
5. Click **"Save and Continue"**

6. **Scopes:** Click **"Add or Remove Scopes"**
   - Select: `openid`, `profile`, `email`
   - Click **"Update"**
   - Click **"Save and Continue"**

7. **Test users:** (For testing only)
   - Add your email address
   - Click **"Save and Continue"**

8. Click **"Back to Dashboard"**

### 2.4 Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Configure:
   - **Application type:** `Web application`
   - **Name:** `AI Family Night Web`
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (for local development)
     - `https://production-react-62oocu7d9-chris-projects-16eb8f38.vercel.app` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:5173/auth/callback` (for local testing)
     - `https://production-react-62oocu7d9-chris-projects-16eb8f38.vercel.app/auth/callback` (production)
     - **IMPORTANT:** Also add Supabase callback URL:
       - `https://your-project.supabase.co/auth/v1/callback`
4. Click **"Create"**
5. Copy **Client ID** and **Client Secret** (you'll need these next)

### 2.5 Configure Google OAuth in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication → Providers**
3. Find **Google** in the list
4. Click to expand
5. Enable: **"Enable Sign in with Google"** ✅
6. Paste:
   - **Client ID:** (from Google Cloud Console)
   - **Client Secret:** (from Google Cloud Console)
7. Copy the **Callback URL** shown (e.g., `https://your-project.supabase.co/auth/v1/callback`)
8. Go back to Google Cloud Console → Credentials
9. Edit your OAuth client
10. Add the Supabase callback URL to **Authorized redirect URIs**
11. Click **"Save"**

---

## 🍎 Step 3: Set Up Apple Sign In (30 minutes)

**Note:** Apple Sign In requires:
- An Apple Developer account ($99/year)
- A verified domain
- More complex setup than Google

### 3.1 Enroll in Apple Developer Program

1. Go to https://developer.apple.com/programs/
2. Click **"Enroll"**
3. Pay $99/year fee
4. Wait for approval (can take 24-48 hours)

### 3.2 Create App ID

1. Go to https://developer.apple.com/account/
2. Click **"Certificates, Identifiers & Profiles"**
3. Click **"Identifiers"** → **"+"** button
4. Select **"App IDs"** → **"Continue"**
5. Select **"App"** → **"Continue"**
6. Configure:
   - **Description:** `AI Family Night`
   - **Bundle ID:** `com.aifamilynight.app` (or your domain reversed)
   - **Capabilities:** Check **"Sign In with Apple"**
7. Click **"Continue"** → **"Register"**

### 3.3 Create Service ID

1. Click **"Identifiers"** → **"+"** button
2. Select **"Services IDs"** → **"Continue"**
3. Configure:
   - **Description:** `AI Family Night Web`
   - **Identifier:** `com.aifamilynight.web`
4. Click **"Continue"** → **"Register"**

5. Click on the Service ID you just created
6. Check **"Sign In with Apple"**
7. Click **"Configure"**
8. Configure:
   - **Primary App ID:** Select the App ID from step 3.2
   - **Domains and Subdomains:**
     - `production-react-62oocu7d9-chris-projects-16eb8f38.vercel.app`
     - `your-project.supabase.co`
   - **Return URLs:**
     - `https://your-project.supabase.co/auth/v1/callback`
9. Click **"Save"** → **"Continue"** → **"Save"**

### 3.4 Create Private Key

1. Click **"Keys"** → **"+"** button
2. Configure:
   - **Key Name:** `AI Family Night Sign In Key`
   - **Enable:** Check **"Sign In with Apple"**
3. Click **"Configure"**
4. Select your **Primary App ID** from earlier
5. Click **"Save"** → **"Continue"** → **"Register"**
6. **IMPORTANT:** Download the `.p8` file NOW (you can't download it again!)
7. Note the **Key ID** (10 characters, e.g., `ABC123XYZ`)

### 3.5 Get Team ID

1. Go to https://developer.apple.com/account/
2. Click **"Membership"** in the sidebar
3. Copy your **Team ID** (10 characters, e.g., `DEF456UVW`)

### 3.6 Configure Apple Sign In in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication → Providers**
3. Find **Apple** in the list
4. Click to expand
5. Enable: **"Enable Sign in with Apple"** ✅
6. Configure:
   - **Client ID (Services ID):** `com.aifamilynight.web` (from step 3.3)
   - **Team ID:** Your Team ID (from step 3.5)
   - **Key ID:** Your Key ID (from step 3.4)
   - **Private Key:** Open the `.p8` file and paste the entire contents
7. Click **"Save"**

---

## ⚙️ Step 4: Update Environment Variables (5 minutes)

### 4.1 Local Development (`.env.local`)

Add Supabase credentials:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Existing Stripe keys...
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
# ... etc
```

### 4.2 Vercel Production

1. Go to https://vercel.com/chris-projects-16eb8f38/production-react/settings/environment-variables
2. Add for **Production** environment:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`

### 4.3 Redeploy

```bash
vercel --prod
```

---

## 🧪 Step 5: Test OAuth Flow (15 minutes)

### 5.1 Test Google Sign In

1. Go to your app: https://production-react-62oocu7d9-chris-projects-16eb8f38.vercel.app/login
2. Click **"Continue with Google"**
3. You should be redirected to Google
4. Select your Google account
5. Grant permissions
6. You should be redirected back to `/auth/callback`
7. Then automatically redirected to `/dashboard`
8. Check: You should be logged in!

**Troubleshooting:**
- **"redirect_uri_mismatch"** error:
  - Go back to Google Cloud Console
  - Edit OAuth client
  - Make sure Supabase callback URL is in Authorized redirect URIs
  - Format: `https://your-project.supabase.co/auth/v1/callback`

- **"Access blocked: AI Family Night has not completed Google verification"**:
  - This is normal for apps not yet published
  - Click **"Advanced"** → **"Go to AI Family Night (unsafe)"**
  - For production, submit app for Google verification (takes 2-4 weeks)

### 5.2 Test Apple Sign In

1. Go to `/login`
2. Click **"Continue with Apple"**
3. You should be redirected to Apple
4. Sign in with Apple ID
5. Choose to **"Share My Email"** or **"Hide My Email"**
6. Complete 2FA if enabled
7. You should be redirected back and logged in

**Troubleshooting:**
- **"invalid_client"** error:
  - Check Service ID matches exactly what's in Supabase
  - Verify domains are correct in Apple Developer Console
  - Make sure `.p8` file contents are pasted correctly

### 5.3 Test Session Persistence

1. After logging in, refresh the page
2. You should remain logged in
3. Close browser and reopen
4. Go to `/dashboard` → Should still be logged in (session persists)

### 5.4 Test Logout

1. In Settings or Dashboard, implement a logout button:
   ```javascript
   import { supabase } from '../lib/supabase'

   const handleLogout = async () => {
     await supabase.auth.signOut()
     navigate('/login')
   }
   ```
2. Click logout → Should be signed out
3. Try accessing `/dashboard` → Should redirect to login

---

## 📊 User Data Flow

### What Happens When User Signs In with Google/Apple:

1. **User clicks SSO button**
   - `supabase.auth.signInWithOAuth({ provider: 'google' })` called
   - User redirected to Google/Apple

2. **User authorizes app**
   - Google/Apple asks for permission
   - User approves

3. **Redirect to Supabase**
   - Provider sends code to `https://your-project.supabase.co/auth/v1/callback`
   - Supabase exchanges code for access token
   - Supabase creates user session

4. **Redirect to your app**
   - Supabase redirects to `https://your-app.vercel.app/auth/callback`
   - Your `AuthCallback` component handles it

5. **Session established**
   - User session stored in browser (cookies + localStorage)
   - User redirected to `/dashboard`
   - `supabase.auth.getUser()` returns user info

### User Data Available:

```javascript
const { data: { user } } = await supabase.auth.getUser()

console.log(user)
// {
//   id: 'uuid-here',
//   email: 'user@gmail.com',
//   user_metadata: {
//     full_name: 'John Doe',
//     avatar_url: 'https://...',
//     provider: 'google' // or 'apple'
//   },
//   app_metadata: {},
//   created_at: '2026-02-13T...'
// }
```

---

## 🔐 Security Best Practices

### ✅ Already Implemented:

- **HTTPS only** - OAuth requires HTTPS (Vercel provides)
- **State parameter** - Supabase handles CSRF protection
- **Token validation** - Supabase verifies all tokens
- **Secure session storage** - Cookies are httpOnly and secure

### ⚠️ TODO:

1. **Email Verification**
   - Currently disabled for OAuth (users are pre-verified by Google/Apple)
   - For email/password signup, enable in Supabase: **Authentication → Providers → Email → Confirm email**

2. **Rate Limiting**
   - Add Vercel Edge Config or Upstash Redis
   - Limit login attempts per IP

3. **Logout from All Devices**
   - Implement session management
   - Allow users to revoke all sessions

---

## 📈 Analytics & Monitoring

### Track OAuth Signups:

In `AuthCallback.jsx`, add analytics:

```javascript
import { trackSignup } from '../utils/analytics'

// After successful auth:
if (session) {
  const provider = session.user.app_metadata.provider
  trackSignup(provider) // 'google' or 'apple'

  // Check if new user (created_at recent)
  const isNewUser = new Date(session.user.created_at) > new Date(Date.now() - 60000)
  if (isNewUser) {
    console.log('New user signed up via', provider)
  }
}
```

### Monitor in Supabase:

1. Go to **Authentication → Users**
2. See all registered users
3. Filter by provider (Google, Apple, Email)
4. View last sign-in time
5. Export user list (CSV)

---

## 🚀 Production Checklist

Before launching OAuth:

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Google OAuth app created
- [ ] Google verified domains added
- [ ] Apple Developer account enrolled ($99/year)
- [ ] Apple Service ID created
- [ ] Apple private key generated (.p8 file)
- [ ] Supabase configured with Google credentials
- [ ] Supabase configured with Apple credentials
- [ ] Environment variables set in Vercel
- [ ] App redeployed to Vercel
- [ ] Tested Google sign-in flow
- [ ] Tested Apple sign-in flow
- [ ] Session persistence verified
- [ ] Logout functionality tested

---

## 💡 Tips & Best Practices

### For Google OAuth:

**Publishing Your App (Optional but Recommended):**
1. Go to Google Cloud Console → OAuth consent screen
2. Click **"Publish App"**
3. Submit for verification
4. Wait 2-4 weeks for Google review
5. Once verified, users won't see "unverified app" warning

**Scopes:**
- Only request `openid`, `profile`, `email`
- Don't request additional scopes unless needed
- More scopes = harder verification process

### For Apple Sign In:

**Email Privacy:**
- Users can choose to hide their email
- Apple generates relay email: `abc123@privaterelay.appleid.com`
- Store this relay email in your database
- Apple forwards emails sent to relay address

**Testing:**
- Use Apple ID from your developer account
- Test on both iOS Safari and desktop
- Verify email relay works

### General OAuth Tips:

1. **Always redirect back** - Never open OAuth in popup (breaks on mobile)
2. **Handle errors gracefully** - Show friendly error messages
3. **Store minimal data** - Only store what you need
4. **Logout = Sign Out** - Clear all session data
5. **Test edge cases:**
   - User denies permissions
   - User already exists with same email
   - User cancels OAuth flow

---

## 🔧 Troubleshooting

### Common Issues:

**"Supabase URL is undefined"**
- Fix: Add `VITE_SUPABASE_URL` to `.env.local`
- Restart dev server: `npm run dev`

**"Invalid redirect URI"**
- Fix: Check all redirect URIs match exactly (trailing slash matters!)
- Google: Check Authorized redirect URIs
- Apple: Check Return URLs

**"User already registered with this email"**
- This is good! User can sign in with either method
- Supabase links accounts automatically

**OAuth works locally but not in production**
- Fix: Add production URL to Google/Apple authorized domains
- Verify Vercel environment variables are set
- Check Vercel deployment logs for errors

---

## 📚 Resources

**Supabase Auth Docs:** https://supabase.com/docs/guides/auth
**Google OAuth Guide:** https://developers.google.com/identity/protocols/oauth2
**Apple Sign In Guide:** https://developer.apple.com/sign-in-with-apple/
**Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

## ✅ Summary

**What's Ready:**
- ✅ Login/Signup pages with Google & Apple buttons
- ✅ OAuth callback handler
- ✅ Supabase Auth integration
- ✅ Session management

**What You Need to Do:**
1. Create Supabase project (15 min)
2. Set up Google OAuth (20 min)
3. Set up Apple Sign In (30 min)
4. Add environment variables (5 min)
5. Deploy and test (15 min)

**Total Time:** ~1.5 hours

**After setup, users can:**
- Sign in with Google (one click)
- Sign in with Apple (one click)
- Sessions persist across devices
- No passwords to remember!

---

**Let's make authentication effortless!** 🚀
