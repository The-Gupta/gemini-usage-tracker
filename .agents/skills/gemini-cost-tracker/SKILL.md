---
name: gemini-cost-tracker
description: >-
  Use this skill when the user asks about Gemini API usage, token consumption,
  cost tracking, or billing. Provides instructions for starting/ending tracked
  sessions, making cost-tracked API calls, checking spending, and exporting
  usage reports. Activate when the user mentions API costs, token counts,
  session budgets, or Gemini billing.
---

# Gemini API Cost Tracker Skill

This project wraps the Gemini API with automatic usage tracking. Every API call
records token counts (input, output, thinking) and calculates costs based on
Tier 1 Pay-as-you-go pricing.

## Quick Start

1. Ensure `GEMINI_API_KEY` is set in the `.env` file
2. Start the server: `npm run dev`
3. Open the dashboard: `http://localhost:3000`

## How to Track Usage

### Starting a Session
```bash
curl -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"name": "My Research Session", "budget": 0.50}'
```

### Making a Tracked API Call
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "gemini-3.8-flash", "contents": "Explain quantum computing"}'
```

The response includes token counts and cost breakdown automatically.

### Checking Current Session Cost
```bash
curl http://localhost:3000/api/sessions/active
```

### Ending a Session
```bash
curl -X POST http://localhost:3000/api/sessions/{id}/end
```

### Exporting Data
- CSV: `GET /api/export/csv`
- JSON: `GET /api/export/json`

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/generate | Make a tracked API call |
| POST | /api/count-tokens | Count tokens before sending |
| POST | /api/sessions/start | Start tracking session |
| POST | /api/sessions/:id/end | End a session |
| GET | /api/sessions/active | Get active session stats |
| GET | /api/stats | All-time usage statistics |
| GET | /api/stats/today | Today's usage |
| GET | /api/pricing | View current model pricing |

## Pricing Reference

For detailed Tier 1 pricing data, see:
[Pricing Reference](./references/pricing-reference.md)

## Verification

To verify the tracker is working:
1. Start the server with `npm run dev`
2. Check health: `curl http://localhost:3000/api/health`
3. Confirm `apiKeyConfigured: true` in the response
4. Start a session and make a test call through the dashboard
5. Verify token counts and costs appear in the stats
