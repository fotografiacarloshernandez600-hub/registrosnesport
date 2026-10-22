-- Nesport: logotipo por carrera, documentos PDF, horarios, descripciones de patrocinadores.
alter table public.events add column if not exists event_logo text;
alter table public.events add column if not exists waiver_pdf text;
alter table public.events add column if not exists privacy_pdf text;
alter table public.events add column if not exists access_time text;
alter table public.events add column if not exists warmup_time text;
alter table public.events add column if not exists kit_pickup_info text;
alter table public.events add column if not exists payment_concept text;
alter table public.event_sponsors add column if not exists description text;

-- El bucket de recursos de eventos debe aceptar imágenes y documentos PDF.
update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','application/pdf']
where id = 'event-assets';
