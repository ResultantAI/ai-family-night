# Deployment Instructions

## Database Setup Required (One-Time)

Before the fixes will work in production, you need to run the SQL migration in Supabase:

### 1. Create Children Table

Go to your Supabase dashboard → SQL Editor and run:

```bash
cat supabase-children-table.sql
```

This will:
- Create the `children` table
- Set up Row Level Security policies
- Migrate existing child data from user metadata to the table
- Add necessary indexes

### 2. Verify Table Creation

Run this query to confirm:

```sql
SELECT * FROM children LIMIT 5;
```

## Features Added in This Deployment

### 1. Children Profiles Fix ✅
- **Problem**: Onboarding was saving child info to user metadata only, not creating database records
- **Fix**:
  - Created `children` table in Supabase
  - Updated onboarding to save to database
  - Updated Settings page to fetch/manage children from database
  - Added full CRUD operations (Create, Read, Update, Delete)

### 2. Premium Games Unlock Fix ✅
- **Problem**: Premium games not unlocking after purchase
- **Fix**:
  - Added `checkPremiumStatus()` function that checks Supabase `subscriptions` table
  - Dashboard now checks both localStorage AND database
  - Syncs database status to localStorage for immediate feedback
  - Supports `premium`, `premium_monthly`, and `premium_yearly` tiers

### 3. ShareButton Integration ✅
- Added ShareButton component to all 6 games
- Supports Download, Web Share API, and Copy to Clipboard
- Dynamic filenames based on content

### 4. JSX Fixes ✅
- Fixed TreehouseDesigner.jsx closing tags
- Fixed FamilyCharacterQuiz.jsx closing tags
- Renamed useAutoSave.js to useAutoSave.jsx

## Known Issues (Not Fixed Yet)

### Payment Method Management
- **Issue**: "Add payment method" button not functional
- **Reason**: Requires Stripe Customer Portal integration
- **Fix Needed**: Set up Stripe billing portal and link button

### Invoice History
- **Issue**: No invoices shown in billing section
- **Reason**: Needs Stripe API integration to fetch invoices
- **Fix Needed**: Call Stripe API to list customer invoices

### Gift Subscription Selection
- **Issue Reported**: Gift selection not changing/working properly
- **Investigation**: Code looks correct (line 120 in Gift.jsx has onClick handler)
- **Possible Cause**: May be a visual/CSS issue or runtime error
- **Needs Testing**: Test in production after deployment

## Files Changed

### New Files:
- `supabase-children-table.sql` - Database migration
- `DEPLOYMENT-INSTRUCTIONS.md` - This file

### Modified Files:
1. `src/pages/Onboarding.jsx` - Save children to database
2. `src/pages/Settings.jsx` - Fetch/manage children, add modal
3. `src/config/stripe.js` - Add checkPremiumStatus() function
4. `src/pages/Dashboard.jsx` - Check database for premium status
5. `src/components/games/PresidentialTimeMachine.jsx` - Add ShareButton
6. `src/components/games/LoveStoryComic.jsx` - Add ShareButton
7. `src/components/games/SuperheroOrigin.jsx` - Add ShareButton
8. `src/components/games/NoisyStorybook.jsx` - Add ShareButton
9. `src/components/games/TreehouseDesigner.jsx` - Add ShareButton + fix JSX
10. `src/components/games/FamilyCharacterQuiz.jsx` - Fix JSX
11. `src/hooks/useAutoSave.jsx` - Renamed from .js

## Deployment Steps

1. **Run Database Migration** (see above)
2. **Build**: `npm run build`
3. **Deploy to Vercel**: `npx vercel --prod`
4. **Assign Domain**:
   ```bash
   npx vercel alias set [deployment-url] aifamilynight.com
   npx vercel alias set [deployment-url] www.aifamilynight.com
   ```

## Testing Checklist

After deployment, test:

- [ ] Onboarding creates child profile in database
- [ ] Settings → Children tab shows created children
- [ ] Can add/edit/delete children from Settings
- [ ] Premium games unlock after purchase
- [ ] Dashboard shows premium status correctly
- [ ] ShareButton works on all 6 games (download, share, copy)
- [ ] All pages load without errors

## Environment Variables Required

Make sure these are set in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRICE_MONTHLY`
- `VITE_STRIPE_PRICE_YEARLY`

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs for database errors
3. Check browser console for client-side errors
4. Verify environment variables are set correctly
