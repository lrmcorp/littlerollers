'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  Eye,
  FileCheck2,
  FileClock,
  FileQuestion,
  MessageCircle,
  QrCode,
  Smartphone,
  UploadCloud,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  browserOrderClient,
  orderErrorDetails,
  sha256Upload,
  type CustomerOrder,
  type PaymentProofUploadSession,
} from '@/api-clients/order-client';
import { formatPaymentCode, orderReasonLabels, orderStatusLabels } from '@/lib/order-presenters';
import { Button, ButtonLink, IconButton } from '../actions';
import { AlertBanner, useAppFeedback } from '../app-feedback';
import { formatRupiah } from '../../lib/formatters';

const steps = ['Ringkasan', 'Pembayaran', 'Unggah bukti', 'Status'];

function currentStep(
  order: CustomerOrder,
  file: File | null,
  uploadSession?: PaymentProofUploadSession,
) {
  if (['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'].includes(order.status)) return 4;
  if (order.status === 'ACTION_REQUIRED' || file || uploadSession) return 3;
  return 2;
}

const uploadStageLabels = {
  IDLE: '',
  ISSUING: 'Menyiapkan upload aman…',
  UPLOADING: 'Mengunggah bukti…',
  SCANNING: 'Memeriksa keamanan file…',
  ATTACHING: 'Menghubungkan bukti ke pesanan…',
  COMPLETED: 'Bukti pembayaran diterima.',
} as const;

