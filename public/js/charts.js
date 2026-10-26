/**
 * Chart.js chart management — Material Design 3 color tokens.
 * All costs in INR (₹).
 */

let costTimeChart = null;
let tokenDistChart = null;

const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

function chartColors() {
  return isDark() ? {
    input: 'rgba(168, 199, 250, 0.85)',
    output: 'rgba(127, 207, 207, 0.85)',
    thinking: 'rgba(213, 190, 229, 0.85)',
    gradient1: 'rgba(168, 199, 250, 0.3)',
    gradient2: 'rgba(168, 199, 250, 0.02)',
    grid: 'rgba(255, 255, 255, 0.04)',
    text: 'rgba(196, 198, 208, 0.7)',
    tooltip: 'rgba(29, 32, 36, 0.97)',
    tooltipText: '#e2e2e9',
    tooltipSub: '#8e9099',
  } : {
    input: 'rgba(11, 87, 208, 0.8)',
    output: 'rgba(0, 137, 123, 0.8)',
    thinking: 'rgba(119, 83, 109, 0.8)',
    gradient1: 'rgba(11, 87, 208, 0.15)',
    gradient2: 'rgba(11, 87, 208, 0.01)',
    grid: 'rgba(0, 0, 0, 0.05)',
    text: 'rgba(68, 71, 79, 0.7)',
    tooltip: 'rgba(255, 255, 255, 0.97)',
    tooltipText: '#1b1b1f',
    tooltipSub: '#44474f',
  };
}

function getDefaultOptions() {
  const c = chartColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: c.text,
          font: { family: "'Google Sans Text', 'Inter', sans-serif", size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: c.tooltip,
        titleColor: c.tooltipText,
        bodyColor: c.tooltipSub,
        borderColor: 'rgba(128,128,128,0.15)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: { family: "'Google Sans', sans-serif", weight: '500', size: 12 },
        bodyFont: { family: "'Google Sans Mono', monospace", size: 11 },
      },
    },
    scales: {
      x: {
        grid: { color: c.grid, drawBorder: false },
        ticks: { color: c.text, font: { size: 10, family: "'Google Sans Text', sans-serif" } },
        border: { display: false },
      },
      y: {
        grid: { color: c.grid, drawBorder: false },
        ticks: { color: c.text, font: { size: 10, family: "'Google Sans Mono', monospace" } },
        border: { display: false },
      },
    },
  };
}

function updateCostTimeChart(calls) {
  const canvas = document.getElementById('canvasCostTime');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const c = chartColors();

  let cumulative = 0;
  const labels = [];
  const data = [];

  (calls || []).forEach((call, i) => {
    cumulative += (call.cost?.totalCost || 0);
    labels.push(formatTime(call.timestamp) || `#${i + 1}`);
    data.push(parseFloat(cumulative.toFixed(4)));
  });

  if (!labels.length) { labels.push('—'); data.push(0); }

  if (costTimeChart) {
    costTimeChart.data.labels = labels;
    costTimeChart.data.datasets[0].data = data;
    costTimeChart.update('none');
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, c.gradient1);
  gradient.addColorStop(1, c.gradient2);

  const options = getDefaultOptions();
  options.plugins.legend.display = false;
  options.scales.y.ticks.callback = (v) => `₹${v < 1 ? v.toFixed(3) : v.toFixed(2)}`;

  costTimeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cumulative Cost (₹)',
        data,
        borderColor: c.input,
        backgroundColor: gradient,
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: data.length > 20 ? 0 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: c.input,
        pointBorderColor: isDark() ? '#1d2024' : '#ffffff',
        pointBorderWidth: 2,
      }],
    },
    options,
  });
}

function updateTokenDistChart(tokens) {
  const canvas = document.getElementById('canvasTokenDist');
  if (!canvas) return;
  const c = chartColors();

  const inputVal = tokens?.input || 0;
  const outputVal = tokens?.output || 0;
  const thinkingVal = tokens?.thinking || 0;
  const hasData = inputVal + outputVal + thinkingVal > 0;

  if (tokenDistChart) {
    tokenDistChart.data.datasets[0].data = hasData ? [inputVal, outputVal, thinkingVal] : [1, 1, 1];
    tokenDistChart.update('none');
    return;
  }

  tokenDistChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Input', 'Output', 'Thinking'],
      datasets: [{
        data: hasData ? [inputVal, outputVal, thinkingVal] : [1, 1, 1],
        backgroundColor: [c.input, c.output, c.thinking],
        borderWidth: 0,
        hoverOffset: 8,
        borderRadius: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: c.text,
            font: { family: "'Google Sans Text', sans-serif", size: 11 },
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 8,
          },
        },
        tooltip: {
          ...getDefaultOptions().plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${formatNumber(val)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function destroyCharts() {
  if (costTimeChart) { costTimeChart.destroy(); costTimeChart = null; }
  if (tokenDistChart) { tokenDistChart.destroy(); tokenDistChart = null; }
}
