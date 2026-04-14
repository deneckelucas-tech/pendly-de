
-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a trigger function that prevents users from modifying sensitive columns
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service_role to modify these fields
  IF current_setting('role') != 'service_role' THEN
    NEW.subscription_status := OLD.subscription_status;
    NEW.subscription_end := OLD.subscription_end;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.trial_start := OLD.trial_start;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to enforce column protection
CREATE TRIGGER protect_profile_billing_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_sensitive_profile_fields();

-- Re-create a safe UPDATE policy
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
