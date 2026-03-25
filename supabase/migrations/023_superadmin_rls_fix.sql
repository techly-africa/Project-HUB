-- Migration 023: Superadmin RLS Fix
-- Ensures superadmins can see and manage all resources, bypassing organization-specific checks.

-- 1. Organizations (Ensure superadmin can see all orgs)
-- (Already handled by superadmin_all_orgs in 020)

-- 2. Projects
DROP POLICY IF EXISTS "org_select_projects" ON public.projects;
CREATE POLICY "org_select_projects" ON public.projects
  FOR SELECT USING (organization_id = public.user_org_id() OR public.user_is_superadmin());

DROP POLICY IF EXISTS "org_insert_projects" ON public.projects;
CREATE POLICY "org_insert_projects" ON public.projects
  FOR INSERT WITH CHECK (organization_id = public.user_org_id() OR public.user_is_superadmin());

DROP POLICY IF EXISTS "org_update_projects" ON public.projects;
CREATE POLICY "org_update_projects" ON public.projects
  FOR UPDATE
  USING (organization_id = public.user_org_id() OR public.user_is_superadmin())
  WITH CHECK (organization_id = public.user_org_id() OR public.user_is_superadmin());

DROP POLICY IF EXISTS "org_delete_projects" ON public.projects;
CREATE POLICY "org_delete_projects" ON public.projects
  FOR DELETE USING (organization_id = public.user_org_id() OR public.user_is_superadmin());

-- 3. Plans
DROP POLICY IF EXISTS "org_plans" ON public.plans;
CREATE POLICY "org_plans" ON public.plans
  FOR ALL
  USING (
    project_id IN (SELECT id FROM public.projects WHERE organization_id = public.user_org_id())
    OR public.user_is_superadmin()
  )
  WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE organization_id = public.user_org_id())
    OR public.user_is_superadmin()
  );

-- 4. Phases
DROP POLICY IF EXISTS "org_phases" ON public.phases;
CREATE POLICY "org_phases" ON public.phases
  FOR ALL
  USING (
    plan_id IN (
      SELECT pl.id FROM public.plans pl
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
    OR public.user_is_superadmin()
  )
  WITH CHECK (
    plan_id IN (
      SELECT pl.id FROM public.plans pl
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
    OR public.user_is_superadmin()
  );

-- 5. Tasks
DROP POLICY IF EXISTS "org_tasks" ON public.tasks;
CREATE POLICY "org_tasks" ON public.tasks
  FOR ALL
  USING (
    phase_id IN (
      SELECT ph.id FROM public.phases ph
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
    OR public.user_is_superadmin()
  )
  WITH CHECK (
    phase_id IN (
      SELECT ph.id FROM public.phases ph
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
    OR public.user_is_superadmin()
  );

-- 6. Task Comments
DROP POLICY IF EXISTS "org_task_comments" ON public.task_comments;
CREATE POLICY "org_task_comments" ON public.task_comments
  FOR ALL
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.phases ph ON t.phase_id = ph.id
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
    OR public.user_is_superadmin()
  )
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.phases ph ON t.phase_id = ph.id
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
    OR public.user_is_superadmin()
  );

-- 7. Task Attachments
DROP POLICY IF EXISTS "org_task_attachments" ON public.task_attachments;
CREATE POLICY "org_task_attachments" ON public.task_attachments
  FOR ALL
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.phases ph ON t.phase_id = ph.id
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
    OR public.user_is_superadmin()
  )
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.phases ph ON t.phase_id = ph.id
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
    OR public.user_is_superadmin()
  );

-- 8. Documents
DROP POLICY IF EXISTS "org_documents" ON public.documents;
CREATE POLICY "org_documents" ON public.documents
  FOR ALL
  USING (organization_id = public.user_org_id() OR public.user_is_superadmin())
  WITH CHECK (organization_id = public.user_org_id() OR public.user_is_superadmin());

-- 9. Document Folders
DROP POLICY IF EXISTS "org members can view folders" ON public.document_folders;
CREATE POLICY "org members can view folders" ON public.document_folders
  FOR SELECT USING (organization_id = public.user_org_id() OR public.user_is_superadmin());

DROP POLICY IF EXISTS "org members can create folders" ON public.document_folders;
CREATE POLICY "org members can create folders" ON public.document_folders
  FOR INSERT WITH CHECK (organization_id = public.user_org_id() OR public.user_is_superadmin());

DROP POLICY IF EXISTS "org members can delete folders" ON public.document_folders;
CREATE POLICY "org members can delete folders" ON public.document_folders
  FOR DELETE USING (organization_id = public.user_org_id() OR public.user_is_superadmin());

DROP POLICY IF EXISTS "org members can update folders" ON public.document_folders;
CREATE POLICY "org members can update folders" ON public.document_folders
  FOR UPDATE USING (organization_id = public.user_org_id() OR public.user_is_superadmin());
