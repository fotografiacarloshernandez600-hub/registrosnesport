-- Nesport: calcetas por carrera y galería de fotografías de participantes.
-- Ejecutar una sola vez en Supabase > SQL Editor.

alter table public.events add column if not exists socks_image text;

alter table public.portfolio_items drop constraint if exists portfolio_items_category_check;
alter table public.portfolio_items add constraint portfolio_items_category_check
  check (category in ('playeras','medallas','dorsales','calcetas','eventos'));

create table if not exists public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_name text not null,
  caption text,
  image_url text not null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.event_photos enable row level security;
create index if not exists event_photos_event_status_created
  on public.event_photos(event_id,status,created_at desc);
