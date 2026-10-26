# Gemini API Tier 1 Pricing Reference

> Last updated: 2026-10-26
> Source: https://ai.google.dev/pricing

## Key Rule
**Thinking/reasoning tokens are billed as output tokens** at the standard
output rate. If a model generates 2,000 thinking tokens and 500 response
tokens, you are billed for 2,500 tokens at the output tier price.

## Pay-as-you-go Pricing (Per 1 Million Tokens)

| Model | Input | Output (incl. Thinking) | Cached Input | Notes |
|-------|-------|------------------------|--------------|-------|
| **Gemini 4 Argon** | $2.00 (promo) → $4.00 | $10.00 (promo) → $20.00 | $0.10 → $0.20 | Promo ends Dec 1, 2026 |
| **Gemini 3.1 Pro Preview** (≤200K) | $2.00 | $12.00 | $0.20 | — |
| **Gemini 3.1 Pro Preview** (>200K) | $4.00 | $18.00 | $0.40 | Long context |
| **Gemini 3.8 Flash** | $0.75 (intro) → $1.50 | $3.75 (intro) → $7.50 | $0.075 | Intro ends Jan 1, 2027 |
| **Gemini 3.5 Flash-Lite** | $0.30 | $2.50 | $0.03 | — |
| **Gemini 3.1 Flash-Lite** | $0.25 | $1.50 | $0.025 | — |

## Cost Saving Tips
- **Context Caching**: Saves ~90% on repeated large inputs
- **Batch API / Flex Lane**: Up to 50% cost reduction for async tasks
- **Flash-Lite models**: Cheapest option for simple tasks
