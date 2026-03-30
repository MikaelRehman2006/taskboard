# Flowboard — Kanban task board

React + TypeScript + Vite + Supabase (anonymous auth, RLS) for the Next Play Games SDE assessment: a four-column Kanban board with drag-and-drop, polished UI, search, priority filter, due-date cues, and board stats.

## Prerequisites

- Node 20+
- A [Supabase](https://supabase.com/) project on the free tier

## Supabase setup

1. Create a project, then open **Authentication → Providers** and enable **Anonymous** sign-in.
2. In **SQL Editor**, run the script in [`supabase/schema.sql`](./supabase/schema.sql).
3. (Optional) Enable realtime for `tasks`: **Database → Publications → supabase_realtime** → add table `tasks`.
4. Copy **Project URL** and **anon public** key from **Project Settings → API**.

## Local run

```bash
cp .env.example .env
# Edit .env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (anon only — never commit .env)

npm install
npm run dev
```

## Deploy (assessment)

Host the built app on [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or [Cloudflare Pages](https://pages.cloudflare.com/). Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the project environment. This repo includes `vercel.json` so Vercel uses Vite’s **`dist`** folder (not `build`).

## GitHub

Remote: `https://github.com/MikaelRehman2006/taskboard.git` — push updates with `git push origin main`.

## Advanced features included

- Search by title, filter by priority
- Due date indicators (soon / overdue) on cards and overdue count in the header
- Board summary: total, done, overdue
- Supabase realtime subscription (when publication includes `tasks`)

Do **not** commit the service role key or a populated `.env` file.
