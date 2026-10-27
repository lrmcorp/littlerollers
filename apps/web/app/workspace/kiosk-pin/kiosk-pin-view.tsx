'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/admin-page-header';
import { AdminEmptyState, Badge, Panel } from '../../components/admin/admin-ui';
import { Button } from '../../components/actions';
import { useAppFeedback } from '../../components/app-feedback';
import { Feedback, Skeleton } from '../../ui';
import {
  browserKioskPinClient,
  type KioskPinBranch,
  type KioskPinClient,
  type KioskPinCreated,
} from './kiosk-pin-client';

const dateTime = (value: string) =>
  new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Staf membuat PIN 6 digit per cabang untuk membuka tablet kiosk presensi. PIN hanya tampil satu kali. */
export function KioskPinView({ client = browserKioskPinClient }: { client?: KioskPinClient }) {
  const feedback = useAppFeedback();
  const [items, setItems] = useState<KioskPinBranch[]>();
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string>();
  const [created, setCreated] = useState<KioskPinCreated & { name: string }>();
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      setItems((await client.list()).items);
    } catch {
      setError('Daftar PIN kiosk belum dapat dimuat. Anda memerlukan izin kelola cabang.');
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  const rotate = async (branch: KioskPinBranch) => {
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: branch.configured ? `Ganti PIN kiosk ${branch.name}?` : `Buat PIN kiosk ${branch.name}?`,
      message: branch.configured
        ? 'PIN lama dan semua tablet yang sudah terbuka di cabang ini langsung terkunci. Masukkan PIN baru di setiap tablet.'
        : 'PIN dipakai tablet studio untuk membuka layar presensi. PIN hanya ditampilkan sekali.',
      confirmLabel: branch.configured ? 'Ganti PIN' : 'Buat PIN',
    });
    if (!accepted) return;
    setBusyId(branch.branchId);
    setCopied(false);
    try {
      const result = await client.rotate(branch.branchId);
      setCreated({ ...result, name: branch.name });
      await load();
    } catch {
      setError('PIN belum dapat dibuat. Periksa izin Anda lalu coba lagi.');
    } finally {
      setBusyId(undefined);
    }
  };

  const copy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.pin);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!items)
    return error ? <Feedback kind="error">{error}</Feedback> : <Skeleton label="Memuat PIN kiosk" />;

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="PIN Kiosk"
        description="Tablet kiosk presensi hanya terbuka dengan PIN 6 digit cabangnya. PIN dibuat di sini, tidak pernah disimpan dalam bentuk asli, dan hanya tampil satu kali."
      />
      {error && <Feedback kind="error">{error}</Feedback>}

      {created && (
        <Panel className="space-y-3 border-2 border-dd-forest p-5" role="status" aria-label="PIN baru">
          <p className="text-sm font-semibold text-dd-ink">PIN baru untuk {created.name}</p>
          <p className="font-mono text-4xl font-bold tracking-[0.3em] text-dd-ink">{created.pin}</p>
          <p className="text-sm text-dd-muted">
            Catat atau salin sekarang. PIN ini tidak akan ditampilkan lagi setelah Anda menutupnya; kalau hilang,
            buat PIN baru.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" leadingIcon={<Copy className="size-4" />} onClick={() => void copy()}>
              {copied ? 'PIN tersalin' : 'Salin PIN'}
            </Button>
            <Button variant="ghost" onClick={() => setCreated(undefined)}>
              Tutup
            </Button>
          </div>
        </Panel>
      )}

      {items.length === 0 ? (
        <AdminEmptyState
          title="Belum ada cabang yang dapat diatur"
          description="Anda tidak memegang izin kelola cabang di cabang mana pun."
        />
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {items.map((branch) => (
            <li key={branch.branchId}>
              <Panel className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-dd-ink">{branch.name}</h2>
                  <p className="text-sm text-dd-muted">
                    {branch.configured && branch.updatedAt
                      ? `PIN dibuat ${dateTime(branch.updatedAt)}`
                      : 'Belum ada PIN. Tablet kiosk cabang ini terkunci.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={branch.configured ? 'success' : 'warning'}>
                    {branch.configured ? 'PIN aktif' : 'Terkunci'}
                  </Badge>
                  <Button
                    variant={branch.configured ? 'secondary' : 'primary'}
                    leadingIcon={<KeyRound className="size-4" />}
                    disabled={busyId !== undefined}
                    loading={busyId === branch.branchId}
                    onClick={() => void rotate(branch)}
                  >
                    {branch.configured ? 'Ganti PIN' : 'Buat PIN'}
                  </Button>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
