// Builds the short class deck; its content is written by hand from docs/presentaciones/2026-11-26-clase-agentes.md.
// Usage (from the repository root): node scripts/presentaciones/corta.js <out.pptx>
const pptxgen = require("pptxgenjs");

const OUT = process.argv[2];
const C = {
  ink: "1B2A41", paper: "F6F3EC", amber: "E8A33D", slate: "4C6E91",
  mute: "4B5563", white: "FFFFFF", text: "1F2937", card: "FFFFFF", line: "E5E0D5",
  navy2: "26395A", soft: "E2E8F0",
};
const H = "Cambria";   // lining figures (Georgia's old-style digits looked uneven)
const B = "Calibri";
const M = "Consolas";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "hispafox";
pres.title = "De la documentación a la PR fusionada, con un equipo de agentes";

const shadow = () => ({ type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.12 });
const noLine = (c) => ({ color: c, width: 0 });

function head(slide, kick, text) {
  slide.addText(kick.toUpperCase(), { x: 0.5, y: 0.22, w: 9, h: 0.25, fontFace: B, fontSize: 10, bold: true, color: C.amber, charSpacing: 3, margin: 0 });
  slide.addText(text, { x: 0.5, y: 0.5, w: 9, h: 0.6, fontFace: H, fontSize: 30, bold: true, color: C.ink, margin: 0, valign: "top" });
}
function card(slide, x, y, w, h, accent = C.slate) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.card }, line: { color: C.line, width: 0.75 }, shadow: shadow() });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h, fill: { color: accent }, line: noLine(accent) });
}
function bullets(slide, items, x, y, w, h, size = 14) {
  slide.addText(items.map((t, i) => ({
    text: t, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1 },
  })), { x, y, w, h, fontFace: B, fontSize: size, color: C.text, paraSpaceAfter: 8, valign: "top", margin: 0.05 });
}
function circleNum(slide, n, x, y, d = 0.42) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: C.amber }, line: noLine(C.amber) });
  slide.addText(String(n), { x, y, w: d, h: d, fontFace: B, fontSize: 14, bold: true, color: C.ink, align: "center", valign: "middle", margin: 0 });
}
function arrow(slide, x, y, w, color = C.slate) {
  slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 1.5, endArrowType: "triangle" } });
}

// ---------- 1. Title ----------
{
  const s = pres.addSlide();
  s.background = { color: C.ink };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: 5.625, fill: { color: C.amber }, line: noLine(C.amber) });
  s.addText("CLASE · 26 DE NOVIEMBRE DE 2026", { x: 0.8, y: 0.8, w: 8, h: 0.3, fontFace: B, fontSize: 12, bold: true, color: C.amber, charSpacing: 3, margin: 0 });
  s.addText([{ text: "De la pizarra", options: { breakLine: true } }, { text: "a la Pull Request" }], {
    x: 0.8, y: 1.3, w: 8.7, h: 1.55, fontFace: H, fontSize: 42, bold: true, color: C.white, margin: 0, valign: "top", lineSpacingMultiple: 0.95,
  });
  s.addText("Una app construida por agentes de IA, de la documentación funcional a la PR fusionada, con puntos de control humanos", {
    x: 0.8, y: 3.05, w: 8.2, h: 0.75, fontFace: B, fontSize: 18, color: C.soft, margin: 0, valign: "top",
  });
  const tags = ["PHP 8.3 · Symfony 7", "Doctrine · SQLite", "Angular 22 · Vitest", "Claude Code"];
  const tg = 0.3, tw = (8.2 - 3 * tg) / 4;
  tags.forEach((t, i) => {
    const x = 0.8 + i * (tw + tg);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 4.1, w: tw, h: 0.42, fill: { color: C.navy2 }, line: { color: C.slate, width: 0.75 } });
    s.addText(t, { x, y: 4.1, w: tw, h: 0.42, fontFace: B, fontSize: 11, color: C.white, align: "center", valign: "middle", margin: 0 });
  });
  s.addText("DemoAgentes · Lista de Tareas", { x: 0.8, y: 4.85, w: 6, h: 0.3, fontFace: B, fontSize: 12, color: "CBD5E1", margin: 0 });
  s.addNotes("Abre con una frase: \"hace tres días esto era una pizarra\" (paso 1, 2026-11-24). Enseña el repositorio en GitHub. Aclara que es una demo didáctica: se prioriza la claridad del código. Anuncia el plan: 20 minutos de contexto y después construimos el equipo de agentes con las manos.");
}

