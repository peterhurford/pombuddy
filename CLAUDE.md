# Pombuddy

Shared Pomodoro timer with structured pre-work and post-work reflection questions. Users create a room, share a link, and everyone sees the same synced timer.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, `src/` directory)
- **Supabase** (Postgres database + Realtime for multi-client sync)
- **Tailwind CSS v4** (styling, dark theme)
- **Vercel** (deployment target)

## Commands

- `make setup` — install deps, create `.env.local`, print Supabase setup instructions
- `make dev` — start dev server (`npm run dev`)
- `make build` — production build (`npm run build`)
- `make lint` — run ESLint (`npm run lint`)

## Project Structure

```
src/
├── app/
│   ├── globals.css              # Dark theme, CSS custom properties, animations
│   ├── layout.tsx               # Root layout (Geist font, metadata)
│   ├── page.tsx                 # Landing page: mode selector + "Create Room"
│   └── room/[id]/page.tsx       # Room page: state machine, timer, questions, realtime
├── components/
│   ├── TimerDisplay.tsx         # Circular SVG countdown with progress ring
│   ├── QuestionCard.tsx         # Card UI for text input or button-select questions
│   ├── PreWorkFlow.tsx          # 5 sequential pre-work reflection questions
│   ├── PostWorkFlow.tsx         # Post-work review (status + conditional follow-ups)
│   ├── CycleHistory.tsx         # List of completed cycles with status badges
│   └── ShareLink.tsx            # Copy room URL to clipboard
└── lib/
    ├── supabase.ts              # Lazy Supabase client singleton (Proxy-based)
    └── types.ts                 # TypeScript types: Room, Cycle, RoomMode, RoomState
```

## Architecture

### Room State Machine

```
LOBBY → PRE_WORK → WORKING → POST_WORK → BREAK → PRE_WORK → ...
```

All state transitions go through Supabase — update the `rooms` row, and all clients receive the change via Realtime subscription.

### Timer Sync

Stores `timer_start` (timestamp) + `timer_duration` (seconds) in the `rooms` table. Each client computes remaining time as `timer_start + timer_duration - now`. No drift because all clients derive from the same source of truth.

### Database Tables

- **`rooms`** — id, mode (`25/5`|`50/10`), state, timer_start, timer_duration, current_cycle
- **`cycles`** — id, room_id (FK), cycle_number, target, first_step, success_criteria, failure_risks, completed_status, incomplete_reason, break_plan

Migration file: `supabase/migrations/001_initial.sql`

### Key Patterns

- All pages are client components (`'use client'`)
- Supabase client is a lazy Proxy singleton — avoids crash at build time when env vars are absent
- Timer uses `setInterval` at 200ms polling against wall clock (not decrement-based) for accuracy
- `timerEndedRef` prevents duplicate timer-end callbacks across re-renders
- Audio notification uses Web Audio API oscillator (no audio files needed)
- RLS is permissive (anyone can read/write) — no auth system yet

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Conventions

- Components are PascalCase in `src/components/`
- All components are client-side (`'use client'`)
- Tailwind uses CSS custom properties defined in `globals.css` (`--accent`, `--card-bg`, etc.)
- No test framework configured yet
