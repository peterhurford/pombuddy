-- Participants table: tracks who is in a room
create table participants (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(id) on delete cascade,
  name text not null,
  emoji text not null,
  current_target text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_participants_room_id on participants(room_id);

-- Enable Realtime
alter publication supabase_realtime add table participants;

-- Permissive RLS (matching existing pattern)
alter table participants enable row level security;

create policy "Allow all reads on participants"
  on participants for select using (true);

create policy "Allow all inserts on participants"
  on participants for insert with check (true);

create policy "Allow all updates on participants"
  on participants for update using (true);

create policy "Allow all deletes on participants"
  on participants for delete using (true);
