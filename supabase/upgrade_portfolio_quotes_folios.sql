-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Galería administrable, solicitudes de cotización y folios independientes por carrera.

alter table public.registrations drop constraint if exists registrations_folio_key;
alter table public.registrations alter column folio drop not null;
create unique index if not exists registrations_event_folio_key
on public.registrations(event_id,folio);

create or replace function public.assign_event_folio()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare next_number integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.event_id::text, 0));
  select coalesce(max((split_part(folio,'.',2))::integer),0)+1
    into next_number
    from public.registrations
   where event_id = new.event_id and folio ~ '^0\.[0-9]+$';
  new.folio := '0.' || lpad(next_number::text,3,'0');
  return new;
end;
$$;

drop trigger if exists registrations_assign_event_folio on public.registrations;
create trigger registrations_assign_event_folio
before insert on public.registrations
for each row when (new.folio is null or new.folio = '')
execute function public.assign_event_folio();

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check(category in ('playeras','medallas','dorsales','eventos')),
  title text not null,
  description text,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  organization text,
  phone text not null,
  email text not null,
  city text not null,
  event_type text not null,
  estimated_runners integer not null check(estimated_runners > 0),
  target_date date,
  services text not null,
  details text,
  status text not null default 'new' check(status in ('new','contacted','quoted','closed')),
  created_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;
alter table public.quote_requests enable row level security;
create index if not exists portfolio_items_category_sort on public.portfolio_items(category,sort_order,created_at desc);
create index if not exists quote_requests_status_created on public.quote_requests(status,created_at desc);

