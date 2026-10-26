/**
 * Gemini API Client Wrapper with automatic usage tracking.
 * Every API call is intercepted, timed, and logged to the active session.
 */

import { GoogleGenAI } from '@google/genai';
import { randomUUID } from 'crypto';
import { calculateCost } from './cost-calculator.js';
import { addCallToSession } from './session-manager.js';

let ai = null;

export function initClient(apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export function getClient() {
  return ai;
}

/**
 * Generate content with automatic tracking.
 */
export async function trackedGenerateContent({ model, contents, systemInstruction, config }) {
  if (!ai) throw new Error('Gemini client not initialized. Call initClient(apiKey) first.');

  const startTime = Date.now();
  let response;
  let error = null;

  try {
    const options = { model, contents };
    if (systemInstruction) options.systemInstruction = systemInstruction;
    if (config) options.config = config;

    response = await ai.models.generateContent(options);
  } catch (err) {
    error = err;
    // Still log the call attempt
  }

  const latencyMs = Date.now() - startTime;
  const usage = response?.usageMetadata || {};

  const tokens = {
    input: usage.promptTokenCount || 0,
    output: usage.candidatesTokenCount || 0,
    thinking: usage.thoughtsTokenCount || 0,
    cached: usage.cachedContentTokenCount || 0,
    total: usage.totalTokenCount || 0,
  };

  const cost = calculateCost(model, {
    inputTokens: tokens.input,
    outputTokens: tokens.output,
    thinkingTokens: tokens.thinking,
    cachedTokens: tokens.cached,
  });

  const callData = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    model,
    promptPreview: typeof contents === 'string'
      ? contents.substring(0, 120)
      : JSON.stringify(contents).substring(0, 120),
    tokens,
    cost,
    latencyMs,
    error: error ? error.message : null,
    success: !error,
  };

  // Log to session
  await addCallToSession(callData);

  if (error) throw error;

  return {
    text: response.text,
    usageMetadata: usage,
    tokens,
    cost,
    latencyMs,
    callId: callData.id,
    _raw: response,
  };
}

/**
 * Count tokens for a prompt without making a generation call.
 */
export async function countTokens({ model, contents }) {
  if (!ai) throw new Error('Gemini client not initialized.');

  const result = await ai.models.countTokens({ model, contents });
  return {
    totalTokens: result.totalTokens,
    model,
  };
}
