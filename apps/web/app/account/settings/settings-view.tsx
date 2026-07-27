'use client';

import { useEffect, useState } from 'react';
import { accountClient, type MyProfile, type PublicSiteConfig } from '../../account-client';
import { useSessionContext } from '../../session-context';
import { messageForApiError, useAppFeedback } from '../../components/app-feedback';

export function SettingsView() {
  const context = useSessionContext();
  const feedback = useAppFeedback();
  const customer = Boolean(context?.session?.roles.includes('CUSTOMER'));
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [config, setConfig] = useState<PublicSiteConfig | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'saving' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const load = async () => {
    setState('loading');
    try {
      const [nextProfile, nextConfig] = await Promise.all([
        accountClient.profile(),
        accountClient.siteConfig(),
      ]);
      setProfile(nextProfile);
      setConfig(nextConfig);
      setState('ready');
    } catch {
      setState('error');
    }
  };
  useEffect(() => void load(), []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-sans">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-brass-dark">
          Preferensi
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="mt-2 text-dd-muted">Atur studio utama dan jalur bantuan akun Anda.</p>
      </header>
      {!customer ? (
        <section className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
          <h2 className="text-lg font-bold">Pengaturan workspace</h2>
          <p className="mt-2 text-sm text-dd-muted">
            Konteks cabang staf tetap dikelola melalui branch switcher workspace.
          </p>
        </section>
      ) : state === 'loading' ? (
        <p role="status">Memuat pengaturan…</p>
      ) : state === 'error' || !profile || !config ? (
        <section className="rounded-dd-xl border border-dd-danger/20 bg-white p-6">
          <h2 className="font-bold">Pengaturan belum dapat dimuat</h2>
          <button className="mt-4" onClick={() => void load()}>
            Coba lagi
          </button>
        </section>
      ) : (
        <form
          className="grid gap-5 rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card"
          onSubmit={async (event) => {
            event.preventDefault();
            if (state === 'saving') return;
            const branchId = String(new FormData(event.currentTarget).get('branchId'));
            setState('saving');
            setMessage('');
            try {
              const updated = await accountClient.updateProfile({
                displayName: profile.displayName,
                preferredBranchId: branchId,
                expectedVersion: profile.version,
              });
              setProfile(updated);
              setState('ready');
              feedback.showToast({
                tone: 'success',
                title: 'Studio utama diperbarui',
                message: 'Jadwal, paket, dan bantuan akan memakai studio pilihan ini.',
              });
              await context?.refresh();
            } catch (error) {
              setState('error');
              setMessage('Studio belum dapat disimpan. Muat ulang dan coba kembali.');
              feedback.showAlert({ tone: 'danger', ...messageForApiError(error) });
            }
          }}
        >
          <fieldset className="grid gap-3">
            <legend className="text-lg font-bold">Studio utama</legend>
            <p className="text-sm leading-6 text-dd-muted">
              Pilihan ini menjadi default untuk jadwal, paket, checkout, dan bantuan WhatsApp.
            </p>
            {config.branches.map((branch) => (
              <label
                key={branch.id}
                className="flex cursor-pointer items-center gap-3 rounded-dd-lg border border-dd-line p-4"
              >
                <input
                  type="radio"
                  name="branchId"
                  value={branch.id}
                  defaultChecked={profile.preferredBranch?.id === branch.id}
                  required
                />
                <span>
                  <strong className="block">{branch.name}</strong>
                  <span className="text-sm text-dd-muted">
                    {branch.timezone === 'Asia/Jakarta' ? 'WIB' : branch.timezone}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          {message && (
            <p role="status" className="rounded-dd-md bg-dd-surface-muted p-3 text-sm">
              {message}
            </p>
          )}
          <button
            disabled={state === 'saving'}
            className="rounded-dd-md border-0 bg-dd-forest px-5 font-bold text-white"
          >
            {state === 'saving' ? 'Menyimpan…' : 'Simpan pengaturan'}
          </button>
        </form>
      )}
    </div>
  );
}
