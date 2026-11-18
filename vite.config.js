import { defineConfig } from 'vite';

export default defineConfig({
  root: 'game',
  publicDir: '../public',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'pages-assets',
  },
});
