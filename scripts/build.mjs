import { build } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist/fonts', { recursive: true });
await cp('vendor/cadence-ui/fonts', 'dist/fonts', { recursive: true });
await cp('src/index.html', 'dist/index.html');
await cp('src/styles.css', 'dist/styles.css');
await build({entryPoints:['src/app.jsx'],bundle:true,minify:true,format:'esm',outfile:'dist/app.js',jsx:'automatic',external:['/fonts/*'],define:{'process.env.NODE_ENV':'"production"','import.meta.env.DEV':'false'}});
