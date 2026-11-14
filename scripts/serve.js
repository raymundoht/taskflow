// Servidor estático mínimo para desarrollo local (sin dependencias): npm start
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const port = process.env.PORT || 3000;

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = normalize(url.pathname === '/' ? '/index.html' : url.pathname);
  const allowed = path === '/index.html' || path.startsWith('/src/');
  if (path.includes('..') || !allowed) { res.writeHead(404).end('Not found'); return; }
  try {
    const data = await readFile(join(root, path));
    res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, () => console.log(`TaskFlow en http://localhost:${port}`));