export function CustomerPaymentFlow({
  order,
  onUpdated,
}: {
  order: CustomerOrder;
  onUpdated(order: CustomerOrder): void;
}) {
  const feedback = useAppFeedback();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploadSession, setUploadSession] = useState<PaymentProofUploadSession>();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<ReturnType<typeof orderErrorDetails>>();
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');
  const [proofPreviewType, setProofPreviewType] = useState('');
  const [proofPreviewLoading, setProofPreviewLoading] = useState(false);
  const [proofPreviewError, setProofPreviewError] = useState('');
  const proofPreviewRef = useRef<HTMLDivElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'BANK_TRANSFER'>('QRIS');
  const [now, setNow] = useState(() => Date.now());
  const step = currentStep(order, file, uploadSession);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!file || file.type === 'application/pdf') {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(
    () => () => {
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    },
    [proofPreviewUrl],
  );
  useEffect(() => {
    if (proofPreviewUrl) proofPreviewRef.current?.focus();
  }, [proofPreviewUrl]);

  const remaining = useMemo(
    () => (order.expiresAt ? Math.max(0, order.expiresAt.getTime() - now) : 0),
    [now, order.expiresAt],
  );
  const paymentAccountAvailable = Boolean(
    order.paymentAccount?.bankName &&
    order.paymentAccount.accountNumber &&
    order.paymentAccount.accountHolderName,
  );
  const canUpload =
    ['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) &&
    remaining > 0 &&
    (paymentAccountAvailable || paymentMethod === 'QRIS');
  const paymentCode = formatPaymentCode(order.paymentUniqueCode);
  const waMessage = `Halo Daily Dose Pilates, saya ingin konfirmasi pembayaran pesanan:\n- Paket: ${order.packageName}\n- No. Pesanan: ${order.id}\n- Nominal: ${formatRupiah(order.payableAmountRp)}\n- Metode: ${paymentMethod === 'QRIS' ? 'QRIS Instan' : 'Transfer Bank'}\nMohon dibantu verifikasi ya. Terima kasih!`;
  const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`;
  const proofReady =
    order.paymentProofStatus?.uploadStatus === 'FINALIZED' &&
    order.paymentProofStatus.scanStatus === 'CLEAN';
  const proofVisual = proofStatusVisual(order.paymentProofStatus);
  const ProofIcon = proofVisual.icon;
  const duration = {
    hours: Math.floor(remaining / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1000),
  };
  const durationLabel =
    duration.hours > 0
      ? `${duration.hours} jam ${duration.minutes} menit`
      : duration.minutes > 0
        ? `${duration.minutes} menit`
        : `${duration.seconds} detik`;

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    feedback.showToast({ tone: 'success', title: `${label} disalin` });
  };

  const closeProofPreview = () => {
    setProofPreviewUrl('');
    setProofPreviewType('');
    setProofPreviewError('');
  };

  const loadProofPreview = async () => {
    if (!proofReady) return;
    setProofPreviewLoading(true);
    setProofPreviewError('');
    setProofPreviewUrl('');
    setProofPreviewType('');
    try {
      const blob = await browserOrderClient.loadProof(order.id);
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(blob.type)) {
        setProofPreviewUrl('');
        setProofPreviewType(blob.type);
        setProofPreviewError('Format bukti pembayaran tidak didukung untuk preview.');
        return;
      }
      setProofPreviewType(blob.type);
      setProofPreviewUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setProofPreviewError(orderErrorDetails(cause).message);
    } finally {
      setProofPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ol
        aria-label="Tahapan checkout"
        className="grid grid-cols-2 gap-2 rounded-dd-xl border border-dd-line bg-white p-3 sm:grid-cols-4"
      >
        {steps.map((label, index) => {
          const number = index + 1;
          const complete = number < step;
          const active = number === step;
          return (
            <li
              key={label}
              aria-current={active ? 'step' : undefined}
              className={`flex items-center gap-2 rounded-dd-lg px-3 py-2 text-xs font-semibold sm:text-sm ${
                active
                  ? 'bg-dd-forest text-white'
                  : complete
                    ? 'bg-dd-success-soft text-dd-success'
                    : 'text-dd-muted'
              }`}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-current text-[11px]">
                {complete ? <Check className="size-3.5" /> : number}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      {order.status === 'ACTION_REQUIRED' && (
        <AlertBanner
          tone="warning"
          title="Bukti pembayaran perlu diperbaiki"
          message={
            orderReasonLabels[order.decisionReasonCode ?? ''] ??
            'Unggah bukti pengganti pada pesanan yang sama.'
          }
        />
      )}
      {order.status === 'PENDING' && (
        <AlertBanner
          tone="info"
          title="Pembayaran sedang diperiksa"
          message="Bukti sudah diterima. Pemeriksaan bukti pembayaran biasanya memakan waktu 15–30 menit pada jam kerja studio (07.00 – 21.00 WIB). Anda akan menerima notifikasi begitu paket aktif."
        />
      )}
      {order.status === 'APPROVED' && (
        <AlertBanner
          tone="success"
          title="Pembayaran disetujui"
          message="Paket sudah aktif dan dapat digunakan untuk booking kelas."
        />
      )}
      {order.status === 'EXPIRED' && (
        <AlertBanner
          tone="danger"
          title="Pesanan kedaluwarsa"
          message="Batas transfer sudah berakhir. Buat pesanan baru untuk memperoleh nominal pembayaran baru."
        />
      )}
      {failure && (
        <AlertBanner
          tone="danger"
          title={
            failure.stage === 'ISSUING'
              ? 'Upload belum dapat disiapkan'
              : failure.stage === 'UPLOADING'
                ? 'File belum selesai diunggah'
                : failure.stage === 'SCANNING'
                  ? 'Pemeriksaan file belum selesai'
                  : failure.stage === 'ATTACHING'
                    ? 'Bukti belum terhubung ke pesanan'
                    : 'Upload belum berhasil'
          }
          message={`${failure.message}${
            failure.correlationReference
              ? ` Referensi bantuan: ${failure.correlationReference}.`
              : ''
          }`}
        />
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-forest">
            Ringkasan pesanan
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-dd-ink sm:text-2xl">{order.packageName}</h2>
              <p className="mt-1 text-sm text-dd-muted">
                {order.branchName} · {order.sessionCount} sesi · {order.durationDays} hari
              </p>
            </div>
            <span className="rounded-full bg-dd-surface-muted px-3 py-1 text-xs font-semibold text-dd-ink">
              {orderStatusLabels[order.status]}
            </span>
          </div>
          <dl className="mt-6 divide-y divide-dd-line rounded-dd-lg border border-dd-line">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-dd-muted">Harga paket</dt>
              <dd className="font-semibold">{formatRupiah(order.baseAmountRp)}</dd>
            </div>
            {order.promotion && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-dd-muted">Promo paket · {order.promotion.name}</dt>
                <dd className="font-semibold text-dd-forest">
                  -{formatRupiah(order.promotion.discountRp)}
                </dd>
              </div>
            )}
            {order.promotion && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-dd-muted">Harga promo</dt>
                <dd className="font-semibold">
                  {formatRupiah(order.promotionalPriceRp ?? order.baseAmountRp)}
                </dd>
              </div>
            )}
            {order.voucher && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-dd-muted">Diskon voucher · {order.voucher.code}</dt>
                <dd className="font-semibold text-dd-forest">
                  -{formatRupiah(order.voucher.discountRp)}
                </dd>
              </div>
            )}
            {order.priceAfterDiscountRp !== order.baseAmountRp && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-dd-muted">Harga setelah diskon</dt>
                <dd className="font-semibold">
                  {formatRupiah(order.priceAfterDiscountRp ?? order.baseAmountRp)}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 bg-dd-surface-muted px-4 py-4">
              <dt>
                <span className="block font-semibold text-dd-ink">
                  Nominal yang perlu ditransfer
                </span>
                <span className="mt-1 block text-xs text-dd-muted">
                  {paymentCode ? `Identifikasi transfer · ${paymentCode}` : 'Nominal standar'}
                </span>
              </dt>
              <dd className="text-xl font-bold text-dd-forest">
                {formatRupiah(order.payableAmountRp)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-dd-muted">
            Tiga digit terakhir pada nominal membantu tim Finance mencocokkan transfer manual dengan
            pesanan Anda.
          </p>
        </section>

        {['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) ? (
          paymentMethod === 'QRIS' ? (
            <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6">
              {/* Tab Selector (UAT #26) */}
              <div
                className="mb-5 flex rounded-dd-lg border border-dd-line bg-dd-surface-muted p-1"
                role="tablist"
                aria-label="Pilihan Metode Pembayaran"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected="true"
                  onClick={() => setPaymentMethod('QRIS')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-dd-md bg-dd-forest px-3 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  <QrCode className="size-4" />
                  <span>QRIS Instan</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected="false"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-dd-md px-3 py-2 text-xs font-bold text-dd-ink transition-all hover:text-dd-forest cursor-pointer"
                >
                  <Smartphone className="size-4" />
                  <span>Transfer Bank</span>
                </button>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                  <span>QRIS</span>
                  <span className="text-rose-300">·</span>
                  <span className="font-semibold text-rose-800">Standar Pembayaran Nasional</span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-dd-ink">Scan QRIS Instan</h2>
                <p className="text-xs text-dd-muted">
                  NMID: ID1020038829101 · Daily Dose Pilates {order.branchName}
                </p>
              </div>

              <div className="mt-4 flex flex-col items-center justify-center rounded-dd-xl border-2 border-dashed border-dd-line bg-dd-paper p-4 sm:p-5">
                <div className="flex flex-col items-center rounded-dd-lg border border-dd-line bg-white p-4 shadow-sm">
                  <QrisSvgPattern />
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-dd-forest">
                    <CheckCircle2 className="size-3.5 text-dd-forest" />
                    <span>Nominal Otomatis Terdeteksi</span>
                  </div>
                </div>

                <div className="mt-4 flex w-full items-center justify-between rounded-dd-lg border border-dd-line bg-white p-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-dd-muted">
                      Nominal Pembayaran
                    </span>
                    <strong className="block text-lg font-bold text-dd-forest">
                      {formatRupiah(order.payableAmountRp)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(String(order.payableAmountRp), 'Nominal')}
                    className="flex items-center gap-1 rounded-dd-md border border-dd-line px-3 py-1.5 text-xs font-semibold text-dd-ink hover:bg-dd-paper cursor-pointer"
                  >
                    <Clipboard className="size-3.5" />
                    <span>Salin</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-dd-muted">
                  <Clock3 className="size-4 shrink-0 text-dd-warning" />
                  <span>
                    {remaining > 0 ? `${durationLabel} tersisa` : 'Batas pembayaran berakhir'}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-dd-lg bg-dd-surface-muted p-3 text-center">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-dd-muted">
                  Didukung oleh semua aplikasi
                </span>
                <p className="mt-1 text-xs font-semibold text-dd-ink">
                  GoPay · OVO · ShopeePay · DANA · BCA · Mandiri · BRImo · BNI · Semua Bank
                </p>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-dd-muted">
                <p className="font-bold text-dd-ink">Langkah Pembayaran:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Buka aplikasi m-Banking atau E-Wallet Anda.</li>
                  <li>Pilih menu <strong>Scan QR / Bayar QRIS</strong>.</li>
                  <li>Scan kode QR di atas (atau screenshot jika pakai 1 HP).</li>
                  <li>Pastikan penerima <strong>DAILY DOSE PILATES</strong> dan nominal sesuai.</li>
                  <li>Selesaikan pembayaran &amp; simpan bukti pembayaran.</li>
                </ol>
              </div>

              <div className="mt-5 border-t border-dd-line pt-4">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-dd-lg bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#20ba5a] sm:text-sm"
                >
                  <MessageCircle className="size-4" />
                  <span>Konfirmasi via WhatsApp CS</span>
                </a>
              </div>
            </section>
          ) : paymentAccountAvailable ? (
            <section className="rounded-dd-xl border border-dd-forest/25 bg-dd-forest p-5 text-white shadow-dd-card sm:p-6">
              {/* Tab Selector (UAT #26) */}
              <div
                className="mb-5 flex rounded-dd-lg border border-white/20 bg-white/10 p-1"
                role="tablist"
                aria-label="Pilihan Metode Pembayaran"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected="false"
                  onClick={() => setPaymentMethod('QRIS')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-dd-md px-3 py-2 text-xs font-bold text-white/80 transition-all hover:text-white cursor-pointer"
                >
                  <QrCode className="size-4" />
                  <span>QRIS Instan</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected="true"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-dd-md bg-white px-3 py-2 text-xs font-bold text-dd-forest shadow-xs cursor-pointer"
                >
                  <Smartphone className="size-4" />
                  <span>Transfer Bank</span>
                </button>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">
                Tujuan transfer
              </p>
              <h2 className="mt-2 text-xl font-semibold">{order.paymentAccount!.bankName}</h2>
              <p className="mt-1 text-sm text-white/70">
                a.n. {order.paymentAccount!.accountHolderName}
              </p>
              <div className="mt-5 space-y-3">
                <CopyRow
                  label="Nomor rekening"
                  value={order.paymentAccount!.accountNumber}
                  onCopy={() => copy(order.paymentAccount!.accountNumber, 'Nomor rekening')}
                />
                <CopyRow
                  label="Nominal transfer"
                  value={formatRupiah(order.payableAmountRp)}
                  onCopy={() => copy(String(order.payableAmountRp), 'Nominal transfer')}
                />
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-dd-lg bg-white/10 px-3 py-3 text-sm">
                <Clock3 className="size-4 shrink-0" />
                <span>
                  {remaining > 0 ? `${durationLabel} tersisa` : 'Batas pembayaran berakhir'}
                </span>
              </div>

              <div className="mt-5 border-t border-white/20 pt-4">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-dd-lg bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#20ba5a] sm:text-sm"
                >
                  <MessageCircle className="size-4" />
                  <span>Konfirmasi via WhatsApp CS</span>
                </a>
              </div>
            </section>
          ) : (
            <section className="rounded-dd-xl border border-dd-line bg-dd-surface-muted p-5 shadow-dd-card sm:p-6">
              <div
                className="mb-5 flex rounded-dd-lg border border-dd-line bg-white p-1"
                role="tablist"
                aria-label="Pilihan Metode Pembayaran"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected="false"
                  onClick={() => setPaymentMethod('QRIS')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-dd-md bg-dd-forest px-3 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  <QrCode className="size-4" />
                  <span>QRIS Instan</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected="true"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-dd-md px-3 py-2 text-xs font-bold text-dd-ink cursor-pointer"
                >
                  <Smartphone className="size-4" />
                  <span>Transfer Bank</span>
                </button>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
                Informasi rekening
              </p>
              <h2 className="mt-2 text-xl font-semibold">Rekening transfer manual tidak tersedia</h2>
              <p className="mt-2 text-sm leading-6 text-dd-muted">
                Pesanan ini tidak memiliki snapshot rekening bank. Silakan gunakan metode{' '}
                <strong>QRIS Instan</strong> di tab sebelah untuk melakukan pembayaran langsung.
              </p>
            </section>
          )
        ) : paymentAccountAvailable ? (
          <section className="rounded-dd-xl border border-dd-forest/25 bg-dd-forest p-5 text-white shadow-dd-card sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">
              Tujuan transfer
            </p>
            <h2 className="mt-2 text-xl font-semibold">{order.paymentAccount!.bankName}</h2>
            <p className="mt-1 text-sm text-white/70">
              a.n. {order.paymentAccount!.accountHolderName}
            </p>
            <div className="mt-5 space-y-3">
              <CopyRow
                label="Nomor rekening"
                value={order.paymentAccount!.accountNumber}
                onCopy={() => copy(order.paymentAccount!.accountNumber, 'Nomor rekening')}
              />
              <CopyRow
                label="Nominal transfer"
                value={formatRupiah(order.payableAmountRp)}
                onCopy={() => copy(String(order.payableAmountRp), 'Nominal transfer')}
              />
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-dd-lg bg-white/10 px-3 py-3 text-sm">
              <Clock3 className="size-4 shrink-0" />
              <span>
                {remaining > 0 ? `${durationLabel} tersisa` : 'Batas pembayaran berakhir'}
              </span>
            </div>
          </section>
        ) : (
          <section
            className={`rounded-dd-xl border border-dd-line bg-dd-surface-muted ${
              ['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status)
                ? 'p-5 shadow-dd-card sm:p-6'
                : 'p-4'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
              Informasi rekening
            </p>
            <h2
              className={`mt-2 font-semibold ${
                ['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status)
                  ? 'text-xl'
                  : 'text-base'
              }`}
            >
              Rekening tidak tersedia
            </h2>
            <p className="mt-2 text-sm leading-6 text-dd-muted">
              {['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status)
                ? 'Pesanan ini tidak memiliki snapshot rekening yang aman untuk digunakan. Jangan melakukan transfer untuk pesanan ini.'
                : 'Informasi rekening tidak tersimpan pada pesanan lama ini. Status dan histori transaksi tetap dapat dilihat.'}
            </p>
            {['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) && (
              <ButtonLink href="/packages" className="mt-4">
                Buat pesanan baru
              </ButtonLink>
            )}
          </section>
        )}
      </div>

      {order.paymentProofId && (
        <section
          className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6"
          aria-labelledby="payment-proof-title"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-dd-lg ${proofVisual.classes}`}
              >
                <ProofIcon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="payment-proof-title" className="text-lg font-semibold">
                  Bukti pembayaran yang dikirim
                </h2>
                <p className="mt-1 text-sm text-dd-muted">
                  {proofStatusLabel(order.paymentProofStatus)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {proofPreviewUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  leadingIcon={<X className="size-4" aria-hidden="true" />}
                  onClick={closeProofPreview}
                >
                  Tutup preview
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                disabled={!proofReady || proofPreviewLoading}
                loading={proofPreviewLoading}
                loadingLabel="Memuat bukti…"
                onClick={() => void loadProofPreview()}
                leadingIcon={<Eye className="size-4" aria-hidden="true" />}
              >
                {proofPreviewUrl ? 'Terbitkan ulang preview' : 'Lihat bukti pembayaran'}
              </Button>
            </div>
          </div>

          {order.status === 'PENDING' && (
            <div className="mt-4 flex items-start gap-2.5 rounded-dd-lg border border-dd-info/30 bg-dd-info-soft/70 p-3.5 text-xs text-dd-info sm:text-sm">
              <Clock3 className="size-4 shrink-0 text-dd-info mt-0.5" />
              <div>
                <p className="font-semibold text-dd-ink">Estimasi verifikasi: 15–30 menit</p>
                <p className="mt-0.5 text-dd-muted">
                  Tim Finance memverifikasi transaksi setiap hari pukul 07.00 – 21.00 WIB. Begitu diverifikasi, saldo paket Anda otomatis bertambah dan siap dipakai untuk memesan kelas.
                </p>
              </div>
            </div>
          )}

          {proofPreviewError && (
            <div className="mt-5">
              <AlertBanner
                tone="danger"
                title="Bukti belum dapat ditampilkan"
                message={proofPreviewError}
              />
            </div>
          )}
          {proofPreviewUrl ? (
            <div
              ref={proofPreviewRef}
              tabIndex={-1}
              className="mt-5 outline-none focus-visible:ring-2 focus-visible:ring-dd-forest"
              role="region"
              aria-label="Preview bukti pembayaran"
            >
              {proofPreviewType.startsWith('image/') ? (
                <img
                  src={proofPreviewUrl}
                  alt="Bukti pembayaran yang dikirim"
                  className="max-h-[34rem] w-full rounded-dd-lg border border-dd-line bg-white object-contain"
                />
              ) : (
                <object
                  data={proofPreviewUrl}
                  type={proofPreviewType}
                  title="Bukti pembayaran yang dikirim"
                  className="h-[34rem] w-full rounded-dd-lg border border-dd-line bg-white"
                >
                  <p>Preview PDF tidak didukung browser ini.</p>
                </object>
              )}
            </div>
          ) : (
            !proofPreviewError && (
              <div
                className="mt-5 rounded-dd-lg border border-dashed border-dd-forest/25 bg-dd-surface-muted px-5 py-4 text-sm leading-6 text-dd-muted"
                role="status"
                aria-live="polite"
              >
                {proofReady
                  ? 'Pilih “Lihat bukti pembayaran” untuk membuka file privat Anda.'
                  : proofUnavailableLabel(order.paymentProofStatus)}
              </div>
            )
          )}
        </section>
      )}

      {canUpload && (
        <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-dd-lg bg-dd-brass-soft text-dd-warning">
              <UploadCloud className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">
                {order.status === 'ACTION_REQUIRED'
                  ? 'Unggah bukti pengganti'
                  : 'Unggah bukti pembayaran'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-dd-muted">
                JPEG, PNG, atau PDF maksimum 10 MB. Pastikan nominal dan tujuan transfer terlihat
                jelas.
              </p>
            </div>
          </div>
          <label className="mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-dd-xl border border-dashed border-dd-line bg-dd-surface-muted p-5 text-center focus-within:ring-2 focus-within:ring-dd-forest">
            <UploadCloud className="size-7 text-dd-forest" />
            <strong className="mt-2 text-sm">Pilih atau jatuhkan bukti pembayaran</strong>
            <span className="mt-1 text-xs text-dd-muted">JPEG, PNG, PDF · maks. 10 MB</span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                if (selected && selected.size > 10_000_000) {
                  setFailure({
                    code: 'PAYMENT_PROOF_TOO_LARGE',
                    message: 'Ukuran file melebihi 10 MB.',
                    correlationReference: undefined,
                    retryable: false,
                    stage: undefined,
                  });
                  setFile(null);
                  setUploadSession(undefined);
                  return;
                }
                setFailure(undefined);
                setUploadSession(undefined);
                setFile(selected);
              }}
            />
          </label>
          {preview && (
            <Image
              src={preview}
              alt="Preview bukti pembayaran"
              width={720}
              height={420}
              unoptimized
              className="mt-4 max-h-72 w-full rounded-dd-lg border border-dd-line object-contain"
            />
          )}
          {file && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-dd-lg border border-dd-line px-4 py-3">
              <div className="min-w-0">
                <strong className="block truncate text-sm">{file.name}</strong>
                <span className="text-xs text-dd-muted">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setFile(null);
                  setUploadSession(undefined);
                  setFailure(undefined);
                }}
              >
                Ganti file
              </Button>
            </div>
          )}
          <p className="mt-4 min-h-5 text-sm text-dd-muted" aria-live="polite" role="status">
            {busy && uploadSession
              ? uploadStageLabels[uploadSession.stage]
              : !file
                ? 'Pilih bukti pembayaran terlebih dahulu.'
                : failure?.retryable
                  ? 'File tetap tersimpan pada halaman ini. Coba lagi untuk melanjutkan.'
                  : ''}
          </p>
          <Button
            type="button"
            disabled={!file || busy || (failure ? !failure.retryable : false)}
            fullWidth
            size="lg"
            loading={busy}
            loadingLabel={
              uploadSession ? uploadStageLabels[uploadSession.stage] : 'Menyiapkan upload aman…'
            }
            className="mt-5"
            onClick={async () => {
              if (!file) return;
              setFailure(undefined);
              setBusy(true);
              try {
                const sha256 = await sha256Upload(file);
                const updated = await browserOrderClient.uploadProof(
                  order,
                  file,
                  sha256,
                  uploadSession,
                  setUploadSession,
                );
                onUpdated(updated);
                setFile(null);
                setUploadSession(undefined);
                feedback.showToast({
                  tone: 'success',
                  title: 'Bukti pembayaran diterima',
                  message: `Status kini Menunggu pemeriksaan Finance.${
                    updated.correlationReference
                      ? ` Referensi: ${updated.correlationReference}.`
                      : ''
                  }`,
                });
              } catch (cause) {
                setFailure(orderErrorDetails(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            {failure?.retryable ? 'Coba lagi' : 'Kirim bukti pembayaran'}
          </Button>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-wrap justify-end gap-3">
          {order.status === 'APPROVED' && (
            <>
              <ButtonLink href="/account/packages" variant="secondary">
                Lihat Paket Saya
              </ButtonLink>
              <ButtonLink
                href={
                  order.continuationSlotId
                    ? `/bookings/new?slot=${order.continuationSlotId}`
                    : '/classes#schedule'
                }
              >
                Booking kelas
              </ButtonLink>
            </>
          )}
          {order.status === 'EXPIRED' && (
            <ButtonLink
              href={`/checkout?package=${encodeURIComponent(order.packageId)}&branch=${encodeURIComponent(order.branchId)}${order.continuationSlotId ? `&slot=${encodeURIComponent(order.continuationSlotId)}` : ''}`}
            >
              Buat pesanan baru
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}

function proofStatusLabel(status: CustomerOrder['paymentProofStatus']) {
  if (!status) return 'Status bukti belum tersedia.';
  if (status.uploadStatus !== 'FINALIZED') return 'Upload bukti belum selesai.';
  if (status.scanStatus === 'CLEAN') return 'Upload selesai · pemeriksaan keamanan bersih.';
  if (status.scanStatus === 'PENDING') return 'Upload selesai · pemeriksaan keamanan berlangsung.';
  if (status.scanStatus === 'REJECTED' || status.scanStatus === 'INFECTED')
    return 'Bukti ditolak oleh pemeriksaan keamanan.';
  return 'Pemeriksaan keamanan bukti mengalami kendala.';
}

function proofStatusVisual(status: CustomerOrder['paymentProofStatus']) {
  if (!status)
    return {
      icon: FileQuestion,
      classes: 'bg-dd-surface-muted text-dd-muted',
    };
  if (status.uploadStatus !== 'FINALIZED' || status.scanStatus === 'PENDING')
    return {
      icon: status.uploadStatus === 'FINALIZED' ? FileClock : UploadCloud,
      classes: 'bg-dd-info-soft text-dd-info',
    };
  if (status.scanStatus === 'CLEAN')
    return {
      icon: FileCheck2,
      classes: 'bg-dd-success-soft text-dd-success',
    };
  if (['REJECTED', 'INFECTED', 'ERROR'].includes(status.scanStatus))
    return {
      icon: AlertTriangle,
      classes: 'bg-dd-danger-soft text-dd-danger',
    };
  return {
    icon: FileQuestion,
    classes: 'bg-dd-surface-muted text-dd-muted',
  };
}

function proofUnavailableLabel(status: CustomerOrder['paymentProofStatus']) {
  if (!status || status.uploadStatus !== 'FINALIZED')
    return 'Preview tersedia setelah upload selesai.';
  if (status.scanStatus === 'PENDING')
    return 'Preview tersedia setelah pemeriksaan keamanan selesai.';
  if (status.scanStatus === 'REJECTED' || status.scanStatus === 'INFECTED')
    return 'File yang ditolak oleh pemeriksaan keamanan tidak dapat dibuka.';
  return 'Bukti belum dapat dipreview. Coba kembali setelah status pemeriksaan diperbarui.';
}

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy(): void }) {
  return (
    <div className="rounded-dd-lg border border-white/15 bg-white/10 p-3">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
        {label}
      </span>
      <div className="mt-1 flex items-center justify-between gap-3">
        <strong className="break-all text-lg">{value || 'Tidak tersedia'}</strong>
        <IconButton
          label={`Salin ${label.toLowerCase()}`}
          variant="ghost"
          onClick={onCopy}
          disabled={!value}
          className="size-9 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
          <Clipboard className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}

function QrisSvgPattern() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 160 160"
      className="size-44 select-none"
      aria-label="QRIS Code Daily Dose Pilates"
      role="img"
    >
      <rect width="160" height="160" fill="white" />
      {/* Top Left Finder Pattern */}
      <rect
        x="10"
        y="10"
        width="38"
        height="38"
        fill="none"
        stroke="#111827"
        strokeWidth="6"
        rx="3"
      />
      <rect x="20" y="20" width="18" height="18" fill="#111827" rx="2" />
      {/* Top Right Finder Pattern */}
      <rect
        x="112"
        y="10"
        width="38"
        height="38"
        fill="none"
        stroke="#111827"
        strokeWidth="6"
        rx="3"
      />
      <rect x="122" y="20" width="18" height="18" fill="#111827" rx="2" />
      {/* Bottom Left Finder Pattern */}
      <rect
        x="10"
        y="112"
        width="38"
        height="38"
        fill="none"
        stroke="#111827"
        strokeWidth="6"
        rx="3"
      />
      <rect x="20" y="122" width="18" height="18" fill="#111827" rx="2" />
      {/* Timing lines & Data Modules pattern */}
      <path
        d="M56 16h6v6h-6zm14 0h6v6h-6zm14 0h6v6h-6zm0 14h6v6h-6zm-14 14h6v6h-6zm28 0h6v6h-6zM16 56h6v6h-6zm0 14h6v6h-6zm0 14h6v6h-6zm14 0h6v6h-6zm14-14h6v6h-6zm14 0h6v6h-6zm14 0h6v6h-6zm14 0h6v6h-6zm14 0h6v6h-6zm14 0h6v6h-6zm14 0h6v6h-6zm14 0h6v6h-6zM56 70h6v6h-6zm28 0h6v6h-6zm28 0h6v6h-6zm-42 14h6v6h-6zm28 0h6v6h-6zm14 14h6v6h-6zm-42 14h6v6h-6zm14 0h6v6h-6zm28 0h6v6h-6zm14 0h6v6h-6zm-28 14h6v6h-6zm28 0h6v6h-6zm-14 14h6v6h-6zm28 0h6v6h-6zm-42 14h6v6h-6zm14 0h6v6h-6zm28 0h6v6h-6zM70 30h6v6h-6zm28 0h6v6h-6zm-14 26h6v6h-6zm14 28h6v6h-6zm28 14h6v6h-6zm-70 14h6v6h-6zm42 14h6v6h-6z"
        fill="#111827"
      />
      {/* Center QRIS Badge */}
      <rect x="60" y="66" width="40" height="20" rx="4" fill="#E11D48" />
      <text
        x="80"
        y="80"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        QRIS
      </text>
    </svg>
  );
}

