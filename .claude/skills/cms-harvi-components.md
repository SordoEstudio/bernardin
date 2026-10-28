# 05 · CMS Components: del sitio al CMS y de vuelta

> Guía de ida y vuelta: cómo pasar contenido hardcoded de tu sitio Astro/Next.js
> al CMS como componente editable, y cómo consumirlo de vuelta con tipo estricto.

La referencia completa del formato de `data` está en
[`../MANUAL_JSON_COMPONENTES_CMS_FORMULARIO_DINAMICO.md`](../MANUAL_JSON_COMPONENTES_CMS_FORMULARIO_DINAMICO.md).
Esta guía se enfoca en el **flujo de trabajo práctico**.

---

## El contrato clave

El objeto `data` que guardás en el CMS es exactamente el mismo que recibís de la API:

```
CMS admin → "Editar datos" → guardás { txt_titulo: "Hola" }
API pública → component.data.txt_titulo === "Hola"
```

Lo que ponés en el JSON, lo leés en el sitio. Sin transformación intermedia.

---

## Paso a paso: sitio → CMS → sitio

### 1. Identificar el contenido editable

Mirá tu componente Astro y marcá qué debería poder editar el cliente:

```astro
---
// ANTES: todo hardcodeado
---
<section>
  <h1>Somos MV Sport Agency</h1>                        <!-- texto editable -->
  <p>Conectamos jugadores con clubes de todo el mundo</p> <!-- texto editable -->
  <img src="/images/hero.jpg" alt="Hero" />               <!-- imagen editable -->
  <a href="/jugadores">Ver jugadores</a>                  <!-- botón editable -->
</section>
```

### 2. Mapear a prefijos CMS

| Contenido del sitio | Prefijo CMS | Clave sugerida |
|---|---|---|
| Título principal | `txt_` | `txt_titulo` |
| Párrafo / descripción | `txt_` | `txt_descripcion` |
| Subtítulo corto | `txt_` | `txt_subtitulo` |
| Imagen | `img_` | `img_fondo`, `img_principal` |
| Botón / CTA | `btn_` | `btn_cta`, `btn_secundario` |
| Lista de ítems | `lista_` | `lista_servicios`, `lista_stats` |
| Icono | `icon_` | `icon_servicio` |
| Flag on/off | `boolean_` | `boolean_mostrar_cta` |
| Config interna (no editable) | `_` | `_configuracion`, `_estilo` |
| Campo opcional | `_optional` al final | `txt_bajada_optional` |

### 3. Armar el JSON de `data`

```json
{
  "txt_titulo": "Somos MV Sport Agency",
  "txt_descripcion": "Conectamos jugadores con clubes de todo el mundo",
  "img_fondo": "https://example.com/hero.jpg",
  "btn_cta": {
    "txt_label": "Ver jugadores",
    "link_url": "/jugadores",
    "link_tipo": "internal"
  }
}
```

> Regla: si la clave no empieza con `_`, aparece en el formulario dinámico del CMS como campo editable.

### 4. Crear el componente en CMS admin

1. Admin → **Componentes web** → **Nuevo componente**
2. Completar:
   - **Nombre**: `Hero Principal` (**en español** — lo ve el usuario en el CMS)
   - **Clave** (`key`): `hero_principal` (snake_case, único por cliente)
   - **Página**: `Inicio` (**en español**, mayúscula inicial — lo ve el usuario en el CMS)
   - **Tipo** (`type`): `hero` (identificador técnico usado en el código — no visible al usuario)
   - **Ruta del componente**: `sections/HeroSection` (opcional, referencia interna)
3. **Editar datos** → pegar el JSON del paso 3
4. **Publicar**

> **Convención**: `Nombre` y `Página` siempre en español. Son los campos visibles al usuario en el CMS.
> El `page_filter` del código debe coincidir exactamente con el valor escrito en `Página`.

### 5. Consumir desde Astro con tipo estricto

```astro
---
// src/pages/index.astro
import { cms } from '@/lib/cms';

// ⚠️ NO usar CMSButtonField/CMSLinkField del kit — esos tipos tienen { label, url }
// pero el CMS guarda y devuelve { txt_label, link_url, link_tipo? }
// Definir siempre la interfaz localmente con las claves reales:
interface CMSBtnField { txt_label: string; link_url: string; link_tipo?: string }

interface HeroData {
  txt_titulo: string;
  txt_descripcion: string;
  img_fondo?: string;
  btn_cta?: CMSBtnField;
}

const { components } = await cms.components.list({ page_filter: 'Inicio' });
const hero = cms.components.getByType<HeroData>(components, 'hero');
---

{hero && (
  <section>
    <h1>{hero.txt_titulo}</h1>
    <p>{hero.txt_descripcion}</p>
    {hero.img_fondo && <img src={hero.img_fondo} alt="Hero" />}
    {hero.btn_cta && (
      <a href={hero.btn_cta.link_url}>{hero.btn_cta.txt_label}</a>
    )}
  </section>
)}
```

