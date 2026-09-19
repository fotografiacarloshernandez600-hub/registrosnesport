-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Control digital de entrega de kits por corredor y carrera.
alter table public.registrations add column if not exists kit_delivered_at timestamptz;
alter table public.registrations add column if not exists kit_delivered_by text;
create index if not exists registrations_event_kit_delivery
on public.registrations(event_id,kit_delivered_at);