// ---------- 2. Flow ----------
{
  const s = pres.addSlide();
  s.background = { color: C.paper };
  head(s, "La idea", "De la documentación a la PR");
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.3, w: 9, h: 0.6, fill: { color: C.ink }, line: noLine(C.ink) });
  s.addText([
    { text: "CLAUDE.md, el candado: ", options: { bold: true, color: C.amber } },
    { text: "stack, capas y reglas. Si algo no encaja, primero se cambia el candado, con aprobación.", options: { color: C.white } },
  ], { x: 0.7, y: 1.3, w: 8.6, h: 0.6, fontFace: B, fontSize: 13, valign: "middle", margin: 0 });
  const steps = [
    ["Documentación", "Funcionalidades F‑xx y reglas RN‑xx"],
    ["Issues y análisis", "Backlog en GitHub y diseño técnico"],
    ["IA con skills", "Un skill por capa"],
    ["App", "Symfony y Angular, con tests"],
    ["PR fusionada", "Closes #<nº>"],
  ];
  const gap = 0.35, w = (9 - 4 * gap) / 5, y = 2.3, h = 1.35;
  steps.forEach(([t, d], i) => {
    const x = 0.5 + i * (w + gap);
    card(s, x, y, w, h, i === 4 ? C.amber : C.slate);
    s.addText(t, { x: x + 0.15, y: y + 0.12, w: w - 0.18, h: 0.55, fontFace: H, fontSize: 12.5, bold: true, color: C.ink, margin: 0, valign: "top" });
    s.addText(d, { x: x + 0.17, y: y + 0.72, w: w - 0.27, h: 0.55, fontFace: B, fontSize: 11.5, color: C.mute, margin: 0, valign: "top" });
    if (i < steps.length - 1) {
      const ax = x + w;
      arrow(s, ax, y + h / 2, gap);
      if ([0, 1, 3].includes(i)) {
        s.addShape(pres.shapes.OVAL, { x: ax + gap / 2 - 0.09, y: y + h + 0.12, w: 0.18, h: 0.18, fill: { color: C.amber }, line: noLine(C.amber) });
        s.addShape(pres.shapes.LINE, { x: ax + gap / 2, y: y + h / 2, w: 0, h: h / 2 + 0.12, line: { color: C.amber, width: 1, dashType: "dash" } });
      }
    }
  });
  s.addShape(pres.shapes.OVAL, { x: 0.5, y: 4.2, w: 0.22, h: 0.22, fill: { color: C.amber }, line: noLine(C.amber) });
  s.addText([
    { text: "CRITERIO: ", options: { bold: true, color: C.ink } },
    { text: "una persona revisa en cada salida antes de avanzar (documentación, backlog y PR).", options: { color: C.text } },
  ], { x: 0.85, y: 4.12, w: 8.6, h: 0.4, fontFace: B, fontSize: 14, margin: 0, valign: "middle" });
  s.addText([
    { text: "El MCP de GitHub se sustituyó por la CLI ", options: {} },
    { text: "gh", options: { fontFace: M } },
    { text: ".", options: {} },
  ], { x: 0.85, y: 4.6, w: 8.6, h: 0.35, fontFace: B, fontSize: 12, color: C.mute, margin: 0 });
  s.addNotes("Es la pizarra del paso 1 pasada a limpio. Enseña CLAUDE.md abierto. El mensaje: si algo no encaja, se cambia primero el candado, con aprobación, y no el código por libre. Los puntos ámbar son los CRITERIO: la documentación, el análisis y el backlog se revisan antes de pasar a la IA, y la PR antes de darla por buena. Cuenta que el MCP de GitHub se sustituyó por la CLI gh.");
}

