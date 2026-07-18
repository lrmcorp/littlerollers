import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contractVersion,
  type CursorPageMeta,
  type ErrorEnvelope,
  type IdempotentCommandOptions,
  type Session,
} from './index.js';
import type {
  ErrorEnvelope as GeneratedErrorEnvelope,
  HealthResult as GeneratedHealthResult,
  Session as GeneratedSession,
} from '../generated/models/index.js';
test('representative generated contract compiles', () => {
  const page: CursorPageMeta = { hasMore: false };
  const error: ErrorEnvelope = {
    error: { code: 'X', message: 'x', correlationId: 'c', details: [] },
  };
  const command: IdempotentCommandOptions = { idempotencyKey: '1234567890123456' };
  const session = {} as Session;
  const generatedSession = {} as GeneratedSession;
  const generatedError = {} as GeneratedErrorEnvelope;
  const generatedHealth = {} as GeneratedHealthResult;
  assert.equal(contractVersion, '0.4.0-draft');
  assert.equal(page.hasMore, false);
  assert.equal(error.error.correlationId, 'c');
  assert.ok(command.idempotencyKey);
  assert.ok(session);
  assert.ok(generatedSession);
  assert.ok(generatedError);
  assert.ok(generatedHealth);
});
