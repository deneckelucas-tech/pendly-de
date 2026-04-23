-- 1) Tabelle user_preferences anlegen
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  notify_delays BOOLEAN NOT NULL DEFAULT true,
  notify_cancellations BOOLEAN NOT NULL DEFAULT true,
  notify_disruptions BOOLEAN NOT NULL DEFAULT true,
  notify_platform_changes BOOLEAN NOT NULL DEFAULT true,
  notify_alternatives BOOLEAN NOT NULL DEFAULT false,
  notify_daily_summary BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
  quiet_hours_end TEXT NOT NULL DEFAULT '06:00',
  default_weekdays TEXT[] NOT NULL DEFAULT ARRAY['mon','tue','wed','thu','fri']::TEXT[],
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  time_format TEXT NOT NULL DEFAULT '24h' CHECK (time_format IN ('24h','12h')),
  language TEXT NOT NULL DEFAULT 'de',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) RLS aktivieren
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 3) Policies — jeder Nutzer nur seine eigenen Daten
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4) updated_at automatisch pflegen
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5) handle_new_user erweitern, damit beim Signup automatisch ein Default-Eintrag entsteht
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, trial_start, subscription_status)
  VALUES (NEW.id, now(), 'trialing');

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 6) Bestehende Nutzer rückwirkend mit Default-Preferences ausstatten
INSERT INTO public.user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;