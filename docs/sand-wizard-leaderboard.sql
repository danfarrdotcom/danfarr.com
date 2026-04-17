-- Sand Wizard Leaderboard
-- Run this in the Supabase SQL editor

create table if not exists sand_wizard_scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 20),
  score integer not null check (score > 0),
  created_at timestamptz not null default now()
);

-- Index for fast top-scores query
create index if not exists idx_sand_wizard_scores_score on sand_wizard_scores (score desc);

-- RLS: anyone can read, anyone can insert (no auth required)
alter table sand_wizard_scores enable row level security;

create policy "Anyone can read scores" on sand_wizard_scores for select using (true);
create policy "Anyone can insert scores" on sand_wizard_scores for insert with check (true);
