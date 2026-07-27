'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthPageShell } from '../components/auth/auth-page-shell';
import { Feedback } from '../ui';
import { verificationClient } from '../identity-verification-client';
import { useSessionContext } from '../session-context';

function PasswordField({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label>
      {label}
      <span className="auth-input-action">
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          className="auth-visibility-toggle"
          aria-label={`${visible ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5.3 9 5.3a15.7 15.7 0 0 1-2.1 2.6M6.6 6.6C4.4 8 3 10.1 3 10.1S6.5 16 12 16c1 0 2-.2 2.8-.5" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}

function UploadPreview({ file, kind }: { file: File | null; kind: 'selfie' | 'ktp' }) {
  const [previewUrl, setPreviewUrl] = useState('');
  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl) return null;
  return (
    <figure className={`auth-upload-preview auth-upload-preview--${kind}`}>
      {/* Blob URLs are created locally and are never sent before submission. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt={`Pratinjau ${kind === 'selfie' ? 'foto selfie' : 'foto KTP'}`} />
      <figcaption>{file?.name}</figcaption>
    </figure>
  );
}

export function RegisterView() {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [selfiePreview, setSelfiePreview] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<File | null>(null);
  const session = useSessionContext();
  return (
    <AuthPageShell
      eyebrow="Registrasi customer"
      title="Buat akun Daily Dose"
      description="Akun langsung aktif. Selfie dan foto KTP akan diperiksa secara privat oleh tim kami sebelum pembelian dan booking tersedia."
    >
      <form
        aria-label="Registrasi customer"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const password = String(form.get('password'));
          if (password !== String(form.get('confirmation'))) {
            setMessage('Konfirmasi password tidak sama.');
            setState('error');
            return;
          }
          const selfie = form.get('selfie');
          const ktp = form.get('ktp');
          if (!(selfie instanceof File) || !(ktp instanceof File) || !selfie.size || !ktp.size) {
            setMessage('Selfie dan foto KTP wajib dipilih.');
            setState('error');
            return;
          }
          setState('loading');
          try {
            await verificationClient.register({
              displayName: String(form.get('displayName')),
              phone: String(form.get('phone')),
              email: String(form.get('email')),
              password,
              consent: form.get('consent') === 'on',
              selfie,
              ktp,
            });
            const completed = await session?.completeSignIn('/account/verification');
            if (!completed) throw new Error('session');
          } catch (error) {
            const status = (error as { response?: { status?: number } }).response?.status;
            setMessage(
              status === 409
                ? 'Email atau nomor WhatsApp sudah digunakan.'
                : status === 422
                  ? 'Periksa kembali data dan format foto yang dipilih.'
                  : 'Registrasi belum dapat diproses. Coba kembali.',
            );
            setState('error');
          }
        }}
      >
        <label>
          Nama lengkap
          <input
            name="displayName"
            autoComplete="name"
            maxLength={160}
            placeholder="Contoh: Nadia Putri"
            required
          />
        </label>
        <label>
          Nomor WhatsApp
          <input name="phone" type="tel" autoComplete="tel" placeholder="0812 3456 7890" required />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            required
          />
        </label>
        <PasswordField label="Password" name="password" placeholder="Minimal 8 karakter" />
        <PasswordField
          label="Ulangi password"
          name="confirmation"
          placeholder="Masukkan ulang password"
        />
        <label className="auth-upload-field">
          <span>Foto selfie</span>
          <input
            aria-label="Foto selfie"
            name="selfie"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="user"
            onChange={(event) => setSelfiePreview(event.currentTarget.files?.[0] ?? null)}
            required
          />
          <small>Wajah terlihat jelas, maksimal 8 MB.</small>
          <UploadPreview file={selfiePreview} kind="selfie" />
        </label>
        <label className="auth-upload-field">
          <span>Foto KTP bagian depan</span>
          <input
            aria-label="Foto KTP bagian depan"
            name="ktp"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={(event) => setKtpPreview(event.currentTarget.files?.[0] ?? null)}
            required
          />
          <small>Seluruh sisi KTP terlihat jelas, maksimal 8 MB.</small>
          <UploadPreview file={ktpPreview} kind="ktp" />
        </label>
        <label className="auth-consent">
          <input name="consent" type="checkbox" required />
          <span>Saya menyetujui pemrosesan selfie dan KTP untuk verifikasi identitas.</span>
        </label>
        <button disabled={state === 'loading'} type="submit">
          {state === 'loading' ? 'Membuat akun…' : 'Daftar dan masuk'}
        </button>
        {state === 'error' && <Feedback kind="error">{message}</Feedback>}
      </form>
      <p className="mt-6 text-sm text-dd-muted">
        Sudah punya akun? <Link href="/sign-in">Kembali masuk</Link>
      </p>
    </AuthPageShell>
  );
}
