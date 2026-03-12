# Rukisha — Merchant Lending Project Tracker

Next.js 14 + Supabase project management tool for the Rukisha merchant lending implementation.

## Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Your `.env.local` is already configured with:
```
NEXT_PUBLIC_SUPABASE_URL=https://rmqnwesgfbdxnarkhcos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Run Supabase migrations
Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/rmqnwesgfbdxnarkhcos/sql) and run these files **in order**:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/002_auth_rls.sql`

### 4. Configure magic link redirect URL
In your Supabase dashboard → Authentication → URL Configuration, add:
```
http://localhost:3000/auth/callback
```
(Add your production URL too when you deploy.)

### 5. Start the app
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Authentication
- Passwordless magic link via email
- Only `@rukisha.co.rw` email addresses are allowed
- All other domains are rejected at both middleware and auth callback level

## Features
- **Dashboard** — overall progress, blocked items, immediate actions
- **Tech Plan** — 8 phases, 29 tasks aligned to March 2026 status
- **Ops Plan** — 6 phases, 22 tasks aligned to March 2026 status
- **Live status updates** — click any status badge to cycle through states
- **Task notes** — click any task row to expand remarks
- **Real-time persistence** — all updates saved to Supabase instantly

## Status values
| Status | Meaning |
|--------|---------|
| Not Started | Work hasn't begun |
| In Progress | Actively being worked on |
| Completed | Done and verified |
| Blocked | Cannot proceed — action required |
| N/A | Not applicable to this project |
