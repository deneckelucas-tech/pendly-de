
-- Cache table for transport API responses
CREATE TABLE public.transport_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for fast lookups
CREATE INDEX idx_transport_cache_key ON public.transport_cache (cache_key);
CREATE INDEX idx_transport_cache_expires ON public.transport_cache (expires_at);

-- Enable RLS
ALTER TABLE public.transport_cache ENABLE ROW LEVEL SECURITY;

-- Public read access (transport data is public)
CREATE POLICY "Anyone can read cache"
ON public.transport_cache
FOR SELECT
TO anon, authenticated
USING (true);

-- Only service role can write (edge function uses service role)
CREATE POLICY "Service role can manage cache"
ON public.transport_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
