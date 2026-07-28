'use client';

import { useEffect, useState } from 'react';
import { accountClient, type MyProfile } from '../../account-client';
import { useSessionContext } from '../../session-context';
import { messageForApiError, useAppFeedback } from '../../components/app-feedback';
import { Button, ButtonLink } from '../../components/actions';
import { useStudioPreference } from '../../components/public/public-experience';

export function ProfileView() {
  const session = useSessionContext();
  const feedback = useAppFeedback();
  const studioPreference = useStudioPreference();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'saving' | 'error' | 'stale'>('loading');
  const [message, setMessage] = useState('');

  const load = async () => {
    setState('loading');
    try {
      setProfile(await accountClient.profile());
      setState('ready');
    } catch {
      setState('error');
    }
  };
  useEffect(() => void load(), []);

  if (!profile)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-8 shadow-dd-card">
        <h1 className="text-2xl font-bold">
          {state === 'error' ? 'Profil belum dapat dimuat' : 'Memuat profil…'}
        </h1>
        {state === 'error' && (
          <Button className="mt-5" onClick={() => void load()}>
            Coba lagi
          </Button>
        )}
      </section>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-sans">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-brass-dark">Akun</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="mt-2 text-dd-muted">Kelola nama tampilan dan lihat identitas kontak akun.</p>
      </header>
      <form
        className="grid gap-5 rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card"
        onSubmit={async (event) => {
          event.preventDefault();
          if (state === 'saving') return;
          const data = new FormData(event.currentTarget);
          setState('saving');
          setMessage('');
          try {
            const updated = await accountClient.updateProfile({
              displayName: String(data.get('displayName')),
              expectedVersion: profile.version,
            });
            setProfile(updated);
            setState('ready');
            feedback.showToast({
              tone: 'success',
              title: 'Profil diperbarui',
              message: 'Nama tampilan terbaru sudah tersimpan.',
            });
            await session?.refresh();
          } catch (error) {
            const status = (error as { response?: { status?: number } }).response?.status;
            setState(status === 409 ? 'stale' : 'error');
            setMessage(
              status === 409
                ? 'Profil sudah berubah. Muat ulang sebelum mencoba lagi.'
                : 'Profil belum dapat disimpan.',
            );
            if (status !== 409)
              feedback.showAlert({ tone: 'danger', ...messageForApiError(error) });
          }
        }}
      >
        <label className="grid gap-2 text-sm font-semibold">
          Nama tampilan
          <input
            name="displayName"
            defaultValue={profile.displayName}
            minLength={2}
            maxLength={160}
            required
            className="rounded-dd-md border border-dd-line bg-white px-3"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Email akun
            <input
              value={profile.emailMasked ?? 'Belum tersedia'}
              readOnly
              className="rounded-dd-md border border-dd-line bg-dd-surface-muted px-3 text-dd-muted"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Nomor WhatsApp
            <input
              value={profile.phoneMasked ?? 'Belum tersedia'}
              readOnly
              className="rounded-dd-md border border-dd-line bg-dd-surface-muted px-3 text-dd-muted"
            />
          </label>
        </div>
        <p className="text-xs leading-5 text-dd-muted">
          Perubahan email atau nomor login membutuhkan verifikasi terpisah melalui tim Daily Dose.
        </p>
        {message && (
          <p
            role="status"
            className={`rounded-dd-md p-3 text-sm ${state === 'ready' ? 'bg-dd-success-soft text-dd-success' : 'bg-dd-danger-soft text-dd-danger'}`}
          >
            {message}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={state === 'saving'} loadingLabel="Menyimpan…">
            Simpan profil
          </Button>
          <ButtonLink href="/account/security" variant="secondary">
            Keamanan akun
          </ButtonLink>
        </div>
      </form>
      <section className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-brass-dark">
          Preferensi latihan
        </p>
        <h2 className="mt-2 text-xl font-semibold">Studio utama</h2>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          {profile.preferredBranch
            ? `${profile.preferredBranch.name} menjadi default untuk jadwal, paket baru, checkout baru, dan bantuan WhatsApp.`
            : 'Pilih studio yang paling sering Anda gunakan.'}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => studioPreference?.openStudioPreference()}
        >
          Ganti studio
        </Button>
      </section>
    </div>
  );
}
