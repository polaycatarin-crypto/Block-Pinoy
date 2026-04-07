/*
  # Block Blast PH Game Schema

  1. New Tables
    - `profiles` - User profiles with game stats
    - `game_progress` - Track player progress, coins, current stage
    - `stage_records` - Best scores per stage
    - `game_items` - Inventory of boosts/power-ups

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Authenticated access required
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  total_coins bigint DEFAULT 0,
  total_score bigint DEFAULT 0,
  current_stage integer DEFAULT 1,
  best_stage integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);


CREATE TABLE IF NOT EXISTS game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage integer NOT NULL,
  score integer DEFAULT 0,
  coins_earned integer DEFAULT 0,
  completed boolean DEFAULT false,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stage)
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own game progress"
  ON game_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own game progress"
  ON game_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own game progress"
  ON game_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


CREATE TABLE IF NOT EXISTS boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boost_type text NOT NULL CHECK (boost_type IN ('bomb', 'lightning', 'hammer', 'shuffle')),
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, boost_type)
);

ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boosts"
  ON boosts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own boosts"
  ON boosts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update boost quantities"
  ON boosts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


CREATE INDEX idx_game_progress_user ON game_progress(user_id);
CREATE INDEX idx_game_progress_stage ON game_progress(stage);
CREATE INDEX idx_boosts_user ON boosts(user_id);
