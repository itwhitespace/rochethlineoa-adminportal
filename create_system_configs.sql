CREATE TABLE IF NOT EXISTS public.system_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Insert initial values if they do not exist
INSERT INTO public.system_configs (key, value, updated_by)
VALUES 
    ('line_liff_id', '2001928374-lkJae12P', 'system'),
    ('line_channel_access_token', '', 'system')
ON CONFLICT (key) DO NOTHING;
