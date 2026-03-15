-- Migration 015: In-app notifications

CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       text NOT NULL,   -- 'task_assigned' | 'task_comment' | 'task_status' | 'task_deadline' | 'invite'
  title      text NOT NULL,
  body       text,
  task_id    text REFERENCES public.tasks(id) ON DELETE CASCADE,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx    ON public.notifications(user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own notifications
CREATE POLICY "own_notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role (used by admin actions) bypasses RLS automatically
