'use client';

import { ArrowLeft, CheckCircle2, Eye, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  browserPurchaseReviewClient,
  purchaseFailure,
  type PurchaseReviewClient,
  type ReviewDetail,
} from '../../../purchase-client';
import { Badge, Button, Panel } from '../../../components/admin/admin-ui';
import { ButtonLink } from '../../../components/actions';
import { AlertBanner, useOptionalAppFeedback } from '../../../components/app-feedback';
import { useSessionContext } from '../../../session-context';
import { Skeleton } from '../../../ui';
import { paymentStatusTone } from '../../../purchases/purchase-review-view';
import { SelectInput, Textarea } from '../../../components/forms';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
const statusLabels: Record<string, string> = {
  AWAITING_PAYMENT: 'Menunggu pembayaran',
  PENDING: 'Menunggu pemeriksaan',
  ACTION_REQUIRED: 'Perlu perbaikan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  EXPIRED: 'Kedaluwarsa',
};
const reasonLabels = {
  PROOF_INVALID: 'Bukti tidak valid',
  AMOUNT_MISMATCH: 'Nominal tidak sesuai',
  OTHER_REVIEW_REQUIRED: 'Perlu tinjauan lain',
} as const;
type RejectReason = keyof typeof reasonLabels;

export function safePaymentReturnTo(value?: string) {
  if (!value || !value.startsWith('/workspace/payments') || value.startsWith('//'))
    return '/workspace/payments';
  try {
    const parsed = new URL(value, 'http://local.invalid');
    if (parsed.origin !== 'http://local.invalid' || parsed.pathname !== '/workspace/payments')
      return '/workspace/payments';
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return '/workspace/payments';
  }
}

