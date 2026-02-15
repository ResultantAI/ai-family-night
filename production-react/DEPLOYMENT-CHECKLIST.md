# 🚀 AI Family Night - Deployment Checklist
**Phase 1 & 2: Conversion & Retention Features Ready**

## ✅ All Phase 1 & 2 Features Complete

See PHASE-1-2-IMPLEMENTATION.md for full details.

## 📋 Quick Deployment Steps

### 1. Supabase (10 min)
Run SQL in Supabase SQL Editor to create tables:
- scheduled_emails
- email_logs  
- notifications
- user_progress

See PHASE-1-2-IMPLEMENTATION.md for SQL scripts.

### 2. Resend Email Service (5 min)
1. Sign up at https://resend.com
2. Add domain: aifamilynight.com
3. Get API key (starts with re_)
4. Add to Vercel env: VITE_EMAIL_API_KEY

### 3. Stripe (5 min)
1. Update annual price to $74.99/year
2. Copy new price ID
3. Update Vercel env: VITE_STRIPE_PRICE_YEARLY

### 4. Deploy
```bash
git push origin main
# Vercel auto-deploys
```

### 5. Test
- Sign up at aifamilynight.com/signup
- Complete onboarding
- Check email received
- Navigate to /calendar and /collection

## 🎯 Success!
All conversion & retention features are live!
