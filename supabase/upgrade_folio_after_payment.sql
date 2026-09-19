-- Ejecutar una sola vez después de upgrade_portfolio_quotes_folios.sql.
-- El folio se asigna únicamente cuando el administrador aprueba el pago.

alter table public.registrations alter column folio drop not null;
alter table public.registrations drop constraint if exists registrations_folio_key;

drop trigger if exists registrations_assign_event_folio on public.registrations;
drop trigger if exists registrations_assign_folio_on_approval on public.registrations;

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
    select coalesce(max((split_part(folio,'.',2))::integer),0)+1
      into next_number
      from public.registrations
     where event_id = new.event_id and folio ~ '^0\.[0-9]+$';
    new.folio := '0.' || lpad(next_number::text,3,'0');
  end if;
  return new;
end;
$$;

-- Los pagos aún pendientes no deben conservar un folio provisional.
update public.registrations
set folio = null
where payment_status <> 'approved';

create unique index if not exists registrations_event_folio_key
on public.registrations(event_id,folio);

create trigger registrations_assign_folio_on_approval
before update of payment_status on public.registrations
for each row execute function public.assign_folio_on_payment_approval();

