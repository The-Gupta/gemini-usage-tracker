# Gemini Usage Tracker

> Track your Gemini API token usage and costs per session with a real-time Material Design 3 dashboard. All costs displayed in INR.

A web-based dashboard that wraps the Google Gemini API with **automatic token tracking**, **real-time cost calculation in INR**, and **session management**. Built for developers who want full visibility into their API spending on the **Tier 1 Pay-as-you-go** plan.

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Dashboard Overview](#dashboard-overview)
- [API Reference](#api-reference)
- [Antigravity IDE Skill](#antigravity-ide-skill)
- [Supported Models and Pricing](#supported-models-and-pricing)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Real-time Dashboard** - Material Design 3 UI with dark/light themes, Google Sans typography, and Material Symbols icons
- **Per-Session Cost Tracking** - Track exactly how much each session costs in INR (Indian Rupees)
- **Token Breakdown** - Input, output, and thinking/reasoning token counts per call
- **Interactive Charts** - Cumulative cost over time and token distribution donut chart (Chart.js)
- **API Playground** - Test prompts directly from the dashboard with instant cost feedback
- **Budget Alerts** - Set session spending limits with visual progress bar and warnings at 80% and 100%
- **Token Counter** - Count tokens before sending a prompt to estimate cost
- **Export Data** - Download all usage history as CSV or JSON
- **Dark/Light Themes** - Full Material Design 3 light and dark color schemes
- **Latency Tracking** - Response time per call and rolling average per session
- **INR Currency** - All costs converted from USD to INR at configurable exchange rate (default: 95 INR/USD)
- **Antigravity IDE Skill** - Integration with Antigravity IDE for AI-assisted cost-aware workflows
- **Session History** - Browse, compare, and delete past sessions

---

## Screenshots

The dashboard features a professional Google Material Design 3 aesthetic with both dark and light modes.

| Dark Mode | Light Mode |
|:---------:|:----------:|
| Clean M3 dark surfaces with tonal elevation | Bright M3 surfaces with Google blue accents |

---

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
2. **A Google Gemini API Key** - Get one free from [Google AI Studio](https://aistudio.google.com/apikey)
3. **Git** (optional, for cloning)

### How to Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"** in the left sidebar
4. Click **"Create API Key"**
5. Select or create a Google Cloud project
6. Copy the generated key (starts with `AIza...`)

> **Important:** If you are on the **free tier** (e.g., Gemini Pro with Jio SIM), API calls are limited to 15 RPM (requests per minute). With a **Tier 1 Pay-as-you-go** billing account, limits increase to 500-2000 RPM depending on the model.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/The-Gupta/gemini-usage-tracker.git
cd gemini-usage-tracker
```


### 2. Install Dependencies

```bash
npm install
```

This installs:
- `express` - HTTP server
- `@google/genai` - Official Google Gemini SDK
- `dotenv` - Environment variable management
- `cors` - Cross-origin support

### 3. Configure Your API Key

```bash
# Copy the example env file
cp .env.example .env
```

Now open `.env` in your editor and replace the placeholder with your actual API key:

```env
# Get your key at https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSyD_YOUR_ACTUAL_KEY_HERE

# Server port (default: 3000)
PORT=3000
```

> **Security:** The `.env` file is in `.gitignore` and will never be committed to Git. Never share your API key publicly.

### 4. Start the Server

```bash
npm run dev
```

You should see:

```
Gemini Usage Tracker running on http://localhost:3000
API Key: Configured
Currency: INR (exchange rate: 95.00 INR/USD)
```

### 5. Open the Dashboard

Open **http://localhost:3000** in your browser. You should see the Material Design 3 dashboard with:
- A green "Connected" status indicator in the top-right
- The exchange rate badge showing the current INR/USD rate
- Metric cards showing zeros (no data yet)

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|:-------:|-------------|
| `GEMINI_API_KEY` | Yes | - | Your Google Gemini API key from AI Studio |
| `PORT` | No | `3000` | Port the server listens on |

### Exchange Rate

The USD to INR exchange rate is configured in `src/cost-calculator.js`:

```javascript
const USD_TO_INR = 95.00; // Update this to current rate
```

Google charges in USD. This rate is used to convert all costs to INR for display. Update it periodically to match the current exchange rate.

---

## Usage Guide

### Starting a Session

1. Enter a descriptive session name (e.g., "Research on Quantum Computing")
2. Optionally set a budget in INR (e.g., 50)
3. Click **Start Session**

The session indicator will turn green, and all subsequent API calls will be tracked under this session.

### Using the API Playground

1. Select a model from the dropdown (shows pricing per 1M tokens)
2. Type your prompt in the text area
3. *Optional:* Click **Count Tokens** to see the estimated input token count and cost before sending
4. Click **Send** (or press `Ctrl+Enter`)
5. The response appears below with token counts, cost, and latency

### Understanding the Dashboard

- **Session Cost** (blue card) - Total cost accumulated in the current session
- **Tokens Used** - Total tokens consumed (input + output + thinking)
- **API Calls** - Number of API requests made
- **Avg Latency** - Average response time across all calls

### Setting a Budget

1. Enter a budget amount in INR in the budget field (top-right)
2. Click **Set**
3. A budget progress bar appears showing percentage used
4. At **80%** you get a yellow warning
5. At **100%** you get a red alert (calls still work, but you're warned)

### Exporting Data

Click **CSV** or **JSON** in the "Recent API Calls" section header to download all tracked usage data.

### Ending a Session

Click **End Session** to finalize the session. It moves to "Session History" where you can review past sessions and their costs.

---

## Dashboard Overview

| Section | Description |
|---------|-------------|
| **Top Nav** | Brand, exchange rate badge, theme toggle, API connection status |
| **Session Bar** | Session name, start/end controls, budget settings |
| **Metric Cards** | Real-time session cost, token count, API calls, average latency |
| **Token Breakdown** | Input, output, and thinking tokens with individual costs in INR |
| **Cost Chart** | Cumulative cost over time (line chart with area fill) |
| **Token Distribution** | Donut chart showing input vs output vs thinking token split |
| **API Playground** | Model selector, prompt input, token counter, send button |
| **Recent API Calls** | Detailed table of every call with model, tokens, cost, latency |
| **Session History** | All past sessions with totals and delete option |

---

## API Reference

All endpoints return JSON. Costs are in INR.

### Generate Content (Tracked)

```http
POST /api/generate
Content-Type: application/json

{
  "model": "gemini-3.8-flash",
  "contents": "Explain quantum computing in simple terms"
}
```

**Response:**
```json
{
  "text": "Quantum computing uses quantum bits...",
  "tokens": { "input": 8, "output": 245, "thinking": 0, "total": 253 },
  "cost": { "totalCost": 0.087, "formattedTotal": "₹0.09" },
  "latencyMs": 1243,
  "model": "gemini-3.8-flash"
}
```

### Count Tokens (No API Call)

```http
POST /api/count-tokens
Content-Type: application/json

{
  "model": "gemini-3.8-flash",
  "contents": "Your prompt text here"
}
```

### Session Management

```http
# Start a session
POST /api/sessions/start
{ "name": "My Session", "budget": 50 }

# Get active session
GET /api/sessions/active

# Set/update budget
POST /api/sessions/:id/budget
{ "budget": 100 }

# End a session
POST /api/sessions/:id/end

# List all sessions
GET /api/sessions

# Get specific session
GET /api/sessions/:id

# Delete a session
DELETE /api/sessions/:id
```

### Statistics

```http
GET /api/stats          # All-time aggregate stats
GET /api/stats/today    # Today's usage only
```

### Other Endpoints

```http
GET /api/health         # Server health, API key status, exchange rate
GET /api/pricing        # Current model pricing (USD per 1M tokens)
GET /api/models         # List of supported models with display names
GET /api/export/csv     # Download all data as CSV
GET /api/export/json    # Download all data as JSON
```

---

## Antigravity IDE Skill

This project includes an **Antigravity IDE Skill** at `.agents/skills/gemini-cost-tracker/`. When you open this project in Antigravity IDE, the AI assistant automatically understands how to:

- Start and end tracked sessions
- Make cost-tracked API calls
- Check current spending
- Export usage reports
- Look up model pricing

### How to Use the Skill

1. Open this project folder as your workspace in **Antigravity IDE**
2. The skill is auto-discovered from `.agents/skills/gemini-cost-tracker/SKILL.md`
3. Ask the AI assistant things like:
   - *"Start a session called 'Research' with a budget of 100 rupees"*
   - *"How much have I spent today?"*
   - *"Make an API call to Gemini Flash asking about machine learning"*
   - *"Export my usage data as CSV"*
   - *"What's the pricing for Gemini 4 Argon?"*

The skill also includes a [pricing reference](/.agents/skills/gemini-cost-tracker/references/pricing-reference.md) document with detailed Tier 1 pricing data.

---

## Supported Models and Pricing

All base prices are in USD per 1M tokens (as charged by Google). The dashboard converts to INR at the configured exchange rate.

| Model | Display Name | Input (per 1M) | Output (per 1M) | Notes |
|-------|-------------|:--------------:|:---------------:|-------|
| `gemini-4-argon` | Gemini 4 Argon | $2.00 | $10.00 | Promo pricing, thinking model |
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro Preview | $2.00 | $12.00 | 1M context window |
| `gemini-3.1-pro-preview-long` | Gemini 3.1 Pro (Long) | $2.00 | $12.00 | 2M context window |
| `gemini-3.8-flash` | Gemini 3.8 Flash | $0.75 | $3.75 | Good balance of speed/cost |
| `gemini-3.5-flash-lite` | Gemini 3.5 Flash-Lite | $0.30 | $2.50 | Budget-friendly |
| `gemini-3.1-flash-lite` | Gemini 3.1 Flash-Lite | $0.25 | $1.50 | Cheapest option |

> **Note on Thinking Tokens:** Models like Gemini 4 Argon generate "thinking" tokens during reasoning. These are billed at the **output token rate**. The dashboard tracks them separately so you can see exactly how much reasoning costs.

### How Costs Are Calculated

```
Cost = (input_tokens / 1,000,000 * input_price_usd * exchange_rate)
     + (output_tokens / 1,000,000 * output_price_usd * exchange_rate)
     + (thinking_tokens / 1,000,000 * output_price_usd * exchange_rate)
```

For example, a call to Gemini 3.8 Flash with 1,000 input tokens and 500 output tokens at 95 INR/USD:
- Input cost: 1000 / 1M * $0.75 * 95 = 0.07 INR
- Output cost: 500 / 1M * $3.75 * 95 = 0.18 INR
- **Total: 0.25 INR**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (ES Modules) |
| **API SDK** | `@google/genai` (official Google GenAI SDK) |
| **Server** | Express.js |
| **Frontend** | Vanilla HTML/CSS/JS |
| **Design System** | Google Material Design 3 |
| **Charts** | Chart.js 4.x |
| **Typography** | Google Sans, Google Sans Text, Google Sans Mono |
| **Icons** | Material Symbols Rounded (variable font) |
| **Storage** | Local JSON file (`data/sessions.json`) |

---

## Project Structure

```
gemini-tracker/
├── public/                          # Frontend (served statically)
│   ├── index.html                   # Dashboard HTML (M3 layout)
│   ├── css/
│   │   └── styles.css               # Material Design 3 stylesheet
│   └── js/
│       ├── app.js                   # Main application logic
│       ├── charts.js                # Chart.js chart management
│       └── utils.js                 # Formatting helpers (INR, numbers, dates)
│
├── src/                             # Backend server
│   ├── server.js                    # Express app, all API routes
│   ├── gemini-client.js             # Google GenAI SDK wrapper with tracking
│   ├── session-manager.js           # Session lifecycle and budget tracking
│   ├── cost-calculator.js           # USD-to-INR cost conversion engine
│   ├── pricing-config.js            # Tier 1 model pricing data
│   └── storage.js                   # Atomic JSON file persistence + CSV export
│
├── .agents/                         # Antigravity IDE integration
│   └── skills/
│       └── gemini-cost-tracker/
│           ├── SKILL.md             # Skill instructions (auto-discovered)
│           └── references/
│               └── pricing-reference.md  # Detailed pricing data
│
├── data/                            # Runtime data (gitignored)
│   └── sessions.json                # Session persistence file
│
├── .env.example                     # Environment variable template
├── .env                             # Your API key (gitignored, create from .env.example)
├── .gitignore                       # Excludes node_modules, .env, data/
├── package.json                     # Dependencies and scripts
├── LICENSE                          # MIT License
└── README.md                        # This file
```

---

## Troubleshooting

### "No API Key" status on dashboard

Your `.env` file is missing or doesn't contain a valid `GEMINI_API_KEY`.

1. Check that `.env` exists in the project root
2. Verify the key format: `GEMINI_API_KEY=AIzaSy...` (no quotes needed)
3. Restart the server after changing `.env`

### "API key not valid" error

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and verify the key is active
2. Make sure the key hasn't been revoked or expired
3. Check that the associated Google Cloud project has the Generative AI API enabled

### Server won't start

```bash
# Check Node.js version (need v18+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Costs showing as 0

- Ensure you have an **active session** (click Start Session)
- API calls only accumulate costs when a session is active
- Check the model dropdown - some models have very low per-token costs

### Exchange rate is wrong

Edit `src/cost-calculator.js` and update the `USD_TO_INR` constant:

```javascript
const USD_TO_INR = 85.50; // Update to current rate
```

Restart the server after changing.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

MIT - see [LICENSE](LICENSE) for details.

---

**Built with Antigravity IDE**



