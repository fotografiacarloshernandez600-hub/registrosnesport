-- Ejecutar una sola vez en Supabase SQL Editor.
-- Foto opcional de bienvenida con consentimiento explícito y folios 001, 002, 003...

alter table public.registrations
  add column if not exists marketing_photo_url text,
  add column if not exists marketing_photo_consent boolean not null default false;

alter table public.registrations alter column folio drop not null;
alter table public.registrations drop constraint if exists registrations_folio_key;

-- Normaliza los folios anteriores del formato 0.001 a 001.
update public.registrations set folio = substring(folio from 3) where folio ~ '^0\.[0-9]{3}$';

create or replace function public.assign_folio_on_payment_approval()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare next_number integer;
begin
  if new.payment_status = 'approved'
     and old.payment_status is distinct from 'approved'
     and new.folio is null then
    perform pg_advisory_xact_lock(hashtextextended(new.event_id::text, 0));
    select coalesce(max(folio::integer), 0) + 1
      into next_number
      from public.registrations
     where event_id = new.event_id and folio ~ '^[0-9]{3}$';
    new.folio := lpad(next_number::text, 3, '0');
  end if;
  return new;
end;
$$;

-- Mantiene folios existentes con formato antiguo si ya se asignaron; los nuevos serán 001, 002...
drop trigger if exists registrations_assign_folio_on_approval on public.registrations;
create trigger registrations_assign_folio_on_approval
before update of payment_status on public.registrations
for each row execute function public.assign_folio_on_payment_approval();
