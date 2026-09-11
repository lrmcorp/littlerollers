'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  browserPurchaseClient,
  purchaseFailure,
  sha256File,
  type PurchaseClient,
  type PurchasePackage,
} from '@/api-clients/purchase-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import type { PaymentProof, Purchase } from '@dailydose/api-client-ts/generated';
import { controlClassName } from '../components/forms';
import { Button } from '../components/actions';
import { Panel } from '../components/admin/admin-ui';
import { formatRupiah } from '../lib/formatters';
const scanLabels: Record<string, string> = {
  PENDING: 'Sedang dipindai',
  CLEAN: 'Bersih',
  REJECTED: 'Ditolak',
  INFECTED: 'Tidak aman',
  ERROR: 'Pemeriksaan gagal',
};

const purchaseStatusLabels: Record<string, string> = {
  AWAITING_PAYMENT: 'Menunggu pembayaran',
  PENDING: 'Menunggu verifikasi',
  ACTION_REQUIRED: 'Perlu perbaikan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  EXPIRED: 'Kedaluwarsa',
};
type PurchaseAction = 'packages' | 'proof' | 'scan' | 'submit';

export function PurchaseView({
  client = browserPurchaseClient,
  branchOverride,
  digestFile = sha256File,
  access,
}: {
  client?: PurchaseClient;
  branchOverride?: { id: string; name: string; timezone: string };
  digestFile?: (file: File) => Promise<string>;
  access?: { isCustomer: boolean; canSubmit: boolean };
}) {
  const sessionContext = useSessionContext();
  const isCustomer =
    access?.isCustomer ??
    Boolean(
      sessionContext?.status === 'authenticated' &&
      sessionContext.session?.roles.includes('CUSTOMER'),
    );
  const [flowBranch, setFlowBranch] = useState<{
    id: string;
    name: string;
    timezone: string;
  } | null>(null);
  const [requestedPackageId, setRequestedPackageId] = useState('');
  const [continuationSlot, setContinuationSlot] = useState('');
  const branch = branchOverride ?? sessionContext?.activeBranch ?? flowBranch;
  const canSubmit =
    access?.canSubmit ??
    Boolean(
      sessionContext?.status === 'authenticated' &&
      sessionContext.hasCapability('customer:self', 'package:read'),
    );
  const authorityKey = sessionContext?.session?.id ?? 'test';
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedClassTypeId, setSelectedClassTypeId] = useState('');
  const [proof, setProof] = useState<PaymentProof | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [intentKey, setIntentKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState<PurchaseAction | null>(null);
  const loading = busyAction !== null;
  const selected = useMemo(
    () => packages.find((item) => item.id === selectedId) ?? null,
    [packages, selectedId],
  );
  const selectedClassTypes = useMemo(
    () => (selected?.classTypeScopes ?? []).filter((scope) => scope.active),
    [selected],
  );

  useEffect(() => {
    if (!isCustomer) return;
    const query = new URLSearchParams(window.location.search);
    const branchId = query.get('branch');
    setRequestedPackageId(query.get('package') ?? '');
    setContinuationSlot(query.get('slot') ?? '');
    if (branchId) setFlowBranch({ id: branchId, name: 'Studio pilihan', timezone: 'Asia/Jakarta' });
  }, [isCustomer]);

  useEffect(() => {
    setPackages([]);
    setSelectedId('');
    setSelectedClassTypeId('');
    setProof(null);
    setSelectedFile(null);
    setPurchase(null);
    setNextCursor(undefined);
    setIntentKey('');
    setMessage('');
    setError('');
  }, [branch?.id, authorityKey]);

  const run = async (actionName: PurchaseAction, action: () => Promise<void>) => {
    setBusyAction(actionName);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(purchaseFailure(cause));
    } finally {
      setBusyAction(null);
    }
  };
  const loadPackages = (cursor?: string) =>
    run('packages', async () => {
      if (!branch) return;
      const result = await client.list(branch.id, cursor);
      setPackages((current) => (cursor ? [...current, ...result.items] : result.items));
      setNextCursor(result.nextCursor);
      setMessage(result.items.length ? 'Paket aktif berhasil dimuat.' : 'Belum ada paket aktif.');
    });

  useEffect(() => {
    if (!branch?.id || !requestedPackageId || !canSubmit) return;
    void run('packages', async () => {
      const result = await client.list(branch.id);
      setPackages(result.items);

      const requestedPackage = result.items.find(({ id }) => id === requestedPackageId) ?? null;
      const requestedClassTypes =
        requestedPackage?.classTypeScopes?.filter((scope) => scope.active) ?? [];

      setSelectedId(requestedPackage?.id ?? '');
      setSelectedClassTypeId(
        requestedClassTypes.length === 1 ? requestedClassTypes[0]!.classTypeId : '',
      );
      setMessage(
        requestedPackage ? 'Paket pilihan siap diproses.' : 'Paket pilihan tidak lagi tersedia.',
      );
    });
  }, [branch?.id, canSubmit, client, requestedPackageId]);

  if (!isCustomer) return null;
  if (!branch)
    return (
      <section className="card" aria-labelledby="purchase-title">
        <PageHeader
          eyebrow="Pengajuan customer"
          title="Beli paket"
          titleId="purchase-title"
          description="Pilih cabang aktif terlebih dahulu untuk melihat paket yang tersedia."
        />
        <Feedback kind="warning">Cabang aktif wajib dipilih secara eksplisit.</Feedback>
      </section>
    );

  return (
    <section className="card purchase-workspace" aria-labelledby="purchase-title">
      <PageHeader
        eyebrow={`${branch.name} · ${branch.timezone}`}
        title="Beli paket"
        titleId="purchase-title"
        description="Pilih paket, periksa bukti pembayaran secara privat, lalu kirim pengajuan."
        context={
          <>
            <StatusBadge tone="info">Verifikasi Manual</StatusBadge>
            <StatusBadge tone="info">Bukti privat</StatusBadge>
          </>
        }
      />
      <div className="workspace-toolbar">
        <Button
          variant="secondary"
          loading={busyAction === 'packages'}
          loadingLabel="Memuat paket…"
          disabled={loading || !canSubmit}
          onClick={() => void loadPackages()}
        >
          Muat paket
        </Button>
      </div>
      {packages.length > 0 && (
        <div className="package-grid" role="radiogroup" aria-label="Paket aktif">
          {packages.map((item) => (
            <label
              className={selectedId === item.id ? 'package-card selected' : 'package-card'}
              key={item.id}
            >
              <input
                className={controlClassName}
                type="radio"
                name="package"
                value={item.id}
                checked={selectedId === item.id}
                onChange={() => {
                  const activeClassTypes =
                    item.classTypeScopes?.filter((scope) => scope.active) ?? [];

                  setSelectedId(item.id);
                  setSelectedClassTypeId(
                    activeClassTypes.length === 1 ? activeClassTypes[0]!.classTypeId : '',
                  );
                  setProof(null);
                  setSelectedFile(null);
                  setPurchase(null);
                  setIntentKey('');
                }}
              />
              <strong>{item.name}</strong>
              <span>
                {item.sessionCount} sesi · {item.durationDays} hari
              </span>
              <b>{formatRupiah(item.priceRp)}</b>
              <small>
                {item.classTypeScopes?.filter((scope) => scope.active).length ?? 0} jenis kelas
                tersedia
              </small>
              <small>
                Efektif {item.effectiveFrom.toLocaleDateString('id-ID')}–
                {item.effectiveUntil?.toLocaleDateString('id-ID') ?? 'tanpa akhir'}
              </small>
            </label>
          ))}
        </div>
      )}
      {!loading && packages.length === 0 && (
        <EmptyState title="Belum ada paket" description="Muat paket aktif untuk cabang ini." />
      )}
      {nextCursor && (
        <Button
          variant="secondary"
          loading={busyAction === 'packages'}
          loadingLabel="Memuat paket…"
          disabled={loading}
          onClick={() => void loadPackages(nextCursor)}
        >
          Muat paket berikutnya
        </Button>
      )}
      {selected && selectedClassTypes.length > 1 && (
        <label>
          Jenis kelas
          <select
            className={controlClassName}
            value={selectedClassTypeId}
            required
            onChange={(event) => {
              setSelectedClassTypeId(event.target.value);
              setProof(null);
              setSelectedFile(null);
              setPurchase(null);
              setIntentKey('');
            }}
          >
            <option value="">Pilih jenis kelas</option>
            {selectedClassTypes.map((scope) => (
              <option key={scope.id} value={scope.classTypeId}>
                {scope.classType?.name ?? `Class •${scope.classTypeId.slice(-6)}`}
              </option>
            ))}
          </select>
        </label>
      )}

      {selected && selectedClassTypes.length === 0 && (
        <Feedback kind="warning">Paket ini belum memiliki jenis kelas aktif.</Feedback>
      )}

      {selected && (
        <form
          aria-label={purchase ? 'Ganti bukti pembayaran' : 'Upload bukti pembayaran'}
          onSubmit={(event) => {
            event.preventDefault();
            if (!selectedClassTypeId) {
              setError('Pilih jenis kelas terlebih dahulu.');
              return;
            }
            if (!selectedFile?.size) {
              setError('Pilih file PNG, JPEG, atau PDF terlebih dahulu.');
              return;
            }
            const file = selectedFile;
            void run('proof', async () => {
              const sha256 = await digestFile(file);
              const issued = await client.issue({
                branchId: branch.id,
                packageId: selected.id,
                fileName: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
                sha256,
              });
              setProof(issued);
              const finalized = await client.finalize(issued.id, sha256, file.size);
              setProof(finalized);
              if (purchase && finalized.scanStatus === 'CLEAN') {
                const replacementKey = crypto.randomUUID();
                await client.replace(purchase.id, finalized.id, purchase.version, replacementKey);
                setMessage('Bukti pengganti diterima dan menunggu hasil authoritative terbaru.');
              } else {
                setMessage(
                  finalized.scanStatus === 'CLEAN'
                    ? 'Bukti dinyatakan bersih dan siap digunakan.'
                    : `Status bukti: ${scanLabels[finalized.scanStatus] ?? finalized.scanStatus}.`,
                );
              }
            });
          }}
        >
          <label>
            {purchase ? 'Bukti pengganti' : 'Bukti pembayaran'}
            <input
              className={controlClassName}
              name="proof"
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <p className="form-hint">
            Format PNG, JPEG, atau PDF (maks. 5MB). Verifikasi keamanan file dilakukan sebelum pengunggahan.
          </p>
          <Button
            type="submit"
            loading={busyAction === 'proof'}
            loadingLabel={purchase ? 'Memeriksa bukti pengganti…' : 'Mengunggah bukti…'}
            disabled={loading}
          >
            {purchase ? 'Periksa bukti pengganti' : 'Unggah dan periksa'}
          </Button>
        </form>
      )}
      {proof && (
        <div className="proof-status" aria-live="polite">
          <StatusBadge
            tone={
              proof.scanStatus === 'CLEAN'
                ? 'success'
                : proof.scanStatus === 'PENDING'
                  ? 'info'
                  : 'danger'
            }
          >
            {scanLabels[proof.scanStatus] ?? proof.scanStatus}
          </StatusBadge>
          <span>
            {proof.fileName || 'Bukti pembayaran'} · {proof.mimeType || 'metadata privat'}
          </span>
          {proof.scanStatus === 'PENDING' && (
            <Button
              variant="secondary"
              size="sm"
              loading={busyAction === 'scan'}
              loadingLabel="Memeriksa status…"
              disabled={loading}
              onClick={() => void run('scan', async () => setProof(await client.status(proof.id)))}
            >
              Periksa status scan
            </Button>
          )}
        </div>
      )}
      {selected && proof?.scanStatus === 'CLEAN' && !purchase && (
        <Panel
          className="grid gap-3 border-amber-200 bg-dd-warning-soft p-4 text-sm text-dd-warning"
          aria-label="Konfirmasi pengajuan pembelian"
        >
          <strong>Konfirmasi pengajuan pembelian</strong>
          <p>
            {selected.name} · {selected.sessionCount} sesi selama {selected.durationDays} hari.
          </p>
          <p>
            Total pembayaran {formatRupiah(selected.priceRp)}. Pengajuan akan diproses dan menunggu
            verifikasi admin.
          </p>
          <Button
            disabled={loading || !canSubmit || !selectedClassTypeId}
            loading={busyAction === 'submit'}
            loadingLabel="Mengirim pengajuan…"
            onClick={() =>
              void run('submit', async () => {
                const key = intentKey || crypto.randomUUID();
                if (!intentKey) setIntentKey(key);
                const result = await client.submit(
                  selected.id,
                  proof.id,
                  branch.id,
                  selectedClassTypeId,
                  key,
                );
                setPurchase(result);
                setMessage(
                  result.status === 'PENDING'
                    ? 'Pengajuan pembelian paket berhasil dikirim dan menunggu verifikasi admin.'
                    : `Status pembelian: ${purchaseStatusLabels[result.status] ?? result.status}.`,
                );
              })
            }
          >
            Kirim pengajuan
          </Button>
        </Panel>
      )}
      {purchase && (
        <Feedback kind="status">
          Status pembelian: {purchaseStatusLabels[purchase.status] ?? purchase.status}. Referensi •{purchase.id.slice(-6)}.{' '}
          {continuationSlot && (
            <span>
              Setelah paket disetujui,{' '}
              <a href={`/bookings/new?slot=${encodeURIComponent(continuationSlot)}`}>
                lanjutkan booking kelas
              </a>
              .
            </span>
          )}
        </Feedback>
      )}
      {loading && <Skeleton label="Memproses pembelian paket" />}
      {message && !loading && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
    </section>
  );
}
