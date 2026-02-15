# 🎫 Promo Code System Setup Guide

**Last Updated:** February 13, 2026
**Status:** ✅ Code Complete - Ready for Stripe Configuration

---

## 📋 Overview

Promo codes are a powerful tool for:
- **Marketing campaigns** - Offer discounts for Product Hunt, email lists, influencers
- **Seasonal promotions** - Holiday sales, back-to-school offers
- **Referral programs** - Reward customers who refer friends
- **Customer retention** - Win back churned users
- **A/B testing** - Test different price points

**Already Implemented:**
- ✅ Checkout sessions configured to accept promo codes
- ✅ Stripe handles validation and discount calculation automatically
- ✅ Promo codes work for both subscriptions and gift purchases

---

## 🚀 How to Create Promo Codes in Stripe

### Step 1: Create a Coupon (5 minutes)

Coupons define the discount amount/percentage. Promo codes are customer-facing redemption codes for coupons.

1. Go to https://dashboard.stripe.com/coupons
2. Click **"+ New"**
3. Configure coupon:

**Example: Holiday Sale (20% off)**
- **Name:** `Holiday 2026`
- **Discount Type:** `Percentage`
- **Discount:** `20%`
- **Duration:** `Once` (applies only to first payment)
- **Applies to:** `All products` (or select specific products)
- **Max redemptions:** `500` (prevent abuse)
- **Redeem by:** `2026-12-31` (expiration date)

4. Click **"Create Coupon"**

**Coupon ID Created:** `holiday2026` (Stripe auto-generates)

### Step 2: Create Promo Code (2 minutes)

Promo codes are customer-facing codes that map to coupons.

1. Go to **Coupons** → Find your coupon → Click **"Create Promo Code"**
2. Configure promo code:

**Example: HOLIDAY20**
- **Code:** `HOLIDAY20` (what customers type)
- **Coupon:** `holiday2026` (links to coupon created above)
- **Active:** ✅ Checked
- **Max redemptions:** `500`
- **First-time customers only:** ❌ Unchecked (optional)
- **Minimum order amount:** (optional, e.g., $10)
- **Expires:** `2026-12-31`

3. Click **"Create Promo Code"**

✅ **Done!** Customers can now enter `HOLIDAY20` at checkout for 20% off.

---

## 🎯 Recommended Promo Code Campaigns

### 1. Launch Campaign - First 100 Customers

**Goal:** Get initial traction with steep discount

**Coupon:**
- Name: `Founding Family`
- Discount: 50% off first 3 months
- Duration: `Repeating` (for 3 months)
- Max redemptions: 100

**Promo Code:** `FOUNDER50`

**Marketing:**
- Product Hunt launch post
- Email to beta users
- Twitter announcement
- Reddit posts

**Expected Revenue:**
- 100 signups × $9.99 × 3 months × 50% = $1,498
- After 3 months, converts to full price $9.99/month

### 2. Referral Reward - Both Sides Win

**Goal:** Viral growth loop

**Coupon A (For Referrer):**
- Name: `Referral Reward`
- Discount: 1 month free
- Duration: `Repeating` (for 1 month)

**Coupon B (For Friend):**
- Name: `Friend Discount`
- Discount: 25% off first month
- Duration: `Once`

**Promo Code:** `REFER-FRIEND` (unique per user)

**Flow:**
1. User shares referral link with promo code
2. Friend signs up with code, gets 25% off
3. Original user gets 1 month free credit

**Implementation:** Requires custom backend to track referrals (Stripe API)

### 3. Win-Back Campaign - Churned Users

**Goal:** Reactivate canceled subscriptions

**Coupon:**
- Name: `Welcome Back`
- Discount: 40% off for 2 months
- Duration: `Repeating` (for 2 months)
- Max redemptions: Unlimited

**Promo Code:** `COMEBACK40`

**Marketing:**
- Email to users who canceled in last 90 days
- "We miss you! 40% off to come back"