export function PaymentReviewDetailView({
  id,
  returnTo,
  client = browserPurchaseReviewClient,
  authorityOverride,
}: {
  id: string;
  returnTo?: string;
  client?: PurchaseReviewClient;
  authorityOverride?: { canReview: boolean; canDecide: boolean };
}) {
  const sessionContext = useSessionContext();
  const feedback = useOptionalAppFeedback();
  const sessionReady = Boolean(authorityOverride) || sessionContext?.status === 'authenticated';
  const canReview =
    authorityOverride?.canReview ??
    Boolean(sessionContext?.hasCapability('payment:review', 'purchase:review'));
  const canDecide =
    authorityOverride?.canDecide ??
    Boolean(sessionContext?.hasCapability('payment:decide', 'purchase:decide'));
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mutating, setMutating] = useState(false);
  const [reasonCode, setReasonCode] = useState<RejectReason>('PROOF_INVALID');
  const [note, setNote] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  const backHref = safePaymentReturnTo(returnTo);

  const load = useCallback(async () => {
    if (!sessionReady || !canReview) return;
    setLoading(true);
    setError('');
    try {
      setDetail(await client.detail(id));
    } catch (cause) {
      setError(purchaseFailure(cause));
    } finally {
      setLoading(false);
    }
  }, [canReview, client, id, sessionReady]);

  useEffect(() => void load(), [load]);
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const loadPreview = async () => {
    const proof = detail?.purchase.paymentProof;
    if (!proof || proof.scanStatus !== 'CLEAN') return;
    setPreviewLoading(true);
    setError('');
    try {
      const blob = await client.loadProof(proof.id);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewType(blob.type || proof.mimeType);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setError(purchaseFailure(cause));
    } finally {
      setPreviewLoading(false);
    }
  };

  const loadMoreUsage = async () => {
    const cursor = detail?.usageHistory.page.nextCursor;
    if (!detail || !cursor) return;
    setUsageLoading(true);
    try {
      const next = await client.detail(id, cursor);
      setDetail({
        ...detail,
        usageHistory: {
          items: [...detail.usageHistory.items, ...next.usageHistory.items],
          page: next.usageHistory.page,
        },
      });
    } catch (cause) {
      setError(purchaseFailure(cause));
    } finally {
      setUsageLoading(false);
    }
  };

  const decide = async (action: 'APPROVE' | 'ACTION_REQUIRED' | 'DUPLICATE') => {
    const purchase = detail?.purchase;
    if (!purchase || !canDecide || purchase.status !== 'PENDING') return;
    if (
      action === 'ACTION_REQUIRED' &&
      reasonCode === 'OTHER_REVIEW_REQUIRED' &&
      note.trim().length < 3
    ) {
      setError('Catatan wajib diisi minimal 3 karakter untuk alasan tinjauan lain.');
      return;
    }
    const copy = {
      APPROVE: [
        'Setujui pembayaran',
        'Paket customer akan diaktifkan dan ledger pembelian dibuat.',
      ],
      ACTION_REQUIRED: [
        'Minta perbaikan bukti',
        'Customer harus mengunggah bukti pembayaran pengganti.',
      ],
      DUPLICATE: [
        'Tolak sebagai duplikat',
        'Transaksi ditolak tanpa mengaktifkan paket atau ledger.',
      ],
    } as const;
    const confirmed = feedback
      ? await feedback.confirm({
          tone: action === 'APPROVE' ? 'warning' : 'danger',
          title: copy[action][0],
          message: `${purchase.customer.displayName} · ${purchase.branch.name} · ${rupiah.format(purchase.payableAmountRpSnapshot ?? purchase.priceRpSnapshot)}. ${copy[action][1]} Scope ${purchase.branch.name}, versi ${purchase.version}.`,
          confirmLabel: copy[action][0],
        })
      : Boolean(authorityOverride);
    if (!confirmed) return;
    setMutating(true);
    setError('');
    try {
      if (action === 'APPROVE') {
        const result = await client.approve(
          purchase.id,
          purchase.version,
          crypto.randomUUID(),
          note.trim() || undefined,
        );
        feedback?.showToast({
          tone: 'success',
          title: 'Pembayaran disetujui',
          message: `${result.customerPackage.packageName ?? purchase.packageNameSnapshot} aktif dengan ${result.customerPackage.available} sesi. Ledger ${result.ledgerEntry.id}.`,
          correlationReference: result.purchase.auditReference ?? undefined,
        });
      } else {
        await client.reject(
          purchase.id,
          purchase.version,
          action === 'DUPLICATE' ? 'DUPLICATE_PURCHASE' : reasonCode,
          crypto.randomUUID(),
          note.trim() || undefined,
        );
        feedback?.showToast({
          tone: 'success',
          title: action === 'DUPLICATE' ? 'Transaksi ditolak' : 'Perbaikan bukti diminta',
          message: 'Keputusan dan audit telah disimpan.',
        });
      }
      await load();
    } catch (cause) {
      setError(purchaseFailure(cause));
    } finally {
      setMutating(false);
    }
  };

  if (sessionContext?.status === 'unauthenticated' && !authorityOverride)
    return (
      <AlertBanner
        tone="warning"
        title="Sesi telah berakhir"
        message="Masuk kembali untuk memeriksa pembayaran."
      />
    );
  if (!sessionReady) return <Skeleton label="Memuat sesi dan izin pembayaran" />;
  if (!canReview)
    return (
      <AlertBanner
        tone="danger"
        title="Akses tidak tersedia"
        message="Role Anda tidak memiliki capability untuk memeriksa pembayaran."
      />
    );
  if (loading && !detail) return <Skeleton label="Memuat detail pembayaran" />;
  if (!detail)
    return (
      <AlertBanner
        tone="danger"
        title="Detail pembayaran belum tersedia"
        message={error || 'Transaksi tidak ditemukan dalam scope Anda.'}
        action={{ label: 'Coba lagi', onSelect: () => void load() }}
      />
    );

  const purchase = detail.purchase;
  const timeline = [
    ['Bukti dikirim', detail.timeline.submittedAt],
    ['Pemeriksaan file selesai', detail.timeline.proofFinalizedAt],
    ['Keputusan dibuat', detail.timeline.decidedAt],
  ] as const;

  return (
    <section className="space-y-5" aria-labelledby="payment-detail-title">
      <ButtonLink
        href={backHref}
        variant="ghost"
        size="sm"
        leadingIcon={<ArrowLeft className="size-4" />}
      >
        Kembali ke antrean
      </ButtonLink>
      <Panel className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-forest">
              Pengguna / Pembayaran
            </p>
            <h1
              id="payment-detail-title"
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Detail pembayaran
            </h1>
            <p className="mt-2 break-all text-sm text-dd-muted">Transaksi {purchase.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={paymentStatusTone(purchase.status)}>
              {statusLabels[purchase.status] ?? purchase.status}
            </Badge>
            <Button variant="secondary" disabled={loading} onClick={() => void load()}>
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Segarkan
            </Button>
          </div>
        </div>
      </Panel>

      {error && (
        <AlertBanner
          tone="danger"
          title="Tindakan belum dapat diproses"
          message={error}
          action={{ label: 'Muat data terbaru', onSelect: () => void load() }}
        />
      )}
      {!canDecide && (
        <AlertBanner
          tone="info"
          title="Mode hanya baca"
          message="Anda dapat melihat transaksi dan bukti. Keputusan dilakukan oleh Finance atau Super Owner."
        />
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <Panel className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-dd-muted">Customer</p>
                <h2 className="mt-1 text-xl font-semibold">{purchase.customer.displayName}</h2>
                <p className="text-sm text-dd-muted">
                  {purchase.customer.phoneMasked ?? 'Kontak termasking tidak tersedia'}
                </p>
              </div>
              <Badge>{purchase.branch.name}</Badge>
            </div>
            <dl className="mt-5 grid gap-4 rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-dd-muted">Paket</dt>
                <dd className="mt-1 font-semibold">{purchase.packageNameSnapshot}</dd>
              </div>
              <div>
                <dt className="text-dd-muted">Harga paket</dt>
                <dd className="mt-1 font-semibold">{rupiah.format(purchase.priceRpSnapshot)}</dd>
              </div>
              {purchase.packagePromotionId && (
                <>
                  <div>
                    <dt className="text-dd-muted">Promo paket</dt>
                    <dd className="mt-1 font-semibold">{purchase.packagePromotionNameSnapshot}</dd>
                  </div>
                  <div>
                    <dt className="text-dd-muted">Diskon promo</dt>
                    <dd className="mt-1 font-semibold text-dd-success">
                      − {rupiah.format(purchase.packagePromotionDiscountRpSnapshot ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-dd-muted">Harga promo</dt>
                    <dd className="mt-1 font-semibold">
                      {rupiah.format(
                        purchase.promotionalPriceRpSnapshot ?? purchase.priceRpSnapshot,
                      )}
                    </dd>
                  </div>
                </>
              )}
              {purchase.voucherCodeSnapshot && (
                <>
                  <div>
                    <dt className="text-dd-muted">Voucher</dt>
                    <dd className="mt-1 font-semibold">{purchase.voucherCodeSnapshot}</dd>
                  </div>
                  <div>
                    <dt className="text-dd-muted">Diskon voucher</dt>
                    <dd className="mt-1 font-semibold text-dd-success">
                      − {rupiah.format(purchase.voucherDiscountRpSnapshot ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-dd-muted">Harga setelah diskon</dt>
                    <dd className="mt-1 font-semibold">
                      {rupiah.format(
                        purchase.priceAfterDiscountRpSnapshot ?? purchase.priceRpSnapshot,
                      )}
                    </dd>
                  </div>
                </>
              )}
              <div>
                <dt className="text-dd-muted">Identifikasi transfer</dt>
                <dd className="mt-1 font-semibold">
                  {purchase.paymentUniqueCode
                    ? String(purchase.paymentUniqueCode).padStart(3, '0')
                    : 'Nominal standar'}
                </dd>
              </div>
              <div>
                <dt className="text-dd-muted">Nominal transfer</dt>
                <dd className="mt-1 font-semibold text-dd-forest">
                  {rupiah.format(purchase.payableAmountRpSnapshot ?? purchase.priceRpSnapshot)}
                </dd>
              </div>
              <div>
                <dt className="text-dd-muted">Sesi / masa berlaku</dt>
                <dd className="mt-1 font-semibold">
                  {purchase.sessionCountSnapshot} sesi · {purchase.durationDaysSnapshot} hari
                </dd>
              </div>
              <div>
                <dt className="text-dd-muted">Versi data</dt>
                <dd className="mt-1 font-semibold">{purchase.version}</dd>
              </div>
            </dl>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Timeline pembayaran</h2>
            <p className="mt-1 text-sm text-dd-muted">
              Waktu berikut berasal dari proses sistem, bukan waktu transfer pada bank customer.
            </p>
            <ol className="mt-5 space-y-4">
              {timeline.map(([label, value], index) => (
                <li key={label} className="flex gap-3">
                  <span
                    className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${value ? 'bg-dd-success-soft text-dd-success' : 'bg-stone-100 text-dd-muted'}`}
                  >
                    {value ? <CheckCircle2 className="size-4" /> : index + 1}
                  </span>
                  <div>
                    <strong className="block text-sm">{label}</strong>
                    <span className="text-sm text-dd-muted">
                      {value ? value.toLocaleString('id-ID') : 'Belum terjadi'}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Bukti pembayaran privat</h2>
                <p className="mt-1 text-sm text-dd-muted">
                  Status pemeriksaan file: {purchase.paymentProof?.scanStatus ?? 'Belum tersedia'}
                </p>
              </div>
              <Button
                variant="secondary"
                disabled={
                  previewLoading ||
                  !purchase.paymentProof ||
                  purchase.paymentProof.scanStatus !== 'CLEAN'
                }
                onClick={() => void loadPreview()}
              >
                <Eye className="size-4" />{' '}
                {previewLoading
                  ? 'Memuat…'
                  : previewUrl
                    ? 'Terbitkan ulang preview'
                    : 'Preview bukti'}
              </Button>
            </div>
            {previewUrl && previewType.startsWith('image/') ? (
              <img
                src={previewUrl}
                alt={`Bukti pembayaran ${purchase.customer.displayName}`}
                className="mt-5 max-h-[34rem] w-full rounded-dd-lg border border-dd-line bg-white object-contain"
              />
            ) : previewUrl && previewType === 'application/pdf' ? (
              <object
                data={previewUrl}
                type={previewType}
                title={`Bukti pembayaran ${purchase.customer.displayName}`}
                className="mt-5 h-[34rem] w-full rounded-dd-lg border border-dd-line bg-white"
              >
                <p>Preview PDF tidak didukung browser ini.</p>
              </object>
            ) : previewUrl ? (
              <AlertBanner
                tone="warning"
                title="Format tidak didukung"
                message="Bukti hanya dapat dipreview sebagai JPEG, PNG, WebP, atau PDF."
              />
            ) : (
              <div className="mt-5 grid min-h-48 place-items-center rounded-dd-lg border border-dashed border-dd-line bg-dd-surface-muted p-6 text-center text-sm text-dd-muted">
                {purchase.paymentProof?.scanStatus === 'CLEAN'
                  ? 'Pilih Preview bukti untuk menerbitkan akses privat berumur pendek.'
                  : 'Preview tersedia setelah pemeriksaan file selesai dan berstatus bersih.'}
              </div>
            )}
          </Panel>

          {detail.activation && (
            <Panel className="border-emerald-200 bg-dd-success-soft/35 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-dd-success" />
                <div>
                  <h2 className="text-lg font-semibold">Paket customer telah aktif</h2>
                  <p className="text-sm text-dd-muted">
                    Hasil ini dimuat dari paket dan ledger authoritative.
                  </p>
                </div>
              </div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-dd-muted">Paket aktif</dt>
                  <dd className="mt-1 font-semibold">{detail.activation.packageName}</dd>
                  <dd className="break-all text-xs text-dd-muted">
                    {detail.activation.customerPackageId}
                  </dd>
                </div>
                <div>
                  <dt className="text-dd-muted">Saldo awal</dt>
                  <dd className="mt-1 font-semibold">{detail.activation.sessionCount} sesi</dd>
                </div>
                <div>
                  <dt className="text-dd-muted">Aktif / kedaluwarsa</dt>
                  <dd className="mt-1 font-semibold">
                    {detail.activation.activationDate.toLocaleDateString('id-ID')} –{' '}
                    {detail.activation.expiryAt.toLocaleDateString('id-ID')}
                  </dd>
                </div>
                <div>
                  <dt className="text-dd-muted">Referensi ledger</dt>
                  <dd className="mt-1 break-all font-semibold">
                    {detail.activation.ledgerEntryId ?? 'Tidak tersedia'}
                  </dd>
                </div>
                <div>
                  <dt className="text-dd-muted">Referensi audit</dt>
                  <dd className="mt-1 break-all font-semibold">
                    {purchase.auditReference ?? 'Tidak tersedia'}
                  </dd>
                </div>
              </dl>
            </Panel>
          )}

          <Panel className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Penggunaan sesi</h2>
                <p className="mt-1 text-sm text-dd-muted">
                  Saldo dan perubahan sesi berasal dari ledger authoritative.
                </p>
              </div>
              {detail.balance ? (
                <Badge
                  tone={
                    detail.balance.status === 'ACTIVE'
                      ? 'success'
                      : detail.balance.status === 'EXPIRED'
                        ? 'danger'
                        : 'neutral'
                  }
                >
                  {detail.balance.status === 'ACTIVE'
                    ? 'Paket aktif'
                    : detail.balance.status === 'EXPIRED'
                      ? 'Paket kedaluwarsa'
                      : 'Paket tidak aktif'}
                </Badge>
              ) : (
                <Badge>Belum diaktifkan</Badge>
              )}
            </div>
            {detail.balance ? (
              <>
                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-dd-muted">Saldo awal</dt>
                    <dd className="mt-1 font-semibold">{detail.balance.sessionCount}</dd>
                  </div>
                  <div>
                    <dt className="text-dd-muted">Tersedia</dt>
                    <dd className="mt-1 font-semibold">{detail.balance.available}</dd>
                  </div>
                  <div>
                    <dt className="text-dd-muted">Direservasi</dt>
                    <dd className="mt-1 font-semibold">{detail.balance.reserved}</dd>
                  </div>
                  <div>
                    <dt className="text-dd-muted">Terpakai</dt>
                    <dd className="mt-1 font-semibold">{detail.balance.used}</dd>
                  </div>
                </dl>
                {detail.balance.status === 'EXPIRED' && (
                  <p className="mt-3 text-sm font-semibold text-dd-danger">
                    Paket kedaluwarsa · 0 sesi dapat digunakan.
                  </p>
                )}
                {detail.balance.status === 'ACTIVE' && detail.balance.available === 0 && (
                  <p className="mt-3 text-sm font-semibold text-dd-forest">Sesi telah habis.</p>
                )}
                <div className="mt-5 overflow-hidden rounded-dd-md border border-dd-line">
                  <div className="hidden grid-cols-[minmax(0,1fr)_7rem_7rem_10rem] gap-3 border-b border-dd-line bg-dd-surface-muted px-4 py-3 text-xs font-bold uppercase tracking-wide text-dd-muted sm:grid">
                    <span>Aktivitas</span>
                    <span>Perubahan</span>
                    <span>Saldo</span>
                    <span>Waktu</span>
                  </div>
                  {detail.usageHistory.items.length ? (
                    detail.usageHistory.items.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid gap-1 border-b border-dd-line px-4 py-3 text-sm last:border-0 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_10rem] sm:gap-3"
                      >
                        <div>
                          <strong>{entry.label}</strong>
                          <p className="text-xs text-dd-muted">
                            Saldo berubah melalui proses sistem yang diaudit.
                          </p>
                        </div>
                        <span
                          className={`font-semibold ${entry.quantity < 0 ? 'text-dd-danger' : 'text-dd-success'}`}
                        >
                          {entry.quantity > 0 ? '+' : ''}
                          {entry.quantity} sesi
                        </span>
                        <span className="font-semibold">{entry.balanceAfter} sesi</span>
                        <time className="text-dd-muted">
                          {entry.occurredAt.toLocaleString('id-ID')}
                        </time>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-dd-muted">Belum ada histori penggunaan sesi.</p>
                  )}
                </div>
                {detail.usageHistory.page.hasMore && (
                  <Button
                    className="mt-4"
                    variant="secondary"
                    disabled={usageLoading}
                    onClick={() => void loadMoreUsage()}
                  >
                    {usageLoading ? 'Memuat…' : 'Muat histori berikutnya'}
                  </Button>
                )}
              </>
            ) : (
              <p className="mt-4 text-sm text-dd-muted">
                Histori tersedia setelah pembayaran disetujui dan paket diaktifkan.
              </p>
            )}
          </Panel>

          {purchase.status !== 'PENDING' && (
            <Panel className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Keputusan pembayaran</h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-dd-muted">Keputusan</dt>
                  <dd className="mt-1 font-semibold">
                    {statusLabels[purchase.status] ?? purchase.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-dd-muted">Aktor</dt>
                  <dd className="mt-1 font-semibold">
                    {detail.decisionActorMasked ?? 'Termasking'}
                  </dd>
                </div>
                <div>
                  <dt className="text-dd-muted">Alasan</dt>
                  <dd className="mt-1 font-semibold">
                    {purchase.decisionReasonCode ?? 'Tidak tersedia'}
                  </dd>
                </div>
                <div>
                  <dt className="text-dd-muted">Referensi audit</dt>
                  <dd className="mt-1 break-all font-semibold">
                    {purchase.auditReference ?? 'Tidak tersedia'}
                  </dd>
                </div>
              </dl>
            </Panel>
          )}
        </div>

        <aside className="h-fit space-y-4 xl:sticky xl:top-24">
          <Panel className="p-5">
            <h2 className="text-lg font-semibold">Keputusan Finance</h2>
            <p className="mt-1 text-sm leading-6 text-dd-muted">
              Setiap tindakan mencatat scope cabang, versi data, idempotency key, dan audit.
            </p>
            {canDecide && purchase.status === 'PENDING' ? (
              <div className="mt-5 space-y-4">
                <Button
                  className="w-full"
                  disabled={mutating}
                  onClick={() => void decide('APPROVE')}
                >
                  <CheckCircle2 className="size-4" /> Setujui pembayaran
                </Button>
                <SelectInput
                  label="Alasan perbaikan"
                  value={reasonCode}
                  onChange={(event) => setReasonCode(event.target.value as RejectReason)}
                  className="mt-1 min-h-10 w-full rounded-dd-md border border-dd-line bg-white px-3"
                >
                  {Object.entries(reasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </SelectInput>
                <Textarea
                  label={`Catatan ${reasonCode === 'OTHER_REVIEW_REQUIRED' ? '(wajib)' : '(opsional)'}`}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={500}
                  placeholder="Jelaskan alasan keputusan"
                />
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={mutating}
                  onClick={() => void decide('ACTION_REQUIRED')}
                >
                  Minta perbaikan bukti
                </Button>
                <Button
                  className="w-full"
                  variant="danger"
                  disabled={mutating}
                  onClick={() => void decide('DUPLICATE')}
                >
                  Tolak sebagai duplikat
                </Button>
              </div>
            ) : (
              <AlertBanner
                tone={purchase.status === 'APPROVED' ? 'success' : 'info'}
                title={purchase.status === 'PENDING' ? 'Mode hanya baca' : 'Keputusan telah dibuat'}
                message={
                  purchase.status === 'PENDING'
                    ? 'Keputusan dilakukan Finance atau Super Owner.'
                    : 'Mutation control ditutup untuk transaksi yang sudah diputus.'
                }
              />
            )}
          </Panel>
        </aside>
      </div>
    </section>
  );
}
