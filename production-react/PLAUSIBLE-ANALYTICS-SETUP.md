# 📊 Plausible Analytics Setup Guide

**Last Updated:** February 13, 2026
**Status:** ✅ Code Complete - Ready for Plausible Dashboard Configuration

---

## 📋 Overview

Plausible Analytics has been integrated into AI Family Night for privacy-first conversion tracking. Unlike Google Analytics, Plausible:
- ✅ **No cookies** - No consent banners needed
- ✅ **GDPR compliant** - No personal data collected
- ✅ **Lightweight** - <1KB script (vs 45KB for Google Analytics)
- ✅ **Simple dashboard** - Easy to understand metrics
- ✅ **Privacy-first** - No cross-site tracking

---

## ✅ What's Been Implemented

### 1. Analytics Script Added ✅

**File:** `index.html`

```html
<!-- Plausible Analytics - Privacy-friendly, GDPR compliant -->
<script defer data-domain="aifamilynight.com" src="https://plausible.io/js/script.js"></script>
<!-- Enable custom events -->
<script>window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }</script>
```

### 2. Analytics Utility Library ✅

**File:** `src/utils/analytics.js`

Provides 30+ event tracking functions for:
- User authentication (signup, login)
- Subscription events (trial started, subscription, cancellation)
- Gift purchases and redemptions
- Game play tracking
- Premium gate conversion funnel
- Checkout flow tracking
- Voice feature usage
- Gallery saves and shares
- Settings toggles
- Error tracking

### 3. Event Tracking Integrated ✅

**Files Modified:**
- `src/components/PremiumGate.jsx` - Tracks paywall views and CTA clicks
- `src/pages/Pricing.jsx` - Tracks checkout started
- `src/pages/Success.jsx` - Tracks trial started, checkout completed, subscription
- `src/pages/Gift.jsx` - Tracks gift purchases

---

## 🚀 Setup Instructions

### Step 1: Create Plausible Account (5 minutes)

1. Go to https://plausible.io/register
2. Choose a plan:
   - **Starter:** $9/month (up to 10K pageviews/month) - Recommended for launch
   - **Growth:** $19/month (up to 100K pageviews/month)
   - **Business:** Custom pricing for 1M+ pageviews
3. Enter your email and create a password
4. Verify your email

### Step 2: Add Your Domain (2 minutes)

1. In the Plausible dashboard, click **"+ Add Website"**
2. Enter your domain: `aifamilynight.com`
3. Click **"Add snippet"**
4. ✅ **Skip this step** - The script is already in `index.html`!

### Step 3: Verify Installation (5 minutes)

1. Deploy your app to production (Vercel)
2. Visit your live site
3. Go to Plausible dashboard → `aifamilynight.com` → **Live View**
4. You should see your visit appear in real-time
5. ✅ If you see data, installation is complete!

**Troubleshooting:**
- Make sure `data-domain="aifamilynight.com"` matches your actual domain
- Check browser console for errors (should see no errors)
- Disable ad blockers and privacy extensions while testing

### Step 4: Set Up Goals (10 minutes)

Goals allow you to track custom events and conversion rates.

1. Go to Plausible dashboard → `aifamilynight.com` → **Settings → Goals**
2. Click **"+ Add Goal"**
3. Add the following custom events:

| Goal Name | Type | Purpose |
|-----------|------|---------|
| `Signup` | Custom Event | User creates account |
| `Trial Started` | Custom Event | User starts 7-day trial |
| `Subscription` | Custom Event | User becomes paying customer |
| `Tier Upgrade` | Custom Event | User upgrades from monthly to yearly |
| `Cancellation` | Custom Event | User cancels subscription |
| `Gift Purchase` | Custom Event | Gift subscription bought |
| `Premium Gate Viewed` | Custom Event | User hits paywall |
| `Premium Gate CTA` | Custom Event | User clicks paywall CTA |
| `Checkout Started` | Custom Event | User enters checkout flow |
| `Checkout Completed` | Custom Event | Payment successful |
| `Game Played` | Custom Event | User plays a game |
| `Voice Input Used` | Custom Event | User uses voice feature |
| `Gallery Save` | Custom Event | User saves to gallery |

4. Click **"Add Goal"** for each event

**Why Goals Matter:**
- Track conversion rates (e.g., 25% of paywall viewers become paying customers)
- Measure funnel drop-off (e.g., 80% who start checkout complete it)
- Optimize marketing spend (e.g., which games drive most subscriptions)

### Step 5: Set Up Funnels (15 minutes)

Funnels show how users move through your conversion flow.

**Funnel 1: Free User → Paying Customer**

1. Go to **Settings → Funnels**
2. Click **"+ Add Funnel"**
3. Name: `Free to Paid Conversion`
4. Steps:
   - Step 1: Pageview `/dashboard`
   - Step 2: `Premium Gate Viewed`
   - Step 3: `Premium Gate CTA`
   - Step 4: Pageview `/pricing`
   - Step 5: `Checkout Started`
   - Step 6: `Trial Started`
   - Step 7: `Subscription`
5. Click **"Save Funnel"**

