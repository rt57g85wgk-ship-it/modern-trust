-- Create voice_leads table to store inquiries from VoiceBot
CREATE TABLE IF NOT EXISTS public.voice_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(room_id) ON DELETE CASCADE,
    caller_phone TEXT NOT NULL,
    transcript TEXT,
    audio_url TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.voice_leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow the service role or authenticated admins to read all leads
-- Note: This is a broad policy for service-level operations. 
-- In production, you might want to restrict this further.
DROP POLICY IF EXISTS "Allow service role to manage voice_leads" ON public.voice_leads;
CREATE POLICY "Allow service role to manage voice_leads" ON public.voice_leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index for room_id to speed up lookups
CREATE INDEX IF NOT EXISTS idx_voice_leads_room_id ON public.voice_leads(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_leads_created_at ON public.voice_leads(created_at);

-- Add comment to table
COMMENT ON TABLE public.voice_leads IS 'Table to store leads/inquiries captured by the VoiceBot system.';
