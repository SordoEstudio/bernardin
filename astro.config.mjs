import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://bernardin.com.ar",
  i18n: { defaultLocale: "es", locales: ["es", "en"] },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "es",
        locales: { es: "es-AR", en: "en" },
      },
    }),
  ],
});
