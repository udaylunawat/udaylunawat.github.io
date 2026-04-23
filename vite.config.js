import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
    assetsDir: 'assets',
  },
  server: {
    open: true,
    fs: {
      deny: ['projects/**', 'experience/**'],
    },
  },
});
