# Actualización de seguridad de inscripciones Nesport

1. Hacer respaldo de Supabase (base de datos y archivos) y probar en proyecto de staging.
2. Ejecutar `supabase/upgrade_seguridad_inscripciones.sql` en Supabase SQL Editor. **Si falla el índice de identidad por duplicados, NO continúes:** revisa esos datos antes de repetir el script.
3. Desplegar el código junto con el SQL. Las inscripciones usan carga directa mediante URL firmada de Supabase Storage; el bucket `payment-receipts` debe existir y `event-assets` debe existir.
4. Configurar `SUPABASE_URL` y `SUPABASE_SECRET_KEY` en Vercel, solo servidor. Nunca usar la secret key en el cliente.
5. En cada carrera nueva o existente, configurar el cupo desde el administrador. Si está vacío no se aplica límite. Los registros pendientes también reservan cupo; los rechazados no.
6. Probar: registro normal, comprobante 5 MB, foto 5 MB, doble clic, dos solicitudes simultáneas, carrera cerrada, cupo agotado, aprobar dos pagos a la vez, y galería e imágenes.
7. **Limitaciones**: no se han ejecutado pruebas de carga reales ni verificado los datos existentes de Supabase. No desplegar en producción sin pruebas en staging. La foto promocional se almacena en bucket público; requiere revisar política de privacidad y consentimiento. El sistema no implementa aún rate limiting ni limpieza automática de cargas abandonadas. Vercel Hobby tiene restricciones de uso comercial.
