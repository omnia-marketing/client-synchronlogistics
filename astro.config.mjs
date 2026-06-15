import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// Hybrid output: every page is prerendered to static HTML by default.
// Only routes that opt out via `export const prerender = false` (the API
// endpoints under src/pages/api) run server-side as Cloudflare Pages Functions.
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [tailwind()],
});
