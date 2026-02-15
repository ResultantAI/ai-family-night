-- AI Family Night - Children Profiles Table
-- Add this to your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ================================================
-- CHILDREN TABLE
-- Stores child profiles for personalization
-- ================================================
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 3 AND age <= 18),
  interests TEXT[] DEFAULT '{}', -- Array of interest IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own children
CREATE POLICY "Users can read own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own children
CREATE POLICY "Users can insert own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own children
CREATE POLICY "Users can update own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own children
CREATE POLICY "Users can delete own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS children_user_id_idx ON children(user_id);
CREATE INDEX IF NOT EXISTS children_created_at_idx ON children(created_at);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- MIGRATION: Add existing onboarding data to children table
-- ================================================
-- This migrates child data from user metadata to the children table
-- Run this AFTER creating the table above

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
    END IF;
  END LOOP;
END $$;
