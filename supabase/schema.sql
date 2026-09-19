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
  hero_image text,
  shirt_image text,
  bib_image text,
  medal_image text,
  kit_image text,
  prizes text,
  faq text,
  status text not null default 'draft' check (status in ('draft','published','coming_soon','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  folio text,
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
  kit_delivered_at timestamptz,
  kit_delivered_by text,
  race_time_ms bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.event_sponsors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  logo_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.event_sponsors enable row level security;

create index if not exists idx_events_status_date on public.events(status,event_date);
create index if not exists idx_registrations_event_status on public.registrations(event_id,payment_status);
create index if not exists idx_registrations_event_time on public.registrations(event_id,race_time_ms) where race_time_ms is not null;
create unique index if not exists registrations_event_folio_key on public.registrations(event_id,folio);

alter table public.events enable row level security;
alter table public.registrations enable row level security;

insert into storage.buckets (id,name,public)
values ('payment-receipts','payment-receipts',false)
on conflict (id) do nothing;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('event-assets','event-assets',true,6291456,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.assign_folio_on_payment_approval()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare next_number integer;
begin
  if new.payment_status='approved' and old.payment_status is distinct from 'approved' and new.folio is null then
    perform pg_advisory_xact_lock(hashtextextended(new.event_id::text,0));
    select coalesce(max((split_part(folio,'.',2))::integer),0)+1 into next_number
    from public.registrations where event_id=new.event_id and folio ~ '^0\.[0-9]+$';
    new.folio := '0.' || lpad(next_number::text,3,'0');
  end if;
  return new;
end;
$$;
create trigger registrations_assign_folio_on_approval before update of payment_status
on public.registrations for each row execute function public.assign_folio_on_payment_approval();
