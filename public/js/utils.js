/**
 * Utility functions for the Gemini Tracker frontend.
 * All costs are displayed in INR (₹).
 */

/** Format a number with Indian numbering (e.g. 1,23,456) */
function formatNumber(num) {
  if (num == null) return '0';
  return Number(num).toLocaleString('en-IN');
}

/** Format INR for display */
function formatCurrency(amount) {
  if (!amount || amount === 0) return '₹0.00';
  if (amount < 1) return `₹${amount.toFixed(4)}`;
  if (amount < 100) return `₹${amount.toFixed(2)}`;
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format date for table display */
function formatTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Truncate string with ellipsis */
function truncate(str, maxLen = 60) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
}

/** Show a toast notification */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/** Animate a stat value change */
function animateValue(elementId, newValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const oldValue = el.textContent;
  el.textContent = newValue;
  if (oldValue !== newValue) {
    el.classList.remove('value-update');
    void el.offsetWidth; // Force reflow
    el.classList.add('value-update');
  }
}

/** Fetch wrapper with error handling */
async function api(url, options = {}) {
  try {
    const resp = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
    return data;
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}
