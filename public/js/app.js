/**
 * Gemini Tracker — Main Frontend Application Logic
 * Google Material Design 3 style. All costs in INR (₹).
 */

let pollingInterval = null;
let currentSession = null;

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await checkHealth();
  await loadModels();
  await refreshDashboard();
  startPolling();
  bindEvents();
});

// ── Health Check ────────────────────────────────────────────
async function checkHealth() {
  try {
    const health = await api('/api/health');
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');

    if (health.apiKeyConfigured) {
      dot.className = 'status-indicator ok';
      text.textContent = 'Connected';
    } else {
      dot.className = 'status-indicator error';
      text.textContent = 'No API Key';
      showToast('Set your GEMINI_API_KEY in .env to use the playground', 'warning', 5000);
    }

    if (health.exchangeRate) {
      document.getElementById('exchangeRateDisplay').innerHTML =
        `<span class="material-symbols-rounded" style="font-size:16px">currency_exchange</span> ₹${health.exchangeRate}/USD`;
    }

    if (health.activeSession) {
      const sessionData = await api('/api/sessions/active');
      if (sessionData.active) {
        currentSession = sessionData.session;
        updateSessionUI(true);
      }
    }
  } catch {
    document.getElementById('statusDot').className = 'status-indicator error';
    document.getElementById('statusText').textContent = 'Offline';
  }
}

// ── Models ──────────────────────────────────────────────────
async function loadModels() {
  try {
    const models = await api('/api/models');
    const select = document.getElementById('modelSelect');
    select.innerHTML = '';
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      const inpInr = (m.input * 95).toFixed(0);
      const outInr = (m.output * 95).toFixed(0);
      opt.textContent = `${m.displayName}  ·  ₹${inpInr} / ₹${outInr} per 1M`;
      select.appendChild(opt);
    });
  } catch {
    document.getElementById('modelSelect').innerHTML =
      '<option value="gemini-3.8-flash">Gemini 3.8 Flash</option>';
  }
}

// ── Polling ─────────────────────────────────────────────────
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(refreshDashboard, 3000);
}

async function refreshDashboard() {
  try {
    const sessionResp = await api('/api/sessions/active');

    if (sessionResp.active) {
      currentSession = sessionResp.session;
      updateSessionUI(true);
      updateStatCards(currentSession);
      updateCharts(currentSession);
      updateCallsTable(currentSession.calls || []);
      updateBudgetDisplay(sessionResp.budgetStatus);
    } else {
      currentSession = null;
      updateSessionUI(false);
    }

    await refreshSessionHistory();

    const stats = await api('/api/stats');
    document.getElementById('allTimeCost').textContent = `All-time: ${stats.formattedCost}`;

    const health = await api('/api/health');
    const mins = Math.floor(health.uptime / 60);
    document.getElementById('footerUptime').textContent = `Uptime: ${mins}m`;
  } catch { /* silent */ }
}

// ── Session UI ──────────────────────────────────────────────
function updateSessionUI(active) {
  const icon = document.getElementById('sessionIcon');
  const label = document.getElementById('sessionLabel');
  const btnStart = document.getElementById('btnStartSession');
  const btnEnd = document.getElementById('btnEndSession');
  const nameInput = document.getElementById('sessionNameInput');

  if (active && currentSession) {
    icon.className = 'material-symbols-rounded session-icon active';
    icon.textContent = 'radio_button_checked';
    label.textContent = currentSession.name || 'Active Session';
    btnStart.style.display = 'none';
    btnEnd.style.display = '';
    nameInput.style.display = 'none';
  } else {
    icon.className = 'material-symbols-rounded session-icon';
    icon.textContent = 'radio_button_unchecked';
    label.textContent = 'No active session';
    btnStart.style.display = '';
    btnEnd.style.display = 'none';
    nameInput.style.display = '';
    animateValue('statSessionCost', '₹0.00');
    animateValue('statTotalTokens', '0');
    animateValue('statApiCalls', '0');
    animateValue('statAvgLatency', '0ms');
    animateValue('statInputTokens', '0');
    animateValue('statOutputTokens', '0');
    animateValue('statThinkingTokens', '0');
  }
}

function updateStatCards(session) {
  if (!session?.totals) return;
  const t = session.totals;
  const tok = t.tokens || {};
  const cost = t.cost || {};

  animateValue('statSessionCost', formatCurrency(cost.total || 0));
  animateValue('statTotalTokens', formatNumber(tok.total || 0));
  animateValue('statApiCalls', formatNumber(t.calls || 0));
  animateValue('statAvgLatency', `${t.avgLatencyMs || 0}ms`);

  animateValue('statInputTokens', formatNumber(tok.input || 0));
  animateValue('statOutputTokens', formatNumber(tok.output || 0));
  animateValue('statThinkingTokens', formatNumber(tok.thinking || 0));

  document.getElementById('statInputCost').textContent = formatCurrency(cost.input || 0);
  document.getElementById('statOutputCost').textContent = formatCurrency(cost.output || 0);
  document.getElementById('statThinkingCost').textContent = formatCurrency(cost.thinking || 0);
}

