-- Migration 021: Auto-assign Superadmin status
-- Ensures copain@avel.africa is always a superadmin.

-- 1. Ensure existing profile is superadmin
UPDATE public.profiles
SET is_superadmin = true
WHERE email = 'copain@avel.africa';

-- 2. Update handle_new_user to handle this automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_domain text;
  org_id      uuid;
  is_admin    boolean := false;
BEGIN
  user_domain := split_part(NEW.email, '@', 2);

  -- Admin check
  IF NEW.email = 'copain@avel.africa' THEN
    is_admin := true;
  END IF;

  SELECT id INTO org_id
    FROM public.organizations
    WHERE domain = user_domain;

  INSERT INTO public.profiles (id, email, organization_id, is_superadmin)
    VALUES (NEW.id, NEW.email, org_id, is_admin)
    ON CONFLICT (id) DO UPDATE
      SET email           = EXCLUDED.email,
          organization_id = COALESCE(public.profiles.organization_id, EXCLUDED.organization_id),
          is_superadmin   = CASE WHEN EXCLUDED.is_superadmin = true THEN true ELSE public.profiles.is_superadmin END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
