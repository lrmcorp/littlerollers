'use client';

import { useEffect, useState } from 'react';
import { Button } from '../actions';
import { Modal } from '../app-feedback';
import {
  lifecycleClient,
  lifecycleFailureMessage,
  type Deletability,
  type LifecycleKind,
} from '../../api-clients/lifecycle-client';
import { ReasonDialog } from './reason-dialog';

export type LifecycleAction = 'deactivate' | 'archive' | 'delete';

export interface LifecycleRequest {
  kind: LifecycleKind;
  id: string;
  /** Nama yang tampil di dialog, mis. "Daily Dose Bandung". */
  name: string;
  action: LifecycleAction;
}

/** Kata benda untuk judul, mis. `branch` → "cabang". */
const NOUN: Record<LifecycleKind, string> = {
  branch: 'cabang',
  studio: 'studio',
  room: 'ruangan',
  'class-type': 'tipe kelas',
  package: 'paket',
  promotion: 'promosi',
  voucher: 'voucher',
  'payment-account': 'rekening pembayaran',
  'min-quota': 'pengaturan kuota',
  'class-slot': 'jadwal kelas',
  user: 'akun',
};

/** Jenis yang punya Arsipkan di UI; selebihnya hanya bisa dinonaktifkan. */
const ARCHIVABLE: ReadonlySet<LifecycleKind> = new Set([
  'branch',
  'class-type',
  'voucher',
  'promotion',
]);

/** Kata kerja "jeda" untuk jenis yang memakainya (voucher, promosi), selain itu "nonaktifkan". */
export const pauseVerb = (kind: LifecycleKind) =>
  kind === 'voucher' || kind === 'promotion' ? 'Jeda' : 'Nonaktifkan';

/**
 * Dialog tunggal untuk Nonaktifkan / Arsipkan / Hapus. Alasan wajib untuk hapus permanen, akun pengguna, dan rekening pembayaran; opsional untuk data master lain.
 * - Hapus: kebolehan hapus ditanyakan ke server; bila masih ada data terkait, dialog menjelaskan apa saja dan
 *   tidak menawarkan hapus.
 * - Nonaktifkan (dan Arsipkan di luar cabang/tipe kelas): jalur tiap modul berbeda, jadi pemanggil menyediakan
 *   `deactivate(reason)` / `archive(reason)`.
 */
