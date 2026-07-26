import { hashPassword, validatePassword, verifyPassword } from './credential-security';

describe('credential security', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SYNTHETIC_ENABLED = 'true';
  });

  it('hashes passwords with the approved Argon2id parameters', async () => {
    const encoded = await hashPassword('a secure invitation password');
    expect(encoded).toMatch(/^\$argon2id\$v=19\$m=65536,(?:p=1,t=3|t=3,p=1)\$/u);
    await expect(verifyPassword(encoded, 'a secure invitation password')).resolves.toBe(true);
    await expect(verifyPassword(encoded, 'not the password')).resolves.toBe(false);
  });

  it('enforces the 8 to 128 character password boundary', () => {
    expect(() => validatePassword('a'.repeat(7))).toThrow();
    expect(() => validatePassword('a'.repeat(8))).not.toThrow();
    expect(() => validatePassword('a'.repeat(128))).not.toThrow();
    expect(() => validatePassword('a'.repeat(129))).toThrow();
  });
});
