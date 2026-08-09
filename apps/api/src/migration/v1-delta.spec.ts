import { createHash, randomBytes } from 'node:crypto';
import {
  assertStrictDeltaOrder,
  decryptDeltaPayload,
  deltaChecksum,
  encryptDeltaPayload,
  parseCanonicalDeltaEvent,
} from '../../prisma/v1-delta';

const eventKey = (gtid: string, eventOrder: number, table: string, sourceId: string) =>
  createHash('sha256')
    .update(`DAILYDOSE_V1:${gtid}:${eventOrder}:${table}:${sourceId}`)
    .digest('hex');

const event = (overrides: Record<string, unknown> = {}) => ({
  gtid: 'server-uuid:101',
  transactionOrder: '101',
  eventOrder: 0,
  sourceTable: 'order_pakets',
  sourceId: '14',
  operation: 'UPDATE',
  before: { id: 14, sisa: 8, deleted_at: null },
  after: { id: 14, sisa: 7, deleted_at: null },
  sourceBranchId: '2',
  occurredAt: '2026-08-02T00:00:00.000Z',
  correlationId: 'cdc-server-uuid-101',
  ...overrides,
  eventKey: eventKey(
    String(overrides.gtid ?? 'server-uuid:101'),
    Number(overrides.eventOrder ?? 0),
    String(overrides.sourceTable ?? 'order_pakets'),
    String(overrides.sourceId ?? '14'),
  ),
});

describe('v1 delta contract', () => {
  const tables = new Set(['order_pakets', 'roles']);

  it('accepts a branch-owned canonical update', () => {
    expect(parseCanonicalDeltaEvent(event(), tables)).toMatchObject({
      sourceTable: 'order_pakets',
      sourceBranchId: '2',
      transactionOrder: '101',
    });
  });

  it('captures unresolved branch ownership so verification can block it safely', () => {
    expect(
      parseCanonicalDeltaEvent(event({ sourceBranchId: null }), tables).sourceBranchId,
    ).toBeNull();
  });

  it('allows global master events without a branch', () => {
    expect(
      parseCanonicalDeltaEvent(
        event({ sourceTable: 'roles', sourceId: '1', sourceBranchId: null }),
        tables,
      ),
    ).toMatchObject({ sourceTable: 'roles', sourceBranchId: null });
  });

  it('rejects an event key that does not bind GTID, row, and order', () => {
    expect(() =>
      parseCanonicalDeltaEvent({ ...event(), eventKey: 'a'.repeat(64) }, tables),
    ).toThrow('DELTA_EVENT_KEY_MISMATCH');
  });

  it('rejects duplicate or backwards ordering', () => {
    expect(() =>
      assertStrictDeltaOrder(
        { transactionOrder: '101', eventOrder: 2 },
        { transactionOrder: '101', eventOrder: 2 },
      ),
    ).toThrow('DELTA_EVENT_OUT_OF_ORDER');
    expect(() =>
      assertStrictDeltaOrder(
        { transactionOrder: '102', eventOrder: 0 },
        { transactionOrder: '101', eventOrder: 9 },
      ),
    ).toThrow('DELTA_EVENT_OUT_OF_ORDER');
  });

  it('encrypts sensitive before/after payloads with authenticated encryption', () => {
    const key = randomBytes(32);
    const payload = { before: { nik: 'sensitive' }, after: { nik: 'changed' } };
    const encrypted = encryptDeltaPayload(payload, key, 'test-v1');
    expect(encrypted.ciphertext).not.toContain('sensitive');
    expect(decryptDeltaPayload(encrypted, key)).toEqual(payload);
    expect(deltaChecksum(payload)).toHaveLength(64);
  });
});
