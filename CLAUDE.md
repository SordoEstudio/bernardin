# CLAUDE.md — Bernardín Máquinas Agrícolas

Sitio web de **Alfaterra / Bernardin** construido con Astro 7 SSG.
Consume contenido desde **CMS Harvi** (CMS multi-cliente) vía API pública.

## Stack

- Astro 7 SSG (`output: 'static'`) — TODO el fetch ocurre en build time
- TypeScript, Tailwind CSS
- Sin React — islands con `<script is:inline>` o `client:*` nativos de Astro
- Deploy: Vercel (static)
- Bilingüe: ES (`src/pages/`) + EN (`src/pages/en/`)

## CMS Harvi

```
CMS_API      = https://micms.website/api/public/v1
CLIENT_SLUG  = alfaterra-bernardin
DOMINIO_PROD = bernardin.com.ar
```

Variables de entorno (`.env` local):
```
PUBLIC_CMS_API=https://micms.website/api/public/v1
PUBLIC_CLIENT_SLUG=alfaterra-bernardin
PUBLIC_SITE_ORIGIN=http://localhost:4321
```

> `PUBLIC_SITE_ORIGIN` es solo para dev local. En Vercel **no se configura** — `astro.config.mjs`
> ya tiene `site: "https://bernardin.com.ar"` → `import.meta.env.SITE` lo resuelve automáticamente.

Cliente CMS en `src/lib/cms.ts`:
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

## Reglas de integración (obligatorias)

- API pública, sin auth. Cliente identificado por `clientSlug` (SSG) o dominio (prod).
- **NUNCA** usar `fetch` directo — siempre usar `cms.*` de `src/lib/cms.ts`.
- **NUNCA** hacer fetch en el cliente para contenido — solo en frontmatter de `.astro`.
- Formularios: form HTML estático → submit `<script is:inline>` a `/forms/{slug}/submit`.
- Deploy trigger: modo `rebuild` en CMS admin. Atlas Trigger rebuildea cada 5 min.
- Validar `json.success` antes de usar `json.data`.
- `btn_*` campos en `data` usan `{ txt_label, link_url, link_tipo? }` — **NO** `CMSLinkField { label, url }`.
  Siempre definir interfaz local `CMSBtnField` en la página que lo use.

## Módulos CMS activos para este cliente

- [x] Noticias (`cms.news.list()` / `cms.news.get(slug)`)
- [x] Productos (`cms.products.list()` / `cms.products.get(slug)`)
- [ ] Propiedades (`cms.properties.list()`)
- [ ] Licitaciones (`cms.biddings.list()`)
- [ ] Legislaciones (`cms.legislations.list()`)
- [x] Componentes CMS (`cms.components.list({ page_filter })`)
- [x] Formularios (`cms.forms.submit(slug, body)`)
- [x] Config cliente (`cms.clientConfig.get()`)

## Componentes CMS — mapa de `type` → página Astro

| `type` en CMS | Página Astro | `Página` en CMS / `page_filter` en código |
|---|---|---|
| `hero` | `src/pages/index.astro` | `Inicio` |
| `stats` | `src/pages/index.astro` | `Inicio` |
| `story_panel` | `src/pages/index.astro` | `Inicio` |
| `marcas_section` | `src/pages/index.astro` | `Inicio` |
| `nuestra_forma` | `src/pages/index.astro` | `Inicio` |
| `empresa_hero` | `src/pages/empresa.astro` | `Empresa` |
| `empresa_intro` | `src/pages/empresa.astro` | `Empresa` |
| `milestones` | `src/pages/empresa.astro` | `Empresa` |
| `valores` | `src/pages/empresa.astro` | `Empresa` |
| `contacto_info` | `src/pages/contacto.astro` | `Contacto` |
| `noticias_header` | `src/pages/noticias/index.astro` + `[slug].astro` | `Noticias` |
| `productos_header` | `src/pages/productos/index.astro` | `Productos` |
| `producto_detalle` | `src/pages/productos/[marca]/[producto].astro` | `Productos` |

CMS admin: **Nombre** y **Página** en español, mayúscula inicial. `type` = clave técnica (snake_case).

Consumo tipado — definir interfaz local, NO usar `CMSButtonField`/`CMSLinkField` del kit:
```ts
import { cms } from '../lib/cms';
interface CMSBtnField { txt_label: string; link_url: string; link_tipo?: string }
interface HeroData { txt_eyebrow: string; txt_titulo: string; txt_texto: string; btn_cta?: CMSBtnField }
const { components } = await cms.components.list({ page_filter: 'Inicio' });
const hero = cms.components.getByType<HeroData>(components, 'hero');
```

## Bilingüe

- ES: sin `locale` param (default `es` en CMSCore)
- EN: pasar `locale: 'en'` en `list()` params
- Páginas EN en `src/pages/en/` — misma estructura, mismo `page_filter`, distinto locale
- Sub-categorías de productos: `cms.categories.list()` — slug = `product.productType`

## Skills de IA disponibles

- `.claude/skills/cms-harvi-json-format.md` — prefijos de JSON para componentes CMS
- `.claude/skills/cms-harvi-astro.md` — patrones Astro SSG con el CMS
- `.claude/skills/cms-harvi-components.md` — flujo sitio → JSON CMS → consumo tipado
