// Builds a .pptx deck by parsing a presentador script (docs/presentaciones/*.md).
// Usage (from the repository root): node scripts/presentaciones/generar.js <script.md> <imgDir> <out.pptx> <config.json>
// Slide types come from each slide's "Visual:" line: ninguno (section), código, tabla, diagrama, cifras, captura.
// With "annexFrom" in the config, it appends an annex listing every "## Paso N — título (fecha)" of the bitácora.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const [MD, IMG, OUT, CFG] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(CFG, "utf8"));

const C = { ink: "1B2A41", paper: "F6F3EC", amber: "E8A33D", slate: "4C6E91", mute: "4B5563", white: "FFFFFF",
  text: "1F2937", card: "FFFFFF", line: "E5E0D5", navy2: "26395A", soft: "E2E8F0", code: "D7E3F4" };
const H = "Cambria", B = "Calibri", M = "Consolas";
const noLine = (c) => ({ color: c, width: 0 });
const shadow = () => ({ type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.12 });

// ---------- parse ----------
const lines = fs.readFileSync(MD, "utf8").replace(/\r\n/g, "\n").split("\n");
const slides = [];
let section = null, cur = null, mode = null, fence = null;
for (const raw of lines) {
  const l = raw;
  if (fence !== null) {
    if (l.startsWith("```")) { if (fence !== "mermaid") cur.code = cur.codeBuf; fence = null; }
    else if (fence !== "mermaid") cur.codeBuf.push(l);
    continue;
  }
  let m;
  if ((m = l.match(/^# Sección (\d+)\. (.+)$/))) { section = { n: +m[1], title: m[2] }; continue; }
  if ((m = l.match(/^## Diapositiva (\d+)\. (.+)$/))) {
    cur = { n: +m[1], title: m[2], section, bullets: [], table: [], codeBuf: [], notes: "" };
    slides.push(cur); mode = "bullets"; continue;
  }
  if (l.startsWith("## ")) { cur = null; continue; }
  if (!cur) continue;
  if (l.startsWith("```")) { fence = l.slice(3).trim(); cur.codeBuf = []; continue; }
  if (l.startsWith("Visual:")) { cur.visual = l.slice(7).trim(); mode = "visual"; continue; }
  if (l.startsWith("**Notas del orador:**")) { cur.notes = l.replace("**Notas del orador:**", "").trim(); mode = "notes"; continue; }
  if (mode === "bullets" && l.startsWith("- ")) cur.bullets.push(l.slice(2));
  if (mode === "visual" && l.startsWith("|")) cur.table.push(l);
}

// ---------- helpers ----------
const clean = (s) => s.replace(/\*\*/g, "");
const plain = (s) => clean(s).replace(/`/g, "");
// Split backticks into monospace runs
function runs(text, base = {}, codeColor = C.slate) {
  const parts = clean(text).split("`");
  return parts.map((p, i) => ({ text: p, options: i % 2 ? { ...base, fontFace: M, color: codeColor } : { ...base } })).filter((r) => r.text.length);
}
function estLines(s, charsPerLine) { return Math.max(1, Math.ceil(plain(s).length / charsPerLine)); }

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "hispafox";
pres.title = cfg.title;
const NSEC = new Set(slides.map((s) => s.section.n)).size;
// Annex: one row per "## Paso N — título (fecha)" of the bitácora
const annex = [];
if (cfg.annexFrom) {
  for (const l of fs.readFileSync(cfg.annexFrom, "utf8").replace(/\r\n/g, "\n").split("\n")) {
    const m = l.match(/^## Paso (\d+) — (.+) \((\d{4}-\d{2}-\d{2})\)\s*$/);
    if (m) annex.push({ n: +m[1], title: m[2], date: m[3] });
  }
}
const annexPages = Math.ceil(annex.length / 12);
const PER = Math.ceil(annex.length / Math.max(1, annexPages));
const TOTAL = slides.length + (annex.length ? annexPages + 1 : 0);

function footer(s, n, dark = false) {
  s.addText(`${n} / ${TOTAL}`, { x: 8.5, y: 5.25, w: 1.0, h: 0.25, fontFace: B, fontSize: 10, color: dark ? "AAB6C8" : "6B7280", align: "right", margin: 0 });
}
function head(s, kick, title) {
  s.addText(kick.toUpperCase(), { x: 0.5, y: 0.22, w: 8.2, h: 0.25, fontFace: B, fontSize: 10, bold: true, color: C.amber, charSpacing: 3, margin: 0 });
  s.addText(title, { x: 0.5, y: 0.5, w: 9, h: 0.55, fontFace: H, fontSize: 28, bold: true, color: C.ink, margin: 0, valign: "top" });
}
function bulletBlock(s, items, x, y, w, size) {
  const arr = [];
  items.forEach((t, i) => {
    const r = [{ text: "\u200B", options: { fontSize: size, color: C.text, bullet: { indent: 14 } } }, ...runs(t, { fontSize: size, color: C.text })];
    if (i < items.length - 1) r[r.length - 1].options.breakLine = true;
    arr.push(...r);
  });
  const cpl = (w * 72) / (size * 0.46);
  const h = items.reduce((a, t) => a + estLines(t, cpl) * size * 1.25 / 72 + 0.09, 0) + 0.05;
  s.addText(arr, { x, y, w, h, fontFace: B, paraSpaceAfter: 6, valign: "top", margin: 0.03 });
  return h;
}

function bulletsShown(sl, type) {
  const tableRows = sl.table.filter((r) => !/^\|\s*-/.test(r)).length;
  if (type === "captura") return 1;
  if (type === "código" || tableRows >= 7) return 3;
  return sl.bullets.length;
}

// ---------- visuals ----------
function codePanel(s, slide, y, maxH) {
  const cap = slide.visual.replace(/^código —\s*/, "").replace(/:$/, "");
  s.addText(runs(cap, { fontSize: 10.5, color: C.mute }), { x: 0.5, y, w: 9, h: 0.28, fontFace: B, margin: 0 });
  const raw = slide.code || [];
  const ind = Math.min(...raw.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  const code = raw.map((l) => l.slice(ind));
  let size = 11;
  const need = (sz) => code.reduce((a, l) => a + Math.max(1, Math.ceil(l.length / ((8.6 * 72) / (sz * 0.55)))), 0) * sz * 1.22 / 72 + 0.3;
  while (need(size) > maxH - 0.35 && size > 10) size -= 0.5;
  const h = Math.min(need(size), maxH - 0.35);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: y + 0.32, w: 9, h, fill: { color: C.ink }, line: noLine(C.ink) });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: y + 0.32, w: 0.07, h, fill: { color: C.amber }, line: noLine(C.amber) });
  s.addText(code.map((l, i) => ({ text: l.length ? clean(l).replace(/`/g, "") : " ", options: { breakLine: i < code.length - 1 } })),
    { x: 0.72, y: y + 0.32, w: 8.65, h, fontFace: M, fontSize: size, color: C.code, valign: "middle", margin: 0.05 });
}
function tablePanel(s, slide, y, maxH, caption) {
  const rows = slide.table.filter((r) => !/^\|\s*-/.test(r)).map((r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  const ncol = rows[0].length;
  const lens = Array.from({ length: ncol }, (_, j) => Math.max(...rows.map((r) => plain(r[j] || "").length)));
  const weights = lens.map((l, j) => Math.min(Math.max(l, plain(rows[0][j] || "").length + 4, 8), 60));
  const tok = Array.from({ length: ncol }, (_, j) => Math.max(...rows.map((r) => Math.max(...plain(r[j] || "").split(/\s+/).map((w) => w.length)))));
  let minW = tok.map((n) => n * 0.083 + 0.18);
  const ms = minW.reduce((a, b) => a + b, 0);
  if (ms > 8.6) minW = minW.map((w) => (w * 8.6) / ms);
  const rest = 9 - minW.reduce((a, b) => a + b, 0);
  const sum = weights.reduce((a, b) => a + b, 0);
  const colW = weights.map((w, j) => minW[j] + (rest * w) / sum);
  let size = 11;
  const rowH = (sz) => rows.reduce((a, r) => a + Math.max(...r.map((c, j) => estLines(c, (colW[j] * 72) / (sz * 0.5) - 2))) * sz * 1.2 / 72 + 0.12, 0);
  while (rowH(size) > maxH - (caption ? 0.35 : 0) && size > 9.5) size -= 0.5;
  let ty = y;
  if (caption) { s.addText(caption, { x: 0.5, y, w: 9, h: 0.28, fontFace: B, fontSize: 10.5, italic: true, color: C.mute, margin: 0 }); ty += 0.33; }
  const data = rows.map((r, i) => r.map((c) => ({
    text: runs(c, { fontSize: size, color: i === 0 ? C.white : C.text, bold: i === 0 }, i === 0 ? C.amber : C.slate),
    options: { fill: { color: i === 0 ? C.ink : i % 2 ? C.card : "FBF9F4" }, valign: "middle" },
  })));
  s.addTable(data, { x: 0.5, y: ty, w: 9, colW, fontFace: B, fontSize: size, border: { type: "solid", pt: 0.5, color: C.line }, margin: [3, 5, 3, 5] });
}
function diagramPanel(s, slide, y, maxH) {
  const m = slide.visual.match(/`([^`]+)`/);
  const nodes = (m ? m[1] : "").split("→").map((t) => t.trim()).filter(Boolean);
  const n = nodes.length;
  const perRow = n <= 6 ? n : Math.ceil(n / 2);
  const gap = 0.32, w = (9 - gap * (perRow - 1)) / perRow, h = n > 6 ? 0.6 : 0.72;
  const rowsN = Math.ceil(n / perRow);
  const totalH = rowsN * h + (rowsN - 1) * 0.35;
  let y0 = y + Math.max(0, Math.min((maxH - totalH) / 2 - 0.1, maxH - totalH - 0.12));
  nodes.forEach((t, i) => {
    const row = Math.floor(i / perRow), col = i % perRow;
    const x = 0.5 + col * (w + gap), yy = y0 + row * (h + 0.35);
    const crit = /^\[.*\]$/.test(t);
    const first = i === 0, last = i === n - 1;
    const fill = crit ? C.amber : first || last ? C.ink : C.card;
    s.addShape(pres.shapes.RECTANGLE, { x, y: yy, w, h, fill: { color: fill }, line: fill === C.card ? { color: C.line, width: 0.75 } : noLine(fill), shadow: fill === C.card ? shadow() : undefined });
    s.addText(plain(t.replace(/^\[|\]$/g, "")), { x: x + 0.06, y: yy, w: w - 0.12, h, fontFace: B, fontSize: n > 8 ? 10 : 11, bold: true,
      color: fill === C.ink ? C.white : C.ink, align: "center", valign: "middle", margin: 0 });
    if (col < perRow - 1 && i < n - 1) s.addShape(pres.shapes.LINE, { x: x + w, y: yy + h / 2, w: gap, h: 0, line: { color: C.slate, width: 1.5, endArrowType: "triangle" } });
  });
  if (rowsN > 1) {
    // elbow connector from the end of row 1 to the start of row 2
    const yA = y0 + h, yB = y0 + h + 0.35, xr = 0.5 + (perRow - 1) * (w + gap) + w / 2, xl = 0.5 + w / 2;
    s.addShape(pres.shapes.LINE, { x: xr, y: yA, w: 0, h: 0.175, line: { color: C.slate, width: 1.5 } });
    s.addShape(pres.shapes.LINE, { x: xl, y: yA + 0.175, w: xr - xl, h: 0, line: { color: C.slate, width: 1.5 } });
    s.addShape(pres.shapes.LINE, { x: xl, y: yA + 0.175, w: 0, h: 0.175, line: { color: C.slate, width: 1.5, endArrowType: "triangle" } });
  }
}
function statsPanel(s, slide, y, maxH) {
  const items = slide.visual.replace(/^cifras —\s*/, "").replace(/\.$/, "").split(" · ").map((it) => {
    const m = it.match(/`([^`]+)`/);
    return { num: m ? m[1] : "", label: plain(it.replace(m ? m[0] : "", "")).trim() };
  });
  const g = 0.3, w = (9 - g * (items.length - 1)) / items.length;
  const ll = Math.max(...items.map((it) => Math.ceil(it.label.length / ((w - 0.3) * 72 / (11.5 * 0.46)))));
  const h = Math.min(1.05 + ll * 0.21, maxH);
  items.forEach((it, i) => {
    const x = 0.5 + i * (w + g);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: i === 0 ? C.ink : C.card }, line: i === 0 ? noLine(C.ink) : { color: C.line, width: 0.75 }, shadow: i === 0 ? undefined : shadow() });
    s.addText(it.num, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.75, fontFace: H, fontSize: 40, bold: true, color: i === 0 ? C.amber : C.ink, margin: 0, valign: "bottom" });
    s.addText(it.label, { x: x + 0.15, y: y + 0.88, w: w - 0.3, h: h - 0.95, fontFace: B, fontSize: 11.5, color: i === 0 ? C.soft : C.mute, margin: 0, valign: "top" });
  });
}

// ---------- cover ----------
{
  const s = pres.addSlide();
  s.background = { color: C.ink };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: 5.625, fill: { color: C.amber }, line: noLine(C.amber) });
  s.addText(cfg.cover.kicker, { x: 0.8, y: 0.8, w: 8.5, h: 0.3, fontFace: B, fontSize: 12, bold: true, color: C.amber, charSpacing: 3, margin: 0 });
  s.addText([{ text: cfg.cover.title1, options: { breakLine: true } }, { text: cfg.cover.title2 }], { x: 0.8, y: 1.3, w: 8.7, h: 1.55, fontFace: H, fontSize: 42, bold: true, color: C.white, margin: 0, valign: "top", lineSpacingMultiple: 0.95 });
  s.addText(cfg.cover.subtitle, { x: 0.8, y: 3.05, w: 8.2, h: 0.75, fontFace: B, fontSize: 18, color: C.soft, margin: 0, valign: "top" });
  const tags = cfg.cover.tags;
  const tg = 0.3, tw = (8.2 - 3 * tg) / 4;
  tags.forEach((t, i) => {
    const x = 0.8 + i * (tw + tg);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 4.1, w: tw, h: 0.42, fill: { color: C.navy2 }, line: { color: C.slate, width: 0.75 } });
    s.addText(t, { x, y: 4.1, w: tw, h: 0.42, fontFace: B, fontSize: 11, color: C.white, align: "center", valign: "middle", margin: 0 });
  });
  s.addText("DemoAgentes · Lista de Tareas", { x: 0.8, y: 4.85, w: 6, h: 0.3, fontFace: B, fontSize: 12, color: "CBD5E1", margin: 0 });
  s.addNotes(cfg.cover.notes);
}

// ---------- slides ----------
const TABLE_CAPTION = { 22: "Traza esperada según el análisis y el plan de tests (no es la salida literal del agente; se puede regenerar con /trazar-reglas RN-12)" };
for (const sl of slides) {
  const s = pres.addSlide();
  const no = sl.n;
  const type = (sl.visual || "").split(/[ ;—]/)[0];
  if (type === "ninguno") {
    s.background = { color: C.ink };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: 5.625, fill: { color: C.amber }, line: noLine(C.amber) });
    const rng = sl.section.title.match(/\s*\((pasos [^)]+)\)\s*$/i);
    const secTitle = rng ? sl.section.title.slice(0, rng.index) : sl.section.title;
    s.addText(`SECCIÓN ${sl.section.n} DE ${NSEC}` + (rng ? ` · ${rng[1].toUpperCase()}` : ""), { x: 0.8, y: 1.0, w: 6, h: 0.3, fontFace: B, fontSize: 12, bold: true, color: C.amber, charSpacing: 3, margin: 0 });
    s.addText(String(sl.section.n), { x: 6.6, y: 0.7, w: 2.9, h: 2.2, fontFace: H, fontSize: 130, bold: true, color: C.navy2, align: "right", valign: "top", margin: 0 });
    s.addText(secTitle, { x: 0.8, y: 1.45, w: 7.2, h: 1.3, fontFace: H, fontSize: 36, bold: true, color: C.white, margin: 0, valign: "top" });
    s.addText(sl.bullets.map((b, i) => ({ text: plain(b), options: { bullet: { indent: 14 }, breakLine: i < sl.bullets.length - 1 } })),
      { x: 0.8, y: 3.05, w: 8.2, h: 1.6, fontFace: B, fontSize: 16, color: C.soft, paraSpaceAfter: 8, valign: "top", margin: 0 });
    footer(s, no, true);
  } else {
    s.background = { color: C.paper };
    head(s, sl.section.title, sl.title);
    let bullets = sl.bullets, bw = 9;
    const shownN = bulletsShown(sl, type);
    bullets = bullets.slice(0, shownN);
    let size = 13, bh;
    const yB = 1.25;
    // shrink bullets until the visual has room
    const visualMin = { "código": 1.6, tabla: 1.4, diagrama: 1.0, cifras: 1.3, captura: 2.35 }[type] || 1.2;
    for (;;) {
      const cpl = (bw * 72) / (size * 0.46);
      bh = bullets.reduce((a, t) => a + estLines(t, cpl) * size * 1.25 / 72 + 0.09, 0) + 0.05;
      if (yB + bh + 0.2 + visualMin <= 5.15 || size <= 11) break;
      size -= 0.5;
    }
    bulletBlock(s, bullets, 0.5, yB, bw, size);
    const vy = yB + bh + 0.18, maxH = 5.15 - vy;
    if (type === "código") codePanel(s, sl, vy, maxH);
    else if (type === "tabla") tablePanel(s, sl, vy, maxH, TABLE_CAPTION[sl.n]);
    else if (type === "diagrama") diagramPanel(s, sl, vy, maxH);
    else if (type === "cifras") statsPanel(s, sl, vy, maxH);
    else if (type === "captura") {
      const ratios = [1220 / 840, 840 / 540], g = 0.3;
      const h = Math.min(maxH - 0.1, (9 - g) / (ratios[0] + ratios[1]));
      let x = 0.5;
      ["recorte-lista.png", "recorte-formulario.png"].forEach((f, i) => {
        const w = h * ratios[i];
        s.addShape(pres.shapes.RECTANGLE, { x, y: vy, w, h, fill: { color: C.card }, line: { color: C.line, width: 0.75 }, shadow: shadow() });
        s.addImage({ path: path.join(IMG, f), x: x + 0.04, y: vy + 0.04, w: w - 0.08, h: h - 0.08, altText: i ? "Formulario de nueva tarea con el error de título obligatorio" : "Lista de tareas con pendientes y completadas" });
        x += w + g;
      });
    }
    footer(s, no);
  }
  const shownAll = type === "ninguno" ? sl.bullets.length : bulletsShown(sl, type);
  const extra = sl.bullets.length > shownAll ? "\n\nPuntos que no están en la diapositiva: " + sl.bullets.slice(shownAll).map(plain).join(" ") : "";
  s.addNotes(plain(sl.notes) + extra);
}

if (annex.length) {
  let no = slides.length + 1;
  const sep = pres.addSlide();
  sep.background = { color: C.ink };
  sep.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: 5.625, fill: { color: C.amber }, line: noLine(C.amber) });
  sep.addText("ANEXO", { x: 0.8, y: 1.0, w: 6, h: 0.3, fontFace: B, fontSize: 12, bold: true, color: C.amber, charSpacing: 3, margin: 0 });
  sep.addText(`Los ${annex.length} pasos de la bitácora`, { x: 0.8, y: 1.45, w: 7.5, h: 1.3, fontFace: H, fontSize: 36, bold: true, color: C.white, margin: 0, valign: "top" });
  const days = [...new Set(annex.map((a) => a.date))];
  sep.addText(days.map((d, i) => ({ text: `${d}: pasos ${annex.filter((a) => a.date === d)[0].n} a ${annex.filter((a) => a.date === d).slice(-1)[0].n}`, options: { bullet: { indent: 14 }, breakLine: i < days.length - 1 } })),
    { x: 0.8, y: 3.05, w: 8.2, h: 1.6, fontFace: B, fontSize: 16, color: C.soft, paraSpaceAfter: 8, valign: "top", margin: 0 });
  sep.addText("Generado automáticamente desde las cabeceras de docs/bitacora.md", { x: 0.8, y: 4.75, w: 8, h: 0.3, fontFace: B, fontSize: 11, italic: true, color: "94A3B8", margin: 0 });
  footer(sep, no++, true);
  sep.addNotes("Anexo de consulta: la lista completa de pasos, generada desde las cabeceras de la bitácora. No se presenta diapositiva a diapositiva.");
  for (let p = 0; p < annexPages; p++) {
    const rowsA = annex.slice(p * PER, (p + 1) * PER);
    const s = pres.addSlide();
    s.background = { color: C.paper };
    head(s, "Anexo", rowsA.length > 1 ? `Pasos ${rowsA[0].n} a ${rowsA[rowsA.length - 1].n}` : `Paso ${rowsA[0].n}`);
    const fmt = (d) => d.slice(8, 10) + "/" + d.slice(5, 7);
    const hdr = ["Paso", "Fecha", "Qué se hizo"].map((h) => ({ text: h, options: { bold: true, color: C.white, fill: { color: C.ink } } }));
    const body = rowsA.map((a, i) => [String(a.n), fmt(a.date), a.title].map((c, j) => ({
      text: j === 2 ? runs(c, { fontSize: 11.5, color: C.text }) : c,
      options: { fill: { color: i % 2 ? "FBF9F4" : C.card }, bold: j === 0, color: C.text },
    })));
    s.addTable([hdr, ...body], { x: 0.5, y: 1.25, w: 9, colW: [0.7, 0.8, 7.5], fontFace: B, fontSize: 11.5, border: { type: "solid", pt: 0.5, color: C.line }, margin: [2, 6, 2, 6], rowH: 0.29 });
    footer(s, no++);
    s.addNotes(`Anexo ${p + 1} de ${annexPages}: pasos ${rowsA[0].n} a ${rowsA[rowsA.length - 1].n}.`);
  }
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("written", f, "slides:", TOTAL));
