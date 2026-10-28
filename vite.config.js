import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { host: 'localhost', port: 4173, strictPort: true },
  preview: { host: 'localhost', port: 4174, strictPort: true },
  build: { outDir: 'dist' },
});