---

## Ejemplo completo: sección de stats / counters

**Contenido original (hardcoded):**
```ts
// copy.ts
export const stats = [
  { number: '150+', label: 'Jugadores representados' },
  { number: '30+',  label: 'Países con presencia' },
  { number: '12',   label: 'Años de experiencia' },
];
```

**JSON de `data` para CMS:**
```json
{
  "lista_stats": [
    { "txt_numero": "150+", "txt_label": "Jugadores representados" },
    { "txt_numero": "30+",  "txt_label": "Países con presencia" },
    { "txt_numero": "12",   "txt_label": "Años de experiencia" }
  ]
}
```

**Consumo en Astro:**
```astro
---
interface StatsData {
  lista_stats: { txt_numero: string; txt_label: string }[];
}

const statsComponent = cms.components.byType(components, 'stats')[0];
const statsData = statsComponent?.data as StatsData | undefined;
---

{statsData?.lista_stats.map((item) => (
  <div>
    <span class="text-4xl font-bold">{item.txt_numero}</span>
    <p>{item.txt_label}</p>
  </div>
))}
```

---

## Ejemplo: sección con imagen + texto + lista de bullets

**JSON de `data`:**
```json
{
  "txt_titulo": "¿Quiénes somos?",
  "txt_descripcion": "MV Sport Agency es una agencia especializada...",
  "img_equipo": "https://example.com/team.jpg",
  "lista_valores": [
    { "icon_item": "FaHandshake", "txt_valor": "Transparencia" },
    { "icon_item": "FaTrophy",    "txt_valor": "Excelencia" },
    { "icon_item": "FaGlobe",     "txt_valor": "Alcance global" }
  ],
  "_configuracion": {
    "imagePosition": "right"
  }
}
```

**Consumo:**
```astro
---
interface AboutData {
  txt_titulo: string;
  txt_descripcion: string;
  img_equipo?: string;
  lista_valores?: { icon_item: string; txt_valor: string }[];
  _configuracion?: { imagePosition?: 'left' | 'right' };
}
---
```

> `_configuracion` llega en `data` aunque no sea editable desde el formulario dinámico. Los campos con `_` se guardan y se sirven por la API igual.

---

## Ejemplo: redes sociales / contactos (`lista_contacto`)

`lista_contacto` es un tipo especial con control dedicado en el CMS admin (selector de red, prefijo de URL automático).

**JSON de `data` para CMS** (pegar en "Editar datos"):
```json
{
  "lista_contacto": [
    {
      "icon_contacto": "FaWhatsapp",
      "txt_label": "WhatsApp",
      "link_destino": "https://wa.me/5491123456789",
      "txt_valor": "+54 11 1234-5678"
    },
    {
      "icon_contacto": "FaInstagram",
      "txt_label": "Instagram",
      "link_destino": "https://instagram.com/mvsportagency",
      "txt_valor": "@mvsportagency"
    },
    {
      "icon_contacto": "FaEnvelope",
      "txt_label": "Email",
      "link_destino": "mailto:info@mvsport.com",
      "txt_valor": "info@mvsport.com"
    }
  ]
}
```

> En el CMS admin, al editar este componente, cada ítem muestra un selector de tipo de red/contacto — no hace falta escribir el `icon_contacto` a mano.

**Consumo en Astro** (`CMSContactItem` viene en `src/lib/cms/types.ts`):

```astro
---
import { cms } from '@/lib/cms';
import type { CMSContactItem } from '@/lib/cms/types';

interface ContactData {
  lista_contacto: CMSContactItem[];
}

const { components } = await cms.components.list({ page_filter: 'Contacto' });
const contactInfo = cms.components.getByType<ContactData>(components, 'contact_info');
---

{contactInfo?.lista_contacto.map((item) => (
  <a href={item.link_destino} target="_blank" rel="noopener">
    <!-- usar item.icon_contacto como nombre de icono (FaWhatsapp, FaInstagram, etc.) -->
    <span>{item.txt_valor || item.txt_label}</span>
  </a>
))}
```

