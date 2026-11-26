// Claude Code hook: records the orchestrator's progress in estado.json
// so that index.html can paint the Mermaid diagram in real time.
// It must never block Claude Code: any error is swallowed and it always exits 0.
'use strict';

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'estado.json');
const RECORDINGS_DIR = path.join(__dirname, 'grabaciones');
const MAX_EVENTS = 500;

// Subagent type -> diagram node
const AGENT_NODES = {
  planificador: 'PLAN',
  'implementador-backend': 'BACK',
  'implementador-frontend': 'FRONT',
  verificador: 'VERIF',
  'guardian-candado': 'GUARD',
};

// Shell commands -> diagram node
const COMMAND_NODES = [
  { re: /\bgh\s+issue\s+view\s+#?(\d+)/, node: 'PREP' },
  { re: /\bgit\s+commit\b/, node: 'COMMIT' },
  { re: /\bgh\s+pr\s+create\b/, node: 'PR' },
  { re: /\bgh\s+pr\s+merge\b/, node: 'MERGE' },
];

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { eventos: [] };
  }
}

function push(event) {
  const state = readState();
  state.eventos.push({ t: new Date().toISOString(), ...event });
  if (state.eventos.length > MAX_EVENTS) {
    state.eventos = state.eventos.slice(-MAX_EVENTS);
  }
  // Each run (from "inicio" on) is also saved as a recording
  if (event.tipo === 'inicio') {
    const stamp = state.eventos.at(-1).t.replace(/[:.]/g, '-').slice(0, 19);
    state.grabacion = `${stamp}-issue-${event.issue}.json`;
  }
  writeJson(STATE_FILE, state);
  if (state.grabacion) {
    let start = 0;
    state.eventos.forEach((e, i) => { if (e.tipo === 'inicio') start = i; });
    fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
    writeJson(path.join(RECORDINGS_DIR, state.grabacion), { eventos: state.eventos.slice(start) });
  }
}

function writeJson(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 1));
  fs.renameSync(tmp, file);
}

// Last node marked as running (used when SubagentStop does not say which agent ended)
function lastRunningAgentNode() {
  const status = {};
  for (const e of readState().eventos) {
    if (e.tipo === 'inicio') Object.keys(status).forEach((k) => delete status[k]);
    if (e.nodo) status[e.nodo] = e.estado;
  }
  const agentNodes = Object.values(AGENT_NODES);
  const running = Object.keys(status).filter((n) => status[n] === 'activo' && agentNodes.includes(n));
  return running.pop() || null;
}

function toText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

// Reads the last assistant message of a subagent transcript (JSONL)
function lastAssistantText(transcriptPath) {
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const entry = JSON.parse(lines[i]);
      if (entry.type === 'assistant') return toText(entry.message && entry.message.content);
    }
  } catch {
    // ignore
  }
  return '';
}

// Verdict of an agent from its final text: 'ok', 'fallo' or null (unknown)
function verdict(node, text) {
  const line = (text.match(/Veredicto:\s*([A-ZÁÉÍÓÚ ]+)/i) || [])[1] || '';
  const v = line.toUpperCase();
  if (node === 'VERIF') {
    if (v.startsWith('REVISAR')) return 'fallo';
    if (v.startsWith('APROBADO')) return 'ok';
  }
  if (node === 'GUARD') {
    if (v.startsWith('NO CUMPLE')) return 'fallo';
    if (v.startsWith('CUMPLE')) return 'ok';
  }
  if (/\bbloquead[oa]\b/i.test(text) && (node === 'BACK' || node === 'FRONT')) return 'fallo';
  return text ? 'ok' : null;
}

function summary(text) {
  const line = (text.match(/Veredicto:\s*[^\\\n"]+/i) || [])[0];
  return line ? line.trim() : 'terminado';
}

function handle(input) {
  const event = input.hook_event_name;
  const tool = input.tool_name;
  const toolInput = input.tool_input || {};

  // Subagents launched with the Agent tool
  if ((event === 'PreToolUse' || event === 'PostToolUse') && (tool === 'Agent' || tool === 'Task')) {
    const node = AGENT_NODES[toolInput.subagent_type];
    if (!node) return;
    if (event === 'PreToolUse') {
      push({ nodo: node, estado: 'activo', texto: toolInput.description || toolInput.subagent_type });
      return;
    }
    const text = toText(input.tool_response);
    // Background launch: the result arrives later through SubagentStop
    if (!/Veredicto|terminad|bloquead|plan/i.test(text) || /run_in_background|async_launched/i.test(text)) return;
    const result = verdict(node, text);
    if (result) push({ nodo: node, estado: result, texto: summary(text) });
    return;
  }

  if (event === 'SubagentStart') {
    const node = AGENT_NODES[input.agent_type];
    if (node) push({ nodo: node, estado: 'activo', texto: input.agent_type });
    return;
  }

  if (event === 'SubagentStop') {
    const node = AGENT_NODES[input.agent_type] || lastRunningAgentNode();
    if (!node) return;
    const text = toText(input.last_assistant_message) || lastAssistantText(input.agent_transcript_path);
    // Without the final text the verdict is unknown: PostToolUse of the Agent tool will set it
    if (!text && (node === 'VERIF' || node === 'GUARD')) return;
    push({ nodo: node, estado: verdict(node, text) || 'ok', texto: summary(text) });
    return;
  }

  // Questions to the person (CRITERIO)
  if (tool === 'AskUserQuestion') {
    push({ nodo: 'CRIT', estado: event === 'PreToolUse' ? 'activo' : 'ok', texto: 'pregunta a la persona' });
    return;
  }

  // Bitácora skill
  if (tool === 'Skill' && /bitacora/.test(toolInput.skill || '') && !/retomar/.test(toolInput.args || '')) {
    push({ nodo: 'BITA', estado: event === 'PreToolUse' ? 'activo' : 'ok', texto: 'skill bitacora' });
    return;
  }

  // Shell commands (issue, commit, PR, merge)
  if (tool === 'Bash' || tool === 'PowerShell') {
    const command = toolInput.command || '';
    for (const { re, node } of COMMAND_NODES) {
      const match = command.match(re);
      if (!match) continue;
      if (event === 'PreToolUse') {
        if (node === 'PREP') push({ tipo: 'inicio', issue: match[1] });
        push({ nodo: node, estado: 'activo', texto: command.slice(0, 120) });
      } else {
        const response = input.tool_response || {};
        const failed = response.interrupted || (response.exitCode && response.exitCode !== 0) || /^Error|exit code [1-9]/i.test(toText(response.stderr || ''));
        push({ nodo: node, estado: failed ? 'fallo' : 'ok', texto: command.slice(0, 120) });
      }
      return;
    }
  }
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  try {
    handle(JSON.parse(raw));
  } catch {
    // never break Claude Code
  }
  process.exit(0);
});
