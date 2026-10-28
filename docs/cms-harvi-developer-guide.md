# CMS Harvi — Guía de integración para desarrolladores

Referencia para integrar un sitio Astro SSG con CMS Harvi.
Basada en la integración real de **Alfaterra / Bernardín** (octubre 2026).

---

## Stack requerido

- Astro 7+ con `output: 'static'`
- TypeScript
- pnpm (o npm/yarn)
- Deploy en Vercel

---

## 1. Copiar el cliente CMS al proyecto

El cliente no está publicado en npm. Copiar desde el kit:

```
kit: cms_sitios/docs/integracion-sitio-cliente/kit-repo-cliente/src/lib/cms/
destino: src/lib/cms/
```

Archivos incluidos: `core.ts`, `types.ts`, `index.ts`, `entities/*.ts`

### Patch requerido en `core.ts`

Node.js no agrega el header `Origin` automáticamente. Sin él, el CMS rechaza el request con "Dominio no autorizado" aunque el `clientSlug` sea correcto.

Agregar a `CMSConfig`:
```ts
defaultHeaders?: Record<string, string>;
```

Usar en `get()` y `post()`:
```ts
headers: { ...this.config.defaultHeaders, ...(fetchOptions?.headers ?? {}) }
```

---

## 2. Variables de entorno

`.env` (dev local):
```
PUBLIC_CMS_API=https://micms.website/api/public/v1
PUBLIC_CLIENT_SLUG=<slug-del-cliente>
PUBLIC_SITE_ORIGIN=http://localhost:4321
```

**Vercel** (producción): configurar `PUBLIC_CMS_API` y `PUBLIC_CLIENT_SLUG`.
`PUBLIC_SITE_ORIGIN` **no** va en Vercel — en producción Astro usa `import.meta.env.SITE` (el `site` de `astro.config.mjs`).

---

## 3. Crear `src/lib/cms.ts`

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

---

## 4. Registro del cliente en CMS admin

Antes de hacer el primer deploy real:

1. Admin → **Clientes** → **Nuevo cliente**
2. `slug`: el valor de `PUBLIC_CLIENT_SLUG`
3. `Dominios autorizados`: dominio de producción + `localhost`
4. Crear los módulos necesarios (noticias, productos, componentes, formularios)

---

## 5. Reglas de integración (obligatorias)

| Regla | Detalle |
|---|---|
| Solo `cms.*` | NUNCA `fetch` directo para contenido |
| Solo build time | NUNCA fetch de contenido en el cliente (SSG puro) |
| `btn_*` shape | `{ txt_label, link_url, link_tipo? }` — NO `{ label, url }` |
| Try-catch en todo | Build debe pasar antes de registro del cliente |
| Bilingual | `locale: 'en'` como param — no sufijos `_es`/`_en` |
| Optional chaining | `getByType<T>()` retorna `T \| undefined` — siempre usar `?.` |

---

## 6. Patrón de páginas por módulo

### Noticias

```astro
---
// index.astro
import { cms } from '../lib/cms';
const { items: articles } = await cms.news.list({ limit: 100 });
---
```

```astro
---
// [slug].astro
export async function getStaticPaths() {
  try {
    const { items } = await cms.news.list({ limit: 100 });
    return items.map((n) => ({ params: { slug: n.slug }, props: { article: n } }));
  } catch { return []; }
}
const { article } = Astro.props;
// article.title, article.content (HTML), article.gallery (CMSImage[])
// article.publishedAt ?? article.createdAt
---
```

### Productos con sub-categorías

```astro
---
const [{ products }, allCategories] = await Promise.all([
  cms.products.list({ locale: 'es', category: brandSlug, limit: 100 }),
  cms.categories.list(),
]).catch(() => [{ products: [] }, []]);

// Sub-categorías: category.slug === product.productType
// product.locale?.title, product.locale?.description
// product.images?.[0], product.slug
---
```

### Componentes CMS (secciones de página)