// ---------- 3. Candado y firmas ----------
{
  const s = pres.addSlide();
  s.background = { color: C.paper };
  head(s, "Las reglas", "El candado y las firmas en modo aviso");
  card(s, 0.5, 1.35, 5.5, 3.4);
  s.addText("Cómo funciona", { x: 0.8, y: 1.5, w: 5, h: 0.4, fontFace: H, fontSize: 18, bold: true, color: C.ink, margin: 0 });
  bullets(s, [
    "Una firma la da una persona en el chat; el agente nunca firma por su cuenta.",
    "Modo aviso (2026-11-25): una firma pendiente no bloquea la clase; se avisa en una línea y se sigue.",
    "Siguen siendo obligatorios: no implementar sin issue, y no abrir PR ni fusionar con tests en rojo.",
    "Las reglas se negocian y dejan rastro: el 405 entró en el candado con aprobación expresa.",
  ], 0.8, 2.0, 4.95, 2.95, 15);
  s.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 1.35, w: 3.2, h: 3.4, fill: { color: C.ink }, line: noLine(C.ink) });
  s.addText("9", { x: 6.3, y: 1.65, w: 3.2, h: 1.35, fontFace: H, fontSize: 80, bold: true, color: C.amber, align: "center", valign: "middle", margin: 0 });
  s.addText("filas en «Pendientes de firma»", { x: 6.5, y: 3.05, w: 2.8, h: 0.6, fontFace: B, fontSize: 15, color: C.white, align: "center", valign: "top", margin: 0 });
  s.addText([{ text: "Un control que se relaja", options: { breakLine: true } }, { text: "debe dejar rastro." }], { x: 6.5, y: 3.75, w: 2.8, h: 0.8, fontFace: B, fontSize: 13, color: C.soft, align: "center", valign: "top", margin: 0 });
  s.addNotes("Enseña la tabla \"Pendientes de firma\" del CLAUDE.md: hay 9 filas ahora mismo. Mensaje: un control que se relaja debe dejar rastro; aquí lo deja la tabla. Pregunta al grupo: \"¿qué prefieres, un control que bloquea o uno que avisa?\" y cuenta por qué aquí se eligió avisar (formación). Merge: como es una demo de clase, el agente fusiona con los tests en verde y una persona revisa lo fusionado; en un proyecto real se revisaría antes.");
}

// ---------- 4. Lo construido (1) ----------
{
  const s = pres.addSlide();
  s.background = { color: C.paper };
  head(s, "Lo construido (1)", "Backend v0.1 completo y frontend base");
  const stats = [["14", "issues en 4 milestones"], ["10", "PR fusionadas"], ["95", "tests de PHPUnit"], ["14", "rutas de la API"]];
  const sw = (9 - 3 * 0.3) / 4;
  stats.forEach(([n, l], i) => {
    const x = 0.5 + i * (sw + 0.3);
    s.addText(n, { x, y: 1.3, w: sw, h: 0.85, fontFace: H, fontSize: 54, bold: true, color: C.ink, margin: 0, valign: "bottom" });
    s.addText(l, { x, y: 2.15, w: sw, h: 0.35, fontFace: B, fontSize: 13, color: C.mute, margin: 0 });
  });
  const cw = (9 - 0.3) / 2;
  card(s, 0.5, 2.85, cw, 1.95);
  s.addText("Backend", { x: 0.8, y: 2.98, w: 4, h: 0.4, fontFace: H, fontSize: 17, bold: true, color: C.ink, margin: 0 });
  bullets(s, ["/api/tasks y /api/task-templates, issues #5 a #9", "267 aserciones, PHPStan y PHP-CS-Fixer", "Errores siempre en problem+json"], 0.8, 3.45, cw - 0.45, 1.5, 14);
  card(s, 0.5 + cw + 0.3, 2.85, cw, 1.95, C.amber);
  s.addText("Frontend base (#3)", { x: 0.8 + cw + 0.3, y: 2.98, w: 4, h: 0.4, fontFace: H, fontSize: 17, bold: true, color: C.ink, margin: 0 });
  bullets(s, ["Angular 22 con proxy a la API", "Errores problem+json traducidos al castellano", "7 tests de Vitest; las pantallas, en #10 a #12"], 0.8 + cw + 0.3, 3.45, cw - 0.45, 1.5, 14);
  s.addNotes("Enseña gh issue list --state all o la pestaña de PR. Cada PR cierra su issue sola. Pasa rápido: lo importante no es la app, es cómo se fabricó. Las 14 rutas: 8 de /api/tasks y 6 de /api/task-templates. Calidad con backend-test.ps1. Cifras de GitHub: 9 issues cerrados y 5 abiertos: #10, #11 y #12 (pantallas), #15 (categorías de la v0.2) y #4 (CI).");
}

