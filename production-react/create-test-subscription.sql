-- Create Test Premium Subscription
-- Run this in Supabase SQL Editor to give yourself premium access for testing
-- IMPORTANT: Replace 'YOUR_EMAIL_HERE' with your actual email address

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email
  SELECT id INTO user_record
  FROM auth.users
  WHERE email = 'YOUR_EMAIL_HERE'; -- ⚠️ CHANGE THIS TO YOUR EMAIL

  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: YOUR_EMAIL_HERE';
  END IF;

  -- Create or update premium subscription
  INSERT INTO subscriptions (
    user_id,
    tier,
    status,
    current_period_start,
    current_period_end,
    trial_start,
    trial_end
  )
  VALUES (
    user_record.id,
    'premium_monthly', -- or 'premium_yearly'
    'active', -- or 'trialing' if you want to test trial
    NOW(),
    NOW() + INTERVAL '30 days', -- 30 days from now
    NOW(),
    NOW() + INTERVAL '7 days' -- 7-day trial
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    tier = 'premium_monthly',
    status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '30 days',
    trial_start = NOW(),
    trial_end = NOW() + INTERVAL '7 days',
    updated_at = NOW();

  RAISE NOTICE 'Premium subscription created/updated for user: %', user_record.id;
END $$;

-- Verify the subscription was created
SELECT
  u.email,
  s.tier,
  s.status,
  s.current_period_start,
  s.current_period_end,
  s.trial_end
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'YOUR_EMAIL_HERE'; -- ⚠️ CHANGE THIS TO YOUR EMAIL
