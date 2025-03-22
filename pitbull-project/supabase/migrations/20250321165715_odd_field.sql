/*
  # Initial Schema Setup for BJJ Registration System

  1. New Tables
    - `profiles`
      - User profiles with belt information
    - `trainings`
      - Weekly training sessions
    - `events`
      - Special events and workshops
    - `registrations`
      - Training and event registrations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  belt text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trainings table
CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time time NOT NULL,
  end_time time NOT NULL,
  day_of_week integer NOT NULL,
  max_participants integer NOT NULL,
  level text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  type text NOT NULL,
  max_participants integer NOT NULL,
  price decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  training_id uuid REFERENCES trainings(id),
  event_id uuid REFERENCES events(id),
  created_at timestamptz DEFAULT now(),
  CHECK (
    (training_id IS NOT NULL AND event_id IS NULL) OR
    (event_id IS NOT NULL AND training_id IS NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trainings policies
CREATE POLICY "Anyone can read trainings"
  ON trainings FOR SELECT
  TO authenticated
  USING (true);

-- Events policies
CREATE POLICY "Anyone can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Registrations policies
CREATE POLICY "Users can read own registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own registrations"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);