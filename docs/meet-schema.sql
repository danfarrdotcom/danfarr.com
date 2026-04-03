-- Run this in your Supabase SQL editor

-- Availability rules: recurring weekly windows
create table availability_rules (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'admin',
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Sun
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Europe/London',
  created_at timestamptz not null default now()
);

-- Slot types: e.g. "30 min chat", "60 min deep dive"
create table slot_types (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'admin',
  title text not null,
  duration_minutes int not null,
  buffer_minutes int not null default 0,
  slug text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Calendar IDs to check for conflicts (beyond just 'primary')
create table synced_calendars (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'admin',
  calendar_id text not null,
  label text,
  created_at timestamptz not null default now(),
  unique(user_id, calendar_id)
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  slot_type_id uuid not null references slot_types(id),
  user_id text not null default 'admin',
  guest_name text not null,
  guest_email text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  google_event_id text,
  google_meet_link text,
  cancel_token text not null default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at timestamptz not null default now()
);

-- Date-specific overrides (block days off, add extra hours)
create table availability_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'admin',
  date date not null,
  start_time time, -- null = blocked entire day
  end_time time,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_bookings_time on bookings(starts_at, ends_at) where status = 'confirmed';
create index idx_availability_rules_user on availability_rules(user_id, day_of_week);
create index idx_slot_types_slug on slot_types(slug);

-- Admin OAuth tokens (for server-side Google Calendar access)
create table admin_tokens (
  user_id text primary key default 'admin',
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- RLS
alter table availability_rules enable row level security;
alter table slot_types enable row level security;
alter table bookings enable row level security;
alter table availability_overrides enable row level security;
alter table synced_calendars enable row level security;

-- Public read for slot_types (active only)
create policy "Public can read active slot types" on slot_types
  for select using (active = true);

-- Public can read availability rules (needed to show open slots)
create policy "Public can read availability rules" on availability_rules
  for select using (true);

-- Public can read overrides (needed for availability calc)
create policy "Public can read overrides" on availability_overrides
  for select using (true);

-- Public can read confirmed bookings (needed to check conflicts)
create policy "Public can read bookings" on bookings
  for select using (status = 'confirmed');

-- Public can insert bookings (guests booking)
create policy "Public can create bookings" on bookings
  for insert with check (true);

-- Service role handles admin writes via server-side calls
