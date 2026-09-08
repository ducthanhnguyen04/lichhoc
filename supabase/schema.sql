-- ========================================================
-- DATABASE SCHEMA FOR AUTO SCHEDULE REMINDER (LICH HOC SMART)
-- ========================================================

-- 1. Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    schedule_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user_id query performance
CREATE INDEX IF NOT EXISTS schedules_user_id_idx ON public.schedules(user_id);

-- 1.5. Grant permissions to Supabase roles
GRANT ALL ON TABLE public.schedules TO authenticated;
GRANT ALL ON TABLE public.schedules TO service_role;
GRANT ALL ON TABLE public.schedules TO anon;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies
CREATE POLICY "Users can view their own schedule"
    ON public.schedules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedule"
    ON public.schedules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule"
    ON public.schedules FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedule"
    ON public.schedules FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Storage Bucket Configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('schedule-images', 'schedule-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Access for Schedule Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'schedule-images');

CREATE POLICY "Authenticated users can upload schedule images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'schedule-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own schedule images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'schedule-images' AND auth.uid() = owner);
