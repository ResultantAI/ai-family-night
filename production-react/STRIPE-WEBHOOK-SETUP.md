# Stripe Webhook Setup Guide

Complete guide to set up Stripe webhooks for AI Family Night subscription management.

## Prerequisites

- ✅ Supabase project created
- ✅ Stripe account created
- ✅ App deployed to Vercel
- ⬜ Database tables created (run `supabase-schema.sql`)

---

## Part 1: Set Up Supabase

### Step 1: Run Database Migrations

1. Go to your **Supabase Dashboard** → SQL Editor
2. Run **`supabase-schema.sql`** (creates customers, subscriptions, game_plays, gallery tables)
3. Run **`supabase-children-table.sql`** (creates children table)
4. Verify tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customers', 'subscriptions', 'children', 'gallery', 'game_plays');
```

Should return 5 rows.

### Step 2: Get Supabase Service Role Key

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy the **service_role** key (not the anon key!)
3. ⚠️ **IMPORTANT**: This key has admin access - never expose it in frontend code

---

## Part 2: Set Up Stripe

### Step 3: Create Stripe Products & Prices

1. Go to **Stripe Dashboard** → **Products**
2. Click **+ Add Product**

#### Product 1: Premium Monthly
- **Name**: AI Family Night Premium (Monthly)
- **Description**: Access to all 8 games + weekly new releases
- **Pricing**:
  - Price: $9.99 USD
  - Billing period: Monthly
  - Free trial: 7 days
- Click **Save product**
- **Copy the Price ID** (starts with `price_...`) → you'll need this for `VITE_STRIPE_PRICE_MONTHLY`

#### Product 2: Premium Yearly
- **Name**: AI Family Night Premium (Yearly)
- **Description**: Access to all 8 games + weekly new releases (Save 50%!)
- **Pricing**:
  - Price: $59.99 USD
  - Billing period: Yearly
  - Free trial: 7 days
- Click **Save product**
- **Copy the Price ID** (starts with `price_...`) → you'll need this for `VITE_STRIPE_PRICE_YEARLY`

### Step 4: Get Stripe API Keys

1. Go to **Stripe Dashboard** → **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_...`) → `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (starts with `sk_...`) → `STRIPE_SECRET_KEY`

---

## Part 3: Configure Vercel Environment Variables

### Step 5: Add Environment Variables to Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these variables (for Production, Preview, and Development):

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Supabase → Settings → API (anon/public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase → Settings → API (service_role key) ⚠️ |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | Stripe → Developers → API keys |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Stripe → Developers → API keys ⚠️ |
| `VITE_STRIPE_PRICE_MONTHLY` | `price_...` | From Step 3 (Monthly product) |
| `VITE_STRIPE_PRICE_YEARLY` | `price_...` | From Step 3 (Yearly product) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Step 6 below |

⚠️ = Sensitive - never commit to git or expose in frontend

3. Click **Save** after adding each variable

---

## Part 4: Set Up Stripe Webhooks

### Step 6: Create Webhook Endpoint

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://aifamilynight.com/api/stripe-webhook`
4. **Listen to**: Select **Events on your account**
5. **Select events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. **Copy the Signing Secret** (starts with `whsec_...`)
8. Add this as `STRIPE_WEBHOOK_SECRET` in Vercel (Step 5)

### Step 7: Test the Webhook

1. In Stripe Dashboard → Webhooks → Your webhook
2. Click **Send test webhook**
3. Select `checkout.session.completed`
4. Click **Send test webhook**
5. Check the **Response** tab - should show `200 OK`

If you get an error:
- Check Vercel function logs: `npx vercel logs --prod`
- Verify all environment variables are set correctly
- Make sure database tables exist

---

## Part 5: Create Test Subscription (For Development)

### Step 8: Give Yourself Premium Access

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open **`create-test-subscription.sql`**
3. **Replace `YOUR_EMAIL_HERE`** with your actual email (the one you signed up with)
4. Run the script
5. You should see: "Premium subscription created/updated for user: [uuid]"

### Step 9: Verify Premium Access

1. Open **AI Family Night** in your browser
2. **Hard refresh** (Cmd+Shift+R or Ctrl+Shift+F5)
3. Go to **Dashboard** - you should see "Premium Plan" badge
4. Go to **Games** - all games should be unlocked
5. Open browser console and run:
   ```javascript
   console.log('Tier:', localStorage.getItem('subscription_tier'))
   ```
   Should show: `premium_monthly`

---

## Part 6: Test Real Stripe Payment Flow

### Step 10: Test Checkout (Test Mode)

1. Make sure you're using **test keys** (`pk_test_...` and `sk_test_...`)
2. Go to your app → **Pricing** page
3. Click **Start Free Trial**
4. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. You should be redirected to `/success`
7. Check **Supabase** → `subscriptions` table - should have a new row
8. Check **Dashboard** - should show Premium badge

### Step 11: Test Webhook Events

1. Go to **Stripe Dashboard** → **Events**
2. You should see recent events:
   - `checkout.session.completed`
   - `customer.subscription.created`
3. Click on each event → Check **Response** tab
4. Should show `200 OK` from your webhook

---

## Troubleshooting

### Premium Games Still Locked

**Check 1: Database**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM subscriptions WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
);
```

**Check 2: localStorage**
```javascript
// Run in browser console
console.log('Tier:', localStorage.getItem('subscription_tier'))
// Should be: premium_monthly, premium_yearly, or premium
```

**Check 3: Clear Cache**
```javascript
// Run in browser console
localStorage.setItem('subscription_tier', 'premium_monthly')
window.location.reload()
```

### Webhook Not Receiving Events

1. **Check endpoint URL**: Should be `https://aifamilynight.com/api/stripe-webhook` (no trailing slash)
2. **Check Vercel logs**:
   ```bash
   npx vercel logs --prod
   ```
3. **Verify webhook secret**: Make sure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
4. **Test webhook**: Stripe Dashboard → Webhooks → Send test webhook

### Environment Variables Not Working

1. **Redeploy after adding variables**:
   ```bash
   npx vercel --prod
   ```
2. **Check variable scope**: Make sure variables are added to "Production" environment
3. **Verify variable names**: Must match exactly (case-sensitive)

---

## Testing Checklist

After setup, verify:

- [ ] All 5 database tables exist in Supabase
- [ ] Stripe products created (Monthly & Yearly)
- [ ] All 8 environment variables set in Vercel
- [ ] Webhook endpoint created in Stripe
- [ ] Webhook secret added to Vercel
- [ ] Test subscription created (yourself)
- [ ] Premium badge shows on Dashboard
- [ ] All games unlocked in Games page
- [ ] Test payment flow works
- [ ] Webhook receives events (check Stripe events log)

---

## Production Checklist

Before going live with real customers:

- [ ] Switch from Stripe **test mode** to **live mode**
- [ ] Update all `pk_test_` and `sk_test_` keys to `pk_live_` and `sk_live_`
- [ ] Update webhook endpoint to use live mode
- [ ] Test full payment flow with real card
- [ ] Set up Stripe billing portal for customers to manage subscriptions
- [ ] Configure email notifications for trial ending
- [ ] Set up monitoring/alerts for failed webhooks

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Stripe webhook event logs
3. Check Supabase database logs
4. Check browser console for errors
5. Verify all environment variables are correct

**Webhook Endpoint**: `https://aifamilynight.com/api/stripe-webhook`
**Webhook Code**: `/api/stripe-webhook.js` (already deployed)
