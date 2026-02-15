# Custom Domain Setup Guide

## Setting up aifamilynight.com on Vercel

### Step 1: Add Domain to Vercel Project

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/chris-projects-16eb8f38/production-react
   - Click on the "Settings" tab
   - Click on "Domains" in the left sidebar

2. **Add Your Domain:**
   - In the "Domains" input field, type: `aifamilynight.com`
   - Click "Add"
   - Also add: `www.aifamilynight.com` (recommended for both with and without www)

3. **Vercel will show you DNS records to configure**

---

### Step 2: Configure DNS Settings

Vercel will give you specific DNS records to add. Here's what you'll likely see:

#### For `aifamilynight.com` (root domain):

**Option A: Using A Records (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option B: Using CNAME (if your DNS provider supports CNAME flattening)**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

#### For `www.aifamilynight.com` (subdomain):

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Step 3: Add DNS Records to Your DNS Provider

**Where to do this depends on where you bought your domain:**

#### If you bought from **GoDaddy:**
1. Go to https://dcc.godaddy.com/manage/
2. Click on your domain `aifamilynight.com`
3. Click "DNS" or "Manage DNS"
4. Scroll to "DNS Records"
5. Click "Add" for each record

#### If you bought from **Namecheap:**
1. Go to https://ap.www.namecheap.com/Domains/DomainControlPanel/
2. Find your domain and click "Manage"
3. Go to "Advanced DNS" tab
4. Click "Add New Record"
5. Add the records Vercel provided

#### If you bought from **Google Domains (now Squarespace):**
1. Go to your domains list
2. Click on `aifamilynight.com`
3. Click "DNS" in the left menu
4. Scroll to "Custom resource records"
5. Add the records

---

### Step 4: Wait for DNS Propagation

- DNS changes can take **15 minutes to 48 hours** to propagate
- Usually happens within 1-2 hours
- You can check status at: https://dnschecker.org/

---

### Step 5: Verify in Vercel

1. Go back to Vercel Dashboard → Settings → Domains
2. Wait for the status to change from "Invalid Configuration" to "Valid Configuration"
3. Vercel will automatically issue an SSL certificate (HTTPS)

---

## Quick Setup Using Vercel CLI

You can also add the domain using the command line:

```bash
# Add root domain
npx vercel domains add aifamilynight.com

# Add www subdomain
npx vercel domains add www.aifamilynight.com
```

---

## After Setup

Once DNS is configured and verified:

1. **Your app will be live at:**
   - https://aifamilynight.com
   - https://www.aifamilynight.com

2. **Old Vercel URLs will still work:**
   - https://production-react-krcj82u3r-chris-projects-16eb8f38.vercel.app

3. **Automatic HTTPS:**
   - Vercel automatically issues SSL certificates
   - All HTTP traffic redirects to HTTPS

---

## Troubleshooting

### Domain Not Verifying?

1. **Check DNS records are correct:**
   ```bash
   dig aifamilynight.com
   dig www.aifamilynight.com
   ```

2. **Make sure you removed conflicting records:**
   - Remove any old A records pointing elsewhere
   - Remove any old CNAME records
   - Only keep the Vercel DNS records

3. **Wait longer:**
   - DNS can take up to 48 hours
   - Check https://dnschecker.org/ to see propagation status

### Still Having Issues?

Contact Vercel support or check:
- Vercel Docs: https://vercel.com/docs/custom-domains
- DNS Checker: https://dnschecker.org/

---

## Current Status

- ✅ **App deployed:** https://production-react-krcj82u3r-chris-projects-16eb8f38.vercel.app
- ✅ **Custom SVG logo added**
- ✅ **Logout functionality added**
- ✅ **Real user data (no more "Welcome back Sarah")**
- ⏳ **Domain setup:** Waiting for you to add aifamilynight.com in Vercel
