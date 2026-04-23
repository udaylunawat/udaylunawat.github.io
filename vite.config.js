import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        loader: 'loader.html',
        valkyrie: 'valkyrie.html',
        'experience-chugani': 'experience/chugani.html',
        'experience-fractal': 'experience/fractal.html',
        'experience-hcl': 'experience/hcl.html',
        'experience-tcs-infosys': 'experience/tcs-infosys.html',
        'experience-yang': 'experience/yang.html',
        'project-agentic-data-analysis': 'projects/agentic-data-analysis.html',
        'project-alpr': 'projects/alpr.html',
        'project-covid-xray': 'projects/covid-xray.html',
        'project-liveliness-detection': 'projects/liveliness-detection.html',
        'project-other-ml-projects': 'projects/other-ml-projects.html',
        'project-pdf2podcast': 'projects/pdf2podcast.html',
        'project-rockreveal-ai': 'projects/rockreveal-ai.html',
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
    assetsDir: 'assets',
  },
  server: {
    open: true,
  },
});
