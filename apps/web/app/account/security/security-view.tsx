'use client';

import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppFeedback } from '../../components/app-feedback';
import { Button, IconButton } from '../../components/actions';
import { browserIdentityClient, type IdentityClient } from '../../identity-client';
import { Skeleton } from '../../ui';

type Status = Awaited<ReturnType<IdentityClient['securityStatus']>>;

export function SecurityView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const feedback = useAppFeedback();
  const [status, setStatus] = useState<Status>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [nextPassword, setNextPassword] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setStatus(await client.securityStatus());
      setError('');
    } catch {
      setError('Status keamanan tidak dapat dimuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void load(), []);

  if (loading) return <Skeleton label="Memuat keamanan akun" />;

  const requirements = [
    { label: 'Minimal 8 karakter', met: nextPassword.length >= 8 },
    {
      label: 'Huruf besar dan kecil',
      met: /[a-z]/.test(nextPassword) && /[A-Z]/.test(nextPassword),
    },
    { label: 'Memiliki angka', met: /\d/.test(nextPassword) },
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-6" aria-labelledby="security-title">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">Akun</p>
        <h1 id="security-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
          Keamanan akun
        </h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Perbarui password dan lindungi sesi aktif pada perangkat Anda.
        </p>
      </header>

      {error && (
        <section className="rounded-dd-xl border border-dd-danger/20 bg-white p-5">
          <strong>{error}</strong>
          <Button type="button" className="mt-4" onClick={() => void load()}>
            Coba lagi
          </Button>
        </section>
      )}

      <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-dd-lg bg-dd-success-soft text-dd-success">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Status password</h2>
            <p className="mt-1 text-sm font-semibold text-dd-ink">
              {status?.passwordEnabled ? 'Password aktif' : 'Password belum aktif'}
            </p>
            <p className="mt-1 text-sm text-dd-muted">
              {status?.passwordEnabled
                ? 'Password dapat diperbarui kapan saja.'
                : 'Aktifkan password untuk melindungi akun ini.'}
            </p>
          </div>
        </div>
      </section>

      {status?.passwordEnabled && (
        <form
          className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6"
          aria-label="Ubah password"
          onSubmit={async (event) => {
            event.preventDefault();
            if (saving) return;
            const form = event.currentTarget;
            const data = new FormData(form);
            setSaving(true);
            setError('');
            try {
              await client.changePassword(String(data.get('current')), String(data.get('next')));
              form.reset();
              setNextPassword('');
              feedback.showToast({
                tone: 'success',
                title: 'Password diperbarui',
                message: 'Sesi lain telah dicabut untuk melindungi akun Anda.',
              });
              await load();
            } catch {
              setError('Password saat ini tidak valid atau password baru belum memenuhi syarat.');
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-dd-forest" />
            <h2 className="text-lg font-semibold">Ubah password</h2>
          </div>
          <div className="mt-5 grid gap-5">
            <PasswordField
              name="current"
              label="Password saat ini"
              shown={showCurrent}
              onToggle={() => setShowCurrent((value) => !value)}
              autoComplete="current-password"
            />
            <PasswordField
              name="next"
              label="Password baru"
              shown={showNext}
              onToggle={() => setShowNext((value) => !value)}
              autoComplete="new-password"
              value={nextPassword}
              onChange={setNextPassword}
            />
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {requirements.map((item) => (
              <li
                key={item.label}
                className={`rounded-dd-md px-3 py-2 text-xs font-semibold ${
                  item.met
                    ? 'bg-dd-success-soft text-dd-success'
                    : 'bg-dd-surface-muted text-dd-muted'
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>
          {error && (
            <p className="mt-4 rounded-dd-md bg-dd-danger-soft p-3 text-sm text-dd-danger">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={saving || requirements.some((item) => !item.met)}
            loading={saving}
            loadingLabel="Menyimpan…"
            className="mt-5"
          >
            Simpan password
          </Button>
        </form>
      )}
    </main>
  );
}

function PasswordField({
  name,
  label,
  shown,
  onToggle,
  autoComplete,
  value,
  onChange,
}: {
  name: string;
  label: string;
  shown: boolean;
  onToggle(): void;
  autoComplete: string;
  value?: string;
  onChange?(value: string): void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <span className="relative">
        <input
          name={name}
          type={shown ? 'text' : 'password'}
          minLength={8}
          maxLength={128}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className="w-full rounded-dd-md border border-dd-line bg-white px-3 pr-12"
        />
        <IconButton
          label={`${shown ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`}
          variant="ghost"
          onClick={onToggle}
          className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-dd-muted"
        >
          {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </IconButton>
      </span>
    </label>
  );
}
