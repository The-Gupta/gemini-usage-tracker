# ðŸ”® Gemini Usage Tracker

> Track your Gemini API token usage and costs per session with a beautiful real-time dashboard.

A web-based dashboard that wraps the Google Gemini API with **automatic token tracking**, **real-time cost calculation**, and **session management**. Built for developers who want visibility into their API spending on the Tier 1 Pay-as-you-go plan.

## âœ¨ Features

- **ðŸ“Š Real-time Dashboard** â€” Glassmorphism dark-mode UI with animated stat cards
- **ðŸ’° Per-Session Cost Tracking** â€” Track exactly how much each session costs
- **ðŸ”¢ Token Breakdown** â€” Input, output, and thinking token counts per call
- **ðŸ“ˆ Interactive Charts** â€” Cost over time and token distribution visualizations
- **ðŸ§ª API Playground** â€” Test prompts directly from the dashboard with instant cost feedback
- **ðŸŽ¯ Budget Alerts** â€” Set spending limits with visual warnings at 80% and 100%
- **ðŸ“¥ Export Data** â€” Download usage history as CSV or JSON
- **ðŸŒ“ Dark/Light Themes** â€” Toggle between gorgeous dark and light modes
- **âš¡ Latency Tracking** â€” Response time per call and average per session
- **ðŸ¤– Antigravity IDE Skill** â€” Integration with Antigravity IDE for AI-assisted workflows

## ðŸš€ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/The-Gupta/gemini-usage-tracker.git
cd gemini-usage-tracker
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

Open **http://localhost:3000** â€” that's it! ðŸŽ‰

## ðŸ“Š Dashboard Overview

| Section | Description |
|---------|-------------|
| **Stat Cards** | Real-time session cost, token count, API calls, average latency |
| **Token Breakdown** | Input, output, and thinking tokens with individual costs |
| **Cost Chart** | Cumulative cost over time per session |
| **Token Donut** | Visual split of input vs output vs thinking tokens |
| **API Playground** | Send prompts, count tokens, see cost estimates before sending |
| **Call Log** | Detailed table of every API call with full metadata |
| **Session History** | All past sessions with costs, exportable to CSV/JSON |

## ðŸ”§ API Endpoints

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

## ðŸ’° Supported Models & Pricing (Tier 1)

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|-----------------|
| Gemini 4 Argon | $2.00 | $10.00 |
| Gemini 3.1 Pro Preview | $2.00 | $12.00 |
| Gemini 3.8 Flash | $0.75 | $3.75 |
| Gemini 3.5 Flash-Lite | $0.30 | $2.50 |
| Gemini 3.1 Flash-Lite | $0.25 | $1.50 |

> **Note:** Thinking/reasoning tokens are billed at the output rate.

## ðŸ› ï¸ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **API SDK:** `@google/genai` (official Google GenAI SDK)
- **Server:** Express.js
- **Frontend:** Vanilla HTML/CSS/JS
- **Charts:** Chart.js
- **Fonts:** Inter + JetBrains Mono
- **Storage:** Local JSON file

## ðŸ“ Project Structure

```
gemini-tracker/
â”œâ”€â”€ public/             # Frontend dashboard
â”‚   â”œâ”€â”€ index.html
â”‚   â”œâ”€â”€ css/styles.css
â”‚   â””â”€â”€ js/
â”œâ”€â”€ src/                # Backend server
â”‚   â”œâ”€â”€ server.js
â”‚   â”œâ”€â”€ gemini-client.js
â”‚   â”œâ”€â”€ session-manager.js
â”‚   â”œâ”€â”€ cost-calculator.js
â”‚   â”œâ”€â”€ pricing-config.js
â”‚   â””â”€â”€ storage.js
â”œâ”€â”€ .agents/skills/     # Antigravity IDE Skill
â”œâ”€â”€ data/               # Session data (gitignored)
â”œâ”€â”€ .env.example
â””â”€â”€ package.json
```

## ðŸ“œ License

MIT