// ---------- 5. Skills y agentes de apoyo ----------
{
  const s = pres.addSlide();
  s.background = { color: C.paper };
  head(s, "Lo construido (2)", "Skills por capa y agentes de apoyo");
  const chain = ["analisis-diseno", "modelo", "dto", "servicio", "api", "frontend", "pruebas"];
  const cg = 0.3, base = 0.3;
  const avail = 9 - cg * (chain.length - 1) - base * chain.length;
  const total = chain.reduce((a, t) => a + t.length, 0);
  let x = 0.5;
  chain.forEach((t, i) => {
    const w = base + avail * t.length / total;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w, h: 0.46, fill: { color: C.ink }, line: noLine(C.ink) });
    s.addText(t, { x, y: 1.3, w, h: 0.46, fontFace: M, fontSize: 10.5, color: C.white, align: "center", valign: "middle", margin: 0 });
    if (i < chain.length - 1) arrow(s, x + w, 1.53, cg);
    x += w + cg;
  });
  s.addText([
    { text: "nueva-feature", options: { bold: true, color: C.ink, fontFace: M } },
    { text: " orquesta la cadena: detecta qué capas toca una petición y encadena los skills, sin implementar nada.", options: { color: C.text } },
  ], { x: 0.5, y: 1.9, w: 9, h: 0.4, fontFace: B, fontSize: 13, margin: 0, valign: "middle" });
  const agents = [
    ["guardian-candado", "/revisar-candado", "CUMPLE o NO CUMPLE"],
    ["qa-exploratorio", "/probar-qa", "Prueba la API por HTTP"],
    ["trazador-reglas", "/trazar-reglas", "Regla → código → test"],
    ["refinador-backlog", "/refinar-backlog", "Issues y preguntas al PO"],
    ["revisor-seguridad", "/revisar-seguridad", "Revisión OWASP"],
    ["disenador-ui", "/disenar-ui", "Especificación de pantallas"],
    ["presentador", "/presentar", "Esta presentación"],
  ];
  const ag = 0.3, aw = (9 - 3 * ag) / 4, ah = 1.0;
  const cell = (i) => ({ x: 0.5 + (i % 4) * (aw + ag), y: 2.55 + Math.floor(i / 4) * (ah + ag) });
  agents.forEach(([n, c, d], i) => {
    const { x, y } = cell(i);
    card(s, x, y, aw, ah);
    s.addText(n, { x: x + 0.17, y: y + 0.1, w: aw - 0.22, h: 0.3, fontFace: B, fontSize: 12.5, bold: true, color: C.ink, margin: 0 });
    s.addText(c, { x: x + 0.17, y: y + 0.4, w: aw - 0.22, h: 0.25, fontFace: M, fontSize: 10, color: C.slate, margin: 0 });
    s.addText(d, { x: x + 0.17, y: y + 0.66, w: aw - 0.22, h: 0.26, fontFace: B, fontSize: 11, color: C.mute, margin: 0 });
  });
  const { x: cx, y: cy } = cell(7);
  s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: aw, h: ah, fill: { color: C.amber }, line: noLine(C.amber) });
  s.addText("qa-exploratorio encontró el fallo que acabó siendo el #23", { x: cx + 0.15, y: cy, w: aw - 0.3, h: ah, fontFace: B, fontSize: 12, bold: true, color: C.ink, valign: "middle", margin: 0 });
  s.addNotes("Enseña .claude/skills/ y .claude/agents/ en el explorador. Prueba real del paso 56: qa-exploratorio hizo 54 pruebas sobre #8 y #9 (51 OK y 3 hallazgos); uno de ellos, rutas inexistentes con respuesta en HTML, es el #23 que veremos arreglado. El refinador-backlog dijo que el #15 no estaba listo y devolvió 9 preguntas para el PO. Además de los skills por capa están bitacora y mensaje-commit.");
}

