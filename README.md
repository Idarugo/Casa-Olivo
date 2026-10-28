# Casa Olivo

Sitio web de **Casa Olivo Restaurante**: cocina chilena en una casona con más de cien años en Olivar, a minutos de Rancagua.

Hecho con [Astro](https://astro.build), sin frameworks de UI ni librerías de animación: el scroll y las transiciones están escritos a mano en TypeScript. Todo el contenido se edita desde un panel propio en `/admin`.

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Recorrido cinemático por la casona guiado por el scroll, carta, menú ejecutivo, celebraciones, agenda y ubicación |
| `/carta` | Carta completa de cocina y Oli bar, con búsqueda y happy hour |
| `/reserva` | Widget de Tableo integrado con la paleta del sitio y preguntas frecuentes |
| `/eventos` | Próximos shows con entradas en Ticketplus y eventos privados |
| `/karaoke` | Concurso de karaoke: calendario, premios, inscripción y bases |
| `/links` | Enlace para la bio de Instagram |
| `/admin` | Panel para editar todo el contenido del sitio |

## Desarrollo

Requiere Node 24 (ver `.nvmrc`).

```bash
nvm use
npm install
npm run dev
```

El sitio queda en `http://localhost:4321`. Para generar la versión estática en `dist/`:

```bash
npm run build
```

## Panel de administración

En `/admin` se agrega, edita, ordena y elimina todo lo que muestra el sitio:

- **Carta:** platos y tragos, categorías, menú ejecutivo y happy hour.
- **Eventos:** shows con afiche, fecha y link de entradas. Se ocultan solos cuando pasan.
- **Karaoke:** datos del concurso, jornadas, premios y bases.
- **Sitio:** escenas del recorrido del inicio (con su punto de vuelo), textos del inicio, datos del local y preguntas frecuentes.
- **Usuarios:** quién puede entrar al panel y con qué rol.
- **Historial:** cada cambio con quién lo hizo, cuándo y qué cambió, con opción de volver a la versión anterior.
- **Papelera:** lo eliminado se guarda 30 días y se puede recuperar.
- **Estado de servicios:** revisión en vivo de la base de datos, las fotos, Tableo, Google Maps, el formulario del karaoke y las entradas de cada show, más avisos de contenido incompleto.
- **Configuración:** aviso temporal en el sitio, títulos y descripciones para Google, imagen para compartir, `sitemap.xml`, `robots.txt` y respaldo descargable del contenido.

### Roles

| Rol | Puede |
| --- | --- |
| Administrador | Todo el panel |
| Editor | Todo el contenido, su historial y el estado de servicios. Sin usuarios ni configuración |
| Carta | Platos, precios, happy hour y menú ejecutivo |

Los permisos se validan en el servidor (`src/lib/permissions.ts` y `src/middleware.ts`), no solo en la interfaz. Siempre queda al menos un administrador.

Los cambios se ven en el sitio en segundos, sin volver a desplegar. Atajos: <kbd>⌘K</kbd> para buscar cualquier cosa y <kbd>⌘S</kbd> para guardar.

### Cómo funciona

- El sitio corre en Vercel en modo servidor (`output: 'server'`). Cada página lee el contenido de Postgres al responder, y la CDN lo guarda 5 segundos.
- Base de datos: Postgres de Neon (`DATABASE_URL`). Las tablas se crean solas y, si la base está vacía, se carga el contenido original desde `src/lib/seed/`.
- Fotos: se convierten a WebP en 1600 px y 900 px y se guardan en Vercel Blob (`BLOB_READ_WRITE_TOKEN`).
- Sesiones con cookie `httpOnly`, contraseñas con scrypt y bloqueo de 15 minutos tras 5 intentos fallidos.

### Puesta en marcha en Vercel

1. En el proyecto de Vercel, **Storage → Create → Neon (Postgres)** y conéctalo al proyecto. Esto define `DATABASE_URL`.
2. **Storage → Create → Blob** y conéctalo al proyecto. Esto define `BLOB_READ_WRITE_TOKEN`.
3. En **Settings → Environment Variables** agrega `SETUP_KEY` con un valor largo que solo tú conozcas.
4. Despliega y entra a `/admin/setup`: con la `SETUP_KEY` creas la primera cuenta. Desde **Usuarios** puedes invitar a más personas.

### Desarrollo local

Sin variables de entorno, `npm run dev` usa PGlite (un Postgres embebido en `.data/`) y guarda las fotos en `.data/uploads`. La primera vez entra a `http://localhost:4321/admin/setup` para crear tu cuenta local. Para empezar de cero, borra la carpeta `.data`.

## Estructura

- `src/lib/schema.ts`: qué se puede editar y con qué campos. El panel arma sus formularios a partir de aquí.
- `src/lib/content.ts`: lee el contenido publicado y lo entrega a las páginas.
- `src/lib/db.ts`, `auth.ts`, `storage.ts`: base de datos, sesiones y fotos.
- `src/lib/permissions.ts`, `audit.ts`, `health.ts`, `backup.ts`: roles, historial, estado de servicios y respaldo.
- `src/pages/admin/`: el panel.

## Sistema visual

- Tipografía única: Manrope.
- Paleta: fondo `#131209`, crema `#F0E7D7`, terracota `#F47B44` y café `#5B433C`, tomados del logo.
- Espaciados, radios y curvas de animación definidos como tokens en `src/styles/global.css`.
- Respeta `prefers-reduced-motion`.

Las skills de diseño usadas para construirlo están en `.claude/skills/` (`landing-page-design` de elayadesign y `scroll-world` de oso95, ambas con licencia MIT).
