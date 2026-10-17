-- ========================================================
-- HACKMATE SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (1-Click Run)
-- ========================================================

-- 1. STUDENTS TABLE
create table if not exists public.students (
  id text primary key,
  name text not null,
  college text,
  branch text,
  div text,
  email text,
  github text,
  linkedin text,
  phone text,
  resume text,
  title text,
  preferred_role text,
  preferred_roles jsonb default '[]'::jsonb,
  experience_level text,
  availability_hours integer default 20,
  past_hackathons integer default 0,
  bio text,
  skills jsonb default '[]'::jsonb,
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. TEAMS TABLE
create table if not exists public.teams (
  id text primary key,
  name text not null,
  hackathon_id text,
  hackathon_title text,
  leader_id text,
  members jsonb default '[]'::jsonb,
  status text default 'Recruiting',
  max_members integer default 4,
  pitch text,
  looking_for_roles jsonb default '[]'::jsonb,
  required_skills jsonb default '[]'::jsonb,
  experience_level text,
  time_commitment text,
  working_mode text,
  requirements_note text,
  project_links jsonb default '{}'::jsonb,
  milestones jsonb default '[]'::jsonb,
  canvas_notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TEAM MESSAGES TABLE
create table if not exists public.team_messages (
  id text primary key,
  team_id text not null,
  sender_id text,
  sender_name text,
  sender_avatar text,
  sender_role text,
  text text not null,
  is_code boolean default false,
  is_system boolean default false,
  timestamp text,
  created_at timestamptz default now()
);

-- 4. NOTIFICATIONS & INVITES TABLE
create table if not exists public.notifications (
  id text primary key,
  type text not null,
  recipient_id text not null,
  sender_team_id text,
  sender_team_name text,
  sender_leader_name text,
  applicant_id text,
  applicant_name text,
  hackathon_id text,
  hackathon_title text,
  role_offered text,
  message text,
  match_score integer default 85,
  status text default 'PENDING',
  timestamp text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Realtime for all 4 tables so changes push live to all browsers!
alter publication supabase_realtime add table public.students;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.team_messages;
alter publication supabase_realtime add table public.notifications;

-- Enable Row Level Security (RLS) and allow public access
alter table public.students enable row level security;
alter table public.teams enable row level security;
alter table public.team_messages enable row level security;
alter table public.notifications enable row level security;

create policy "Public Read Students" on public.students for select using (true);
create policy "Public Write Students" on public.students for insert with check (true);
create policy "Public Update Students" on public.students for update using (true);

create policy "Public Read Teams" on public.teams for select using (true);
create policy "Public Write Teams" on public.teams for insert with check (true);
create policy "Public Update Teams" on public.teams for update using (true);
create policy "Public Delete Teams" on public.teams for delete using (true);

create policy "Public Read Messages" on public.team_messages for select using (true);
create policy "Public Insert Messages" on public.team_messages for insert with check (true);

create policy "Public Read Notifications" on public.notifications for select using (true);
create policy "Public Write Notifications" on public.notifications for insert with check (true);
create policy "Public Update Notifications" on public.notifications for update using (true);
