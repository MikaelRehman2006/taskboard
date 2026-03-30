# Internship Assessment — Task Manager (Kanban)

**Mikael Rehman**

---

## 1. Solution overview and design decisions

**Flowboard** is a web Kanban board built with **React**, **TypeScript**, and **Vite**, backed by **Supabase** for persistence, **anonymous (guest) authentication**, and **Row Level Security (RLS)**. The UI follows a dark, product-style layout inspired by tools like Linear and Notion: a single cohesive palette (charcoal surfaces, indigo/violet accents), **DM Sans** for typography, clear separation between columns and cards, and visible loading, error, and empty states.

**Architecture:** The client talks to Supabase directly (no separate backend). On first visit, the app signs the user in **anonymously** so no email or password is required. Each task row stores `user_id`; a **before-insert trigger** sets `user_id` from `auth.uid()` so clients cannot spoof ownership. RLS policies restrict SELECT/INSERT/UPDATE/DELETE to rows where `user_id = auth.uid()`, so different browsers/sessions only see their own tasks.

**Drag-and-drop:** Column drops update `status` in Supabase (`todo`, `in_progress`, `in_review`, `done`). **@dnd-kit** provides pointer and touch sensors so dragging works on desktop and mobile; the board scrolls horizontally on narrow screens so all four columns stay usable.

**Build/deploy:** Environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are read at build time. The repo includes **`vercel.json`** so Vercel outputs from Vite’s **`dist`** directory.

---

## 2. Live application

**https://taskboard-eight-tawny.vercel.app/**

---

## 3. GitHub repository

**https://github.com/MikaelRehman2006/taskboard**

---

## 4. Database schema (SQL)

Run the following in the Supabase **SQL Editor** (also committed as `supabase/schema.sql` in the repository). **Anonymous sign-in** must be enabled under Authentication → Providers.

```sql
-- Enable Anonymous sign-in: Authentication → Providers → Anonymous → ON

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null check (status in ('todo', 'in_progress', 'in_review', 'done')),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  description text,
  priority text default 'normal' check (priority in ('low', 'normal', 'high')),
  due_date date,
  assignee_id uuid
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (user_id, status);

alter table public.tasks enable row level security;

create or replace function public.set_task_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_tasks_set_owner on public.tasks;
create trigger trg_tasks_set_owner
  before insert on public.tasks
  for each row
  execute function public.set_task_owner();

create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);
```

**Optional:** Enable Realtime for `tasks` via Database → Publications → `supabase_realtime`.

**Security note:** Only the **anon** public key is used in the frontend. The **service_role** key is never committed or exposed to the client.

---

## 5. Local setup instructions

**Prerequisites:** Node.js 20+, a Supabase project (free tier).

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/MikaelRehman2006/taskboard.git
   cd taskboard
   npm install
   ```

2. Copy environment template and add your Supabase **Project URL** and **anon / publishable** key:

   ```bash
   cp .env.example .env
   ```

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

3. In Supabase: enable **Anonymous** sign-in; run the SQL schema above (or `supabase/schema.sql`).

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Production build (optional):

   ```bash
   npm run build
   npm run preview
   ```

For **Vercel**, set the same two `VITE_*` variables in the project’s Environment Variables and redeploy after changes.

---

## 6. Advanced features implemented

From the assessment’s optional list, the following are implemented:

| Area | Implementation |
|------|----------------|
| **Due date indicators** | Tasks with a due date show “Due soon” (within a few days) or “Overdue” styling on the card. |
| **Search & filtering** | Search input filters tasks by **title**. Dropdown filters by **priority** (low / normal / high). |
| **Board summary / stats** | Header shows **Total**, **Done**, and **Overdue** counts (overdue excludes completed tasks). |
| **Realtime (optional)** | When `tasks` is added to the `supabase_realtime` publication, the client subscribes to changes scoped by `user_id` and refetches. |

Not implemented in this submission: dedicated **team/assignees UI**, **comments**, **activity log**, and **labels/tags** (the schema includes `assignee_id` for future extension).

---

## 7. Tradeoffs and future improvements

- **Anonymous-only auth:** Keeps onboarding instant and matches the brief, but users cannot recover tasks across devices without migrating to email or OAuth later.
- **Direct Supabase from the browser:** Simple and fast to ship; a backend would help for heavier logic, webhooks, or hiding integration details.
- **Scope vs. time:** Prioritized a polished core board, RLS, and a subset of advanced features (due dates, search, stats) over full team/comments/labels.
- **With more time:** Task detail **drawer** with **comments** and **activity timeline**; **labels** and assignees wired to `assignee_id`; optimistic UI for drag-and-drop; automated tests (E2E for board flows).

---

*This document is for the Next Play Games internship assessment deliverable. Confidential assessment materials are not redistributed.*
