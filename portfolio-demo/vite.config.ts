import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

// This static entry deliberately does not load the Sites/Cloudflare app router,
// its identity gateway, D1, or account routes.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('..', import.meta.url)),
      'next/image': fileURLToPath(
        new URL('./static-image.tsx', import.meta.url),
      ),
    },
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  build: {
    outDir: fileURLToPath(new URL('../dist/public-demo', import.meta.url)),
    emptyOutDir: true,
  },
});
