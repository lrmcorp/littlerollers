import assert from 'node:assert/strict';
import test from 'node:test';
import { decryptEnvelope, encryptEnvelope, maskEmail, renderEmail } from './index';

test('encrypts and authenticates email envelopes', () => {
  const key = Buffer.alloc(32, 7).toString('base64');
  const encrypted = encryptEnvelope(
    { to: 'user@example.test', variables: { token: 'secret' } },
    key,
  );
  assert.equal(encrypted.includes('secret'), false);
  assert.deepEqual(decryptEnvelope(encrypted, key), {
    to: 'user@example.test',
    variables: { token: 'secret' },
  });
});

test('renders escaped templates and rejects insecure links', () => {
  const rendered = renderEmail('ORDER_APPROVED_V1', {
    href: 'https://app.example.test/account/packages',
    detail: '<unsafe>',
  });
  assert.match(rendered.html, /&lt;unsafe&gt;/);
  assert.throws(() => renderEmail('ORDER_APPROVED_V1', { href: 'http://unsafe.test' }));
  assert.equal(maskEmail('customer@example.test'), 'cu******@example.test');
});
