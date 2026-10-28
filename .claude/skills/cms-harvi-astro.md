# Skill: Integración CMS Harvi en proyectos Astro (SSG)

> Pegá este archivo en `.claude/skills/cms-harvi/` o como contexto de tu asistente de IA.
> Complementa `cms-integration.md` (el skill genérico, orientado a Next.js).

## Diferencias clave respecto a Next.js

| Aspecto | Next.js | **Astro SSG** |
|---|---|---|
| Env vars | `process.env.NEXT_PUBLIC_*` | `import.meta.env.PUBLIC_*` |
| Fetch cache | `{ next: { revalidate: N } }` | No aplica — fetch en build time |
| Datos dinámicos | Server Components + ISR | `getStaticPaths()` en build |
| Islands client | React hooks | `<script>` o `client:*` islands |
| Deploy trigger | Webhook revalidate | Vercel deploy hook (rebuild) |

## Reglas de oro para Astro

1. **Todos los fetches al CMS son en build time** (frontmatter de `.astro`). El sitio es SSG puro.
2. **Nunca `fetch` en el cliente para datos de contenido.** Solo para acciones (submit de form).
3. **Deploy mode = `rebuild`** en CMS admin (no `revalidate`). Atlas Trigger dispara rebuild al cambiar contenido.
4. **Siempre pasar `clientSlug` Y `defaultHeaders: { Origin }`** — en SSG no viaja Origin/Host del browser. El `clientSlug` identifica al cliente, pero el CMS también valida el header `Origin` para autorizar. Sin `Origin`, rechaza con "Dominio no autorizado" aunque el slug sea correcto.
5. **Para `getStaticPaths()`**: fetchear lista completa (`limit: 100` o paginar) y generar una ruta por ítem.
6. **Formularios**: form HTML estático → submit client-side a `POST /api/public/v1/forms/{slug}/submit`. NO SSR.

## Instalación en el proyecto Astro

```bash
# Copiar las fuentes del cliente (no hay paquete npm todavía)
# En el repo del sitio Astro, crear src/lib/cms/ con los archivos de @harvi/cms-client
```

Env vars en `.env` (local dev):
```
PUBLIC_CMS_API=https://micms.website/api/public/v1
PUBLIC_CLIENT_SLUG=<slug-del-cliente>
PUBLIC_SITE_ORIGIN=http://localhost:4321
```

## Cliente CMS (`src/lib/cms.ts`)

```ts
import { createCMSClient } from './cms/index';

export const cms = createCMSClient({
  baseUrl: import.meta.env.PUBLIC_CMS_API,
  clientSlug: import.meta.env.PUBLIC_CLIENT_SLUG,
  defaultHeaders: {
    Origin: import.meta.env.PUBLIC_SITE_ORIGIN ?? import.meta.env.SITE,
  },
});
```

## Noticias — patrón completo SSG

```astro
---
// src/pages/noticias/index.astro
import { cms } from '@/lib/cms';

const { items: noticias } = await cms.news.list({ limit: 100 });
---
```

```astro
---
// src/pages/noticias/[slug].astro
import { cms } from '@/lib/cms';

export async function getStaticPaths() {
  const { items } = await cms.news.list({ limit: 100 });
  return items.map((n) => ({
    params: { slug: n.slug },
    props: { article: n },
  }));
}

const { article } = Astro.props;
---
```

> ⚠️ Si hay más de 100 noticias, paginar: fetchear página 1 y 2, concatenar `items`.

## Formulario de contacto

El form puede ser HTML estático. Solo el **submit** habla con el CMS:

```astro
---
// src/pages/contacto.astro
const cmsFormEndpoint = `${import.meta.env.PUBLIC_CMS_API}/forms/contacto/submit`;
---
<form id="contact-form" data-endpoint={cmsFormEndpoint}>
  <!-- campos estáticos -->
</form>

<script is:inline define:vars={{ endpoint: cmsFormEndpoint }}>
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    // json.success === true si enviado OK
    // json.data.message tiene el mensaje de éxito configurado en el CMS
  });
</script>
```

El formulario debe existir en el CMS admin con slug `contacto` y los mismos `name` de campo que el HTML.

## CMS Components — secciones dinámicas

```astro
---
// src/pages/index.astro
import { cms } from '@/lib/cms';
import type { CMSButtonField } from '@/lib/cms/types';

interface HeroData { txt_titulo: string; img_fondo?: string; btn_cta?: CMSButtonField }
interface StatsData { lista_stats: { txt_numero: string; txt_label: string }[] }

// page_filter debe coincidir con el nombre de Página escrito en el CMS admin (español, mayúscula inicial)
const { components } = await cms.components.list({ page_filter: 'Inicio' });
const hero  = cms.components.getByType<HeroData>(components, 'hero');
const stats = cms.components.getByType<StatsData>(components, 'stats');
---

{hero && <HeroSection titulo={hero.txt_titulo} cta={hero.btn_cta} />}
{stats && <StatsSection items={stats.lista_stats} />}
```

El `data` del componente es el objeto configurado en el CMS. Cada `type` mapea a un componente Astro.
Los tipos primitivos (`CMSButtonField`, `CMSGalleryItem`, `CMSContactItem`) vienen en `@harvi/cms-client`.
Guía completa: `docs/integracion-sitio-cliente/05-componentes-cms-desde-sitio.md`.

## Deploy — configuración en CMS admin

Admin → Clientes → [tu cliente] → tab **Integrations**:

