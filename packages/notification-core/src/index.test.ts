import assert from 'node:assert/strict';
import test from 'node:test';
import { decryptEnvelope, defaultEmailCopy, encryptEnvelope, maskEmail, renderEmail } from './index';

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

test('a published subject/intro override replaces the default text but never the action button or link', () => {
  const rendered = renderEmail(
    'ORDER_APPROVED_V1',
    { href: 'https://app.example.test/account/packages' },
    { subject: 'Judul kustom', intro: 'Paragraf kustom.' },
  );
  assert.equal(rendered.subject, 'Judul kustom');
  assert.match(rendered.text, /Paragraf kustom\./);
  assert.doesNotMatch(rendered.text, /Pembayaran Anda telah disetujui/);
  assert.match(rendered.html, /Lihat paket/); // label tombol tetap dari teks bawaan
  assert.match(rendered.html, /https:\/\/app\.example\.test\/account\/packages/);
});

test('blank or missing override fields fall back to the default subject and intro', () => {
  const rendered = renderEmail('ORDER_APPROVED_V1', {}, { subject: '  ', intro: undefined });
  const fallback = renderEmail('ORDER_APPROVED_V1', {});
  assert.equal(rendered.subject, fallback.subject);
  assert.equal(rendered.text, fallback.text);
});

test('defaultEmailCopy exposes exactly the subject and intro renderEmail uses without an override', () => {
  assert.deepEqual(defaultEmailCopy('AUTH_PASSWORD_RESET_V1'), {
    subject: 'Reset password Daily Dose Pilates',
    intro: 'Kami menerima permintaan reset password untuk akun Anda.',
  });
});
