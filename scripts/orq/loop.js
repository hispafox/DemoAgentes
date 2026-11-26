#!/usr/bin/env node
// Orchestrator loop engine for DemoAgentes.
// It is the ONLY writer of docs/planes/estado-<issue>.json. It knows the order of the steps of
// .claude/agents/orquestador.md and refuses to mark a step as done without its proof.
//
//   node scripts/orq/loop.js crear <n> [--rama <rama>]
//   node scripts/orq/loop.js estado <n>
//   node scripts/orq/loop.js siguiente <n>
//   node scripts/orq/loop.js marcar <n> <paso> <estado> [--prueba ..] [--veredicto ..] [--capas back,front]
//                                                       [--motivo ..] [--sin-prueba "<motivo>"]
//   node scripts/orq/loop.js aprobar <n> <paso> --dijo "<lo que dijo la persona>"
//   node scripts/orq/loop.js reabrir <n> <paso> --motivo "<motivo>"
//   node scripts/orq/loop.js aparcar <n> --motivo "<motivo>"   |   retomar <n>
//   node scripts/orq/loop.js cola [--label <label>]
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const PLANS = path.join(ROOT, 'docs', 'planes');
const MAX_ROUNDS = 3;

// Steps of .claude/agents/orquestador.md, in order: [id, what, who does it, proof it needs]
const STEPS = [
  ['1_preparar', 'Preparar: issue y rama', 'orquestador: gh issue view y git switch', 'el issue existe y la rama es la del issue'],
  ['2_planificar', 'Plan del issue', 'agente planificador', '--prueba con la ruta docs/planes/plan-<n>-*.md'],
  ['2a_criterio', 'CRITERIO: preguntas abiertas del plan', 'la persona (parada humana)', 'aprobar con --dijo, o no_aplica si el plan no tiene preguntas'],
  ['3a_backend', 'Implementar backend', 'agente implementador-backend', 'ficheros de backend/ cambiados en la rama, o no_aplica'],
  ['3b_frontend', 'Implementar frontend', 'agente implementador-frontend', 'ficheros de frontend/ cambiados en la rama, o no_aplica'],
  ['4_verificar', 'Verificar (máx. 3 vueltas)', 'agente verificador', '--veredicto APROBADO|REVISAR y --prueba con el resumen de tests'],
  ['5_guardian', 'Revisar el candado', 'agente guardian-candado', '--veredicto CUMPLE|"NO CUMPLE"'],
  ['6a_bitacora', 'Bitácora', 'skill bitacora', 'docs/bitacora.md cambiado en la rama y con el #<n>'],
  ['6b_commit', 'Commit', 'skill mensaje-commit y git commit', 'un commit de la rama con (#<n>)'],
  ['6c_pr', 'Pull Request', 'gh pr create', 'una PR abierta desde la rama'],
  ['6d_merge', 'Merge y tests en main', 'gh pr merge y scripts de test en main', 'la PR fusionada en GitHub y --prueba con los tests en main'],
  ['7_revision_funcional', 'Revisión funcional', 'la persona (parada humana)', 'aprobar con --dijo, o no_aplica si no hay pantallas'],
];
const STEP_IDS = STEPS.map((s) => s[0]);
const HUMAN = ['2a_criterio', '7_revision_funcional'];
const IMPLEMENTERS = { back: '3a_backend', front: '3b_frontend' };
const CLOSED = ['hecho', 'no_aplica'];