// ---------- 6. Skill, agente y comando ----------
{
  const s = pres.addSlide();
  s.background = { color: C.paper };
  head(s, "Conceptos", "Skill, agente y comando");
  const cols = [
    ["Skill", "Cómo se hace", ".claude/skills/", "el de quien lo usa", "api, nueva-feature"],
    ["Agente", "Quién lo hace", ".claude/agents/", "propio y limpio", "guardian-candado"],
    ["Comando", "Cómo se lanza", ".claude/commands/", "el de la conversación", "/revisar-candado"],
  ];
  const g = 0.3, w = (9 - 2 * g) / 3;
  cols.forEach(([h, q, where, ctx, ex], i) => {
    const x = 0.5 + i * (w + g);
    const fill = i === 1 ? C.amber : C.ink;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w, h: 0.55, fill: { color: fill }, line: noLine(fill) });
    s.addText(h, { x, y: 1.3, w, h: 0.55, fontFace: H, fontSize: 19, bold: true, color: i === 1 ? C.ink : C.white, align: "center", valign: "middle", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.85, w, h: 1.65, fill: { color: C.card }, line: { color: C.line, width: 0.75 } });
    s.addText([
      { text: q, options: { bold: true, fontSize: 16, color: C.ink, breakLine: true } },
      { text: where, options: { fontFace: M, fontSize: 11.5, color: C.slate, breakLine: true } },
      { text: "Contexto: " + ctx, options: { fontSize: 13, color: C.mute, breakLine: true } },
      { text: "Ejemplo: " + ex, options: { fontSize: 13, color: C.mute } },
    ], { x: x + 0.2, y: 1.97, w: w - 0.35, h: 1.45, fontFace: B, paraSpaceAfter: 5, valign: "top", margin: 0 });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.8, w: 9, h: 1.25, fill: { color: C.ink }, line: noLine(C.ink) });
  s.addText("Quien verifica no corrige", { x: 0.75, y: 3.92, w: 4.1, h: 0.45, fontFace: H, fontSize: 18, bold: true, color: C.amber, margin: 0 });
  s.addText("El verificador y el guardián no tienen Edit ni Write: dan un veredicto fijo que lee otro agente.", { x: 0.75, y: 4.38, w: 4.1, h: 0.6, fontFace: B, fontSize: 12.5, color: C.soft, margin: 0, valign: "top" });
  s.addText("Quien coordina no implementa", { x: 5.15, y: 3.92, w: 4.1, h: 0.45, fontFace: H, fontSize: 18, bold: true, color: C.amber, margin: 0 });
  s.addText("El orquestador reparte el trabajo y lee resultados; los que editan son los implementadores.", { x: 5.15, y: 4.38, w: 4.1, h: 0.6, fontFace: B, fontSize: 12.5, color: C.soft, margin: 0, valign: "top" });
  s.addNotes("Abre .claude/agents/guardian-candado.md y señala description (cuándo usarlo), tools (qué puede hacer) y el formato de salida (CUMPLE o NO CUMPLE, APROBADO o REVISAR). Pregunta retórica: \"¿qué pasaría si el verificador pudiera editar?\" Respuesta: marcaría en verde lo que él mismo ha tocado. Es el hilo que retomamos en el lab; aquí solo se plantea.");
}

