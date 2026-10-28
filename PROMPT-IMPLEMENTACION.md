# Prompt de inicio — Implementación CMS Harvi en sitio Astro

> Pegá este texto como primer mensaje a Claude Code al arrancar una sesión de implementación
> en el repo del sitio cliente. Reemplazá los `[placeholders]` antes de enviarlo.

---

```
Vamos a conectar este sitio Astro SSG al CMS Harvi (CMS multi-cliente propietario).

## Contexto

- CMS: sistema multi-tenant propio, API pública en `/api/public/v1`
- El sitio es Astro 5 SSG (`output: 'static'`). Todo fetch ocurre en build time.
- Cliente: [NOMBRE DEL CLIENTE]
- Slug del cliente en CMS: [slug-del-cliente]
- Dominio de producción: [dominio.com]

## Documentación disponible

Todo lo que necesitás saber sobre la integración está en el directorio `src/lib/cms/` (el kit ya está copiado) y en los skills de `.claude/skills/`:

- `cms-harvi-astro.md` — reglas de integración Astro + errores comunes
- `cms-harvi-json-format.md` — convenciones de prefijos para datos de componentes CMS
- `cms-harvi-components.md` — flujo sitio → JSON → CMS → consumo tipado

Si el kit todavía no está copiado, las fuentes canónicas están en el repo del CMS:
`docs/integracion-sitio-cliente/kit-repo-cliente/`

Leé esos archivos antes de proponer cualquier implementación.

## Reglas de trabajo

1. **Preguntá antes de asumir.** Si el diseño actual del sitio puede mapearse a una entidad CMS de más de una manera, preguntá cuál. No supongas nombres de campo, slugs de formulario, ni qué módulos del CMS están activos para este cliente.

2. **Verificá el estado actual antes de cambiar.** Leé el componente Astro existente antes de reescribirlo. Muchos componentes tienen datos hardcodeados o en `src/data/*.json` — identificá exactamente qué campo va al CMS y qué puede quedar estático.

3. **Mantén el contrato de tipos.** Usá las interfaces de `src/lib/cms/types.ts` (o extendelas si hacen falta). No uses `any` donde hay tipo disponible.

4. **Formularios: nunca SSG.** Los submits van siempre client-side (`<script is:inline>` o island `client:*`). El fetch de build solo lee contenido, nunca escribe.

5. **Un cambio a la vez, verificar entre pasos.** Si algo no compila o devuelve error del CMS, pará y diagnosticá antes de continuar.

## Protocolo para problemas nuevos

Si durante la implementación encontrás un error, comportamiento inesperado, o limitación del CMS que no está documentada:

1. Documentalo en el momento: qué pasó, qué lo causó, cómo se resolvió.
2. Evaluá si aplica a otras integraciones futuras.
3. Si aplica: proponé agregar el aprendizaje a `docs/integracion-sitio-cliente/` (el repo del CMS). No lo hagas vos directamente — avisame para decidir si va a `04-troubleshooting.md`, a la skill `cms-harvi-astro.md`, o a `02-contrato-api.md`.

## Skills necesarias

Antes de arrancar, instalá las skills del kit CMS (ya deberían estar en `.claude/skills/`):
- `cms-harvi-astro.md`
- `cms-harvi-json-format.md`
- `cms-harvi-components.md`

Para el stack de este proyecto (Astro + Tailwind + [otras libs del sitio]), buscá skills adicionales relevantes. Usá solo skills respaldadas por el desarrollador oficial del framework o herramienta (Astro, Tailwind Labs, Vercel, Anthropic — no skills de terceros desconocidos):

```bash
npx @anthropic-ai/claude-code skills add <url-del-skill>
```

Antes de instalar cualquier skill externa, mostrámela y explicá de quién viene y por qué es relevante. No instales skills automáticamente sin confirmación.

## Variables de entorno

En `.env` (ya configurado o a configurar):
```
PUBLIC_CMS_API=https://micms.website/api/public/v1
PUBLIC_CLIENT_SLUG=[slug-del-cliente]
PUBLIC_SITE_ORIGIN=http://localhost:4321
```

`PUBLIC_SITE_ORIGIN` es solo para dev local — Node.js fetch no manda `Origin` automáticamente en build time y el CMS lo necesita para autorizar. En Vercel no va.

## Por dónde empezar

1. Si todavía no corriste el onboarding: `node setup.js` — genera `.env` y `CLAUDE.md` interactivamente.
2. Leé `CLAUDE.md` generado.
3. Leé las tres skills CMS en `.claude/skills/`.
4. Preguntame si hay dudas sobre la tabla `type → componente → page_filter` o sobre los módulos activos.
5. Arrancamos componente por componente, de lo más simple a lo más complejo.
```
