// Headless Edge via CDP: open a URL, optionally click a button, save a PNG.
// Usage: node scripts/presentaciones/capturas.js <url> <out.png> [buttonText]
// Needs Microsoft Edge; the app must be running (backend and frontend).
const { spawn } = require("child_process");
const fs = require("fs");
const [url, out, button] = process.argv.slice(2);
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;
const profile = require("path").join(__dirname, "edge-profile");
const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page"); } catch { await sleep(250); }
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); } };
  await new Promise((r) => (ws.onopen = r));
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1.5, mobile: false });
  await send("Page.enable");
  await send("Page.navigate", { url });
  await sleep(4000);
  if (button) {
    await send("Runtime.evaluate", { expression: `[...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(button)}).click()` });
    await sleep(800);
  }
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("saved", out);
  ws.close(); edge.kill();
  process.exit(0);
})().catch((e) => { console.error(e); edge.kill(); process.exit(1); });
