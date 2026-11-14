// Copia los archivos publicables a dist/ (lo que se despliega en GitHub Pages).
import { cp, rm, mkdir } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
console.log('Build listo en dist/');
