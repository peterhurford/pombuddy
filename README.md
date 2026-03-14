# Pombuddy

A shared Pomodoro timer where you create a room, share a link, and everyone sees the same synced countdown. Includes structured reflection questions before and after each work cycle.

## Features

- **Shared timer** — all participants see the same countdown, synced via Supabase Realtime
- **Two modes** — 25/5 (classic Pomodoro) or 50/10 (deep work)
- **Pre-work reflection** — 5 questions to set intentions before each cycle
- **Post-work review** — rate completion, reflect on what happened, plan your break
- **Cycle history** — track your completed cycles and their outcomes

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project. You'll need the project URL and anon key from Settings > API.

### 2. Run setup

```bash
make setup
```

This installs dependencies and creates `.env.local`. Edit it with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the database migration

Open the Supabase SQL Editor (Dashboard > SQL Editor) and paste the contents of `supabase/migrations/001_initial.sql`. Run it.

This creates the `rooms` and `cycles` tables, enables Realtime on rooms, and sets up permissive RLS policies.

### 4. Start the dev server

```bash
make dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Pick a timer mode (25/5 or 50/10) and click **Create Room**
2. Share the room link with your co-working buddies
3. Click **Start First Cycle** — everyone answers 5 reflection questions
4. Timer counts down — all participants see the same time remaining
5. When the timer ends, answer post-work review questions
6. Break timer starts, then the next cycle begins

## How the Timer Sync Works

The timer doesn't count down on a per-client basis. Instead, Supabase stores the `timer_start` timestamp and `timer_duration` in seconds. Each client computes remaining time as:

```
remaining = timer_start + timer_duration - now
```

This means all clients always agree on the time, regardless of when they joined or any network delays.

## Deployment

Built for Vercel:

```bash
make build
```

Set the same environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in your Vercel project settings.
