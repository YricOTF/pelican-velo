import { defineConfig } from 'vite';

export default defineConfig({
  root: 'game',
  publicDir: '../public',
  base: './',
  build: {
    target: ['chrome107', 'edge107', 'firefox104', 'safari15'],
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'pages-assets',
  },
});