**Expected Results:**
- 100 users visit dashboard
- 40 users hit premium gate (40%)
- 30 users click "Start Free Trial" (75% of 40 = 30%)
- 25 users reach pricing page (83% of 30 = 25%)
- 20 users start checkout (80% of 25 = 20%)
- 18 users complete trial signup (90% of 20 = 18%)
- 15 users convert to paying (83% of 18 = 15%)

**Overall Conversion Rate:** 15% (15 paying / 100 visitors)

**Funnel 2: Gift Purchase Flow**

1. Name: `Gift Subscription Purchase`
2. Steps:
   - Step 1: Pageview `/pricing`
   - Step 2: Pageview `/gift`
   - Step 3: `Gift Purchase`
   - Step 4: Pageview `/success`
3. Click **"Save Funnel"**

### Step 6: Configure Revenue Tracking (Optional - 5 minutes)

Track actual revenue from subscriptions and gifts.

1. Go to **Settings → Goals**
2. Edit each revenue-related goal:
   - `Subscription` → Enable **"Track monetary value"**
   - `Gift Purchase` → Enable **"Track monetary value"**
3. Plausible will automatically sum revenue from event `value` props

**Already Implemented:**
```javascript
// In analytics.js
trackSubscription('premium_monthly', 'monthly')
// → Sends { value: 9.99 }

trackGiftPurchase(6, 45)
// → Sends { value: 45 }
```

### Step 7: Set Up Email Reports (Optional - 5 minutes)

Get weekly or monthly analytics reports via email.

1. Go to **Settings → Email Reports**
2. Click **"+ Add Email Report"**
3. Configure:
   - **Frequency:** Weekly (every Monday)
   - **Recipients:** Your email
   - **Include:** Top pages, goals, traffic sources
4. Click **"Save Report"**

---

## 📈 Key Metrics to Track

### Conversion Funnel

Track these metrics weekly:

| Metric | Target | How to Track |
|--------|--------|--------------|
| **Visitor → Signup** | 10% | Compare `Pageviews` to `Signup` goal |
| **Signup → Trial** | 50% | Compare `Signup` to `Trial Started` |
| **Trial → Paid** | 40% | Compare `Trial Started` to `Subscription` |
| **Overall Conversion** | 2-5% | Visitors to `Subscription` |
| **Gift Purchases** | 5% of revenue | Track `Gift Purchase` goal |

### Revenue Metrics

- **MRR (Monthly Recurring Revenue):** Sum of all monthly subscriptions
- **ARR (Annual Recurring Revenue):** MRR × 12 + gift revenue
- **ARPU (Avg Revenue Per User):** Total revenue ÷ total paying users
- **LTV (Lifetime Value):** ARPU × avg subscription length (months)

### Engagement Metrics

- **Games Played per User:** Track `Game Played` by user
- **Voice Feature Usage:** % of users who use voice input
- **Gallery Saves:** % of games saved to gallery
- **Churn Rate:** `Cancellation` events ÷ active subscriptions

---

## 🎯 Conversion Optimization Insights

### What to Look For

1. **High Premium Gate Views, Low CTA Clicks**
   - Problem: Paywall not compelling
   - Fix: Improve benefits list, add social proof, show pricing more prominently

2. **High Checkout Started, Low Completed**
   - Problem: Checkout friction
   - Fix: Simplify form, reduce fields, add trust badges

3. **High Trial Starts, Low Paid Conversions**
   - Problem: Users not seeing value during trial
   - Fix: Onboarding emails, feature guides, engagement prompts

4. **Certain Games Drive More Subscriptions**
   - Action: Promote those games on homepage, create more similar games

5. **Gift Purchases Spike Around Holidays**
   - Action: Create holiday-themed landing pages, email campaigns

---

## 🔍 Advanced Analytics Features

### 1. Filter by Properties

Track custom properties with events:

```javascript
// Example: Track which game drove the conversion
trackPremiumGateView('noisy-storybook', 'Noisy Storybook')

// In Plausible dashboard:
// Premium Gate Viewed → Filter by "game_name" → See conversion by game
```

### 2. Compare Time Periods

- Go to dashboard → Click date range
- Select "Compare to previous period"
- See if conversion rates are improving week-over-week

### 3. Traffic Sources

- Plausible automatically tracks referrers
- See which channels drive best conversions:
  - Direct traffic
  - Google search
  - Facebook ads
  - Product Hunt
  - Email campaigns

### 4. Device & Browser Stats

- See which devices/browsers your users prefer
- Optimize for mobile if 60%+ of traffic is mobile

---

## 📊 Sample Dashboard Views

### Overview Dashboard

**Top Pages (by visits):**
1. `/dashboard` - 5,000 visits
2. `/pricing` - 1,200 visits
3. `/games/noisy-storybook` - 800 visits

**Top Goals (this month):**
1. Game Played - 12,000 events
2. Premium Gate Viewed - 500 events
3. Trial Started - 125 events
4. Subscription - 50 events

**Conversion Rate:** 4% (50 subscriptions / 1,200 pricing page visits)

