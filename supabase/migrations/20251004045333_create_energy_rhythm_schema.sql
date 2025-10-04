/*
  # Energy Rhythm Tracker Schema

  ## Overview
  This migration creates the database schema for tracking users' circadian rhythms,
  menstrual cycles, and generating personalized energy predictions and activity recommendations.

  ## New Tables
  
  ### `user_profiles`
  Stores basic user information and preferences
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `circadian_profiles`
  Stores circadian rhythm assessment results
  - `id` (uuid, primary key) - Unique profile identifier
  - `user_id` (uuid, foreign key) - References user_profiles
  - `chronotype` (text) - Morning lark, night owl, or intermediate
  - `natural_wake_time` (time) - Preferred wake time without alarm
  - `peak_energy_time` (time) - Time of highest natural energy
  - `survey_responses` (jsonb) - Raw survey data
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `menstrual_cycles`
  Tracks menstrual cycle information
  - `id` (uuid, primary key) - Unique cycle identifier
  - `user_id` (uuid, foreign key) - References user_profiles
  - `last_period_start` (date) - Start date of last period
  - `next_period_expected` (date) - Expected start date of next period
  - `cycle_length` (integer) - Average cycle length in days
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Authenticated users required for all operations
  
  ### Policies
  For each table:
  - SELECT: Users can view only their own records
  - INSERT: Users can create only their own records
  - UPDATE: Users can update only their own records
  - DELETE: Users can delete only their own records
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create circadian_profiles table
CREATE TABLE IF NOT EXISTS circadian_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  chronotype text NOT NULL,
  natural_wake_time time NOT NULL,
  peak_energy_time time NOT NULL,
  survey_responses jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE circadian_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own circadian profile"
  ON circadian_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own circadian profile"
  ON circadian_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own circadian profile"
  ON circadian_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own circadian profile"
  ON circadian_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create menstrual_cycles table
CREATE TABLE IF NOT EXISTS menstrual_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  last_period_start date NOT NULL,
  next_period_expected date NOT NULL,
  cycle_length integer DEFAULT 28,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menstrual_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycle data"
  ON menstrual_cycles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cycle data"
  ON menstrual_cycles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cycle data"
  ON menstrual_cycles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own cycle data"
  ON menstrual_cycles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_circadian_profiles_user_id ON circadian_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_id ON menstrual_cycles(user_id);