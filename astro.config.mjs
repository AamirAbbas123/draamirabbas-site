import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Change SITE_URL on Vercel once your domain is connected.
export default defineConfig({
  site: process.env.SITE_URL || 'https://draamirabbas.com',
  output: 'static',
  devToolbar: { enabled: false },
  adapter: vercel(),
  // Keystatic's server code uses Astro virtual modules; keep it out of Vite's dependency pre-bundling.
  vite: { optimizeDeps: { exclude: ['@keystatic/astro'] } },
  integrations: [react(), markdoc(), keystatic(), sitemap({ filter: (p) => !p.includes('/keystatic') })],
});
