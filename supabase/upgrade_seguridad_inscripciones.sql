-- NESPORT: ejecutar en Supabase SQL Editor ANTES de publicar el nuevo código.
-- No elimina participantes ni cambia folios existentes.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS capacity integer;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_capacity_positive;
ALTER TABLE public.events ADD CONSTRAINT events_capacity_positive CHECK (capacity IS NULL OR capacity > 0);
CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_identity_unique
 ON public.registrations (event_id, lower(btrim(full_name)), birth_date);
-- Si el índice anterior falla, revisa inscripciones duplicadas antes de continuar.
CREATE OR REPLACE FUNCTION public.nesport_guard_registration()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_status text; v_capacity integer; v_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.event_id::text, 711));
  SELECT status, capacity INTO v_status, v_capacity FROM public.events WHERE id::text=NEW.event_id;
  IF NOT FOUND OR v_status <> 'published' THEN
    RAISE EXCEPTION 'La carrera no admite inscripciones actualmente.' USING ERRCODE='P0001';
  END IF;
  IF v_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count FROM public.registrations
    WHERE event_id=NEW.event_id AND payment_status IN ('pending','approved');
    IF v_count >= v_capacity THEN
      RAISE EXCEPTION 'Los cupos de esta carrera están agotados.' USING ERRCODE='P0001';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS nesport_registration_guard ON public.registrations;
CREATE TRIGGER nesport_registration_guard BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.nesport_guard_registration();
-- Asegura folios únicos; la función existente de asignación usa bloqueo por carrera.
CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_folio_key ON public.registrations(event_id,folio);