// ---------- helpers ----------
function sh(cmd, args) {
  try {
    return execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}
const ghJson = (args) => { const out = sh('gh', args); return out ? JSON.parse(out) : null; };
const now = () => new Date().toISOString();
const statePath = (n) => path.join(PLANS, `estado-${n}.json`);

function fail(msg) {
  console.error(`\n⛔ ${msg}\n`);
  process.exit(1);
}

function load(n) {
  const p = statePath(n);
  if (!fs.existsSync(p)) fail(`No existe ${path.relative(ROOT, p)}. Créalo con: node scripts/orq/loop.js crear ${n}`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function save(d) {
  d.actualizado = now();
  const p = statePath(d.issue);
  fs.writeFileSync(p + '.tmp', JSON.stringify(d, null, 2) + '\n');
  fs.renameSync(p + '.tmp', p);
}

function log(d, paso, estado, detalle) {
  d.historial.push({ t: now(), paso, estado, ...(detalle ? { detalle } : {}) });
}

function parseArgs(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    else pos.push(argv[i]);
  }
  return { pos, opt };
}

function slug(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 4).join('-');
}

const currentBranch = () => sh('git', ['branch', '--show-current']);

// The PR of the issue branch, if any (open, merged or closed)
function prOf(d) {
  const list = ghJson(['pr', 'list', '--head', d.rama, '--state', 'all', '--json', 'number,url,state']);
  return list && list.length ? list[0] : null;
}

// Files changed by the issue: from git while on its branch, from its PR otherwise
function changedFiles(d) {
  if (currentBranch() === d.rama) {
    const diff = sh('git', ['diff', '--name-only', 'main...HEAD']) || '';
    const status = (sh('git', ['status', '--porcelain', '-uall']) || '').split('\n').map((l) => l.slice(3));
    return [...new Set([...diff.split('\n'), ...status].filter(Boolean))];
  }
  const pr = prOf(d);
  if (!pr) return [];
  const data = ghJson(['pr', 'view', String(pr.number), '--json', 'files']);
  return data ? data.files.map((f) => f.path) : [];
}

function commitsOf(d) {
  if (currentBranch() === d.rama) {
    return (sh('git', ['log', 'main..HEAD', '--format=%h %s']) || '').split('\n').filter(Boolean);
  }
  const pr = prOf(d);
  if (!pr) return [];
  const data = ghJson(['pr', 'view', String(pr.number), '--json', 'commits']);
  return data ? data.commits.map((c) => `${c.oid.slice(0, 7)} ${c.messageHeadline}`) : [];
}

// ---------- proofs: returns [ok, evidence or reason] ----------
function proof(d, paso, opt) {
  const n = d.issue;
  switch (paso) {
    case '1_preparar': {
      const issue = ghJson(['issue', 'view', String(n), '--json', 'number,state']);
      if (!issue) return [false, `el issue #${n} no existe`];
      if (currentBranch() === d.rama) return [true, `issue #${n} ${issue.state}; rama ${d.rama} activa`];
      if (prOf(d)) return [true, `issue #${n} ${issue.state}; la rama ${d.rama} tiene PR`];
      return [false, `no estás en la rama ${d.rama} (estás en ${currentBranch()})`];
    }
    case '2_planificar': {
      const p = opt.prueba;
      if (!p || p === true) return [false, 'falta --prueba con la ruta del plan'];
      if (!new RegExp(`plan-${n}-[^/\\\\]+\\.md$`).test(p)) return [false, `${p} no es un plan del #${n} (docs/planes/plan-${n}-*.md)`];
      if (!fs.existsSync(path.join(ROOT, p))) return [false, `${p} no existe`];
      d.plan = p.replace(/\\/g, '/');
      return [true, d.plan];
    }
    case '3a_backend':
    case '3b_frontend': {
      const dir = paso === '3a_backend' ? 'backend/' : 'frontend/';
      const files = changedFiles(d).filter((f) => f.startsWith(dir));
      return files.length ? [true, `${files.length} ficheros de ${dir}`] : [false, `no hay cambios en ${dir} en la rama ni en su PR`];
    }
    case '4_verificar':
      if (opt.veredicto !== 'APROBADO') return [false, '--veredicto APROBADO (para REVISAR usa el estado "revisar")'];
      if (!opt.prueba || opt.prueba === true) return [false, 'falta --prueba con el resumen de tests (p. ej. "Vitest 66/66, build OK")'];
      return [true, `Veredicto: APROBADO · ${opt.prueba}`];
    case '5_guardian':
      if (opt.veredicto !== 'CUMPLE') return [false, '--veredicto CUMPLE (para NO CUMPLE usa el estado "revisar")'];
      return [true, 'Veredicto: CUMPLE'];
    case '6a_bitacora': {
      if (!changedFiles(d).includes('docs/bitacora.md')) return [false, 'docs/bitacora.md no cambia en la rama'];
      const text = fs.readFileSync(path.join(ROOT, 'docs', 'bitacora.md'), 'utf8');
      return text.includes(`#${n}`) ? [true, 'docs/bitacora.md con el #' + n] : [false, `la bitácora no menciona el #${n}`];
    }
    case '6b_commit': {
      const c = commitsOf(d).find((l) => l.includes(`(#${n})`));
      return c ? [true, c] : [false, `ningún commit de la rama lleva (#${n})`];
    }
    case '6c_pr': {
      const pr = prOf(d);
      return pr ? [true, pr.url] : [false, `no hay PR desde ${d.rama}`];
    }
    case '6d_merge': {
      const pr = prOf(d);
      if (!pr) return [false, `no hay PR desde ${d.rama}`];
      const data = ghJson(['pr', 'view', String(pr.number), '--json', 'state,mergedAt']);
      if (!data || data.state !== 'MERGED') return [false, `la PR #${pr.number} no está fusionada`];
      if (!opt.prueba || opt.prueba === true) return [false, 'falta --prueba con los tests repetidos en main'];
      return [true, `PR #${pr.number} fusionada el ${data.mergedAt} · ${opt.prueba}`];
    }
    default:
      return [false, `${paso} es una parada humana: usa "aprobar" con --dijo`];
  }
}

// ---------- state logic ----------
function nextStep(d) {
  return STEP_IDS.find((id) => !CLOSED.includes(d.pasos[id].estado)) || null;
}

function checkOrder(d, paso) {
  for (const id of STEP_IDS) {
    if (id === paso) return;
    if (!CLOSED.includes(d.pasos[id].estado)) fail(`No se marca ${paso}: antes falta ${id} (${d.pasos[id].estado}).`);
  }
}

function setFinal(d) {
  if (d.aparcado) d.final = 'APARCADO';
  else if (Object.values(d.pasos).some((p) => p.estado === 'bloqueado')) d.final = 'BLOQUEADO';
  else if (CLOSED.includes(d.pasos['6d_merge'].estado)) d.final = CLOSED.includes(d.pasos['7_revision_funcional'].estado) ? 'CERRADO' : 'FUSIONADO';
  else d.final = 'ABIERTO';
}

// REVISAR / NO CUMPLE: one more round; the implementers of the named layers go back to "corregir"
function sendBack(d, paso, opt) {
  const layers = typeof opt.capas === 'string' ? opt.capas.split(',').map((s) => s.trim()) : [];
  const targets = layers.map((l) => IMPLEMENTERS[l]).filter(Boolean);
  if (!targets.length) fail('Di qué capas corrigen: --capas back, --capas front o --capas back,front');
  d.vuelta += 1;
  const verdict = paso === '4_verificar' ? 'REVISAR' : 'NO CUMPLE';
  if (d.vuelta >= MAX_ROUNDS) {
    d.pasos[paso] = { estado: 'bloqueado', veredicto: verdict, motivo: opt.motivo || `${MAX_ROUNDS} vueltas sin APROBADO`, fecha: now() };
    log(d, paso, 'bloqueado', `${verdict} en la vuelta ${d.vuelta}: para y decide la persona`);
    return;
  }
  for (const t of targets) d.pasos[t] = { estado: 'corregir', motivo: opt.motivo || verdict, fecha: now() };
  d.pasos['4_verificar'] = { estado: 'pendiente' };
  d.pasos['5_guardian'] = { estado: 'pendiente' };
  log(d, paso, 'revisar', `${verdict} (vuelta ${d.vuelta}/${MAX_ROUNDS}) → corrigen: ${layers.join(', ')}`);
}

// ---------- commands ----------
function cmdCrear(n, opt, quiet = false) {
  if (fs.existsSync(statePath(n))) fail(`Ya existe docs/planes/estado-${n}.json. Míralo con: estado ${n}`);
  const issue = ghJson(['issue', 'view', String(n), '--json', 'number,title,state']);
  if (!issue) fail(`El issue #${n} no existe en GitHub.`);
  const d = {
    issue: Number(n),
    titulo: issue.title,
    rama: typeof opt.rama === 'string' ? opt.rama : `feature/${n}-${slug(issue.title)}`,
    plan: null,
    creado: now(),
    actualizado: null,
    vuelta: 0,
    final: 'ABIERTO',
    pasos: Object.fromEntries(STEP_IDS.map((id) => [id, { estado: 'pendiente' }])),
    historial: [],
  };
  log(d, 'crear', 'hecho', `#${n} ${issue.title}`);
  save(d);
  if (quiet) return;
  console.log(`Creado docs/planes/estado-${n}.json · rama ${d.rama}`);
  cmdEstado(n);
}

function cmdEstado(n) {
  const d = load(n);
  const marks = { hecho: '✔', no_aplica: '–', pendiente: '·', en_marcha: '▶', corregir: '↺', bloqueado: '⛔', espera: '⏸' };
  console.log(`\n#${d.issue} ${d.titulo}\nrama ${d.rama} · plan ${d.plan || '—'} · vuelta ${d.vuelta}/${MAX_ROUNDS} · ${d.final}\n`);
  for (const [id, what] of STEPS) {
    const p = d.pasos[id];
    const extra = p.veredicto || p.prueba || p.motivo || p.dijo || '';
    console.log(`  ${marks[p.estado] || '?'} ${id.padEnd(22)} ${p.estado.padEnd(10)} ${what}${extra ? '  · ' + String(extra).slice(0, 70) : ''}`);
  }
  console.log('');
}

function cmdSiguiente(n) {
  const d = load(n);
  const id = nextStep(d);
  if (!id) return console.log(`#${n}: no queda nada (${d.final}).`);
  const [, what, who, needs] = STEPS[STEP_IDS.indexOf(id)];
  const p = d.pasos[id];
  if (p.estado === 'bloqueado') return console.log(`#${n}: ⛔ BLOQUEADO en ${id} — ${p.motivo}. Decide la persona; después: reabrir ${n} ${id}`);
  console.log(`#${n} · siguiente: ${id} — ${what}${p.estado === 'corregir' ? ' (CORREGIR: ' + p.motivo + ')' : ''}`);
  console.log(`  lo hace: ${who}`);
  console.log(`  prueba para cerrarlo: ${needs}`);
  if (HUMAN.includes(id)) console.log('  ⏸ PARADA HUMANA: pregunta a la persona y registra con "aprobar" lo que diga.');
}

function cmdMarcar(n, paso, estado, opt) {
  const d = load(n);
  if (!STEP_IDS.includes(paso)) fail(`Paso desconocido: ${paso}. Son: ${STEP_IDS.join(', ')}`);
  const valid = ['hecho', 'no_aplica', 'en_marcha', 'revisar'];
  if (!valid.includes(estado)) fail(`Estado no válido: ${estado}. Son: ${valid.join(', ')}`);
  checkOrder(d, paso);
  if (d.pasos[paso].estado === 'bloqueado') fail(`${paso} está BLOQUEADO: decide la persona y después "reabrir ${n} ${paso} --motivo ..."`);

  if (estado === 'en_marcha') {
    d.pasos[paso] = { ...d.pasos[paso], estado: 'en_marcha', desde: now() };
    log(d, paso, 'en_marcha');
  } else if (estado === 'revisar') {
    if (paso !== '4_verificar' && paso !== '5_guardian') fail('Solo el verificador y el guardián devuelven trabajo.');
    sendBack(d, paso, opt);
  } else if (estado === 'no_aplica') {
    if (!opt.motivo || opt.motivo === true) fail('no_aplica necesita --motivo (p. ej. "el plan no tiene pasos de backend").');
    d.pasos[paso] = { estado: 'no_aplica', motivo: opt.motivo, fecha: now() };
    log(d, paso, 'no_aplica', opt.motivo);
  } else {
    if (HUMAN.includes(paso)) fail(`${paso} es una parada humana: usa "aprobar ${n} ${paso} --dijo ..."`);
    let [ok, evidence] = proof(d, paso, opt);
    if (!ok) {
      if (typeof opt['sin-prueba'] !== 'string') fail(`NO se marca ${paso}: ${evidence}.\n   Hazlo de verdad, o fuérzalo con --sin-prueba "<motivo>", que queda escrito en el JSON.`);
      evidence = `forzado sin prueba: ${opt['sin-prueba']} (${evidence})`;
    }
    d.pasos[paso] = { estado: 'hecho', prueba: evidence, fecha: now(), ...(opt.veredicto ? { veredicto: opt.veredicto } : {}) };
    log(d, paso, 'hecho', evidence);
  }
  setFinal(d);
  save(d);
  if (estado === 'revisar') console.log(`#${n} · ${paso} → ${d.historial.at(-1).detalle}`);
  else console.log(`#${n} · ${paso} → ${d.pasos[paso].estado}${d.pasos[paso].prueba ? '  · ' + d.pasos[paso].prueba : ''}`);
  if (d.final === 'BLOQUEADO') console.log(`⛔ BLOQUEADO tras ${d.vuelta} vueltas: para y entrega el informe de bloqueo a la persona.`);
}

function cmdAprobar(n, paso, opt) {
  const d = load(n);
  if (!HUMAN.includes(paso)) fail(`${paso} no es una parada humana. Las paradas son: ${HUMAN.join(', ')}`);
  if (!opt.dijo || opt.dijo === true) fail('Falta --dijo con lo que respondió la persona. Sin su respuesta no se aprueba nada.');
  checkOrder(d, paso);
  d.pasos[paso] = { estado: 'hecho', dijo: opt.dijo, fecha: now() };
  log(d, paso, 'hecho', `la persona: ${opt.dijo}`);
  setFinal(d);
  save(d);
  console.log(`#${n} · ${paso} → aprobado: «${opt.dijo}»`);
}

function cmdReabrir(n, paso, opt) {
  const d = load(n);
  if (!STEP_IDS.includes(paso)) fail(`Paso desconocido: ${paso}`);
  if (!opt.motivo || opt.motivo === true) fail('reabrir necesita --motivo.');
  const from = STEP_IDS.indexOf(paso);
  for (const id of STEP_IDS.slice(from)) {
    if (d.pasos[id].estado !== 'no_aplica' || id === paso) d.pasos[id] = { estado: 'pendiente' };
  }
  if (from <= STEP_IDS.indexOf('4_verificar')) d.vuelta = 0;
  log(d, paso, 'reabierto', opt.motivo);
  setFinal(d);
  save(d);
  console.log(`#${n}: reabierto desde ${paso} — «${opt.motivo}»`);
}

// Parked issues stay out of the queue until they are resumed
function cmdAparcar(n, opt) {
  if (!opt.motivo || opt.motivo === true) fail('aparcar necesita --motivo.');
  if (!fs.existsSync(statePath(n))) cmdCrear(n, opt, true);
  const d = load(n);
  d.aparcado = { motivo: opt.motivo, fecha: now() };
  log(d, 'aparcar', 'aparcado', opt.motivo);
  setFinal(d);
  save(d);
  console.log(`#${n}: aparcado — «${opt.motivo}». La cola lo salta hasta "retomar ${n}".`);
}

function cmdRetomar(n) {
  const d = load(n);
  delete d.aparcado;
  log(d, 'retomar', 'hecho');
  setFinal(d);
  save(d);
  console.log(`#${n}: vuelve a la cola (${d.final}).`);
}

// Sequential queue: open issues in number order; the first one not merged is the next
function cmdCola(opt) {
  const args = ['issue', 'list', '--state', 'open', '--limit', '100', '--json', 'number,title,labels'];
  if (typeof opt.label === 'string') args.push('--label', opt.label);
  const issues = (ghJson(args) || []).sort((a, b) => a.number - b.number);
  let next = null;
  console.log('');
  for (const i of issues) {
    const p = statePath(i.number);
    const d = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
    const where = d ? `${d.final} · ${nextStep(d) || 'fin'}` : 'sin estado';
    if (!next && (!d || d.final === 'ABIERTO')) next = i.number;
    console.log(`  ${next === i.number ? '→' : ' '} #${String(i.number).padEnd(4)} ${where.padEnd(28)} ${i.title}`);
  }
  console.log(next ? `\nSiguiente de la cola: #${next}` : '\nCola vacía: no hay issues abiertos sin terminar.');
  const blocked = issues.filter((i) => fs.existsSync(statePath(i.number)) && JSON.parse(fs.readFileSync(statePath(i.number), 'utf8')).final === 'BLOQUEADO');
  if (blocked.length) console.log(`Bloqueados (los decide la persona): ${blocked.map((i) => '#' + i.number).join(', ')}`);
}

// ---------- main ----------
const { pos, opt } = parseArgs(process.argv.slice(2));
const [cmd, n, a, b] = pos;
const needIssue = () => { if (!/^\d+$/.test(n || '')) fail(`Falta el número del issue: loop.js ${cmd} <n>`); };
switch (cmd) {
  case 'crear': needIssue(); cmdCrear(n, opt); break;
  case 'estado': needIssue(); cmdEstado(n); break;
  case 'siguiente': needIssue(); cmdSiguiente(n); break;
  case 'marcar': needIssue(); cmdMarcar(n, a, b, opt); break;
  case 'aprobar': needIssue(); cmdAprobar(n, a, opt); break;
  case 'reabrir': needIssue(); cmdReabrir(n, a, opt); break;
  case 'aparcar': needIssue(); cmdAparcar(n, opt); break;
  case 'retomar': needIssue(); cmdRetomar(n); break;
  case 'cola': cmdCola(opt); break;
  default:
    console.log('Uso: node scripts/orq/loop.js <crear|estado|siguiente|marcar|aprobar|reabrir|aparcar|retomar|cola> ...');
    process.exit(cmd ? 1 : 0);
}
