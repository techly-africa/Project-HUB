-- Migration 022: License Management
-- Adds license-related fields to organizations.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS license_key text DEFAULT gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS license_type text DEFAULT 'standard' CHECK (license_type IN ('standard', 'freemium')),
  ADD COLUMN IF NOT EXISTS license_expires_at timestamptz DEFAULT (CURRENT_TIMESTAMP + interval '1 month'),
  ADD COLUMN IF NOT EXISTS is_license_active boolean DEFAULT true;

-- Update RLS to ensure superadmins can still manage these new fields
-- (Already covered by the existing superadmin_all_orgs policy in 020)

-- Comment on columns for clarity
COMMENT ON COLUMN public.organizations.license_key IS 'Revolving API key for the current month.';
COMMENT ON COLUMN public.organizations.license_type IS 'Standard paid license or Freemium grant.';
COMMENT ON COLUMN public.organizations.license_expires_at IS 'When the current license period ends.';