// ---------- 7. Equipo de agentes + demo ----------
{
  const s = pres.addSlide();
  s.background = { color: C.paper };
  head(s, "Hoy en el lab", "El equipo de agentes");
  const box = (t, x, y, w, h, fill, color, size = 12, border = false) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: border ? { color: C.line, width: 0.75 } : noLine(fill) });
    s.addText(t, { x, y, w, h, fontFace: B, fontSize: size, bold: true, color, align: "center", valign: "middle", margin: 0 });
  };
  box("Persona · /orquestar", 0.5, 1.33, 1.65, 0.6, C.slate, C.white, 11.5);
  arrow(s, 2.15, 1.63, 0.35);
  box("Orquestador", 2.5, 1.25, 1.75, 0.75, C.ink, C.amber, 15);
  const team = ["Planificador", "Implementador backend", "Implementador frontend", "Verificador", "guardian-candado"];
  const vx = 3.375, bx = 3.75, bw = 2.1, bh = 0.38, pitch = 0.66, y0 = 2.25;
  const lastY = y0 + (team.length - 1) * pitch + bh / 2;
  s.addShape(pres.shapes.LINE, { x: vx, y: 2.0, w: 0, h: lastY - 2.0, line: { color: C.slate, width: 1.25 } });
  team.forEach((t, i) => {
    const y = y0 + i * pitch;
    arrow(s, vx, y + bh / 2, bx - vx);
    if (i === 4) box(t, bx, y, bw, bh, C.amber, C.ink, 11.5);
    else box(t, bx, y, bw, bh, C.card, C.ink, 11.5, true);
  });
  card(s, 0.5, 2.25, 2.6, 1.0, C.amber);
  s.addText([
    { text: "Plan en ", options: { color: C.text } },
    { text: "docs/planes/", options: { fontFace: M, color: C.slate, breakLine: true } },
    { text: "Máximo 3 vueltas de corrección", options: { color: C.text } },
  ], { x: 0.72, y: 2.25, w: 2.3, h: 1.0, fontFace: B, fontSize: 11.5, margin: 0, valign: "middle", paraSpaceAfter: 6 });
  const dy = 1.25, dh = lastY + bh / 2 - dy;
  card(s, 6.15, dy, 3.35, dh, C.amber);
  s.addText("Demo · 2 a 3 min", { x: 6.45, y: dy + 0.15, w: 3, h: 0.4, fontFace: H, fontSize: 17, bold: true, color: C.ink, margin: 0 });
  const steps = [["/agents", "Los 7 agentes de apoyo"], ["/revisar-candado #24", "PR #24, la del issue #23"], ["Veredicto", "CUMPLE y git status limpio"]];
  steps.forEach(([c, d], i) => {
    const y = dy + 0.8 + i * 1.0;
    circleNum(s, i + 1, 6.45, y, 0.42);
    s.addText(c, { x: 7.0, y: y - 0.02, w: 2.4, h: 0.28, fontFace: i === 2 ? B : M, fontSize: 11.5, bold: true, color: C.ink, margin: 0 });
    s.addText(d, { x: 7.0, y: y + 0.28, w: 2.4, h: 0.28, fontFace: B, fontSize: 12, color: C.mute, margin: 0 });
  });
  s.addNotes("El diagrama es el del lab; no lo expliques paso a paso, eso es el lab. Una idea: cada agente es un sombrero que antes llevaba una sola conversación.\n\nDEMO (2 a 3 min): 1) En Claude Code, /agents: enseña los siete agentes de apoyo (todavía no están los cinco del lab). 2) Lanza /revisar-candado #24 (la PR del issue #23). Mientras trabaja (unos 25 s en el ensayo), abre docs/planes/plan-23-errores-problem-json.md y enseña capas afectadas y descartadas. 3) Enseña el veredicto (en el ensayo, CUMPLE) y que no ha modificado nada: git status. 4) Cierra: \"dentro de una hora, esto será una pieza más del equipo\".\n\nPlan B: si el agente no responde o tarda, enseña el plan y la PR #24 en GitHub y cuenta el veredicto del ensayo.");
}

