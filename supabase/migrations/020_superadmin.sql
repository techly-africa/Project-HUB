-- Migration 020: Super Admin
-- Adds is_superadmin flag to profiles and seeds copain@avel.africa.

-- ─── Flag ────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_superadmin boolean NOT NULL DEFAULT false;

-- ─── Helper: check if current user is superadmin ──────────────────────────────
-- SECURITY DEFINER allows this to run even if the user can't read their own profile yet.
CREATE OR REPLACE FUNCTION public.user_is_superadmin()
RETURNS boolean AS $$
  SELECT COALESCE(is_superadmin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── Seed superadmin ─────────────────────────────────────────────────────────
UPDATE public.profiles
  SET is_superadmin = true
  WHERE email = 'copain@avel.africa';

-- ─── Superadmin can read + manage ALL organizations ───────────────────────────
DROP POLICY IF EXISTS "superadmin_all_orgs" ON public.organizations;
CREATE POLICY "superadmin_all_orgs" ON public.organizations
  FOR ALL
  USING (public.user_is_superadmin())
  WITH CHECK (public.user_is_superadmin());

-- ─── Superadmin can read + manage ALL profiles ────────────────────────────────
-- (Ensures no recursion by using the security definer function)
DROP POLICY IF EXISTS "superadmin_all_profiles" ON public.profiles;
CREATE POLICY "superadmin_all_profiles" ON public.profiles
  FOR ALL
  USING (
    id = auth.uid()
    OR public.user_is_superadmin()
  )
  WITH CHECK (
    id = auth.uid()
    OR public.user_is_superadmin()
  );
