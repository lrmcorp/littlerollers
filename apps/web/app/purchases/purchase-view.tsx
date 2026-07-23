'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  browserPurchaseClient,
  purchaseFailure,
  sha256File,
  type PurchaseClient,
  type PurchasePackage,
} from '../purchase-client';
import { ConfirmationPanel, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import type { PaymentProof, Purchase } from '@dailydose/api-client-ts/generated';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
const scanLabels: Record<string, string> = {
  PENDING: 'Sedang dipindai',
  CLEAN: 'Bersih',
  REJECTED: 'Ditolak',
  INFECTED: 'Tidak aman',
  ERROR: 'Pemeriksaan gagal',
};

export function PurchaseView({
  client = browserPurchaseClient,
  branchOverride,
  digestFile = sha256File,
}: {
  client?: PurchaseClient;
  branchOverride?: { id: string; name: string; timezone: string };
  digestFile?: (file: File) => Promise<string>;
}) {
  const sessionContext = useSessionContext();
  const branch = branchOverride ?? sessionContext?.activeBranch ?? null;
  const isCustomer = !sessionContext || sessionContext.session?.roles.includes('CUSTOMER');
  const canSubmit = !sessionContext || sessionContext.hasCapability('package:read');
  const authorityKey = `${sessionContext?.session?.id ?? 'test'}:${sessionContext?.session?.assurance ?? 'MFA'}`;
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [proof, setProof] = useState<PaymentProof | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [intentKey, setIntentKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const selected = useMemo(
    () => packages.find((item) => item.id === selectedId) ?? null,
    [packages, selectedId],
  );

  useEffect(() => {
    setPackages([]);
    setSelectedId('');
    setProof(null);
    setSelectedFile(null);
    setPurchase(null);
    setNextCursor(undefined);
    setIntentKey('');
    setMessage('');
    setError('');
  }, [branch?.id, authorityKey]);

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(purchaseFailure(cause));
    } finally {
      setLoading(false);
    }
  };
  const loadPackages = (cursor?: string) =>
    run(async () => {
      if (!branch) return;
      const result = await client.list(branch.id, cursor);
      setPackages((current) => (cursor ? [...current, ...result.items] : result.items));
      setNextCursor(result.nextCursor);
      setMessage(result.items.length ? 'Paket aktif berhasil dimuat.' : 'Belum ada paket aktif.');
    });

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
            <StatusBadge tone="warning">Synthetic</StatusBadge>
            <StatusBadge tone="info">Bukti privat</StatusBadge>
          </>
        }
      />
      <div className="workspace-toolbar">
        <button disabled={loading || !canSubmit} onClick={() => void loadPackages()}>
          Muat paket
        </button>
      </div>
      {packages.length > 0 && (
        <div className="package-grid" role="radiogroup" aria-label="Paket aktif">
          {packages.map((item) => (
            <label
              className={selectedId === item.id ? 'package-card selected' : 'package-card'}
              key={item.id}
            >
              <input
                type="radio"
                name="package"
                value={item.id}
                checked={selectedId === item.id}
                onChange={() => {
                  setSelectedId(item.id);
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
              <b>{rupiah.format(item.priceRp)}</b>
              <small>Class type •{item.classTypeId.slice(-6)}</small>
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
        <button disabled={loading} onClick={() => void loadPackages(nextCursor)}>
          Muat paket berikutnya
        </button>
      )}
      {selected && (
        <form
          aria-label={purchase ? 'Ganti bukti pembayaran' : 'Upload bukti pembayaran'}
          onSubmit={(event) => {
            event.preventDefault();
            if (!selectedFile?.size) {
              setError('Pilih file PNG, JPEG, atau PDF terlebih dahulu.');
              return;
            }
            const file = selectedFile;
            void run(async () => {
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
              name="proof"
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <p className="form-hint">
            PNG, JPEG, atau PDF. Checksum dihitung lokal dan tidak ditampilkan.
          </p>
          <button disabled={loading}>
            {purchase ? 'Periksa bukti pengganti' : 'Upload dan periksa'}
          </button>
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
            <button
              disabled={loading}
              onClick={() => void run(async () => setProof(await client.status(proof.id)))}
            >
              Periksa status scan
            </button>
          )}
        </div>
      )}
      {selected && proof?.scanStatus === 'CLEAN' && !purchase && (
        <ConfirmationPanel title="Konfirmasi pengajuan purchase">
          <p>
            {selected.name} · {selected.sessionCount} sesi selama {selected.durationDays} hari.
          </p>
          <p>
            Total pembayaran {rupiah.format(selected.priceRp)}. Purchase akan berstatus menunggu
            review.
          </p>
          <button
            disabled={loading || !canSubmit}
            onClick={() =>
              void run(async () => {
                const key = intentKey || crypto.randomUUID();
                if (!intentKey) setIntentKey(key);
                const result = await client.submit(selected.id, proof.id, key);
                setPurchase(result);
                setMessage(
                  result.status === 'PENDING'
                    ? 'Pengajuan purchase menunggu review.'
                    : `Purchase ${result.status}.`,
                );
              })
            }
          >
            Kirim pengajuan
          </button>
        </ConfirmationPanel>
      )}
      {purchase && (
        <Feedback kind="status">
          Purchase {purchase.status}. Referensi •{purchase.id.slice(-6)}.
        </Feedback>
      )}
      {loading && <Skeleton label="Memproses purchase" />}
      {message && !loading && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
    </section>
  );
}
