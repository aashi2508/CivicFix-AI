import { app } from '../src/app'; import http from 'http';
const s = http.createServer(app); s.listen(0, async () => { const port = (s.address() as any).port; const r = await fetch(`http://127.0.0.1:${port}/health`); if (!r.ok) process.exitCode = 1; console.log(await r.json()); s.close(); });
