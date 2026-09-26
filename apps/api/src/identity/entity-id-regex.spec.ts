import { ENTITY_ID_REGEX } from './security';

describe('ENTITY_ID_REGEX validation', () => {
  it('accepts standard RFC4122 UUIDs', () => {
    const validUuids = [
      'c850259b-136b-4e1b-b3ae-35c9a29e9cb6',
      'a0000000-0000-0000-0000-000000000001',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
    ];

    for (const id of validUuids) {
      expect(ENTITY_ID_REGEX.test(id)).toBe(true);
    }
  });

  it('accepts non-hex studio and branch IDs (e.g. Surabaya ddsby...)', () => {
    const customIds = [
      'ddsby-branch-01',
      'ddsby-studio-reformer',
      'ddsby_studio_mat',
      'surabaya-main-01',
      'jkt-central-studio',
      'pkg-reformer-10',
    ];

    for (const id of customIds) {
      expect(ENTITY_ID_REGEX.test(id)).toBe(true);
    }
  });

  it('rejects invalid or unsafe strings', () => {
    const invalidIds = [
      'short', // < 8 chars
      'a'.repeat(41), // > 40 chars
      'invalid id with spaces',
      'id;DROP TABLE users;',
      'id<script>',
      'branch/id',
      '',
    ];

    for (const id of invalidIds) {
      expect(ENTITY_ID_REGEX.test(id)).toBe(false);
    }
  });
});
