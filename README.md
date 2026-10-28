# Casa Olivo

Sitio web de **Casa Olivo Restaurante**: cocina chilena en una casona con más de cien años en Olivar, a minutos de Rancagua.

Hecho con [Astro](https://astro.build), sin frameworks de UI ni librerías de animación: el scroll y las transiciones están escritos a mano en TypeScript.

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Recorrido cinemático por la casona guiado por el scroll, carta, menú ejecutivo, celebraciones, agenda y ubicación |
| `/carta` | Carta completa de cocina y Oli bar, con búsqueda y happy hour |
| `/reserva` | Widget de Tableo integrado con la paleta del sitio y preguntas frecuentes |
| `/eventos` | Próximos shows con entradas en Ticketplus y eventos privados |
| `/karaoke` | Concurso de karaoke: calendario, premios, inscripción y bases |
| `/links` | Enlace para la bio de Instagram |

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

## Editar contenido

Todo el contenido vive en `src/data/`, no hace falta tocar los componentes:

- `site.ts`: enlaces, escenas del recorrido del inicio y horario.
- `carta.ts`: platos, tragos y precios.
- `eventos.ts`: shows, jornadas del karaoke y bases. Los eventos pasados se ocultan solos según la fecha.

Las imágenes están en `public/img/` en formato WebP, con una versión `-sm` para pantallas pequeñas.

## Sistema visual

- Tipografía única: Manrope.
- Paleta: fondo `#131209`, crema `#F0E7D7`, terracota `#F47B44` y café `#5B433C`, tomados del logo.
- Espaciados, radios y curvas de animación definidos como tokens en `src/styles/global.css`.
- Respeta `prefers-reduced-motion`.

Las skills de diseño usadas para construirlo están en `.claude/skills/` (`landing-page-design` de elayadesign y `scroll-world` de oso95, ambas con licencia MIT).