export function LifecycleDialog({
  request,
  deactivate,
  archive,
  onClose,
  onDone,
}: {
  request: LifecycleRequest | null;
  deactivate?(reason: string): Promise<unknown>;
  /** Jalur arsip milik modul (voucher, promosi); cabang dan tipe kelas memakai rute lifecycle bersama. */
  archive?(reason: string): Promise<unknown>;
  onClose(): void;
  /** Dipanggil setelah berhasil; `message` siap ditampilkan sebagai toast. */
  onDone(message: string): void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [check, setCheck] = useState<Deletability | 'loading' | 'failed' | null>(null);

  const deleting = request?.action === 'delete';
  // Alasan wajib hanya untuk hapus permanen serta aksi atas akun pengguna dan rekening pembayaran (uang).
  const reasonRequired =
    deleting || request?.kind === 'user' || request?.kind === 'payment-account';
  const requestKey = request ? `${request.kind}:${request.id}:${request.action}` : '';

  useEffect(() => {
    setError('');
    setBusy(false);
    if (!request || request.action !== 'delete') {
      setCheck(null);
      return;
    }
    let cancelled = false;
    setCheck('loading');
    lifecycleClient
      .deletability(request.kind, request.id)
      .then((result) => !cancelled && setCheck(result))
      .catch(async (failure) => {
        if (cancelled) return;
        setError(await lifecycleFailureMessage(failure));
        setCheck('failed');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  if (!request) return null;
  const noun = NOUN[request.kind];

  if (deleting && check !== null && typeof check === 'object' && check.deletable === false) {
    return (
      <Modal
        open
        title={`${capitalize(noun)} belum dapat dihapus`}
        description={`"${request.name}" masih memiliki data terkait, sehingga ${
          request.kind === 'class-slot'
            ? 'dipertahankan sebagai riwayat; batalkan kelas bila sudah terbit'
            : `hanya bisa ${pauseVerb(request.kind) === 'Jeda' ? 'dijeda' : 'dinonaktifkan'}${ARCHIVABLE.has(request.kind) ? ' atau diarsipkan' : ''}`
        }.`}
        onClose={onClose}
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Mengerti
            </Button>
          </div>
        }
      >
        <ul className="grid gap-1.5 text-sm" aria-label="Data terkait">
          {check.blockers.map((blocker) => (
            <li key={blocker.kind} className="flex justify-between gap-4 rounded-lg bg-dd-surface-muted px-3 py-2">
              <span>{capitalize(blocker.label)}</span>
              <strong>{blocker.count.toLocaleString('id-ID')}</strong>
            </li>
          ))}
        </ul>
      </Modal>
    );
  }

  if (deleting && (check === 'loading' || check === null)) {
    return (
      <Modal open title={`Memeriksa ${noun}…`} onClose={onClose} busy>
        <p className="text-sm text-dd-muted">Memeriksa data yang terkait dengan “{request.name}”.</p>
      </Modal>
    );
  }

  if (deleting && check === 'failed') {
    return (
      <Modal
        open
        title="Pemeriksaan gagal"
        onClose={onClose}
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Tutup
            </Button>
          </div>
        }
      >
        <p role="alert" className="text-sm text-dd-danger">
          {error}
        </p>
      </Modal>
    );
  }

  const copy = {
    deactivate: {
      title: `${pauseVerb(request.kind)} ${noun}?`,
      description: `"${request.name}" tidak lagi dipakai untuk data baru, riwayatnya tetap utuh, dan bisa diaktifkan kembali.`,
      confirmLabel: pauseVerb(request.kind),
      success: `${capitalize(noun)} "${request.name}" berhasil ${pauseVerb(request.kind) === 'Jeda' ? 'dijeda' : 'dinonaktifkan'}.`,
      tone: 'primary' as const,
    },
    archive: {
      title: `Arsipkan ${noun}?`,
      description: `"${request.name}" disembunyikan dari daftar kerja. Riwayat tetap utuh dan bisa dibuka lagi lewat filter Diarsipkan.`,
      confirmLabel: 'Arsipkan',
      success: `${capitalize(noun)} "${request.name}" berhasil diarsipkan.`,
      tone: 'primary' as const,
    },
    delete: {
      title: `Hapus ${noun} permanen?`,
      description: `"${request.name}" tidak memiliki data terkait dan akan dihapus permanen. Tindakan ini tidak dapat dibatalkan; salinan datanya tersimpan di catatan audit.`,
      confirmLabel: 'Hapus permanen',
      success: `${capitalize(noun)} "${request.name}" berhasil dihapus.`,
      tone: 'danger' as const,
    },
  }[request.action];

  const run = async (reason: string) => {
    setBusy(true);
    setError('');
    try {
      if (request.action === 'delete') await lifecycleClient.remove(request.kind, request.id, reason);
      else if (request.action === 'archive') {
        if (archive) await archive(reason);
        else if (request.kind === 'branch' || request.kind === 'class-type')
          await lifecycleClient.archive(request.kind, request.id, reason);
        else throw new Error('archive handler is required');
      } else {
        if (!deactivate) throw new Error('deactivate handler is required');
        await deactivate(reason);
      }
      await onDone(copy.success);
    } catch (failure) {
      setError(await lifecycleFailureMessage(failure));
      setBusy(false);
    }
  };

  return (
    <ReasonDialog
      open
      title={copy.title}
      description={copy.description}
      label="Alasan"
      optional={!reasonRequired}
      confirmLabel={copy.confirmLabel}
      tone={copy.tone}
      maxLength={500}
      busy={busy}
      error={error}
      onCancel={onClose}
      onConfirm={(reason) => void run(reason)}
    />
  );
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
