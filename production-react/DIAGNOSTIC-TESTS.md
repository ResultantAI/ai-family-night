# AI Family Night - Complete Diagnostic Tests

Run these tests to verify all features are working correctly.

## 🔍 Pre-Flight Checklist

Before running diagnostics, verify:
- [ ] Supabase project is created
- [ ] Vercel deployment is complete
- [ ] Environment variables are set in Vercel

---

## 1️⃣ DATABASE DIAGNOSTICS

### Test 1.1: Check Tables Exist

Run in **Supabase SQL Editor**:

```sql
-- Should return 5 tables: customers, subscriptions, children, gallery, game_plays
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customers', 'subscriptions', 'children', 'gallery', 'game_plays')
ORDER BY table_name;
```

**Expected Result**: 5 rows
**If Failed**: Run `supabase-schema.sql` and `supabase-children-table.sql`

---

### Test 1.2: Check RLS Policies

Run in **Supabase SQL Editor**:

```sql
-- Should return policies for all tables
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Result**: Multiple policies for each table
**If Failed**: RLS policies not created - rerun schema files

---

### Test 1.3: Test Children Table Insert

Run in **Supabase SQL Editor** (replace with your email):

```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- Try inserting a test child (replace USER_ID with the ID from above)
INSERT INTO children (user_id, name, age, interests)
VALUES ('YOUR_USER_ID_HERE', 'Test Child', 8, ARRAY['space', 'animals'])
RETURNING *;

-- Verify it worked
SELECT * FROM children WHERE name = 'Test Child';

-- Clean up test
DELETE FROM children WHERE name = 'Test Child';
```

**Expected Result**: Insert succeeds, then select shows the row, then delete removes it
**If Failed**: Table doesn't exist or RLS is blocking access

---

## 2️⃣ AUTHENTICATION DIAGNOSTICS

### Test 2.1: Check User Exists

Run in **Supabase SQL Editor**:

```sql
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data->>'onboarding_completed' as onboarding_done
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';
```

**Expected Result**: Shows your user record
**If Failed**: User not created - check auth flow

---

### Test 2.2: Browser Console Auth Test

Open browser console (F12) and run:

```javascript
// Check if user is logged in
const { data, error } = await supabase.auth.getUser()
console.log('User:', data.user?.email)
console.log('Error:', error)
```

**Expected Result**: Shows your email
**If Failed**: Not logged in - go to /login

---

## 3️⃣ SUBSCRIPTION DIAGNOSTICS

### Test 3.1: Check Subscription Status (Database)

Run in **Supabase SQL Editor**:

```sql
SELECT
  u.email,
  s.tier,
  s.status,
  s.current_period_end,
  s.created_at
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'YOUR_EMAIL_HERE';
```

**Expected Result**: Shows your subscription (if created)
**If No Rows**: No subscription - run `create-test-subscription.sql`

---

### Test 3.2: Check Subscription Status (Frontend)

Browser console (F12):

```javascript
// Check localStorage
console.log('Tier:', localStorage.getItem('subscription_tier'))

// Check database
const { data: { user } } = await supabase.auth.getUser()
const { data: sub } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .single()
console.log('Subscription:', sub)
```

**Expected Result**: Both show premium tier
**If Failed**: Run `create-test-subscription.sql`

---

### Test 3.3: Quick Premium Fix

If premium isn't working, run in browser console:

```javascript
localStorage.setItem('subscription_tier', 'premium_monthly')
window.location.reload()
```

---

## 4️⃣ CHILDREN PROFILE DIAGNOSTICS

### Test 4.1: Check Children Table Access

Browser console (F12):

```javascript
// Try to read children
const { data, error } = await supabase
  .from('children')
  .select('*')

console.log('Children:', data)
console.log('Error:', error)
```

**Expected Result**: `data` is an array (empty or with children), `error` is null
**If Error**: "relation 'public.children' does not exist" → Table not created
**If Error**: "permission denied" → RLS policy issue

---

### Test 4.2: Try Creating a Child

Browser console (F12):

```javascript
const { data: { user } } = await supabase.auth.getUser()

const { data, error } = await supabase
  .from('children')
  .insert({
    user_id: user.id,
    name: 'Test Child',
    age: 8,
    interests: ['space', 'animals']
  })
  .select()

console.log('Created:', data)
console.log('Error:', error)

// Clean up
if (data && data[0]) {
  await supabase.from('children').delete().eq('id', data[0].id)
  console.log('Cleaned up test child')
}
```

**Expected Result**: Child created successfully, then deleted
**If Failed**: Check error message for details

---

## 5️⃣ GAMES ACCESS DIAGNOSTICS

### Test 5.1: Check Game Access Logic

Browser console (F12):

```javascript
// Import the function (if you can access it)
// Or just check localStorage
const tier = localStorage.getItem('subscription_tier')
const isPremium = tier === 'premium_monthly' || tier === 'premium_yearly' || tier === 'premium'