**Expected Reactivation Rate:** 10-20%

### 4. Holiday Sale - Seasonal Promotion

**Goal:** Revenue boost during holidays

**Coupon:**
- Name: `Holiday Sale 2026`
- Discount: 30% off first year (yearly plan only)
- Duration: `Once`
- Applies to: Yearly product only

**Promo Code:** `HOLIDAY30`

**Dates:** Black Friday to Cyber Monday (4 days)

**Marketing:**
- Facebook ads targeting parents
- Instagram stories
- Email blast to free users

**Expected Revenue:**
- 200 signups × $59 × 70% = $8,260 in 4 days

### 5. Influencer Partnership

**Goal:** Reach new audiences

**Coupon:**
- Name: `Influencer Partner`
- Discount: 15% off (influencer keeps 10% commission)
- Duration: `Forever` (recurring discount)

**Promo Code:** `INFLUENCER-NAME`

**How it Works:**
1. Partner with family/parenting influencer
2. Give them unique promo code
3. Track redemptions in Stripe
4. Pay influencer $1.50 per signup (15% of $9.99)

**Example:** Partner with mom blogger with 50K followers
- 1% conversion = 500 signups
- Influencer earns $750
- You earn 500 × $9.99 × 85% = $4,246

---

## 💻 Code Implementation

### What's Already Done ✅

**File:** `api/create-checkout-session.js`

```javascript
const session = await stripe.checkout.sessions.create({
  // ...
  allow_promotion_codes: true, // ✅ Already enabled!
  // ...
})
```

This automatically adds a promo code input field to Stripe Checkout!

**No additional code needed** - Stripe handles:
- ✅ Promo code validation
- ✅ Discount calculation
- ✅ Invalid code error messages
- ✅ Tracking redemptions
- ✅ Preventing abuse (max redemptions, expiry)

---

## 🎨 Optional: Custom Promo Code UI (Advanced)

If you want to show promo code input on your pricing page (before checkout), here's how:

### Add Promo Code Input to Pricing Page

**File:** `src/pages/Pricing.jsx`

```javascript
// Add state for promo code
const [promoCode, setPromoCode] = useState('')
const [promoDiscount, setPromoDiscount] = useState(null)

// Validate promo code (optional - preview discount before checkout)
const validatePromoCode = async () => {
  const response = await fetch('/api/validate-promo-code', {
    method: 'POST',
    body: JSON.stringify({ code: promoCode })
  })
  const data = await response.json()
  if (data.valid) {
    setPromoDiscount(data.discount) // Show "20% off!" badge
  } else {
    setPromoDiscount(null)
    alert('Invalid promo code')
  }
}

// Pass promo code to checkout
const handleSubscribe = async (priceId) => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({
      priceId,
      mode: 'subscription',
      promoCode // ← Add this
    })
  })
  // ...
}
```

**UI Component:**
```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Promo Code (Optional)
  </label>
  <div className="flex gap-2">
    <input
      type="text"
      value={promoCode}
      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
      placeholder="Enter code"
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
    />
    <button
      onClick={validatePromoCode}
      className="px-6 py-2 bg-purple-600 text-white rounded-lg"
    >
      Apply
    </button>
  </div>
  {promoDiscount && (
    <p className="text-green-600 text-sm mt-2">
      ✓ {promoDiscount.percent}% off applied!
    </p>
  )}
</div>
```

**Backend API to Validate (Optional):**

**File:** `api/validate-promo-code.js`

```javascript
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  const { code } = req.body

  try {
    // List all promo codes matching the code
    const promoCodes = await stripe.promotionCodes.list({
      code: code,
      active: true,
      limit: 1
    })

    if (promoCodes.data.length === 0) {
      return res.status(200).json({ valid: false })
    }

    const promoCode = promoCodes.data[0]
    const coupon = promoCode.coupon

    return res.status(200).json({
      valid: true,
      discount: {
        percent: coupon.percent_off,
        amount: coupon.amount_off,
        duration: coupon.duration
      }
    })
  } catch (error) {
    console.error('Promo code validation error:', error)
    res.status(500).json({ error: 'Failed to validate promo code' })
  }
}
```