```astro
---
interface CMSBtnField { txt_label: string; link_url: string; link_tipo?: string; }
interface HeroData { txt_eyebrow?: string; txt_titulo?: string; txt_texto?: string; btn_cta?: CMSBtnField; }

const { components } = await cms.components.list({ page_filter: 'Inicio', locale: 'es' })
  .catch(() => ({ components: [] }));
const hero = cms.components.getByType<HeroData>(components, 'hero');
---

<h1>{hero?.txt_titulo ?? "Título por defecto"}</h1>
```

**Regla**: definir `CMSBtnField` localmente en cada página. NO importar `CMSLinkField` del kit.

### Formulario de contacto

```astro
<form id="contact-form" class="form">
  <input name="nombre" required />
  <input name="email" type="email" required />
  <textarea name="mensaje" required></textarea>
  <button type="submit">Enviar</button>
</form>

<script is:inline define:vars={{ endpoint: `${import.meta.env.PUBLIC_CMS_API}/forms/contacto/submit` }}>
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.currentTarget.querySelector('[type="submit"]');
    btn.disabled = true;
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        e.currentTarget.innerHTML = `<p>${json.data?.message ?? '¡Mensaje enviado!'}</p>`;
      } else { btn.disabled = false; alert('Error al enviar.'); }
    } catch { btn.disabled = false; alert('Error de conexión.'); }
  });
</script>
```

Los `name` de los campos **deben coincidir exactamente** con los IDs de campo configurados en el formulario del CMS admin.

---

## 7. Bilingüe (ES + EN)

```
src/pages/        → ES (locale default)
src/pages/en/     → EN (misma estructura, mismo page_filter, locale: 'en')
```

Todos los calls CMS en páginas EN llevan `locale: 'en'`:
```ts
await cms.news.list({ limit: 100, locale: 'en' });
await cms.components.list({ page_filter: 'Inicio', locale: 'en' });
```

---

## 8. Deploy hook (rebuild automático)

1. Vercel → proyecto → **Settings** → **Git** → **Deploy Hooks** → crear hook
2. CMS admin → **Clientes** → [cliente] → **Integrations**:
   - Modo: `rebuild`
   - Webhook URL: el hook de Vercel
   - Activo: ON

Cada cambio de contenido en el CMS dispara el rebuild. Latencia máx. ~5 min (Atlas Scheduled Trigger).

---

## 9. CLAUDE.md del proyecto

Documentar en el `CLAUDE.md` del repo:
- `CLIENT_SLUG`, `DOMINIO_PROD`
- Módulos CMS activos (`[x]` / `[ ]`)
- Tabla `type` → página Astro → `page_filter`
- Reglas `btn_*` (shape exacta)
- Bilingual strategy

Ver `CLAUDE.md` de este proyecto como plantilla.

---

## 10. Errores frecuentes

| Error | Causa | Fix |
|---|---|---|
| `"input must be a 24 character hex string"` | `cms.products.list({ category: slug })` con slug no registrado | Wrap en try-catch |
| `CMSError: Dominio no autorizado` | `Origin` header no enviado en build | Patch `core.ts` + `PUBLIC_SITE_ORIGIN` |
| Páginas vacías en build | Cliente no registrado aún | Normal — se llenan al registrar y hacer deploy |
| Form no envía | Campos `name` no coinciden con CMS form slug | Verificar nombres de campo en CMS admin |
| `Cannot find module '@harvi/cms-client'` | Paquete no en npm | Copiar `src/lib/cms/` directamente |

---

## 11. Checklist de integración completa

- [ ] `src/lib/cms/` copiado del kit
- [ ] `core.ts` patcheado con `defaultHeaders`
- [ ] `src/lib/cms.ts` creado
- [ ] `.env` local configurado
- [ ] `astro.config.mjs` tiene `site: "https://dominio.com"`
- [ ] Páginas de noticias migradas
- [ ] Páginas de productos migradas
- [ ] Componentes CMS integrados (hero, stats, etc.)
- [ ] Formulario de contacto con AJAX submit
- [ ] `CLAUDE.md` del proyecto actualizado
- [ ] Cliente registrado en CMS admin
- [ ] Contenido cargado en CMS (noticias, productos, componentes, formularios)
- [ ] Vercel env vars configuradas
- [ ] Deploy hook configurado en CMS admin
- [ ] Build en Vercel verificado con contenido real