function updateBudgetDisplay(budgetStatus) {
  const card = document.getElementById('cardBudget');
  const fill = document.getElementById('budgetBarFill');
  const text = document.getElementById('budgetText');

  if (!budgetStatus?.budget) { card.style.display = 'none'; return; }

  card.style.display = '';
  const pct = budgetStatus.percentage || 0;
  fill.style.width = `${Math.min(pct, 100)}%`;
  fill.className = 'budget-progress-fill' +
    (pct >= 100 ? ' danger' : pct >= 80 ? ' warning' : '');
  text.textContent = `${formatCurrency(budgetStatus.spent)} / ${formatCurrency(budgetStatus.budget)}`;
}

// ── Charts ──────────────────────────────────────────────────
function updateCharts(session) {
  if (!session) return;
  updateCostTimeChart(session.calls || []);
  updateTokenDistChart(session.totals?.tokens || {});
}

// ── Calls Table ─────────────────────────────────────────────
function updateCallsTable(calls) {
  const tbody = document.getElementById('callsTableBody');
  if (!calls?.length) {
    tbody.innerHTML = `<tr class="empty-state-row"><td colspan="10">
      <div class="empty-state">
        <span class="material-symbols-rounded empty-icon">rocket_launch</span>
        <p>No API calls yet. Use the playground above to get started.</p>
      </div>
    </td></tr>`;
    return;
  }

  const sorted = [...calls].reverse();
  tbody.innerHTML = sorted.map((call, i) => {
    const tok = call.tokens || {};
    return `<tr>
      <td class="mono">${sorted.length - i}</td>
      <td class="mono">${formatTime(call.timestamp)}</td>
      <td>${call.model || '—'}</td>
      <td class="prompt-cell" title="${(call.promptPreview || '').replace(/"/g, '&quot;')}">${truncate(call.promptPreview, 40)}</td>
      <td class="mono num">${formatNumber(tok.input)}</td>
      <td class="mono num">${formatNumber(tok.output)}</td>
      <td class="mono num">${formatNumber(tok.thinking)}</td>
      <td class="mono num"><strong>${formatNumber(tok.total)}</strong></td>
      <td class="cost-cell">${call.cost?.formattedTotal || '₹0.00'}</td>
      <td class="mono num">${call.latencyMs || 0}ms</td>
    </tr>`;
  }).join('');
}

// ── Session History ─────────────────────────────────────────
async function refreshSessionHistory() {
  try {
    const sessions = await api('/api/sessions');
    const tbody = document.getElementById('sessionsTableBody');

    if (!sessions?.length) {
      tbody.innerHTML = `<tr class="empty-state-row"><td colspan="7">
        <div class="empty-state">
          <span class="material-symbols-rounded empty-icon">folder_off</span>
          <p>No sessions yet. Start one above.</p>
        </div>
      </td></tr>`;
      return;
    }

    const sorted = [...sessions].reverse();
    tbody.innerHTML = sorted.map(s => {
      const t = s.totals || {};
      const tok = t.tokens || {};
      const cost = t.cost || {};
      const isActive = s.status === 'active';
      return `<tr>
        <td><strong>${s.name || '—'}</strong></td>
        <td class="mono">${formatDate(s.startedAt)}</td>
        <td><span class="status-badge ${s.status}">${s.status}</span></td>
        <td class="mono num">${t.calls || 0}</td>
        <td class="mono num">${formatNumber(tok.total || 0)}</td>
        <td class="cost-cell">${formatCurrency(cost.total || 0)}</td>
        <td>${!isActive ? `<button class="gm-btn gm-btn-text gm-btn-sm" style="color:var(--error)" onclick="deleteSessionById('${s.id}')">
          <span class="material-symbols-rounded">delete</span>
        </button>` : ''}</td>
      </tr>`;
    }).join('');
  } catch { /* silent */ }
}