**Note:** This is optional! Stripe Checkout already has promo code input built-in.

---

## 📊 Tracking Promo Code Performance

### View Redemptions in Stripe

1. Go to https://dashboard.stripe.com/coupons
2. Click on a coupon
3. See:
   - **Times Redeemed:** How many times used
   - **Gross Revenue:** Revenue before discount
   - **Discount Amount:** Total discounts given
   - **Net Revenue:** Revenue after discount

### Analytics Setup

Track promo code usage in Plausible:

**File:** `src/utils/analytics.js`

```javascript
export function trackPromoCodeUsed(code, discountPercent) {
  trackEvent('Promo Code Used', {
    code: code,
    discount: discountPercent
  })
}
```

**Call in checkout flow:**
```javascript
if (promoCode) {
  trackPromoCodeUsed(promoCode, promoDiscount.percent)
}
```

### Calculate ROI

**Example: HOLIDAY20 Campaign**

**Costs:**
- Ad spend: $500
- Email campaign: $50
- Total: $550

**Results:**
- 150 redemptions
- Avg order: $9.99/month
- Discount: 20% off first month
- Revenue: 150 × $9.99 × 80% = $1,198

**First Month ROI:** ($1,198 - $550) / $550 = 118% ROI

**Lifetime Value:**
- Avg subscription length: 8 months
- LTV: 150 × $9.99 × 8 = $11,988
- LTV ROI: ($11,988 - $550) / $550 = 2,079% ROI 🚀

---

## 🎯 Best Practices

### 1. Keep Codes Simple and Memorable

**Good:**
- `HOLIDAY20` - Clear what it's for, easy to remember
- `WELCOME10` - Friendly, obvious discount
- `SAVE50` - Action-oriented

**Bad:**
- `X7K2P9QM` - Hard to remember
- `2026HOLIDAYSALE20PERCENT` - Too long
- `coupon_abc123` - Looks like a bug

### 2. Set Expiration Dates

Always set expiration dates to create urgency:
- Launch codes: 7-14 days
- Holiday sales: 3-7 days
- Evergreen codes: 6-12 months

### 3. Limit Redemptions

Prevent abuse and control costs:
- Launch codes: 100-500 max
- Holiday sales: Unlimited (time-limited)
- Referral codes: 1 per user

### 4. Stack Discounts Strategically

**Don't:**
- Allow 50% promo code on already-discounted yearly plan = 75% off
- Give away too much margin

**Do:**
- Limit promo codes to monthly plan only
- Offer "first month free" instead of percentage off
- Give longer trials instead of discounts

### 5. A/B Test Discount Amounts

Test different discount levels:
- Group A: 10% off
- Group B: 20% off
- Group C: 30% off

Track:
- Conversion rate
- Net revenue
- Retention rate after discount ends

**Finding:** Often, 20% converts best with healthy LTV.

---

## 🚀 Launch Checklist

### Week 1: Create First Promo Codes

- [ ] Create `LAUNCH50` - 50% off first 3 months (max 100 uses)
- [ ] Create `FRIEND25` - 25% off for referrals (unlimited)
- [ ] Test promo code redemption with test card
- [ ] Verify discount applied correctly in Stripe Dashboard

### Week 2: Product Hunt Launch

- [ ] Create `PRODUCTHUNT` - 30% off first year (max 500)
- [ ] Prepare Product Hunt post mentioning promo code
- [ ] Monitor redemptions in real-time
- [ ] Reply to comments with discount code

### Month 2: First Seasonal Sale

- [ ] Create `BACKTOSCHOOL` - 25% off yearly plan (2-week campaign)
- [ ] Create email campaign to free users
- [ ] Run Facebook/Instagram ads
- [ ] Track ROI in Plausible Analytics

