import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // important for GitHub Pages
  build: {
    outDir: 'docs', // 🚀 THIS tells Vite to build into /docs
  },
});
