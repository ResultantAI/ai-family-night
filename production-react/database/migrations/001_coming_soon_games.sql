-- Coming Soon Games System
-- Run this in Supabase SQL Editor

-- Create coming_soon_games table
CREATE TABLE IF NOT EXISTS coming_soon_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  icon TEXT,
  gradient TEXT,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_released BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_coming_soon_release_date ON coming_soon_games(release_date);
CREATE INDEX IF NOT EXISTS idx_coming_soon_is_released ON coming_soon_games(is_released);

-- Enable Row Level Security
ALTER TABLE coming_soon_games ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read coming soon games
CREATE POLICY "Anyone can view coming soon games"
  ON coming_soon_games FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update (for cron jobs)
CREATE POLICY "Service role can manage coming soon games"
  ON coming_soon_games FOR ALL
  USING (auth.role() = 'service_role');

-- Insert sample coming soon games
INSERT INTO coming_soon_games (title, description, category, icon, gradient, release_date) VALUES
  ('Musical Maestro', 'Compose family songs with AI-generated melodies', 'Music', '🎵', 'from-violet-400 to-purple-500', NOW() + INTERVAL '7 days'),
  ('Pet Designer', 'Design your dream pet with magical abilities', 'Creative', '🐾', 'from-teal-400 to-cyan-500', NOW() + INTERVAL '14 days'),
  ('Time Capsule Maker', 'Create a digital time capsule for your family', 'Memory', '⏰', 'from-indigo-400 to-blue-500', NOW() + INTERVAL '21 days');

-- Function to auto-release games when date is reached
CREATE OR REPLACE FUNCTION release_scheduled_games()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coming_soon_games
  SET is_released = TRUE,
      updated_at = NOW()
  WHERE release_date <= NOW()
    AND is_released = FALSE;
END;
$$;

-- Note: Set up a cron job in Supabase to run this function daily
-- Or call it from your backend API
