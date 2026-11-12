import assert from 'node:assert/strict';
import test from 'node:test';
import { aiResultSchema, ConfiguredVisionService, resolveChatCompletionsUrl } from '../src/services/ai';

test('resolves an OpenAI v1 base URL to the chat completions endpoint', () => {
  assert.equal(resolveChatCompletionsUrl('https://api.openai.com/v1'), 'https://api.openai.com/v1/chat/completions');
  assert.equal(resolveChatCompletionsUrl('https://provider.test/v1/chat/completions/'), 'https://provider.test/v1/chat/completions');
});

test('rejects fabricated confidence outside the valid range', () => {
  const parsed = aiResultSchema.safeParse({
    category: 'POTHOLE',
    summary: 'Surface damage',
    priority: 'HIGH',
    confidence: 1.4,
    reason: 'Visible road damage',
    needsHumanReview: false,
  });
  assert.equal(parsed.success, false);
});

test('uses explicit manual-review fallback when provider is not configured', async () => {
  const result = await new ConfiguredVisionService().review({
    title: 'Unclear report',
    description: 'The image is unclear and the issue cannot be identified.',
  });
  assert.equal(result.provider, 'manual-review');
  assert.equal(result.confidence, 0);
  assert.equal(result.needsHumanReview, true);
});
