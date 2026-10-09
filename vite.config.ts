import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work from any path (GitHub Pages project sites, subfolders, file://).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', target: 'es2019' },
});
