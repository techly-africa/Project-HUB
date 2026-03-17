-- Migration 019: Storage isolation + document_folders RLS consolidation
-- ─────────────────────────────────────────────────────────────────────────────
-- Part A: Super Admin Helper (Enables bypass)
-- ─────────────────────────────────────────────────────────────────────────────
-- This function allows storage and folder policies to recognize administrative users.
-- We define it here as well to ensure 019 can be run independently of 020 if needed.
CREATE OR REPLACE FUNCTION public.user_is_superadmin()
RETURNS boolean AS $$
  SELECT COALESCE(is_superadmin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- Part B: Storage bucket org-scoping
-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: enforce that the first path segment (folder name) must equal the
-- caller's organization_id.
--
-- NOTE: Already uploaded files at the root or in different paths will be 
-- accessible ONLY to Super Admins until they are moved.

-- Drop old policies
DROP POLICY IF EXISTS "authenticated upload"  ON storage.objects;
DROP POLICY IF EXISTS "authenticated read"    ON storage.objects;
DROP POLICY IF EXISTS "authenticated delete"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload task attachments"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read task attachments"    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete task attachments"  ON storage.objects;
DROP POLICY IF EXISTS "org_scoped_storage" ON storage.objects;

CREATE POLICY "org_scoped_storage"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND (
      (storage.foldername(name))[1] = public.user_org_id()::text
      OR public.user_is_superadmin()
    )
  )
  WITH CHECK (
    bucket_id = 'task-attachments'
    AND (
      (storage.foldername(name))[1] = public.user_org_id()::text
      OR public.user_is_superadmin()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Part C: document_folders RLS — consolidate to user_org_id() pattern
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "org members can view folders"   ON public.document_folders;
DROP POLICY IF EXISTS "org members can create folders" ON public.document_folders;
DROP POLICY IF EXISTS "org members can delete folders" ON public.document_folders;
DROP POLICY IF EXISTS "org members can update folders" ON public.document_folders;
DROP POLICY IF EXISTS "org_all_folders" ON public.document_folders;

CREATE POLICY "org_all_folders" ON public.document_folders
  FOR ALL
  USING (
    organization_id = public.user_org_id()
    OR public.user_is_superadmin()
  )
  WITH CHECK (
    organization_id = public.user_org_id()
    OR public.user_is_superadmin()
  );
