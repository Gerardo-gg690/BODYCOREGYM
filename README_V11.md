# BODYCORE GYM V11

- Configuración Firebase de tu proyecto incluida.
- Botón salir y actualización manual en el panel.
- Escucha en tiempo real de Firestore en el panel.
- Kiosco: escritura mediante transacción en Firestore y animación de confirmación.
- Recordatorios de vencimiento (0–3 días): enlaces para enviar **manualmente** por WhatsApp. **No hay envío automático**: eso requiere WhatsApp Business Platform, consentimiento de los clientes, plantillas aprobadas y backend programado.

## Importante
- La pantalla `kiosco.html` aún exige autenticación de administrador para acceder a Firestore. **No compartas credenciales de administrador con clientes ni publiques el kiosco como autoservicio público**. Para kiosco público se requiere una API protegida, App Check y reglas específicas.
- El sistema usa un documento agregado para datos. No está diseñado para alta concurrencia: probar y migrar a colecciones por entidad antes de comercializar.
- Guarda respaldo de los datos actuales antes de reemplazar archivos.
- Publica el contenido de esta carpeta en la raíz del repositorio GitHub Pages.
- Los cambios del kiosco se ven en el panel mediante `onSnapshot` si ambos están autenticados y conectados.
- No se han ejecutado pruebas integrales con el proyecto Firebase real.
