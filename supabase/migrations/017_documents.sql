-- Migration 017: Document Repository
-- A per-org document store. Each row is either a direct upload (source='direct')
-- or a reference to an existing task attachment (source='task').
-- Both use the same 'task-attachments' storage bucket; direct uploads are stored
-- under the prefix 'repository/'.

CREATE TABLE IF NOT EXISTS public.documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name               text NOT NULL,
  storage_path       text NOT NULL,
  size               bigint,
  mime_type          text,
  source             text NOT NULL DEFAULT 'direct' CHECK (source IN ('direct', 'task')),
  task_attachment_id uuid REFERENCES public.task_attachments(id) ON DELETE SET NULL,
  uploaded_by        uuid REFERENCES auth.users(id),
  created_at         timestamptz DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_documents" ON public.documents
  FOR ALL
  USING (organization_id = public.user_org_id())
  WITH CHECK (organization_id = public.user_org_id());
