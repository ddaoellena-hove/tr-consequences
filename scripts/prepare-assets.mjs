import { cp, mkdir } from 'node:fs/promises';
await mkdir(new URL('../public/fonts/', import.meta.url), { recursive: true });
await cp(new URL('../vendor/cadence-ui/fonts/', import.meta.url), new URL('../public/fonts/', import.meta.url), { recursive: true });
