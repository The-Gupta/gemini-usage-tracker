/**
 * JSON-based persistence layer for session data.
 * Atomic writes (temp file + rename) prevent data corruption.
 */

import { readFile, writeFile, rename, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export async function loadAllSessions() {
  await ensureDataDir();
  if (!existsSync(SESSIONS_FILE)) {
    return [];
  }
  try {
    const raw = await readFile(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveAllSessions(sessions) {
  await ensureDataDir();
  const tempFile = SESSIONS_FILE + '.tmp';
  await writeFile(tempFile, JSON.stringify(sessions, null, 2), 'utf-8');
  await rename(tempFile, SESSIONS_FILE);
}

export async function saveSession(session) {
  const sessions = await loadAllSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  await saveAllSessions(sessions);
}

export async function deleteSession(sessionId) {
  const sessions = await loadAllSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  await saveAllSessions(filtered);
  return filtered.length < sessions.length;
}

export async function getSession(sessionId) {
  const sessions = await loadAllSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

export async function exportSessionsCsv() {
  const sessions = await loadAllSessions();
  const header = 'Session ID,Name,Started,Ended,Status,Total Calls,Input Tokens,Output Tokens,Thinking Tokens,Total Tokens,Input Cost,Output Cost,Thinking Cost,Total Cost\n';
  const rows = sessions.map(s => {
    const t = s.totals || {};
    const tok = t.tokens || {};
    const cost = t.cost || {};
    return [
      s.id, `"${s.name || ''}"`, s.startedAt, s.endedAt || '', s.status,
      t.calls || 0, tok.input || 0, tok.output || 0, tok.thinking || 0, tok.total || 0,
      (cost.input || 0).toFixed(6), (cost.output || 0).toFixed(6),
      (cost.thinking || 0).toFixed(6), (cost.total || 0).toFixed(6),
    ].join(',');
  });
  return header + rows.join('\n');
}