### Month 3: Referral Program

- [ ] Create referral promo code system
- [ ] Implement backend tracking (Stripe API)
- [ ] Add "Refer a Friend" page to app
- [ ] Send announcement email to all users

---

## 📚 Stripe Promo Code API Reference

### List All Promo Codes

```javascript
const promoCodes = await stripe.promotionCodes.list({
  active: true,
  limit: 100
})
```

### Create Promo Code Programmatically

```javascript
const promoCode = await stripe.promotionCodes.create({
  coupon: 'holiday2026', // Coupon ID
  code: 'HOLIDAY20', // Customer-facing code
  max_redemptions: 500,
  expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
})
```

### Deactivate Promo Code

```javascript
await stripe.promotionCodes.update('promo_xxxxx', {
  active: false
})
```

### Apply Promo Code to Checkout

```javascript
const session = await stripe.checkout.sessions.create({
  // ...
  discounts: [{
    promotion_code: 'promo_xxxxx' // Auto-apply (optional)
  }],
  allow_promotion_codes: true // Let customer enter manually
})
```

---

## 🎁 Gift Subscription Promo Codes

Promo codes work for gift purchases too!

**Example: Mother's Day Campaign**

**Coupon:**
- Name: `Mother's Day Gift`
- Discount: $10 off
- Duration: `Once`
- Applies to: Gift products only

**Promo Code:** `MOM2026`

**Marketing:**
- Email campaign 2 weeks before Mother's Day
- "Give Mom the gift of family time - $10 off!"

**Expected Results:**
- 50 gift purchases × $45 avg = $2,250
- Less $500 discount = $1,750 net
- High referral potential (Mom shares with friends)

---

## 💡 Advanced: Dynamic Promo Codes

For power users, create unique codes programmatically:

### Unique Referral Codes

```javascript
// Generate unique code for each user
const userId = 'user_abc123'
const promoCode = await stripe.promotionCodes.create({
  coupon: 'referral_reward',
  code: `FRIEND-${userId.slice(-6).toUpperCase()}`, // FRIEND-ABC123
  max_redemptions: 10 // Each user can refer 10 friends
})

// Store in database
await supabase.from('user_referrals').insert({
  user_id: userId,
  promo_code: promoCode.code
})
```

### Influencer Commission Tracking

```javascript
// Create code for influencer
const influencerCode = await stripe.promotionCodes.create({
  coupon: 'influencer_15_percent',
  code: 'MOMBLOGGER15',
  metadata: {
    influencer_id: 'influencer_123',
    commission_rate: '0.15'
  }
})

// In webhook, track redemptions
const redemptions = await stripe.promotionCodes.retrieve('promo_xxxxx')
const commission = redemptions.times_redeemed * 9.99 * 0.15
// Pay influencer $commission
```

---

## ✅ Summary

**What's Ready:**
- ✅ Stripe checkout accepts promo codes (code already implemented)
- ✅ All you need to do is create codes in Stripe Dashboard
- ✅ Promo codes work for subscriptions and gifts
- ✅ Stripe handles validation, discounts, and tracking

**Next Steps:**
1. Create first promo code in Stripe (5 minutes)
2. Test redemption with test card (5 minutes)
3. Launch first campaign (e.g., Product Hunt)
4. Monitor redemptions in Stripe Dashboard
5. Calculate ROI and iterate

**Promo codes are your secret weapon for:**
- 🚀 Viral growth (referrals)
- 💰 Revenue spikes (seasonal sales)
- 🎯 Conversion optimization (A/B testing)
- ❤️ Customer retention (win-backs)

**Start simple, then scale!**

---

**Questions?**
- Stripe Coupons: https://dashboard.stripe.com/coupons
- Stripe API Docs: https://stripe.com/docs/api/promotion_codes
- Promo Code Ideas: See "Recommended Campaigns" section above

**Let's drive conversions with smart discounting!** 🎫
