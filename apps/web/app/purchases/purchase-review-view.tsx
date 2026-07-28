'use client';

import { useEffect, useRef, useState } from 'react';
import {
  browserPurchaseReviewClient,
  purchaseFailure,
  type PurchaseReviewClient,
  type ReviewPurchase,
} from '../purchase-client';
import { ConfirmationPanel, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import {
  Badge,
  Button,
  DataTable,
  DetailDrawer,
  FilterBar,
  Panel,
} from '../components/admin/admin-ui';
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
  const canReview =
    !sessionContext || sessionContext.hasCapability('payment:review', 'purchase:review');
  const canDecide =
    !sessionContext || sessionContext.hasCapability('payment:decide', 'purchase:decide');
  const authorityKey = sessionContext?.session?.id ?? 'test';
  const [items, setItems] = useState<ReviewPurchase[]>([]);
  const [selected, setSelected] = useState<ReviewPurchase | null>(null);
  const [status, setStatus] = useState('PENDING');
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [reasonCode, setReasonCode] = useState<RejectReason>('PROOF_INVALID');
  const [intentKey, setIntentKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      <Panel className="p-6">
        <PageHeader
          eyebrow="Internal review"
          title="Review purchase"
          titleId="review-title"
          description="Pilih cabang aktif untuk membuka queue purchase."
        />
        <Feedback kind="warning">Cabang aktif wajib dipilih secara eksplisit.</Feedback>
      </Panel>
    );

  return (
    <section className="purchase-workspace space-y-6" aria-labelledby="review-title">
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow={`${branch.name} · ${branch.timezone}`}
          title="Review purchase"
          titleId="review-title"
          description="Periksa snapshot komersial dan bukti privat sebelum mengambil keputusan."
          context={<StatusBadge tone="success">Permission terverifikasi</StatusBadge>}
        />
      </Panel>
      <FilterBar>
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
        <Button disabled={loading} onClick={() => void load()}>
          Muat queue
        </Button>
      </FilterBar>
      {items.length > 0 && (
        <DataTable
          items={items}
          rowKey={(item) => item.id}
          columns={[
            {
              id: 'customer',
              header: 'Pelanggan',
              cell: (item) => (
                <div>
                  <strong>{item.customerName}</strong>
                  <p className="text-xs text-dd-muted">{item.packageNameSnapshot}</p>
                </div>
              ),
            },
            {
              id: 'value',
              header: 'Nilai',
              cell: (item) => (
                <div>
                  {rupiah.format(item.payableAmountRpSnapshot ?? item.priceRpSnapshot)}
                  <p className="text-xs text-dd-muted">
                    {item.paymentUniqueCode
                      ? `Harga ${rupiah.format(item.priceRpSnapshot)} · identifikasi ${String(item.paymentUniqueCode).padStart(3, '0')}`
                      : 'Nominal standar'}
                  </p>
                </div>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => (
                <Badge
                  tone={
                    item.status === 'APPROVED'
                      ? 'success'
                      : item.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {statusLabels[item.status]}
                </Badge>
              ),
            },
            {
              id: 'submitted',
              header: 'Diajukan',
              cell: (item) => item.submittedAt.toLocaleString('id-ID'),
            },
            {
              id: 'action',
              header: 'Tindakan',
              cell: (item) => (
                <Button
                  variant="secondary"
                  onClick={(event) => {
                    opener.current = event.currentTarget;
                    setSelected(item);
                    setIntentKey('');
                  }}
                >
                  Review
                </Button>
              ),
            },
          ]}
          mobileCard={(item) => (
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong>{item.customerName}</strong>
                <p className="mt-1 text-sm text-dd-muted">{item.packageNameSnapshot}</p>
                <p className="mt-2 font-semibold">
                  {rupiah.format(item.payableAmountRpSnapshot ?? item.priceRpSnapshot)}
                </p>
              </div>
              <div className="grid justify-items-end gap-3">
                <Badge
                  tone={
                    item.status === 'APPROVED'
                      ? 'success'
                      : item.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {statusLabels[item.status]}
                </Badge>
                <Button
                  variant="secondary"
                  onClick={(event) => {
                    opener.current = event.currentTarget;
                    setSelected(item);
                    setIntentKey('');
                  }}
                >
                  Review
                </Button>
              </div>
            </div>
          )}
        />
      )}
      {!loading && items.length === 0 && (
        <EmptyState
          title="Queue kosong"
          description="Muat purchase sesuai status dan cabang aktif."
        />
      )}
      {nextCursor && (
        <Button variant="secondary" disabled={loading} onClick={() => void load(nextCursor)}>
          Muat purchase berikutnya
        </Button>
      )}
      {selected && (
        <DetailDrawer open title="Detail review" onClose={close}>
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
              <dt>Total transfer</dt>
              <dd>{rupiah.format(selected.payableAmountRpSnapshot ?? selected.priceRpSnapshot)}</dd>
            </div>
            <div>
              <dt>Harga paket / identifikasi transfer</dt>
              <dd>
                {rupiah.format(selected.priceRpSnapshot)} /{' '}
                {selected.paymentUniqueCode
                  ? String(selected.paymentUniqueCode).padStart(3, '0')
                  : 'Nominal standar'}
              </dd>
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
          <Button
            variant="secondary"
            disabled={loading || !selected.paymentProofId}
            onClick={() =>
              void run(async () => {
                if (!selected.paymentProofId) return;
                const authorization = await client.authorizeProof(selected.paymentProofId);
                window.open(authorization.url, '_blank', 'noopener,noreferrer');
                setMessage(
                  `Bukti privat diotorisasi sampai ${authorization.expiresAt.toLocaleTimeString('id-ID')}.`,
                );
              })
            }
          >
            Buka bukti privat
          </Button>
          {selected.status === 'PENDING' && (
            <>
              <ConfirmationPanel title="Konsekuensi approval">
                Approval membuat customer package dan ledger PURCHASE. Rejection tidak menambah
                saldo.
              </ConfirmationPanel>
              <Button
                disabled={loading || !canDecide}
                onClick={() =>
                  void run(async () => {
                    const key = intentKey || crypto.randomUUID();
                    if (!intentKey) setIntentKey(key);
                    authoritative(await client.approve(selected.id, selected.version, key));
                  })
                }
              >
                Setujui purchase
              </Button>
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
              <Button
                variant="danger"
                disabled={loading || !canDecide}
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
              </Button>
            </>
          )}
        </DetailDrawer>
      )}
      {loading && <Skeleton label="Memproses purchase" />}
      {message && !loading && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
    </section>
  );
}
