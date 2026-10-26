/**
 * Cost Calculator for Gemini API calls.
 * Pricing is stored in USD per 1M tokens (as Google charges).
 * All displayed costs are converted to INR (₹).
 * Thinking tokens are billed at the output rate.
 */

import { getModelPricing } from './pricing-config.js';

// ── Exchange Rate ────────────────────────────────────────────
// USD to INR conversion rate. Update this as needed.
const USD_TO_INR = 95.00;

export function getExchangeRate() {
  return USD_TO_INR;
}

/**
 * Convert USD to INR.
 */
export function usdToInr(usdAmount) {
  return usdAmount * USD_TO_INR;
}

export function calculateCost(modelName, tokenUsage) {
  const pricing = getModelPricing(modelName);
  if (!pricing) {
    return {
      inputCost: 0, outputCost: 0, thinkingCost: 0, cachedCost: 0,
      totalCost: 0, formattedTotal: '₹0.0000', modelFound: false,
    };
  }

  const inputTokens = tokenUsage.inputTokens || 0;
  const outputTokens = tokenUsage.outputTokens || 0;
  const thinkingTokens = tokenUsage.thinkingTokens || 0;
  const cachedTokens = tokenUsage.cachedTokens || 0;

  // Costs calculated in USD first, then converted to INR
  const inputCostUsd = ((inputTokens - cachedTokens) * pricing.input) / 1_000_000;
  const outputCostUsd = (outputTokens * pricing.output) / 1_000_000;
  const thinkingCostUsd = (thinkingTokens * pricing.output) / 1_000_000;
  const cachedCostUsd = (cachedTokens * pricing.cachedInput) / 1_000_000;
  const totalCostUsd = inputCostUsd + outputCostUsd + thinkingCostUsd + cachedCostUsd;

  // Convert all to INR
  const inputCost = usdToInr(inputCostUsd);
  const outputCost = usdToInr(outputCostUsd);
  const thinkingCost = usdToInr(thinkingCostUsd);
  const cachedCost = usdToInr(cachedCostUsd);
  const totalCost = usdToInr(totalCostUsd);

  return {
    inputCost, outputCost, thinkingCost, cachedCost, totalCost,
    totalCostUsd, // Keep USD for reference
    formattedTotal: formatCurrency(totalCost), modelFound: true,
  };
}

export function formatCurrency(amount) {
  if (amount === 0) return '₹0.00';
  if (amount < 1) return `₹${amount.toFixed(4)}`;
  if (amount < 100) return `₹${amount.toFixed(2)}`;
  return `₹${amount.toFixed(2)}`;
}

export function estimateCost(modelName, estimatedInputTokens, estimatedOutputTokens = 500) {
  const pricing = getModelPricing(modelName);
  if (!pricing) return null;

  const inputCostUsd = (estimatedInputTokens * pricing.input) / 1_000_000;
  const outputLowUsd = (estimatedOutputTokens * 0.5 * pricing.output) / 1_000_000;
  const outputMidUsd = (estimatedOutputTokens * pricing.output) / 1_000_000;
  const outputHighUsd = (estimatedOutputTokens * 2 * pricing.output) / 1_000_000;

  return {
    inputCost: usdToInr(inputCostUsd),
    estimated: {
      low: formatCurrency(usdToInr(inputCostUsd + outputLowUsd)),
      mid: formatCurrency(usdToInr(inputCostUsd + outputMidUsd)),
      high: formatCurrency(usdToInr(inputCostUsd + outputHighUsd)),
    },
    inputTokens: estimatedInputTokens,
  };
}
