-- SQL script to support "The Virtual Receptionist" feature.
-- 1. Add virtual_phone to users table to map a premium number to a landlord.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS virtual_phone TEXT;

-- 2. Add to_phone to voice_leads table to record which virtual number was called.
ALTER TABLE public.voice_leads ADD COLUMN IF NOT EXISTS to_phone TEXT;

-- Create index for faster lookups by virtual phone
CREATE INDEX IF NOT EXISTS idx_users_virtual_phone ON public.users(virtual_phone);
CREATE INDEX IF NOT EXISTS idx_voice_leads_to_phone ON public.voice_leads(to_phone);

-- Add comments
COMMENT ON COLUMN public.users.virtual_phone IS 'The virtual premium number assigned to this landlord.';
COMMENT ON COLUMN public.voice_leads.to_phone IS 'The virtual number that the customer called.';
