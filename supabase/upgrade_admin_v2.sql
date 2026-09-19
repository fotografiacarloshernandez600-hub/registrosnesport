-- Ejecutar una sola vez en Supabase > SQL Editor para habilitar el panel Nesport v2.
alter table public.events add column if not exists hero_image text;
alter table public.events add column if not exists shirt_image text;
alter table public.events add column if not exists bib_image text;
alter table public.events add column if not exists medal_image text;
alter table public.events add column if not exists kit_image text;
alter table public.events add column if not exists prizes text;
alter table public.events add column if not exists faq text;

create index if not exists idx_registrations_event_time
on public.registrations(event_id,race_time_ms)
where race_time_ms is not null;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('event-assets','event-assets',true,6291456,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update
set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

alter table public.events enable row level security;
alter table public.registrations enable row level security;
