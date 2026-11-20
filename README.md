# HUNDRA Community

App pública e instalable para jugadores y familias de HUNDRA Sports. Negro, blanco y azul oscuro, con identidad visual de HUNDRA. No incluye tienda.

## Uso

- Inicio reúne el calendario anual completo, jugador de la semana, jugador del mes, News y newsletter mensual.
- News con el diseño completo y el texto de cada publicación.
- Calendario de temporada del 1 de septiembre de 2026 al 31 de agosto de 2027, con doce meses, fechas señaladas e información al pasar el ratón o enfocar con teclado.
- Al pulsar una fecha se abre su ficha de torneo, quedada, gira o charla. Estas actividades no tienen pestañas visibles en la navegación.
- Avisos de WhatsApp según la sección, sin aviso en giras ni actividades de empresa.
- HUNDRA Performance enlaza el formulario externo para activar o actualizar el planning físico.
- Los torneos permiten adjuntar hasta 10 PDF de 10 MB y abrirlos desde sus publicaciones; los PDF de borradores requieren sesión de edición.
- Sin formularios públicos, solicitudes de regalos ni enlaces de gestión directa. El receptor de inscripciones públicas está desactivado.
- Instalación PWA con estilo iOS, publicaciones completas sin ventanas de detalle, calendario interactivo para consultar actividades.

Antonio edita en `/admin`: crea, duplica, sube imágenes, guarda borradores y publica. La contraseña y los datos de las familias no forman parte de este repositorio. El contenido y las imágenes editoriales se guardan en almacenamiento privado R2; solo las publicaciones activas se sirven por la API pública. El código fuente público y el contenido editorial son independientes.

Consulta [GUIA-ANTONIO.md](GUIA-ANTONIO.md) para la edición semanal.

## Desarrollo

Node.js >=22.13 y npm. `npm run install:ci`, `npm run dev`, `npx tsc --noEmit`, `node scripts/check-season.mjs`, `npm run build`.

El servidor se ejecuta como Cloudflare Worker con Vinext/React. Conserva la integración de Sites en `vite.config.ts`. El binding R2 `BUCKET` se declara en `.openai/hosting.json`. Configura `ADMIN_PASSWORD` y `SESSION_SECRET` como secretos del servidor; en local se pueden definir en `.dev.vars`, que está ignorado por Git.

La publicación se realiza mediante Sites, después de sincronizar y guardar una versión del código. GitHub conserva una copia del código; un cambio en GitHub por sí solo no despliega esta app. La edición semanal en el panel sí actualiza directamente el contenido sin desplegar de nuevo.

App pública: https://hundracommunity.app. Panel: https://hundracommunity.app/admin. Dominio registrado en Hostinger, con DNS y HTTPS activos verificados el 19 de noviembre de 2026. La dirección de plataforma https://hundra-community.opalescentpaper1.chatgpt.site sigue disponible.

## Operación

Sesión de edición HttpOnly, SameSite y caducidad de ocho horas; las escrituras exigen sesión y origen de la app. Se limitan los intentos de acceso al panel por IP. La publicación usa ETag para impedir que dos ediciones se sobrescriban. Cada guardado conserva una versión anterior del contenido en R2; esto no sustituye un backup externo independiente. Exportación manual del contenido desde el panel.

Las familias consultan el contenido y gestionan cualquier interés o consulta avisando en su grupo habitual de WhatsApp. La newsletter mensual se publica dentro de la app y no envía correos. El histórico privado de solicitudes anteriores se conserva para Antonio; no se aceptan nuevas inscripciones en la web.

La app necesita conexión para cargar noticias y datos actuales. Sin conexión muestra una página de aviso; no almacena en caché el panel ni los datos de las familias.

## Derechos

El logotipo, los diseños y los materiales de HUNDRA pertenecen a sus titulares. La visibilidad pública del repositorio no concede una licencia sobre ellos.