// ---------- 8. Dos ensayos ----------
{
  const s = pres.addSlide();
  s.background = { color: C.paper };
  head(s, "Ensayos con datos reales", "Dos ensayos: cuánto tarda cada agente");
  s.addChart(pres.charts.BAR, [
    { name: "Ensayo 1 · #10 frontend", labels: ["Planificador", "Implementador", "Verificador", "Guardián"], values: [40, 330, 40, 25] },
    { name: "Ensayo 2 · #23 backend", labels: ["Planificador", "Implementador", "Verificador", "Guardián"], values: [30, 150, 20, 25] },
  ], {
    x: 0.4, y: 1.55, w: 5.6, h: 3.53, barDir: "col", barGapWidthPct: 60, valAxisMaxVal: 400, valAxisMajorUnit: 100,
    chartColors: [C.slate, C.amber],
    chartArea: { fill: { color: C.paper } }, plotArea: { fill: { color: C.paper } },
    catAxisLabelColor: C.mute, valAxisLabelColor: C.mute, catAxisLabelFontSize: 12, valAxisLabelFontSize: 10,
    catAxisLabelFontFace: B, valAxisLabelFontFace: B,
    valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: "none" },
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text, dataLabelFontSize: 11, dataLabelFontFace: B,
    showLegend: true, legendPos: "b", legendFontSize: 12, legendColor: C.text, legendFontFace: B,
    showValAxisTitle: false,
  });
  const cards = [
    ["7 min", "de agentes en el primer ensayo (435 s)", C.slate],
    ["PR #24", "el #23 arreglado de verdad, con 4 tests", C.amber],
    ["APROBADO · CUMPLE", "a la primera, las dos veces", C.slate],
  ];
  s.addText("Segundos por agente", { x: 0.5, y: 1.3, w: 5.4, h: 0.3, fontFace: B, fontSize: 12, bold: true, color: C.mute, margin: 0 });
  const ch = 1.06, cg = 0.3;
  cards.forEach(([big, small, acc], i) => {
    const y = 1.3 + i * (ch + cg);
    card(s, 6.3, y, 3.2, ch, acc);
    s.addText([
      { text: big, options: { fontFace: H, fontSize: i === 2 ? 17 : 24, bold: true, color: C.ink, breakLine: true } },
      { text: small, options: { fontSize: 12.5, color: C.mute } },
    ], { x: 6.55, y, w: 2.85, h: ch, fontFace: B, margin: 0, valign: "middle" });
  });
  s.addNotes("Enseña la PR #24 en GitHub y el diff pequeño. El primer ensayo (#10) fue en ramas locales, sin PR: unos 7 minutos de agentes (435 s), 42 tests de Vitest en verde y pantallas probadas a mano en 3 minutos. El segundo (#23) fue el de verdad: /orquestar lanzado como comando, agentes creados sin commit como se hará hoy, y PR fusionada. ApiJsonFormatSubscriber hace que los 404 y 405 de /api salgan en problem+json. Verificador y guardián dieron luz verde a la primera las dos veces; lo interesante no fueron los aciertos (siguiente diapositiva).");
}

// ---------- 9. Lo que salió mal ----------
{
  const s = pres.addSlide();
  s.background = { color: C.paper };
  head(s, "La diapositiva más útil", "Lo que salió mal y lo que aprendimos");
  const code = (t) => ({ text: t, options: { fontFace: M } });
  const plain = (t) => ({ text: t, options: {} });
  const items = [
    [[plain("Los agentes tardaron 7 minutos en aparecer")], [plain("Crearlos al principio o abrir sesión nueva")]],
    [[plain("Los ID de ejemplo, escritos a mano: 404")], [plain("Se leen de cada respuesta")]],
    [[plain("Verificador y guardián miraban "), code("main..HEAD")], [plain("Revisan también los cambios sin commit")]],
    [[plain("El planificador inventó un agente")], [plain("Solo asigna agentes que existen")]],
    [[plain("Cada skill cerraba con commit y PR")], [plain("Un solo cierre, el del orquestador")]],
    [[plain("Nadie podía actualizar el análisis")], [plain("Los implementadores, con "), code("analisis-diseno")]],
    [[plain("El skill "), code("api"), plain(" se contradecía")], [plain("Corregido: hace falta el subscriber")]],
  ];
  items.forEach(([p, f], i) => {
    const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4;
    const x = 0.5 + col * 4.6, y = 1.35 + row * 0.92;
    circleNum(s, i + 1, x, y + 0.04, 0.42);
    s.addText(p, { x: x + 0.6, y, w: 3.85, h: 0.32, fontFace: B, fontSize: 14, bold: true, color: C.ink, margin: 0, valign: "top" });
    s.addText(f, { x: x + 0.6, y: y + 0.34, w: 3.85, h: 0.3, fontFace: B, fontSize: 12.5, color: C.mute, margin: 0, valign: "top" });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 4.11, w: 4.4, h: 0.94, fill: { color: C.ink }, line: noLine(C.ink) });
  s.addText("Los agentes fallan en las costuras (permisos, rutas, quién cierra), no en el código.", { x: 5.3, y: 4.11, w: 4.05, h: 0.94, fontFace: H, fontSize: 14, color: C.white, valign: "middle", margin: 0 });
  s.addNotes("Esta es la diapositiva más útil de la clase. Mensaje: los agentes fallan en las costuras (permisos, rutas, quién cierra), no en el código; por eso se ensaya antes. Anuncia que hoy quizá les pasen cosas parecidas y que la tabla de planes B del lab ya lo prevé.\n\nY de antes, para el recuerdo: PHPUnit \"colgado\" (paso 42) no era un fallo del código, era el disco al 99 % y el antivirus escaneando más de 5.600 ficheros de vendor/. El workflow de CI quedó aparcado (paso 52): al token de gh le falta el permiso workflow; está en .github/ci-pendiente.yml.");
}

