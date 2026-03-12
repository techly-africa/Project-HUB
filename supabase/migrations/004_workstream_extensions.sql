-- Migration 004: Workstream Extensions
-- Run this in your Supabase SQL editor

-- ── Profiles ───────────────────────────────────────────────────────────────
-- Table to hold user public info for assignment selection
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync new users
-- Drop if exists to avoid errors on reapplying
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fill profiles for existing users
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ── Tasks Updates ─────────────────────────────────────────────────────────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id);

-- ── Comments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS Policies ──────────────────────────────────────────────────────────
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Profiles: everyone can read, user can update self
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Comments: read by anyone, insert by authed users
CREATE POLICY "Public read comments" ON public.task_comments FOR SELECT USING (true);
CREATE POLICY "Authed users can comment" ON public.task_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can edit own comments" ON public.task_comments FOR UPDATE USING (auth.uid() = user_id);
