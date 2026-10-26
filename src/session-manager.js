/**
 * Session Manager — lifecycle management for tracking sessions.
 * Each session aggregates multiple API calls with their token/cost data.
 */

import { randomUUID } from 'crypto';
import { saveSession, loadAllSessions, getSession } from './storage.js';

let activeSessionId = null;

function createEmptyTotals() {
  return {
    calls: 0,
    tokens: { input: 0, output: 0, thinking: 0, cached: 0, total: 0 },
    cost: { input: 0, output: 0, thinking: 0, cached: 0, total: 0 },
    avgLatencyMs: 0,
    totalLatencyMs: 0,
  };
}

export async function startSession(name) {
  // End any active session first
  if (activeSessionId) {
    await endSession(activeSessionId);
  }

  const session = {
    id: randomUUID(),
    name: name || `Session ${new Date().toLocaleString()}`,
    startedAt: new Date().toISOString(),
    endedAt: null,
    status: 'active',
    calls: [],
    totals: createEmptyTotals(),
    budget: null,
  };

  activeSessionId = session.id;
  await saveSession(session);
  return session;
}

export async function endSession(sessionId) {
  const session = await getSession(sessionId || activeSessionId);
  if (!session) return null;

  session.status = 'completed';
  session.endedAt = new Date().toISOString();
  recalculateTotals(session);

  if (activeSessionId === session.id) {
    activeSessionId = null;
  }

  await saveSession(session);
  return session;
}

export async function getActiveSession() {
  if (!activeSessionId) return null;
  return await getSession(activeSessionId);
}

export async function getSessionHistory() {
  return await loadAllSessions();
}

export async function getSessionStats(sessionId) {
  const session = await getSession(sessionId);
  if (!session) return null;
  recalculateTotals(session);
  return session.totals;
}

export async function addCallToSession(callData) {
  let session;
  if (!activeSessionId) {
    session = await startSession('Auto-started session');
  } else {
    session = await getSession(activeSessionId);
  }
  if (!session) return null;

  session.calls.push(callData);
  recalculateTotals(session);
  await saveSession(session);
  return session;
}

export async function setSessionBudget(sessionId, budgetUsd) {
  const session = await getSession(sessionId || activeSessionId);
  if (!session) return null;
  session.budget = budgetUsd;
  await saveSession(session);
  return session;
}

export function checkBudget(session) {
  if (!session.budget) return { withinBudget: true, percentage: 0 };
  const spent = session.totals.cost.total;
  const percentage = (spent / session.budget) * 100;
  return {
    withinBudget: spent < session.budget,
    percentage: Math.min(percentage, 100),
    spent,
    budget: session.budget,
    remaining: Math.max(session.budget - spent, 0),
  };
}

function recalculateTotals(session) {
  const totals = createEmptyTotals();
  totals.calls = session.calls.length;

  for (const call of session.calls) {
    const tok = call.tokens || {};
    const cost = call.cost || {};

    totals.tokens.input += tok.input || 0;
    totals.tokens.output += tok.output || 0;
    totals.tokens.thinking += tok.thinking || 0;
    totals.tokens.cached += tok.cached || 0;
    totals.tokens.total += tok.total || 0;

    totals.cost.input += cost.inputCost || 0;
    totals.cost.output += cost.outputCost || 0;
    totals.cost.thinking += cost.thinkingCost || 0;
    totals.cost.cached += cost.cachedCost || 0;
    totals.cost.total += cost.totalCost || 0;

    totals.totalLatencyMs += call.latencyMs || 0;
  }

  totals.avgLatencyMs = totals.calls > 0
    ? Math.round(totals.totalLatencyMs / totals.calls)
    : 0;

  session.totals = totals;
}

export function getActiveSessionId() {
  return activeSessionId;
}
