-- Register the schedule-notifications edge function as a pg_cron job.
-- Runs every minute, checks all active commute connections for delays,
-- cancellations, and platform changes, and sends push notifications via
-- send-push.
--
-- Reuses the vault secret 'email_queue_service_role_key' that was set up
-- by the email infrastructure migration, so no additional secret is needed.

-- pg_net + pg_cron are already enabled by 20260422190054_email_infra.sql,
-- but we keep the guard for environments where this migration runs first.
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
END $$;

-- Idempotent: drop existing schedule before re-creating it.
DO $$ BEGIN
  PERFORM cron.unschedule('schedule-notifications');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'schedule-notifications',
  '* * * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://fxjxxlcbpkrmwmcqllyx.supabase.co/functions/v1/schedule-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'email_queue_service_role_key'
        LIMIT 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 50000
  );
  $cron$
);
