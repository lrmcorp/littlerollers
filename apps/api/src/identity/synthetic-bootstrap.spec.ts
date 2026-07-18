import { digest } from './security';
import { syntheticBootstrapIdentity } from './synthetic-bootstrap';

describe('synthetic Super Owner bootstrap configuration', () => {
  it('normalizes and hashes the configured email without returning it', () => {
    const result = syntheticBootstrapIdentity({
      NODE_ENV: 'test',
      AUTH_SYNTHETIC_ENABLED: 'true',
      SYNTHETIC_BOOTSTRAP_SUPER_OWNER_EMAIL: ' Owner@EXAMPLE.test ',
    });
    expect(result).toEqual({ subjectHash: digest('google:owner@example.test') });
    expect(JSON.stringify(result)).not.toContain('owner@example.test');
  });

  it('is disabled in production even when synthetic flags are supplied', () => {
    expect(
      syntheticBootstrapIdentity({
        NODE_ENV: 'production',
        AUTH_SYNTHETIC_ENABLED: 'true',
        SYNTHETIC_BOOTSTRAP_SUPER_OWNER_EMAIL: 'owner@example.test',
      }),
    ).toBeNull();
  });

  it('fails closed when synthetic bootstrap configuration is incomplete or invalid', () => {
    expect(() =>
      syntheticBootstrapIdentity({ NODE_ENV: 'test', AUTH_SYNTHETIC_ENABLED: 'true' }),
    ).toThrow('CONFIGURATION_REQUIRED');
    expect(() =>
      syntheticBootstrapIdentity({
        NODE_ENV: 'test',
        AUTH_SYNTHETIC_ENABLED: 'true',
        SYNTHETIC_BOOTSTRAP_SUPER_OWNER_EMAIL: 'not-an-email',
      }),
    ).toThrow('CONFIGURATION_REQUIRED');
  });
});
