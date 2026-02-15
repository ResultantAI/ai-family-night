-- ============================================
-- AI FAMILY NIGHT - COMPLETE DATABASE SETUP
-- ============================================
-- Run this ONCE in Supabase SQL Editor
-- This sets up EVERYTHING you need
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. CUSTOMERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own customer data" ON customers;
CREATE POLICY "Users can read own customer data"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage customers" ON customers;
CREATE POLICY "Service role can manage customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS customers_user_id_idx ON customers(user_id);
CREATE INDEX IF NOT EXISTS customers_stripe_customer_id_idx ON customers(stripe_customer_id);

-- ================================================
-- 2. SUBSCRIPTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- ================================================
-- 3. CHILDREN TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 3 AND age <= 18),
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own children" ON children;
CREATE POLICY "Users can read own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own children" ON children;
CREATE POLICY "Users can insert own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own children" ON children;
CREATE POLICY "Users can update own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own children" ON children;
CREATE POLICY "Users can delete own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS children_user_id_idx ON children(user_id);
CREATE INDEX IF NOT EXISTS children_created_at_idx ON children(created_at);

-- ================================================
-- 4. GAME PLAYS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS game_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE game_plays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own game plays" ON game_plays;
CREATE POLICY "Users can read own game plays"
  ON game_plays FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own game plays" ON game_plays;
CREATE POLICY "Users can insert own game plays"
  ON game_plays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS game_plays_user_id_idx ON game_plays(user_id);
CREATE INDEX IF NOT EXISTS game_plays_game_id_idx ON game_plays(game_id);
CREATE INDEX IF NOT EXISTS game_plays_created_at_idx ON game_plays(created_at);

-- ================================================
-- 5. GALLERY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_name TEXT NOT NULL,
  data JSONB NOT NULL,
  preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own gallery" ON gallery;
CREATE POLICY "Users can read own gallery"
  ON gallery FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own gallery" ON gallery;
CREATE POLICY "Users can insert own gallery"
  ON gallery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own gallery" ON gallery;
CREATE POLICY "Users can delete own gallery"
  ON gallery FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS gallery_user_id_idx ON gallery(user_id);
CREATE INDEX IF NOT EXISTS gallery_created_at_idx ON gallery(created_at);
CREATE INDEX IF NOT EXISTS gallery_game_name_idx ON gallery(game_name);

-- ================================================
-- 6. HELPER FUNCTIONS
-- ================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_children_updated_at ON children;
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 7. MIGRATE EXISTING DATA
-- ================================================

-- Migrate child data from user metadata to children table
DO $$
DECLARE
  user_record RECORD;
  child_name TEXT;
  child_age INTEGER;
  child_interests TEXT[];
BEGIN
  FOR user_record IN
    SELECT id, raw_user_meta_data
    FROM auth.users
    WHERE raw_user_meta_data->>'child_name' IS NOT NULL
  LOOP
    child_name := user_record.raw_user_meta_data->>'child_name';
    child_age := (user_record.raw_user_meta_data->>'child_age')::INTEGER;

    -- Convert interests JSONB array to TEXT array
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(user_record.raw_user_meta_data->'interests')
    ) INTO child_interests;

    -- Insert child if name and age exist
    IF child_name IS NOT NULL AND child_age IS NOT NULL THEN
      INSERT INTO children (user_id, name, age, interests)
      VALUES (user_record.id, child_name, child_age, COALESCE(child_interests, '{}'))
      ON CONFLICT DO NOTHING;

      RAISE NOTICE 'Migrated child % for user %', child_name, user_record.id;
    END IF;
  END LOOP;
END $$;

-- ================================================
-- ✅ SETUP COMPLETE!
-- ================================================

-- Verify everything was created
SELECT
  'Tables Created' as status,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customers', 'subscriptions', 'children', 'gallery', 'game_plays');

-- Should show: status = 'Tables Created', count = 5
