'use client';

import { useEffect, useRef, useState } from 'react';
import {
  browserPurchaseReviewClient,
  purchaseFailure,
  type PurchaseReviewClient,
  type ReviewPurchase,
} from '../purchase-client';
import { ConfirmationPanel, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu review',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};
const reasonLabels = {
  PROOF_INVALID: 'Bukti tidak valid',
  AMOUNT_MISMATCH: 'Nominal tidak sesuai',
  DUPLICATE_PURCHASE: 'Purchase duplikat',
  OTHER_REVIEW_REQUIRED: 'Perlu tinjauan lain',
} as const;
type RejectReason = keyof typeof reasonLabels;

export function PurchaseReviewView({
  client = browserPurchaseReviewClient,
  branchOverride,
}: {
  client?: PurchaseReviewClient;
  branchOverride?: { id: string; name: string; timezone: string };
}) {
  const sessionContext = useSessionContext();
  const branch = branchOverride ?? sessionContext?.activeBranch ?? null;
  const canReview = !sessionContext || sessionContext.hasCapability('purchase:review');
  const canDecide = !sessionContext || sessionContext.hasCapability('purchase:decide');
  const hasMfa = !sessionContext || sessionContext.session?.assurance === 'MFA';
  const authorityKey = `${sessionContext?.session?.id ?? 'test'}:${sessionContext?.session?.assurance ?? 'MFA'}`;
  const [items, setItems] = useState<ReviewPurchase[]>([]);
  const [selected, setSelected] = useState<ReviewPurchase | null>(null);
  const [status, setStatus] = useState('PENDING');
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [reasonCode, setReasonCode] = useState<RejectReason>('PROOF_INVALID');
  const [intentKey, setIntentKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setItems([]);
    setSelected(null);
    setNextCursor(undefined);
    setStatus('PENDING');
    setIntentKey('');
    setMessage('');
    setError('');
  }, [branch?.id, authorityKey]);
  useEffect(() => {
    if (selected) closeButton.current?.focus();
  }, [selected]);

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
  const load = (cursor?: string) =>
    run(async () => {
      if (!branch) return;
      const result = await client.list(branch.id, status === 'ALL' ? undefined : status, cursor);
      setItems((current) => (cursor ? [...current, ...result.items] : result.items));
      setNextCursor(result.nextCursor);
      setMessage(
        result.items.length ? 'Queue purchase berhasil dimuat.' : 'Queue purchase kosong.',
      );
    });
  const close = () => {
    setSelected(null);
    setIntentKey('');
    window.setTimeout(() => opener.current?.focus(), 0);
  };
  const authoritative = (purchase: ReviewPurchase) => {
    const merged = selected ? { ...purchase, customerName: selected.customerName } : purchase;
    setItems((current) => current.map((item) => (item.id === merged.id ? merged : item)));
    setSelected(merged);
    setMessage(`Purchase ${statusLabels[merged.status] ?? merged.status}.`);
  };

  if (!canReview) return null;
  if (!branch)
    return (
      <section className="card" aria-labelledby="review-title">
        <PageHeader
          eyebrow="Internal review"
          title="Review purchase"
          titleId="review-title"
          description="Pilih cabang aktif untuk membuka queue purchase."
        />
        <Feedback kind="warning">Cabang aktif wajib dipilih secara eksplisit.</Feedback>
      </section>
    );

  return (
    <section className="card purchase-workspace" aria-labelledby="review-title">
      <PageHeader
        eyebrow={`${branch.name} · ${branch.timezone}`}
        title="Review purchase"
        titleId="review-title"
        description="Periksa snapshot komersial dan bukti privat sebelum mengambil keputusan."
        context={
          <StatusBadge tone={hasMfa ? 'success' : 'warning'}>
            {hasMfa ? 'MFA aktif' : 'MFA diperlukan'}
          </StatusBadge>
        }
      />
      <div className="filter-bar">
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setItems([]);
              setNextCursor(undefined);
            }}
          >
            <option value="PENDING">Menunggu review</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
            <option value="ALL">Semua status</option>
          </select>
        </label>
        <button disabled={loading} onClick={() => void load()}>
          Muat queue
        </button>
      </div>
      {items.length > 0 && (
        <div className="purchase-queue" role="list" aria-label="Queue purchase">
          {items.map((item) => (
            <div role="listitem" key={item.id}>
              <button
                className="purchase-row"
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setSelected(item);
                  setIntentKey('');
                }}
              >
                <span>
                  <strong>{item.customerName}</strong>
                  <small>{item.packageNameSnapshot}</small>
                </span>
                <span>
                  {rupiah.format(item.priceRpSnapshot)}
                  <small>
                    {item.sessionCountSnapshot} sesi · {item.durationDaysSnapshot} hari
                  </small>
                </span>
                <span>
                  <StatusBadge
                    tone={
                      item.status === 'APPROVED'
                        ? 'success'
                        : item.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {statusLabels[item.status]}
                  </StatusBadge>
                  <small>{item.submittedAt.toLocaleString('id-ID')}</small>
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
      {!loading && items.length === 0 && (
        <EmptyState
          title="Queue kosong"
          description="Muat purchase sesuai status dan cabang aktif."
        />
      )}
      {nextCursor && (
        <button disabled={loading} onClick={() => void load(nextCursor)}>
          Muat purchase berikutnya
        </button>
      )}
      {selected && (
        <div
          className="panel-backdrop"
          onMouseDown={(event) => event.target === event.currentTarget && close()}
        >
          <div
            className="side-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
          >
            <header className="side-panel-header">
              <div>
                <p className="eyebrow">Purchase •{selected.id.slice(-6)}</p>
                <h2 id="decision-title">Detail review</h2>
              </div>
              <button ref={closeButton} onClick={close} aria-label="Tutup panel review">
                Tutup
              </button>
            </header>
            <dl className="purchase-summary">
              <div>
                <dt>Pelanggan</dt>
                <dd>{selected.customerName}</dd>
              </div>
              <div>
                <dt>Paket</dt>
                <dd>{selected.packageNameSnapshot}</dd>
              </div>
              <div>
                <dt>Harga</dt>
                <dd>{rupiah.format(selected.priceRpSnapshot)}</dd>
              </div>
              <div>
                <dt>Sesi / durasi</dt>
                <dd>
                  {selected.sessionCountSnapshot} / {selected.durationDaysSnapshot} hari
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{statusLabels[selected.status]}</dd>
              </div>
              <div>
                <dt>Versi</dt>
                <dd>{selected.version}</dd>
              </div>
            </dl>
            <button
              disabled={loading}
              onClick={() =>
                void run(async () => {
                  const authorization = await client.authorizeProof(selected.paymentProofId);
                  window.open(authorization.url, '_blank', 'noopener,noreferrer');
                  setMessage(
                    `Bukti privat diotorisasi sampai ${authorization.expiresAt.toLocaleTimeString('id-ID')}.`,
                  );
                })
              }
            >
              Buka bukti privat
            </button>
            {selected.status === 'PENDING' && (
              <>
                <ConfirmationPanel title="Konsekuensi approval">
                  Approval membuat customer package dan ledger PURCHASE. Rejection tidak menambah
                  saldo.
                </ConfirmationPanel>
                {!hasMfa && (
                  <Feedback kind="warning">
                    Lakukan step-up MFA sebelum mengambil keputusan.
                  </Feedback>
                )}
                <button
                  disabled={loading || !canDecide || !hasMfa}
                  onClick={() =>
                    void run(async () => {
                      const key = intentKey || crypto.randomUUID();
                      if (!intentKey) setIntentKey(key);
                      authoritative(await client.approve(selected.id, selected.version, key));
                    })
                  }
                >
                  Setujui purchase
                </button>
                <label>
                  Alasan penolakan
                  <select
                    value={reasonCode}
                    onChange={(event) => setReasonCode(event.target.value as RejectReason)}
                  >
                    {Object.entries(reasonLabels).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  disabled={loading || !canDecide || !hasMfa}
                  onClick={() =>
                    void run(async () => {
                      const key = intentKey || crypto.randomUUID();
                      if (!intentKey) setIntentKey(key);
                      authoritative(
                        await client.reject(selected.id, selected.version, reasonCode, key),
                      );
                    })
                  }
                >
                  Tolak purchase
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {loading && <Skeleton label="Memproses purchase" />}
      {message && !loading && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
    </section>
  );
}
