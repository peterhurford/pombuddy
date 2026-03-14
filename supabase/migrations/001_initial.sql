-- Create rooms table
create table rooms (
  id text primary key,
  created_at timestamptz default now(),
  mode text not null default '25/5' check (mode in ('25/5', '50/10')),
  state text not null default 'lobby' check (state in ('lobby', 'pre_work', 'working', 'post_work', 'break')),
  timer_start timestamptz,
  timer_duration int,
  current_cycle int not null default 1,
  paused boolean not null default false,
  paused_remaining int
);

-- Create cycles table
create table cycles (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(id) on delete cascade,
  cycle_number int not null,
  target text,
  first_step text,
  success_criteria text,
  failure_risks text,
  completed_status text check (completed_status in ('yes', 'mostly_yes', 'mostly_no', 'no')),
  incomplete_reason text,
  break_plan text,
  created_at timestamptz default now()
);

-- Enable Realtime on rooms table
alter publication supabase_realtime add table rooms;

-- Enable RLS (with permissive policies for simplicity)
alter table rooms enable row level security;
alter table cycles enable row level security;

create policy "Anyone can read rooms" on rooms for select using (true);
create policy "Anyone can insert rooms" on rooms for insert with check (true);
create policy "Anyone can update rooms" on rooms for update using (true);

create policy "Anyone can read cycles" on cycles for select using (true);
create policy "Anyone can insert cycles" on cycles for insert with check (true);
create policy "Anyone can update cycles" on cycles for update using (true);
