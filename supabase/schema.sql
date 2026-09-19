create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  location text not null,
  event_date timestamptz not null,
  price integer not null check (price >= 0),
  categories text not null,
  includes text not null,
  waiver text not null,
  privacy text not null,
  bank_name text not null,
  bank_holder text not null,
  bank_account text not null,
  bank_clabe text not null,
  status text not null default 'draft' check (status in ('draft','published','coming_soon','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  folio text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  birth_date date not null,
  gender text not null,
  category text not null,
  shirt_size text not null,
  city text not null,
  club text,
  emergency_name text not null,
  emergency_phone text not null,
  receipt_key text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','approved','rejected')),
  race_time_ms bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_status_date on public.events(status,event_date);
create index if not exists idx_registrations_event_status on public.registrations(event_id,payment_status);

alter table public.events enable row level security;
alter table public.registrations enable row level security;

insert into storage.buckets (id,name,public)
values ('payment-receipts','payment-receipts',false)
on conflict (id) do nothing;
