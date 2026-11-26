// Small local server for the live orchestrator view.
// Serves index.html and estado.json (written by hook.js). No dependencies.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || process.argv[2] || 4300);
const STATE_FILE = path.join(__dirname, 'estado.json');
const PAGE = path.join(__dirname, 'index.html');
const RECORDINGS_DIR = path.join(__dirname, 'grabaciones');
const PLANS_DIR = path.join(__dirname, '..', '..', 'docs', 'planes');

function sendJson(res, body) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/estado.json') {
    let body = '{"eventos":[]}';
    try {
      body = fs.readFileSync(STATE_FILE, 'utf8');
    } catch {
      // no events yet
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(body);
    return;
  }

  // Loop state of each issue (docs/planes/estado-<n>.json, written by scripts/orq/loop.js)
  if (url.pathname === '/estados') {
    let list = [];
    try {
      list = fs.readdirSync(PLANS_DIR).filter((f) => /^estado-\d+\.json$/.test(f)).map((f) => {
        const d = JSON.parse(fs.readFileSync(path.join(PLANS_DIR, f), 'utf8'));
        const next = Object.entries(d.pasos).find(([, p]) => p.estado !== 'hecho' && p.estado !== 'no_aplica');
        return { issue: d.issue, titulo: d.titulo, final: d.final, siguiente: next ? next[0] : null, actualizado: d.actualizado };
      }).sort((a, b) => String(b.actualizado).localeCompare(String(a.actualizado)));
    } catch {
      // no states yet
    }
    sendJson(res, JSON.stringify(list));
    return;
  }

  const state = url.pathname.match(/^\/estados\/(\d+)$/);
  if (state) {
    const file = path.join(PLANS_DIR, `estado-${state[1]}.json`);
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    sendJson(res, fs.readFileSync(file, 'utf8'));
    return;
  }

  // Recordings saved by hook.js, newest first
  if (url.pathname === '/grabaciones') {
    let list = [];
    try {
      list = fs.readdirSync(RECORDINGS_DIR).filter((f) => f.endsWith('.json')).sort().reverse().map((name) => {
        const events = JSON.parse(fs.readFileSync(path.join(RECORDINGS_DIR, name), 'utf8')).eventos || [];
        return { nombre: name, issue: events[0]?.issue || '?', inicio: events[0]?.t, eventos: events.length };
      });
    } catch {
      // no recordings yet
    }
    sendJson(res, JSON.stringify(list));
    return;
  }

  const recording = url.pathname.match(/^\/grabaciones\/([\w.-]+\.json)$/);
  if (recording) {
    const file = path.join(RECORDINGS_DIR, recording[1]);
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    sendJson(res, fs.readFileSync(file, 'utf8'));
    return;
  }

  if (url.pathname === '/reiniciar' && req.method === 'POST') {
    // Clears the live view only; recordings are kept
    fs.writeFileSync(STATE_FILE, JSON.stringify({ eventos: [] }));
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    fs.createReadStream(PAGE).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('No encontrado');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Orquestador en vivo: http://127.0.0.1:${PORT}`);
});
