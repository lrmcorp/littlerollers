import assert from 'node:assert/strict';
import test from 'node:test';
import { QuotaEvaluationError, evaluateQuota } from './index';

test('fails closed without explicit synthetic configuration', async () => {
  await assert.rejects(
    evaluateQuota({} as never, {
      jobId: '00000000-0000-4000-8000-000000000001',
      now: new Date(),
      actor: { type: 'SYSTEM' },
      correlationId: 'test',
      syntheticEnabled: false,
    }),
    (error) => error instanceof QuotaEvaluationError && error.code === 'CONFIGURATION_REQUIRED',
  );
});
