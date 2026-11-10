# BODYCORE GYM V9 - Instalación en Firebase

## 1. Crear proyecto
1. En https://console.firebase.google.com crea un proyecto.
2. En **Configuración del proyecto > Tus apps**, registra una **app web** y copia `firebaseConfig`.
3. Pega los campos `apiKey`, `authDomain`, `projectId`, `appId` en `firebase-config.js`.

## 2. Activar autenticación y base de datos
1. En **Authentication > Sign-in method** activa **Correo electrónico/contraseña**.
2. En **Authentication > Users** crea el usuario administrador con correo y contraseña segura.
3. Copia el **UID** de ese usuario y pégalo en `BODYCORE_ADMIN_UID` de `firebase-config.js`.
4. En **Firestore Database** crea una base de datos (elige región adecuada). No uses reglas abiertas para producción.
5. En Authentication > Settings > Authorized domains verifica el dominio de Hosting.

## 3. Publicar desde la computadora
1. Instala Node.js LTS y abre una terminal en esta carpeta.
2. Ejecuta `npm install -g firebase-tools`.
3. Ejecuta `firebase login`.
4. Ejecuta `firebase use --add` y selecciona tu proyecto (o `firebase deploy --project TU_PROJECT_ID`).
5. Ejecuta `firebase deploy --only hosting,firestore:rules`.
6. Firebase te mostrará la URL pública.

## 4. Primera migración
- Antes de iniciar, exporta un respaldo desde tu versión V9 original.
- En la primera entrada, si Firebase está vacío, el sistema preguntará si deseas importar los datos locales del navegador actual.
- **IMPORTANTE**: solo acepta la importación en el mismo navegador donde ya están los clientes reales. En otro navegador los datos locales pueden ser demostrativos o estar vacíos.
- Verifica los registros después de importar y conserva tu respaldo.

## Limitaciones y precauciones
- Esta versión usa un documento Firestore por gimnasio para mantener compatibilidad con la V9. No está optimizada para varios empleados editando simultáneamente: las escrituras pueden sobrescribirse.
- El documento de Firestore tiene límite de 1 MiB. Evita guardar fotos grandes como base64 en productos.
- El kiosco comparte la sesión del administrador en el mismo navegador. **No uses el kiosco en una pantalla pública sin supervisión**: un kiosco independiente requiere reglas y autenticación específicas.
- No hay sincronización en tiempo real entre pantallas abiertas; recarga para obtener datos recientes. Si hay cambios pendientes, espera a que se guarden antes de cerrar.
- No uses esta adaptación como sistema comercial definitivo sin probar operaciones, copias de seguridad, permisos y recuperación.
- La configuración web de Firebase no es una contraseña. La seguridad depende de Authentication y de las reglas de Firestore.