console.log('Tier:', tier)
console.log('Is Premium:', isPremium)
console.log('Expected: All games unlocked =', isPremium)
```

**Expected Result**: `isPremium` is `true`
**If Failed**: Set premium manually (Test 3.3)

---

### Test 5.2: Navigate to Games Page

1. Go to `/games`
2. Check if "Superhero Origin Story" has a lock icon
3. Try clicking it

**Expected Result**: If premium, no lock and game loads
**If Failed**: Games.jsx not checking premium correctly

---

## 6️⃣ ENVIRONMENT VARIABLES DIAGNOSTICS

### Test 6.1: Check Supabase Config

Browser console (F12):

```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
```

**Expected Result**: Shows URL and `true` for has key
**If Failed**: Environment variables not set

---

### Test 6.2: Check Stripe Config

Browser console (F12):

```javascript
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 20))
console.log('Monthly Price:', import.meta.env.VITE_STRIPE_PRICE_MONTHLY)
console.log('Yearly Price:', import.meta.env.VITE_STRIPE_PRICE_YEARLY)
```

**Expected Result**: Shows partial key and price IDs
**If Failed**: Stripe variables not set in Vercel

---

## 7️⃣ SHAREBUTTON DIAGNOSTICS

### Test 7.1: Test ShareButton on Game

1. Go to any game (e.g., Presidential Time Machine)
2. Generate content
3. Look for "Share" button
4. Click it and verify menu opens

**Expected Result**: Share menu appears with Download/Share/Copy options
**If Failed**: ShareButton not integrated or CSS issue

---

### Test 7.2: Test Download

1. Click Share → Download
2. Check Downloads folder

**Expected Result**: PNG file downloaded
**If Failed**: html2canvas error - check console

---

## 8️⃣ ONBOARDING DIAGNOSTICS

### Test 8.1: Check Onboarding Flow

1. Create new test account
2. Complete onboarding
3. Check if child was created

**Expected Result**: Child appears in Settings → Children tab
**If Failed**: Onboarding not saving to children table

---

### Test 8.2: Verify Child Created After Onboarding

Run in **Supabase SQL Editor** (replace email):

```sql
SELECT
  u.email,
  c.name,
  c.age,
  c.interests
FROM children c
JOIN auth.users u ON u.id = c.user_id
WHERE u.email = 'YOUR_EMAIL_HERE';
```

**Expected Result**: Shows child from onboarding
**If No Rows**: Onboarding not creating children

---

## 🛠️ QUICK FIXES

### Fix 1: Children Table Missing

```bash
# Run in terminal
cat supabase-children-table.sql
# Copy output and run in Supabase SQL Editor
```

---

### Fix 2: Premium Not Working

```sql
-- Run in Supabase SQL Editor (replace YOUR_EMAIL_HERE)
DO $$
DECLARE user_record RECORD;
BEGIN
  SELECT id INTO user_record FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';
  INSERT INTO subscriptions (user_id, tier, status, current_period_start, current_period_end)
  VALUES (user_record.id, 'premium_monthly', 'active', NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO UPDATE SET tier = 'premium_monthly', status = 'active';
END $$;
```

Then in browser:
```javascript
localStorage.setItem('subscription_tier', 'premium_monthly')
location.reload()
```

---

### Fix 3: Clear All Local Storage

Browser console:
```javascript
localStorage.clear()
location.reload()
```

---

## 📊 RESULTS SUMMARY

After running all tests, fill in:

| Component | Status | Notes |
|-----------|--------|-------|
| Database Tables | ⬜ Pass / ❌ Fail | |
| RLS Policies | ⬜ Pass / ❌ Fail | |
| Authentication | ⬜ Pass / ❌ Fail | |
| Subscriptions | ⬜ Pass / ❌ Fail | |
| Children Profiles | ⬜ Pass / ❌ Fail | |
| Games Access | ⬜ Pass / ❌ Fail | |
| ShareButton | ⬜ Pass / ❌ Fail | |
| Onboarding | ⬜ Pass / ❌ Fail | |

---

## 🚨 CRITICAL ISSUES TO CHECK

1. **Children table doesn't exist** → Run `supabase-children-table.sql`
2. **Premium not working** → Run `create-test-subscription.sql`
3. **Can't save children** → Check browser console for errors
4. **Games locked** → Set localStorage manually
5. **ShareButton missing** → Check if game was updated

---

## 📞 GET HELP

If tests fail, provide:
1. Which test failed
2. Error message from console/SQL
3. Screenshot of error
