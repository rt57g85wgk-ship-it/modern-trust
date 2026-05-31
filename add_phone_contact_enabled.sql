-- SQL script to add 'phone_contact_enabled' column to the 'users' table in Supabase.
-- Please execute this SQL command in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mlmpopgfrwjdbitkxvzt/sql/new

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_contact_enabled BOOLEAN DEFAULT false;
