/**
 * Express Server — serves the dashboard and exposes the REST API.
 * All costs are in INR (₹).
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initClient, trackedGenerateContent, countTokens } from './gemini-client.js';
import {
  startSession, endSession, getActiveSession, getSessionHistory,
  getSessionStats, setSessionBudget, checkBudget, getActiveSessionId,
} from './session-manager.js';
import { deleteSession, getSession, loadAllSessions, exportSessionsCsv } from './storage.js';
import { getAllModelPricing, getSupportedModels } from './pricing-config.js';
import { calculateCost, estimateCost, formatCurrency, getExchangeRate } from './cost-calculator.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ── Initialize Gemini Client ────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'your_api_key_here') {
  console.warn('\n⚠️  GEMINI_API_KEY not set! Create a .env file with your key.');
  console.warn('   Get one at: https://aistudio.google.com/\n');
} else {
  initClient(apiKey);
  console.log('✅ Gemini client initialized');
}

// ── API Routes: Generation ──────────────────────────────────

app.post('/api/generate', async (req, res) => {
  try {
    const { model, contents, systemInstruction } = req.body;
    if (!model || !contents) {
      return res.status(400).json({ error: 'model and contents are required' });
    }

    const result = await trackedGenerateContent({ model, contents, systemInstruction });

    const session = await getActiveSession();
    const budgetStatus = session ? checkBudget(session) : null;

    res.json({
      text: result.text,
      tokens: result.tokens,
      cost: result.cost,
      latencyMs: result.latencyMs,
      callId: result.callId,
      budgetStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/count-tokens', async (req, res) => {
  try {
    const { model, contents } = req.body;
    if (!model || !contents) {
      return res.status(400).json({ error: 'model and contents are required' });
    }
    const result = await countTokens({ model, contents });
    const estimate = estimateCost(model, result.totalTokens);
    res.json({ ...result, estimate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API Routes: Sessions ────────────────────────────────────

app.post('/api/sessions/start', async (req, res) => {
  try {
    const { name, budget } = req.body;
    const session = await startSession(name);
    if (budget) await setSessionBudget(session.id, budget);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sessions/:id/end', async (req, res) => {
  try {
    const session = await endSession(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await getSessionHistory();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sessions/active', async (req, res) => {
  try {
    const session = await getActiveSession();
    if (!session) return res.json({ active: false });
    const budgetStatus = checkBudget(session);
    res.json({ active: true, session, budgetStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await getSession(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const deleted = await deleteSession(req.params.id);
    res.json({ deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sessions/:id/budget', async (req, res) => {
  try {
    const { budget } = req.body;
    const session = await setSessionBudget(req.params.id, budget);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API Routes: Stats ───────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const sessions = await loadAllSessions();
    const allTime = {
      totalSessions: sessions.length,
      totalCalls: 0,
      tokens: { input: 0, output: 0, thinking: 0, total: 0 },
      cost: { total: 0 },
      formattedCost: '₹0.00',
    };

    for (const s of sessions) {
      const t = s.totals || {};
      const tok = t.tokens || {};
      const cost = t.cost || {};
      allTime.totalCalls += t.calls || 0;
      allTime.tokens.input += tok.input || 0;
      allTime.tokens.output += tok.output || 0;
      allTime.tokens.thinking += tok.thinking || 0;
      allTime.tokens.total += tok.total || 0;
      allTime.cost.total += cost.total || 0;
    }
    allTime.formattedCost = formatCurrency(allTime.cost.total);
    res.json(allTime);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats/today', async (req, res) => {
  try {
    const sessions = await loadAllSessions();
    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter(s => s.startedAt && s.startedAt.startsWith(today));

    const stats = {
      sessions: todaySessions.length,
      totalCalls: 0,
      tokens: { input: 0, output: 0, thinking: 0, total: 0 },
      cost: { total: 0 },
      formattedCost: '₹0.00',
    };

    for (const s of todaySessions) {
      const t = s.totals || {};
      const tok = t.tokens || {};
      const cost = t.cost || {};
      stats.totalCalls += t.calls || 0;
      stats.tokens.input += tok.input || 0;
      stats.tokens.output += tok.output || 0;
      stats.tokens.thinking += tok.thinking || 0;
      stats.tokens.total += tok.total || 0;
      stats.cost.total += cost.total || 0;
    }
    stats.formattedCost = formatCurrency(stats.cost.total);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API Routes: Pricing & Models ────────────────────────────

app.get('/api/pricing', (req, res) => {
  res.json(getAllModelPricing());
});

app.get('/api/models', (req, res) => {
  const models = getSupportedModels();
  const pricing = getAllModelPricing();
  res.json(models.map(m => ({ name: m, ...pricing[m] })));
});

// ── API Routes: Export ──────────────────────────────────────

app.get('/api/export/csv', async (req, res) => {
  try {
    const csv = await exportSessionsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=gemini-usage.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export/json', async (req, res) => {
  try {
    const sessions = await loadAllSessions();
    res.setHeader('Content-Disposition', 'attachment; filename=gemini-usage.json');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API Health ──────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!(apiKey && apiKey !== 'your_api_key_here'),
    activeSession: getActiveSessionId(),
    uptime: process.uptime(),
    currency: 'INR',
    exchangeRate: getExchangeRate(),
  });
});

// ── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🔮 Gemini Usage Tracker                            ║
║   Dashboard: http://localhost:${PORT}                   ║
║   Currency:  INR (₹) @ ₹${getExchangeRate()}/USD          ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
