-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Patrocinadores y logotipos asociados a cada carrera.
create table if not exists public.event_sponsors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  logo_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists event_sponsors_event_sort
on public.event_sponsors(event_id,sort_order,created_at);
alter table public.event_sponsors enable row level security;

