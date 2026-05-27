-- SQL script to create the 'tenant_requirements' table and setup Row-Level Security (RLS) policies in Supabase.
-- Please execute this SQL command in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mlmpopgfrwjdbitkxvzt/sql/new
DROP TABLE IF EXISTS tenant_requirements CASCADE;

CREATE TABLE tenant_requirements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  min_budget NUMERIC,
  max_budget NUMERIC,
  location_name VARCHAR(255),
  location_lat DOUBLE PRECISION DEFAULT 13.7563, -- Bangkok default lat
  location_lng DOUBLE PRECISION DEFAULT 100.5018, -- Bangkok default lng
  radius_km DOUBLE PRECISION DEFAULT 99.0,
  property_type VARCHAR(50),
  room_layout VARCHAR(50),
  pet_friendly BOOLEAN DEFAULT false,
  lease_term VARCHAR(50),
  preferred_amenities TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tenant_requirements ENABLE ROW LEVEL SECURITY;

-- Setup Row-Level Security (RLS) policies
DROP POLICY IF EXISTS "Users can view their own requirements" ON tenant_requirements;
CREATE POLICY "Users can view their own requirements" 
  ON tenant_requirements FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their own requirements" ON tenant_requirements;
CREATE POLICY "Users can upsert their own requirements" 
  ON tenant_requirements FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own requirements" ON tenant_requirements;
CREATE POLICY "Users can update their own requirements" 
  ON tenant_requirements FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);
