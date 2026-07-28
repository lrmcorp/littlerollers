'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clipboard, Clock3, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  browserOrderClient,
  orderErrorDetails,
  sha256Upload,
  type CustomerOrder,
  type PaymentProofUploadSession,
} from '../../order-client';
import { formatPaymentCode, orderReasonLabels, orderStatusLabels } from '../../order-presenters';
import { Button, ButtonLink, IconButton } from '../actions';
import { AlertBanner, useAppFeedback } from '../app-feedback';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

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

  const remaining = useMemo(
    () => (order.expiresAt ? Math.max(0, order.expiresAt.getTime() - now) : 0),
    [now, order.expiresAt],
  );
  const canUpload = ['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) && remaining > 0;
  const paymentCode = formatPaymentCode(order.paymentUniqueCode);
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
          message="Bukti sudah diterima. Anda akan memperoleh notifikasi setelah Finance mengambil keputusan."
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
              <dd className="font-semibold">{rupiah.format(order.baseAmountRp)}</dd>
            </div>
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
                {rupiah.format(order.payableAmountRp)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-dd-muted">
            Tiga digit terakhir pada nominal membantu tim Finance mencocokkan transfer manual dengan
            pesanan Anda.
          </p>
        </section>

        <section className="rounded-dd-xl border border-dd-forest/25 bg-dd-forest p-5 text-white shadow-dd-card sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">
            Tujuan transfer
          </p>
          <h2 className="mt-2 text-xl font-semibold">{order.paymentAccount?.bankName}</h2>
          <p className="mt-1 text-sm text-white/70">
            a.n. {order.paymentAccount?.accountHolderName}
          </p>
          <div className="mt-5 space-y-3">
            <CopyRow
              label="Nomor rekening"
              value={order.paymentAccount?.accountNumber ?? ''}
              onCopy={() => copy(order.paymentAccount?.accountNumber ?? '', 'Nomor rekening')}
            />
            <CopyRow
              label="Nominal transfer"
              value={rupiah.format(order.payableAmountRp)}
              onCopy={() => copy(String(order.payableAmountRp), 'Nominal transfer')}
            />
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-dd-lg bg-white/10 px-3 py-3 text-sm">
            <Clock3 className="size-4 shrink-0" />
            <span>{remaining > 0 ? `${durationLabel} tersisa` : 'Batas pembayaran berakhir'}</span>
          </div>
        </section>
      </div>

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/orders" className="text-sm font-semibold text-dd-forest">
          Semua pesanan
        </Link>
        <div className="flex flex-wrap gap-3">
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
