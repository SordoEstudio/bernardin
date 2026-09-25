import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://alfaterra.com.ar',
  i18n: { defaultLocale: 'es', locales: ['es', 'en'] },
  integrations: [sitemap()],
})