// ── Event Bindings ──────────────────────────────────────────
function bindEvents() {
  document.getElementById('btnStartSession').addEventListener('click', async () => {
    const name = document.getElementById('sessionNameInput').value.trim();
    const budget = parseFloat(document.getElementById('budgetInput').value) || null;
    try {
      const session = await api('/api/sessions/start', {
        method: 'POST', body: JSON.stringify({ name, budget }),
      });
      currentSession = session;
      updateSessionUI(true);
      showToast(`Session "${session.name}" started`, 'success');
    } catch { /* api() shows error */ }
  });

  document.getElementById('btnEndSession').addEventListener('click', async () => {
    if (!currentSession) return;
    try {
      await api(`/api/sessions/${currentSession.id}/end`, { method: 'POST' });
      showToast('Session ended', 'info');
      currentSession = null;
      updateSessionUI(false);
      await refreshDashboard();
    } catch { /* api() shows error */ }
  });

  document.getElementById('btnSetBudget').addEventListener('click', async () => {
    if (!currentSession) { showToast('Start a session first', 'warning'); return; }
    const budget = parseFloat(document.getElementById('budgetInput').value);
    if (!budget || budget <= 0) { showToast('Enter a valid budget', 'warning'); return; }
    try {
      await api(`/api/sessions/${currentSession.id}/budget`, {
        method: 'POST', body: JSON.stringify({ budget }),
      });
      showToast(`Budget set to ₹${budget.toFixed(2)}`, 'success');
    } catch { /* api() shows error */ }
  });

  document.getElementById('btnSendPrompt').addEventListener('click', sendPrompt);
  document.getElementById('btnCountTokens').addEventListener('click', countTokensAction);

  document.getElementById('promptInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendPrompt();
    }
  });

  document.getElementById('btnThemeToggle').addEventListener('click', toggleTheme);

  document.getElementById('btnExportCsv').addEventListener('click', () => window.open('/api/export/csv', '_blank'));
  document.getElementById('btnExportJson').addEventListener('click', () => window.open('/api/export/json', '_blank'));

  document.querySelectorAll('.chip-group .chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.chip-group .chip').forEach(c => c.classList.remove('chip--selected'));
      e.target.classList.add('chip--selected');
    });
  });
}

// ── Send Prompt ─────────────────────────────────────────────
async function sendPrompt() {
  const model = document.getElementById('modelSelect').value;
  const contents = document.getElementById('promptInput').value.trim();
  if (!contents) { showToast('Enter a prompt first', 'warning'); return; }

  const btn = document.getElementById('btnSendPrompt');
  btn.disabled = true;

  try {
    const result = await api('/api/generate', {
      method: 'POST', body: JSON.stringify({ model, contents }),
    });

    document.getElementById('responseArea').style.display = '';
    document.getElementById('respModel').textContent = model;
    document.getElementById('respTokens').textContent = `${formatNumber(result.tokens?.total || 0)} tokens`;
    document.getElementById('respCost').textContent = result.cost?.formattedTotal || '₹0.00';
    document.getElementById('respLatency').textContent = `${result.latencyMs || 0}ms`;
    document.getElementById('responseText').textContent = result.text || '(empty response)';

    showToast(`Response received · ${result.cost?.formattedTotal || '₹0'}`, 'success');

    if (result.budgetStatus && !result.budgetStatus.withinBudget) {
      showToast('Budget exceeded!', 'error', 5000);
    } else if (result.budgetStatus?.percentage >= 80) {
      showToast(`${result.budgetStatus.percentage.toFixed(0)}% of budget used`, 'warning');
    }
    await refreshDashboard();
  } catch { /* api() shows error */ }
  finally { btn.disabled = false; }
}

// ── Count Tokens ────────────────────────────────────────────
async function countTokensAction() {
  const model = document.getElementById('modelSelect').value;
  const contents = document.getElementById('promptInput').value.trim();
  if (!contents) { showToast('Enter a prompt first', 'warning'); return; }

  try {
    const result = await api('/api/count-tokens', {
      method: 'POST', body: JSON.stringify({ model, contents }),
    });
    document.getElementById('tokenEstimate').style.display = '';
    document.getElementById('estTokenCount').textContent = formatNumber(result.totalTokens);
    document.getElementById('estCost').textContent = result.estimate?.estimated?.mid || '₹0.00';
  } catch { /* api() shows error */ }
}

// ── Delete Session ──────────────────────────────────────────
async function deleteSessionById(id) {
  if (!confirm('Delete this session and all its data?')) return;
  try {
    await api(`/api/sessions/${id}`, { method: 'DELETE' });
    showToast('Session deleted', 'info');
    await refreshDashboard();
  } catch { /* api() shows error */ }
}

// ── Theme Toggle ────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('gemini-tracker-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('themeIcon').textContent = saved === 'dark' ? 'dark_mode' : 'light_mode';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('gemini-tracker-theme', next);
  document.getElementById('themeIcon').textContent = next === 'dark' ? 'dark_mode' : 'light_mode';
  destroyCharts();
  if (currentSession) updateCharts(currentSession);
}
