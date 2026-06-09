-- SQL script to add notification preference columns to the 'users' table.
-- Please execute this SQL command in your Supabase SQL Editor.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notify_line BOOLEAN DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN public.users.notify_email IS 'Whether the user wants to receive notifications via Email.';
COMMENT ON COLUMN public.users.notify_line IS 'Whether the user wants to receive notifications via LINE.';