**Íconos disponibles** (valor de `icon_contacto`):
`FaWhatsapp` · `FaPhone` · `FaEnvelope` · `FaMapMarkerAlt` · `FaInstagram` · `FaFacebook` · `FaLinkedin` · `FaTwitter` · `FaYoutube` · `FaTiktok` · `FaTelegram` · `FaDiscord` · `FaReddit` · `FaPinterest` · `FaLink` (Otro)

---

## Patrón: centralizar tipos de componentes

`@harvi/cms-client` incluye los tipos primitivos reutilizables. Solo definís las
interfaces propias de tu proyecto:

```ts
// src/lib/cms-components.ts
import type { CMSGalleryItem } from './cms/types';

// btn_* campos: el CMS guarda { txt_label, link_url, link_tipo? } — NO { label, url }
// CMSButtonField/CMSLinkField del kit tienen la forma incorrecta; definir local:
export interface CMSBtnField {
  txt_label: string;
  link_url: string;
  link_tipo?: 'internal' | 'external';
}

export interface HeroData {
  txt_titulo: string;
  txt_descripcion: string;
  img_fondo?: string;
  btn_cta?: CMSBtnField;
}

export interface StatsData {
  lista_stats: { txt_numero: string; txt_label: string }[];
}

export interface AboutData {
  txt_titulo: string;
  txt_descripcion: string;
  img_equipo?: string;
  lista_valores?: { icon_item: string; txt_valor: string }[];
  _configuracion?: Record<string, unknown>;
}
```

Uso en página — `cms.components.getByType<T>()` ya viene en la lib:

```astro
---
import { cms } from '@/lib/cms';
import type { HeroData, StatsData } from '@/lib/cms-components';

const { components } = await cms.components.list({ page_filter: 'Inicio' });

const hero  = cms.components.getByType<HeroData>(components, 'hero');
const stats = cms.components.getByType<StatsData>(components, 'stats');
---
```

---

## Convenciones de `type` para componentes

El campo `type` es técnico (código). El campo `Página` es lo que el usuario escribe en el CMS admin — **siempre en español, mayúscula inicial**:

| `type` en CMS (técnico) | Componente Astro | `Página` en CMS admin | `page_filter` en código |
|---|---|---|---|
| `hero` | `HeroSection.astro` | `Inicio` | `'Inicio'` |
| `stats` | `StatsSection.astro` | `Inicio` | `'Inicio'` |
| `about` | `AboutSection.astro` | `Quiénes somos` | `'Quiénes somos'` |
| `services` | `ServicesSection.astro` | `Servicios` | `'Servicios'` |
| `cta_banner` | `CTABanner.astro` | *(página correspondiente)* | — |
| `contact_info` | `ContactInfo.astro` | `Contacto` | `'Contacto'` |

Documentar esta tabla (con los valores reales del proyecto) en el `CLAUDE.md` del repo del sitio.

---

## Checklist antes de crear un componente CMS

- [ ] ¿Qué texto/imagen/botón debe poder editar el cliente?
- [ ] Cada campo editable tiene prefijo correcto (`txt_`, `img_`, `btn_`, etc.)
- [ ] Configuración no editable usa `_` al principio
- [ ] Campos opcionales terminan en `_optional`
- [ ] `Nombre` y `Página` escritos en español en el CMS admin
- [ ] `page_filter` en el código coincide exactamente con el valor de `Página`
- [ ] `type` acordado con el sitio (la clave que usa `getByType()`)
- [ ] JSON pegado en "Editar datos" del CMS admin
- [ ] Componente publicado (`status: published`)
- [ ] Interface TypeScript en el sitio refleja las claves del JSON

---

## Referencia rápida de prefijos

| Prefijo | Tipo de campo | Valor en `data` |
|---|---|---|
| `txt_` | Texto / textarea | `string` |
| `img_` | Imagen (media picker) | `string` (URL) |
| `icon_` | Icono | `string` (ej. `FaHome`) |
| `btn_` | Botón / CTA | `{ txt_label, link_url, link_tipo? }` |
| `link_` | Enlace | `string` o `{ label, url }` |
| `boolean_` | Checkbox | `true` \| `false` |
| `lista_` | Lista repetible | `Array<{...}>` con mismos prefijos |
| `gallery_` | Galería de imágenes | `Array<{ url, alt?, order? }>` |
| `lista_contacto` | Lista de contactos | `Array<{ icon_contacto, txt_label, link_destino, txt_valor? }>` |
| `_` (prefijo) | No editable, sí guardado | cualquier valor |
| `_optional` (sufijo) | Campo no obligatorio | `string` u otro |
