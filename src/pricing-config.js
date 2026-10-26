/**
 * Gemini API Tier 1 (Pay-as-you-go) Pricing Configuration
 *
 * All prices are in USD per 1 million tokens (as charged by Google).
 * Conversion to INR happens in cost-calculator.js at display time.
 * Thinking/reasoning tokens are billed as output tokens.
 *
 * Last updated: 2026-10-26
 * Source: https://ai.google.dev/pricing
 */

const MODEL_PRICING = {
  'gemini-4-argon': {
    displayName: 'Gemini 4 Argon',
    category: 'flagship',
    input: 2.00,
    output: 10.00,
    cachedInput: 0.10,
    promoEnd: '2026-12-01T00:00:00Z',
    standardPricing: { input: 4.00, output: 20.00, cachedInput: 0.20 },
  },
  'gemini-3.1-pro-preview': {
    displayName: 'Gemini 3.1 Pro Preview',
    category: 'pro',
    input: 2.00,
    output: 12.00,
    cachedInput: 0.20,
    promoEnd: null,
    standardPricing: null,
    contextNote: '≤200K context',
  },
  'gemini-3.1-pro-preview-long': {
    displayName: 'Gemini 3.1 Pro Preview (Long)',
    category: 'pro',
    input: 4.00,
    output: 18.00,
    cachedInput: 0.40,
    promoEnd: null,
    standardPricing: null,
    contextNote: '>200K context',
  },
  'gemini-3.8-flash': {
    displayName: 'Gemini 3.8 Flash',
    category: 'flash',
    input: 0.75,
    output: 3.75,
    cachedInput: 0.075,
    promoEnd: '2027-01-01T00:00:00Z',
    standardPricing: { input: 1.50, output: 7.50, cachedInput: 0.15 },
  },
  'gemini-3.5-flash-lite': {
    displayName: 'Gemini 3.5 Flash-Lite',
    category: 'flash-lite',
    input: 0.30,
    output: 2.50,
    cachedInput: 0.03,
    promoEnd: null,
    standardPricing: null,
  },
  'gemini-3.1-flash-lite': {
    displayName: 'Gemini 3.1 Flash-Lite',
    category: 'flash-lite',
    input: 0.25,
    output: 1.50,
    cachedInput: 0.025,
    promoEnd: null,
    standardPricing: null,
  },
};

export function getModelPricing(modelName) {
  const key = modelName.replace(/^models\//, '');
  const pricing = MODEL_PRICING[key];
  if (!pricing) return null;

  if (pricing.promoEnd && pricing.standardPricing) {
    const now = new Date();
    const promoEnd = new Date(pricing.promoEnd);
    if (now >= promoEnd) {
      return {
        ...pricing,
        input: pricing.standardPricing.input,
        output: pricing.standardPricing.output,
        cachedInput: pricing.standardPricing.cachedInput,
        isPromo: false,
      };
    }
  }
  return { ...pricing, isPromo: !!pricing.promoEnd };
}

export function getAllModelPricing() {
  const result = {};
  for (const key of Object.keys(MODEL_PRICING)) {
    result[key] = getModelPricing(key);
  }
  return result;
}

export function getSupportedModels() {
  return Object.keys(MODEL_PRICING);
}

export default MODEL_PRICING;
