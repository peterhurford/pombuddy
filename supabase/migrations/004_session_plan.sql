-- Each participant gets their own session plan and completion tracking
alter table participants add column session_plan jsonb default '[]'::jsonb;
alter table participants add column plan_completed jsonb default '[]'::jsonb;
