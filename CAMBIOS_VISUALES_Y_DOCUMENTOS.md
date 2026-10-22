# Nesport — ajustes visuales y documentos

## Cambios incluidos
- Logotipo de Nesport sin fondo blanco y con recorte más limpio.
- Galería del inicio más compacta; imágenes de productos en modo `contain` y ampliación en lightbox.
- Logotipo individual por carrera en la ficha del evento, en lugar de destacar la primera categoría dentro de una tarjeta roja.
- Secciones de premios, contenido del kit e indicaciones logísticas con tarjetas visuales.
- Imágenes de playera, medalla, dorsal, kit y calcetas con visualización ampliada.
- Patrocinadores clicables con descripción en modal; el administrador permite agregar y actualizar descripciones.
- Carta responsiva y aviso de privacidad cargables como PDF desde administración.
- Campos configurables para acceso, calentamiento, entrega del kit y concepto de pago.
- Recordatorio de llegada anticipada y datos logísticos en la confirmación del comprobante y al aprobar el pago en el administrador.
- Comunidad fotográfica al final de la ficha, disponible 12 horas después de la hora programada de inicio, y envío restringido a corredores con inscripción aprobada para esa carrera.

## Aplicación
1. En Supabase, ejecutar `supabase/upgrade_nesport_visual_documents.sql`.
2. Publicar el contenido del proyecto en el repositorio y esperar el despliegue de Vercel.
3. En administración, volver a guardar o cargar los logotipos de carrera, PDFs, horarios y descripciones que correspondan.
4. Verificar en una carrera de prueba que la carga de documentos y la galería de participantes funcionan con las credenciales y el bucket de Supabase del proyecto.

## Importante
La galería comunitaria se habilita 12 horas después del inicio programado porque el esquema actual no tiene un campo separado de hora de finalización de carrera. Si el evento dura más, se debe ajustar ese umbral o agregar una hora de cierre específica.