| Campo | Valor |
|---|---|
| Modo | `rebuild` |
| Webhook URL | URL del deploy hook de Vercel del sitio Astro |
| Activo | ON |

Crear el deploy hook en: Vercel → proyecto Astro → Settings → Git → Deploy Hooks.

Cada cambio de contenido en el CMS setea `pendingRebuild = true` en la DB. Atlas Scheduled Trigger lo procesa cada 5 minutos y dispara el rebuild de Vercel.

## Resiliencia del build (cliente no registrado aún)

El build debe pasar **antes** de registrar el cliente en el CMS. Wrap todo CMS call en try-catch:

```ts
// En getStaticPaths() — una excepción aquí aborta el build entero
export async function getStaticPaths() {
  try {
    const { items } = await cms.news.list({ limit: 100 });
    return items.map((n) => ({ params: { slug: n.slug }, props: { article: n } }));
  } catch {
    return []; // build pasa, páginas se generan cuando haya contenido
  }
}

// En fetch de runtime — fallback a vacío
const { components } = await cms.components.list({ page_filter: 'Inicio' })
  .catch(() => ({ components: [] }));
```

**Error típico pre-registro**: `cms.products.list({ category: 'mi-slug' })` → CMS intenta parsear el slug como MongoDB ObjectId → `"input must be a 24 character hex string"`. Fix: try-catch en getStaticPaths().

## Campos del modelo Product

```ts
product.slug              // string — identificador URL
product.productType       // string — slug de la Category (sub-categoría)
product.locale?.title     // string — nombre traducido
product.locale?.description // string — descripción traducida
product.images            // CMSImage[] | undefined — array de imágenes
product.images?.[0]       // primera imagen (thumbnail)
```

## Sub-categorías via CMS Category entities

```ts
const allCategories = await cms.categories.list().catch(() => []);
// Category.slug === product.productType
const category = allCategories.find((c) => c.slug === product.productType);
// category?.name → nombre para mostrar
// category?.description → descripción de la categoría
```

## Bilingüe — locale como query param

```ts
// ES (default) — no hace falta pasar locale
const { items } = await cms.news.list({ limit: 100 });

// EN — pasar locale: 'en' en todos los calls de la página EN
const { items } = await cms.news.list({ limit: 100, locale: 'en' });
const { components } = await cms.components.list({ page_filter: 'Inicio', locale: 'en' });
```

NO usar sufijos `_es`/`_en` en claves. El CMS maneja locale en backend.

## `getByType<T>` siempre retorna T | undefined

```ts
const hero = cms.components.getByType<HeroData>(components, 'hero');
// hero puede ser undefined — SIEMPRE usar ?.
hero?.txt_titulo  // ✓
hero.txt_titulo   // ✗ — TypeScript error + runtime crash si no hay componente
```

Usar fallback para texto estático durante el período sin registro:
```ts
hero?.txt_titulo ?? "Título por defecto hardcodeado"
```

## Errores comunes en Astro

| Error | Causa | Fix |
|---|---|---|
| `DOMAIN_NOT_ALLOWED` en build | Origin/Host no reconocido en SSG | Agregar `PUBLIC_CLIENT_SLUG` al env |
| `CMSError: Dominio no autorizado` en dev/build | Node.js `fetch` no manda header `Origin` automáticamente — el CMS no puede identificar al cliente aunque venga `clientSlug` | Ver sección abajo ↓ |
| Páginas con datos viejos tras editar en CMS | SSG estático — no hay ISR | Deploy hook trigger rebuildea el sitio |
| Form submit falla en preview | CMS identifica por dominio; `*.vercel.app` no está en `domains[]` | OK — previews están allowlisteados por defecto |
| `Cannot find module '@harvi/cms-client'` | Paquete no publicado todavía | Copiar `src/` directamente a `src/lib/cms/` |

### Fix: header `Origin` en fetch server-side

Node.js `fetch` (usado en build time de Astro SSG) **no agrega `Origin` automáticamente**. El CMS Harvi usa ese header para identificar al cliente cuando no recibe el header de un browser. Sin `Origin`, rechaza la request aunque `clientSlug` sea correcto.

**Solución permanente:** agregar `PUBLIC_SITE_ORIGIN` al `.env` y pasarlo como `defaultHeaders` al crear el cliente CMS.

En `.env` (dev):
```
PUBLIC_SITE_ORIGIN=http://localhost:<puerto>
```

En `.env.production` / Vercel env vars: **no agregar** — en producción se usa `import.meta.env.SITE` (el `site` del `astro.config.mjs`).

En `src/lib/cms.ts`:
```ts
import { createCMSClient } from './cms/index';

export const cms = createCMSClient({
  baseUrl: import.meta.env.PUBLIC_CMS_API,
  clientSlug: import.meta.env.PUBLIC_CLIENT_SLUG,
  defaultHeaders: {
    Origin: import.meta.env.PUBLIC_SITE_ORIGIN ?? import.meta.env.SITE,
  },
});
```

En `src/lib/cms/core.ts`, el `CMSConfig` debe incluir `defaultHeaders`:
```ts
defaultHeaders?: Record<string, string>;
```
Y usarlos en `get` y `post`:
```ts
headers: { ...this.config.defaultHeaders, ...(fetchOptions?.headers ?? {}) }
```

**En CMS admin**, el cliente debe tener en Dominios autorizados:
- `localhost` (o `localhost:<puerto>`) para dev
- El dominio de producción para builds/Vercel
