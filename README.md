# Gemini Usage Tracker

> Track your Gemini API token usage and costs per session with a beautiful real-time dashboard.

A web-based dashboard that wraps the Google Gemini API with **automatic token tracking**, **real-time cost calculation**, and **session management**. Built for developers who want visibility into their API spending on the Tier 1 Pay-as-you-go plan.

## Features

- **Real-time Dashboard** - Material Design 3 dark/light UI with animated stat cards
- **Per-Session Cost Tracking** - Track exactly how much each session costs in INR
- **Token Breakdown** - Input, output, and thinking token counts per call
- **Interactive Charts** - Cost over time and token distribution visualizations
- **API Playground** - Test prompts directly from the dashboard with instant cost feedback
- **Budget Alerts** - Set spending limits with visual warnings at 80% and 100%
- **Export Data** - Download usage history as CSV or JSON
- **Dark/Light Themes** - Toggle between gorgeous dark and light modes
- **Latency Tracking** - Response time per call and average per session
- **Antigravity IDE Skill** - Integration with Antigravity IDE for AI-assisted workflows

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/The-Gupta/-gemini-usage-tracker.git
cd -gemini-usage-tracker
npm install
```

### 2. Add Your API Key
```bash
cp .env.example .env
# Edit .env and add your Gemini API key from https://aistudio.google.com/
```

### 3. Run
```bash
npm run dev
```

Open **http://localhost:3000** - that's it!

## Dashboard Overview

| Section | Description |
|---------|-------------|
| **Stat Cards** | Real-time session cost, token count, API calls, average latency |
| **Token Breakdown** | Input, output, and thinking tokens with individual costs |
| **Cost Chart** | Cumulative cost over time per session |
| **Token Donut** | Visual split of input vs output vs thinking tokens |
| **API Playground** | Send prompts, count tokens, see cost estimates before sending |
| **Call Log** | Detailed table of every API call with full metadata |
| **Session History** | All past sessions with costs, exportable to CSV/JSON |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Make a tracked Gemini API call |
| `POST` | `/api/count-tokens` | Count tokens for a prompt |
| `POST` | `/api/sessions/start` | Start a new tracking session |
| `POST` | `/api/sessions/:id/end` | End a session |
| `GET` | `/api/sessions/active` | Get active session with stats |
| `GET` | `/api/sessions` | List all sessions |
| `GET` | `/api/stats` | All-time aggregate statistics |
| `GET` | `/api/stats/today` | Today's usage stats |
| `GET` | `/api/pricing` | Current model pricing |
| `GET` | `/api/export/csv` | Export all data as CSV |
| `GET` | `/api/health` | Server health check |

## Supported Models & Pricing (Tier 1)

All prices are in USD per 1M tokens. Costs are displayed in INR at the current exchange rate.

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Gemini 4 Argon | $2.00 | $10.00 |
| Gemini 3.1 Pro Preview | $2.00 | $12.00 |
| Gemini 3.8 Flash | $0.75 | $3.75 |
| Gemini 3.5 Flash-Lite | $0.30 | $2.50 |
| Gemini 3.1 Flash-Lite | $0.25 | $1.50 |

> **Note:** Thinking/reasoning tokens are billed at the output rate.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **API SDK:** `@google/genai` (official Google GenAI SDK)
- **Server:** Express.js
- **Frontend:** Vanilla HTML/CSS/JS with Material Design 3
- **Charts:** Chart.js
- **Fonts:** Google Sans + Google Sans Mono
- **Icons:** Material Symbols Rounded
- **Storage:** Local JSON file

## Project Structure

```
gemini-tracker/
├── public/             # Frontend dashboard
│   ├── index.html
│   ├── css/styles.css
│   └── js/
├── src/                # Backend server
│   ├── server.js
│   ├── gemini-client.js
│   ├── session-manager.js
│   ├── cost-calculator.js
│   ├── pricing-config.js
│   └── storage.js
├── .agents/skills/     # Antigravity IDE Skill
├── data/               # Session data (gitignored)
├── .env.example
└── package.json
```

## License

MIT
