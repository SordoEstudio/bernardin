# Starter Prompt — Integración CMS Harvi (nuevo proyecto)

Copiá este prompt en una sesión nueva de Claude Code para iniciar la integración.
Reemplazá los `[COMPLETAR]` antes de pegarlo.

---

## Prompt para copiar

```
Necesito conectar este sitio con CMS Harvi. El kit de integración está en:
C:/Users/LENOVO/Documents/GitHub/cms_sitios/docs/integracion-sitio-cliente/kit-repo-cliente

Antes de cualquier implementación:

1. Analizar la estructura del proyecto:
   - Stack y versión (Astro/Next.js, SSG/SSR)
   - Páginas y secciones existentes
   - Datos hardcodeados actuales (JSON files, arrays en código, etc.)
   - Si tiene i18n / multilocale

2. Leer los skills del kit en:
   - kit-repo-cliente/.claude/skills/cms-harvi-astro.md
   - kit-repo-cliente/.claude/skills/cms-harvi-components.md
   - kit-repo-cliente/.claude/skills/cms-harvi-json-format.md
   Y la documentación en kit-repo-cliente/docs/

3. Confirmar conmigo las decisiones clave ANTES de implementar:
   - Client slug CMS: [COMPLETAR - ej: mi-empresa-sitio]
   - Dominio de producción: [COMPLETAR - ej: miempresa.com]
   - ¿Registro nuevo o cliente existente en el CMS?: [nuevo / existente]
   - Módulos a activar: noticias / productos / propiedades / componentes / formularios
   - ¿Multilocale?: [sí / no]
   - ¿Sub-categorías de productos via CMS Category entities?: [sí / no]
   - Shape de btn_*: confirmar que es { txt_label, link_url, link_tipo? }

4. Escribir una spec y un plan completos usando superpowers:writing-plans:
   - Spec: docs/superpowers/specs/YYYY-MM-DD-cms-harvi-integration-design.md
   - Plan: docs/superpowers/plans/YYYY-MM-DD-cms-harvi-integration.md

5. Una vez que apruebe el plan, implementar en auto mode usando superpowers:executing-plans.

Reglas obligatorias durante la implementación:
- NUNCA usar fetch directo — siempre cms.* de src/lib/cms.ts
- NUNCA hacer fetch de contenido en el cliente (SSG puro)
- btn_* shape: { txt_label, link_url, link_tipo? } — NUNCA { label, url }
- Wrap TODO CMS call en try-catch — build debe pasar antes del registro en CMS
- Bilingual: locale: 'en' como query param — NO sufijos _es/_en en claves
- getByType<T>() retorna T | undefined — siempre usar optional chaining ?.
- Interfaces CMSBtnField definidas localmente en cada página, no importadas del kit
- Validar json.success antes de usar json.data en cualquier response del CMS
```

---

## Notas de uso

### Superpowers

Si superpowers no está instalado en `~/.claude/plugins/`:
```bash
git clone https://github.com/obra/superpowers.git \
  ~/.claude/plugins/cache/superpowers-dev/superpowers/7.0.0
```

### Kit de integración

El kit vive en el repo del CMS (`cms_sitios`), no en el repo del sitio cliente.
Path en esta máquina: `C:/Users/LENOVO/Documents/GitHub/cms_sitios/docs/integracion-sitio-cliente/kit-repo-cliente`

### Windows + pnpm

Si el wrapper de pnpm falla con error de path resolution, invocar directamente:
```powershell
node "C:\Users\LENOVO\AppData\Local\pnpm\.tools\pnpm\12.3.4\node_modules\pnpm\bin\pnpm.mjs" build
```

### `setup.js` del kit es interactivo

El script `setup.js` usa `readline` y no puede ejecutarse en modo no-interactivo.
Crear `CLAUDE.md` manualmente desde la plantilla del kit con los valores del cliente.

---

## Lo que el LLM debe esperar

### Build exitoso antes de registrar el cliente

Todas las llamadas al CMS retornan vacío o lanzan error antes del registro.
El build debe pasar con datos vacíos/fallback. Nunca romper el build por un CMS call.

### Errores esperados antes del registro

- `cms.products.list({ category: 'slug' })` → MongoDB ObjectId parse error
  Fix: try-catch en getStaticPaths(), retornar `[]`
- `cms.news.list()` → retorna `{ items: [] }` (vacío, no error)
- `cms.components.list()` → retorna `{ components: [] }` (vacío, no error)

### Estructura de datos clave

```ts
// NewsItem
article.title           // string
article.summary         // string | undefined
article.content         // string (HTML)
article.gallery         // CMSImage[] | undefined
article.publishedAt     // string | undefined
article.createdAt       // string
article.slug            // string

// Product
product.slug            // string
product.productType     // string (slug de Category)
product.locale?.title   // string | undefined
product.locale?.description // string | undefined
product.images          // CMSImage[] | undefined

// CMSComponent.data via getByType<T>()
// T | undefined — siempre usar ?.
```