// ---------- 10. Lo que queda ----------
{
  const s = pres.addSlide();
  s.background = { color: C.ink };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: 5.625, fill: { color: C.amber }, line: noLine(C.amber) });
  s.addText("LO QUE QUEDA", { x: 0.8, y: 0.45, w: 8, h: 0.3, fontFace: B, fontSize: 11, bold: true, color: C.amber, charSpacing: 3, margin: 0 });
  const open = [["#10 · #11 · #12", "Pantallas de Angular"], ["#15", "Categorías (v0.2)"], ["#4", "CI aparcada"]];
  const ow = (8.7 - 2 * 0.3) / 3;
  open.forEach(([n, d], i) => {
    const x = 0.8 + i * (ow + 0.3);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 0.9, w: ow, h: 1.0, fill: { color: C.navy2 }, line: { color: C.slate, width: 0.75 } });
    s.addText(n, { x: x + 0.18, y: 0.98, w: ow - 0.3, h: 0.45, fontFace: H, fontSize: 19, bold: true, color: C.white, margin: 0 });
    s.addText(d, { x: x + 0.18, y: 1.43, w: ow - 0.3, h: 0.35, fontFace: B, fontSize: 13, color: C.soft, margin: 0 });
  });
  s.addText("También: tablero de GitHub Projects, entorno Docker y 9 firmas pendientes.", { x: 0.8, y: 2.1, w: 8.7, h: 0.35, fontFace: B, fontSize: 13, color: C.soft, margin: 0 });
  s.addText("Ahora, el lab", { x: 0.8, y: 2.75, w: 8.7, h: 0.85, fontFace: H, fontSize: 40, bold: true, color: C.white, margin: 0 });
  s.addText([
    { text: "Creamos los cinco agentes del equipo y ", options: { color: C.soft } },
    { text: "/orquestar #10", options: { color: C.amber, bold: true, fontFace: M, fontSize: 15 } },
    { text: " cierra el primer issue de pantallas.", options: { color: C.soft } },
  ], { x: 0.8, y: 3.6, w: 8.7, h: 0.5, fontFace: B, fontSize: 16, margin: 0, valign: "middle" });
  s.addText([
    { text: "Plan B: ", options: { bold: true, color: C.amber } },
    { text: "docs/formacion/agentes-referencia/   ", options: { fontFace: M } },
    { text: "Más ideas: ", options: { bold: true, color: C.amber } },
    { text: "docs/propuesta-agentes.md", options: { fontFace: M } },
  ], { x: 0.8, y: 4.75, w: 8.7, h: 0.35, fontFace: B, fontSize: 12, color: C.soft, margin: 0 });
  s.addNotes("Cierra la apertura con la transición: \"lo que ya hay lo hizo un agente solo con skills; ahora lo repartimos\". Abre docs/formacion/lab-agentes-orquestador.md y empieza por el bloque 0 (preparación). No entres en detalle de los bloques: se explican durante el lab. Si sobra tiempo, hay 15 agentes propuestos en docs/propuesta-agentes.md (por ejemplo, evaluador-agentes).");
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("written", f));