**Revenue This Month:** $2,495
- Subscriptions: $1,998 (40 × $9.99 + 10 × $59)
- Gifts: $497 (11 × $45)

### Funnel Analysis

**Free to Paid Conversion:**
- 5,000 dashboard visits
- 500 premium gates (10%)
- 375 CTA clicks (75%)
- 300 pricing page visits (80%)
- 150 checkout started (50%)
- 125 trials started (83%)
- 50 subscriptions (40%)

**Overall Conversion:** 1% (50 / 5,000)

**Insight:** Biggest drop-off is pricing → checkout (50%). Add trust signals or simplify checkout.

---

## 🎯 Action Items After Setup

### Week 1: Baseline Metrics
- [ ] Let analytics run for 7 days
- [ ] Document baseline conversion rates
- [ ] Identify biggest drop-off points in funnel

### Week 2: First Optimizations
- [ ] Run A/B test on premium gate copy
- [ ] Add more social proof to pricing page
- [ ] Send trial reminder emails at day 5, 3, 1

### Week 3: Deep Dive
- [ ] Analyze which games drive most subscriptions
- [ ] Review voice feature usage rate
- [ ] Check if yearly vs monthly preference matches projections

### Month 2: Iteration
- [ ] Review month 1 data
- [ ] Set OKRs based on actual conversion rates
- [ ] Plan product roadmap based on engagement data

---

## 🔐 Privacy & GDPR Compliance

### Why Plausible is Better Than Google Analytics

| Feature | Plausible | Google Analytics |
|---------|-----------|------------------|
| **Cookie-free** | ✅ Yes | ❌ No |
| **GDPR compliant** | ✅ Built-in | ⚠️ Requires configuration |
| **No consent banner** | ✅ Not needed | ❌ Required by law |
| **Data ownership** | ✅ You own it | ❌ Google owns it |
| **Script size** | ✅ <1KB | ❌ 45KB |
| **Page speed impact** | ✅ Minimal | ⚠️ Noticeable |
| **Data retention** | ✅ Forever | ⚠️ 14 months default |
| **Open source** | ✅ Yes | ❌ No |

### What Data is Collected?

Plausible collects:
- ✅ Page URLs visited
- ✅ Referrer source
- ✅ Browser/device type
- ✅ Country (from IP, but IP not stored)
- ✅ Custom events you define

Plausible does NOT collect:
- ❌ Personal identifiable information (PII)
- ❌ IP addresses (immediately discarded)
- ❌ Cookies
- ❌ Cross-site tracking data
- ❌ User fingerprints

**Result:** No cookie banner needed, no GDPR consent required!

---

## 💡 Pro Tips

### 1. Track Every User Action

Add tracking to every important button:
```javascript
<button onClick={() => {
  trackEvent('Feature Used', { feature: 'extra_safe_mode' })
  enableSafeMode()
}}>
  Enable Safe Mode
</button>
```

### 2. Use Descriptive Event Names

**Bad:** `trackEvent('click')`
**Good:** `trackEvent('Premium Gate CTA', { game_id: 'noisy-storybook' })`

### 3. Track Errors

Know when things break:
```javascript
catch (error) {
  trackError('Checkout Failed', error.message, { step: 'payment' })
}
```

### 4. Monitor Real-Time During Launch

- Open Plausible → Live View
- Launch Product Hunt / email campaign
- Watch visitors flow through funnel in real-time
- Fix issues immediately

### 5. Share Dashboard with Team

- Go to **Settings → Visibility**
- Enable **"Public Dashboard"** or invite team members
- Everyone can see metrics without logging in

---

## 📚 Resources

**Plausible Documentation:** https://plausible.io/docs
**Custom Events Guide:** https://plausible.io/docs/custom-event-goals
**Funnels Guide:** https://plausible.io/docs/funnel-analysis
**API Reference:** https://plausible.io/docs/events-api

**Support:**
- Plausible Support: hello@plausible.io
- Community Forum: https://github.com/plausible/analytics/discussions

---

## ✅ Summary Checklist

Before launching, verify:

- [ ] Plausible account created
- [ ] Domain added to Plausible
- [ ] Script verified (see live traffic)
- [ ] 13+ goals configured
- [ ] 2 funnels set up (Free→Paid, Gift Purchase)
- [ ] Revenue tracking enabled
- [ ] Weekly email reports configured
- [ ] Baseline metrics documented
- [ ] Team has access to dashboard

**Estimated Time:** ~45 minutes total

---

## 🚀 Next Steps

Once Plausible is configured:

1. **Monitor for 1 week** - Get baseline conversion rates
2. **Optimize premium gate** - Use data to improve paywall copy
3. **Run A/B tests** - Test different pricing page variants
4. **Set conversion goals** - E.g., "Increase free→paid by 5%"
5. **Review monthly** - Adjust strategy based on data

**You now have world-class analytics without compromising user privacy!** 🎉

---

**Questions?**
- Analytics setup: See this guide
- Event tracking: See `src/utils/analytics.js`
- Plausible dashboard: https://plausible.io/aifamilynight.com

**Let's turn data into growth!** 📈
