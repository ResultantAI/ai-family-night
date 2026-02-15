-- AI Family Night - Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- CUSTOMERS TABLE
-- Stores Stripe customer information
-- ================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own customer data
CREATE POLICY "Users can read own customer data"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert/update customers (for webhooks)
CREATE POLICY "Service role can manage customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON customers(user_id);
CREATE INDEX IF NOT EXISTS customers_stripe_customer_id_idx ON customers(stripe_customer_id);

-- ================================================
-- SUBSCRIPTIONS TABLE
-- Stores user subscription status and tier
-- ================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium_monthly', 'premium_yearly'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'trialing', 'canceled', 'past_due'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- ================================================
-- GAME PLAYS TABLE
-- Tracks game usage for analytics and free tier limits
-- ================================================
CREATE TABLE IF NOT EXISTS game_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL, -- 'comic-maker', 'noisy-storybook', etc.
  metadata JSONB, -- Store additional game-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE game_plays ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own game plays
CREATE POLICY "Users can read own game plays"
  ON game_plays FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own game plays
CREATE POLICY "Users can insert own game plays"
  ON game_plays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for analytics and limits
CREATE INDEX IF NOT EXISTS game_plays_user_id_idx ON game_plays(user_id);
CREATE INDEX IF NOT EXISTS game_plays_game_id_idx ON game_plays(game_id);
CREATE INDEX IF NOT EXISTS game_plays_created_at_idx ON game_plays(created_at);
CREATE INDEX IF NOT EXISTS game_plays_user_game_date_idx ON game_plays(user_id, game_id, created_at);

-- ================================================
-- GALLERY TABLE
-- Stores user creations from games
-- ================================================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_name TEXT NOT NULL,
  data JSONB NOT NULL, -- Full creation data (script, hero, story, etc.)
  preview TEXT, -- Short preview text
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own gallery items
CREATE POLICY "Users can read own gallery"
  ON gallery FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own gallery items
CREATE POLICY "Users can insert own gallery"
  ON gallery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own gallery items
CREATE POLICY "Users can delete own gallery"
  ON gallery FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS gallery_user_id_idx ON gallery(user_id);
CREATE INDEX IF NOT EXISTS gallery_created_at_idx ON gallery(created_at);
CREATE INDEX IF NOT EXISTS gallery_game_name_idx ON gallery(game_name);

-- ================================================
-- GIFT SUBSCRIPTIONS TABLE
-- Tracks gift subscription purchases and redemptions
-- ================================================
CREATE TABLE IF NOT EXISTS gift_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchaser_email TEXT NOT NULL,
  purchaser_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  duration_months INTEGER NOT NULL, -- 3, 6, or 12
  message TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id TEXT,
  redemption_code TEXT UNIQUE NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gift_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read gifts they purchased or received
CREATE POLICY "Users can read their gifts"
  ON gift_subscriptions FOR SELECT
  USING (
    purchaser_email = auth.jwt() ->> 'email' OR
    recipient_email = auth.jwt() ->> 'email' OR
    redeemed_by = auth.uid()
  );

-- Policy: Service role can manage gifts (for webhooks/gift creation)
CREATE POLICY "Service role can manage gifts"
  ON gift_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS gift_subscriptions_recipient_email_idx ON gift_subscriptions(recipient_email);
CREATE INDEX IF NOT EXISTS gift_subscriptions_redemption_code_idx ON gift_subscriptions(redemption_code);
CREATE INDEX IF NOT EXISTS gift_subscriptions_redeemed_by_idx ON gift_subscriptions(redeemed_by);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION has_premium_access(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_record RECORD;
BEGIN
  SELECT * INTO sub_record
  FROM subscriptions
  WHERE user_id = user_id_param;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if subscription is active or trialing
  IF sub_record.status IN ('active', 'trialing') THEN
    -- Check if not canceled or if canceled, check if still in period
    IF NOT sub_record.cancel_at_period_end OR sub_record.current_period_end > NOW() THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current tier
CREATE OR REPLACE FUNCTION get_user_tier(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  sub_record RECORD;
BEGIN
  SELECT * INTO sub_record
  FROM subscriptions
  WHERE user_id = user_id_param;

  IF NOT FOUND THEN
    RETURN 'free';
  END IF;

  -- If subscription is active, return tier
  IF sub_record.status IN ('active', 'trialing') AND
     (NOT sub_record.cancel_at_period_end OR sub_record.current_period_end > NOW()) THEN
    RETURN sub_record.tier;
  END IF;

  RETURN 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- INITIAL DATA
-- ================================================

-- Create a free tier subscription for new users automatically
-- This trigger ensures every new user gets a subscription record
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ================================================
-- ANALYTICS VIEWS (Optional - for admin dashboard)
-- ================================================

-- View for subscription analytics
CREATE OR REPLACE VIEW subscription_stats AS
SELECT
  tier,
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN trial_end > NOW() THEN 1 END) as active_trials,
  COUNT(CASE WHEN cancel_at_period_end THEN 1 END) as canceling_count
FROM subscriptions
GROUP BY tier, status;

-- View for game popularity
CREATE OR REPLACE VIEW game_popularity AS
SELECT
  game_id,
  COUNT(*) as play_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', created_at) as date
FROM game_plays
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY game_id, DATE_TRUNC('day', created_at)
ORDER BY play_count DESC;

-- ================================================
-- COMPLETED!
-- ================================================
-- Next steps:
-- 1. Update .env.local with your Supabase URL and anon key
-- 2. Update Stripe webhook to write to these tables
-- 3. Update frontend to use Supabase instead of localStorage
-- 4. Test authentication and subscription flows
