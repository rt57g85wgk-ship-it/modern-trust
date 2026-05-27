-- SQL script to add 'promoted' column to the 'rooms' table in Supabase.
-- Please execute this SQL command in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mlmpopgfrwjdbitkxvzt/sql/new

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS promoted BOOLEAN DEFAULT false;
