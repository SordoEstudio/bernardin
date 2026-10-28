#!/usr/bin/env node
/**
 * setup.js — Onboarding interactivo para integración CMS Harvi
 *
 * Ejecutar desde la raíz del repo Astro del cliente:
 *   node setup.js
 *
 * Genera: .env, CLAUDE.md (desde CLAUDE.md.template)
 * Requiere: Node.js 18+, sin dependencias externas
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CMS_API = 'https://micms.website/api/public/v1';

// ─── helpers ────────────────────────────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    const hint = defaultValue ? ` [${defaultValue}]` : '';
    rl.question(`\n${question}${hint}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function askRequired(question) {
  return new Promise(async (resolve) => {
    let value = '';
    while (!value) {
      value = await ask(question);
      if (!value) console.log('  ⚠  Campo obligatorio. Ingresá un valor.');
    }
    resolve(value);
  });
}

function line(char = '─', len = 60) {
  return char.repeat(len);
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log('\n' + line('═'));
console.log('  CMS Harvi — Setup de integración');
console.log(line('═'));
console.log('  Configurá este sitio Astro para conectarse al CMS.');
console.log('  Presioná Enter para aceptar el valor entre corchetes.');
console.log(line());

const siteName    = await askRequired('Nombre del sitio (ej: "Sitio MV Sport")');
const clientName  = await askRequired('Nombre del cliente (ej: "MV Sport")');
const clientSlug  = await askRequired('Slug del cliente en CMS (ej: "mv-sport")');
const prodDomain  = await askRequired('Dominio de producción (ej: "mvsport.com.ar")');
const localPort   = await ask('Puerto local de Astro', '4321');

console.log('\n' + line());
console.log('  Módulos activos para este cliente:');
console.log('  (s = sí / n = no)\n');

const modules = {
  news:        (await ask('  ¿Noticias?',         'n')) === 's',
  products:    (await ask('  ¿Productos?',         'n')) === 's',
  properties:  (await ask('  ¿Propiedades?',       'n')) === 's',
  biddings:    (await ask('  ¿Licitaciones?',      'n')) === 's',
  legislations:(await ask('  ¿Legislaciones?',     'n')) === 's',
  components:  (await ask('  ¿Componentes CMS?',   's')) === 's',
  forms:       (await ask('  ¿Formularios?',        'n')) === 's',
  testimonials:(await ask('  ¿Testimonios?',        'n')) === 's',
  activities:  (await ask('  ¿Actividades?',        'n')) === 's',
  clientConfig:(await ask('  ¿Config cliente?',     's')) === 's',
};

rl.close();

// ─── generar .env ─────────────────────────────────────────────────────────

const envPath = resolve(process.cwd(), '.env');
const envExists = existsSync(envPath);
const envContent = [
  `# CMS Harvi — generado por setup.js`,
  `PUBLIC_CMS_API=${CMS_API}`,
  `PUBLIC_CLIENT_SLUG=${clientSlug}`,
  `PUBLIC_SITE_ORIGIN=http://localhost:${localPort}`,
  ``,
  `# En Vercel NO agregar PUBLIC_SITE_ORIGIN — se usa SITE automáticamente`,
].join('\n');

writeFileSync(envPath, envContent, 'utf-8');
console.log(`\n${envExists ? '⟳' : '✓'} .env ${envExists ? 'sobreescrito' : 'creado'}`);

// ─── generar CLAUDE.md ────────────────────────────────────────────────────

const templatePath = resolve(__dirname, 'CLAUDE.md.template');
let claudeMd = readFileSync(templatePath, 'utf-8');

// Reemplazar placeholders
claudeMd = claudeMd
  .replaceAll('[NOMBRE DEL SITIO]',    siteName)
  .replaceAll('[NOMBRE DEL CLIENTE]',  clientName)
  .replaceAll('<slug-del-cliente>',    clientSlug)
  .replaceAll('<dominio-produccion.com>', prodDomain)
  .replaceAll('http://localhost:4321', `http://localhost:${localPort}`);

// Marcar módulos activos
const modMap = {
  news:         "Noticias (`cms.news.list()` / `cms.news.get(slug)`)",
  products:     "Productos (`cms.products.list()` / `cms.products.get(slug)`)",
  properties:   "Propiedades (`cms.properties.list()`)",
  biddings:     "Licitaciones (`cms.biddings.list()`)",
  legislations: "Legislaciones (`cms.legislations.list()`)",
  components:   "Componentes CMS (`cms.components.list({ page_filter })`)",
  forms:        "Formularios (`cms.forms.submit(slug, body)`)",
  testimonials: "Testimonios (`cms.forms.testimonials(slug)`)",
  activities:   "Actividades (`cms.activities.list()`)",
  clientConfig: "Config cliente (`cms.clientConfig.get()`)",
};

for (const [key, label] of Object.entries(modMap)) {
  const checked = modules[key] ?? false;
  // Reemplaza "- [ ] Xxx" o "- [x] Xxx" con el estado correcto
  const pattern = new RegExp(`- \\[[ x]\\] ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
  claudeMd = claudeMd.replace(pattern, `- [${checked ? 'x' : ' '}] ${label}`);
}

const claudePath = resolve(process.cwd(), 'CLAUDE.md');
writeFileSync(claudePath, claudeMd, 'utf-8');
console.log(`✓ CLAUDE.md creado`);

// ─── resumen ─────────────────────────────────────────────────────────────

console.log('\n' + line('═'));
console.log('  Configuración completada\n');
console.log(`  Sitio:    ${siteName}`);
console.log(`  Cliente:  ${clientName}  (slug: ${clientSlug})`);
console.log(`  Dominio:  ${prodDomain}`);
console.log(`  CMS API:  ${CMS_API}`);
console.log(`  Dev URL:  http://localhost:${localPort}`);
console.log('\n  Módulos activos:');
for (const [key, label] of Object.entries(modMap)) {
  if (modules[key]) console.log(`    ✓ ${label.split('(')[0].trim()}`);
}

// ─── verificación de conexión ────────────────────────────────────────────

console.log('\n' + line());
console.log('  Verificando conexión al CMS...\n');

const origin = `http://localhost:${localPort}`;
const testUrl = `${CMS_API}/cms-components?clientSlug=${encodeURIComponent(clientSlug)}`;

try {
  const res = await fetch(testUrl, {
    headers: { Origin: origin },
    signal: AbortSignal.timeout(8000),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    // Error de negocio (cliente no encontrado, dominio no autorizado, etc.)
    console.log(`  ✗ Error del CMS (HTTP ${res.status})`);
    console.log(`    Mensaje: ${json.error ?? json.message ?? 'sin detalle'}`);
    console.log('');
    if (res.status === 404 || (json.error ?? '').toLowerCase().includes('cliente')) {
      console.log('  → El cliente todavía no está registrado en CMS admin.');
      console.log(`    Ir a Admin → Clientes → Nuevo → slug: "${clientSlug}"`);
    } else if ((json.error ?? '').toLowerCase().includes('dominio') || (json.error ?? '').toLowerCase().includes('autorizado')) {
      console.log('  → Dominio no autorizado. En CMS admin, agregá a Dominios:');
      console.log(`    - localhost  (para dev local)`);
      console.log(`    - ${prodDomain}  (producción)`);
    }
  } else {
    const components = json.data?.components ?? [];
    const clientInfo = json.data?.client;

    console.log(`  ✓ Conexión OK — cliente: ${clientInfo?.name ?? clientSlug}`);
    console.log(`  ✓ Componentes recibidos: ${components.length}`);

    if (components.length === 0) {
      console.log('\n  (Sin componentes publicados todavía — normal en setup inicial)');
    } else {
      // Agrupar por página
      const byPage = {};
      for (const c of components) {
        const page = c.page || '(sin página)';
        if (!byPage[page]) byPage[page] = [];
        byPage[page].push(c);
      }
      console.log('');
      for (const [page, comps] of Object.entries(byPage)) {
        console.log(`  Página "${page}":`);
        for (const c of comps) {
          const keys = Object.keys(c.data ?? {}).slice(0, 3).join(', ');
          console.log(`    • [${c.type}] ${c.name}  →  data: { ${keys}${Object.keys(c.data ?? {}).length > 3 ? ', ...' : ''} }`);
        }
      }
    }
  }
} catch (err) {
  if (err.name === 'TimeoutError' || err.name === 'AbortError') {
    console.log('  ✗ Timeout — el CMS no respondió en 8 segundos.');
    console.log('    Verificá que https://micms.website esté accesible.');
  } else {
    console.log(`  ✗ No se pudo conectar: ${err.message}`);
    console.log('    Verificá tu conexión a internet.');
  }
}

console.log('\n' + line());
console.log('  Próximos pasos:');
console.log('    1. Registrar cliente en CMS admin si no está (slug + dominios)');
console.log('    2. Agregar PUBLIC_CMS_API y PUBLIC_CLIENT_SLUG en Vercel env vars');
console.log('    3. Completar tabla type→componente en CLAUDE.md');
console.log('    4. Crear componentes en CMS admin y cargar los JSON de data');
console.log(line('═') + '\n');
