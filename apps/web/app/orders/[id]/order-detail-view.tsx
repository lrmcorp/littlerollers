'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  browserOrderClient,
  orderError,
  sha256Upload,
  type CustomerOrder,
} from '../../order-client';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
const reasonLabels: Record<string, string> = {
  PROOF_INVALID: 'Bukti pembayaran tidak valid.',
  AMOUNT_MISMATCH: 'Nominal transfer tidak sesuai.',
  OTHER_REVIEW_REQUIRED: 'Bukti memerlukan perbaikan.',
};
export function OrderDetailView({ id }: { id: string }) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    browserOrderClient
      .detail(id)
      .then(setOrder)
      .catch((e) => setError(orderError(e)))
      .finally(() => setLoading(false));
  }, [id]);
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
    () => (order?.expiresAt ? Math.max(0, order.expiresAt.getTime() - now) : 0),
    [order, now],
  );
  if (loading)
    return (
      <section className="card">
        <Skeleton label="Memuat pesanan" />
      </section>
    );
  if (!order)
    return (
      <section className="card">
        <PageHeader
          eyebrow="Pesanan"
          title="Pesanan tidak tersedia"
          description="Pesanan mungkin sudah tidak dapat diakses."
        />
        {error && <Feedback kind="error">{error}</Feedback>}
        <Link href="/orders">Kembali</Link>
      </section>
    );
  const canUpload = ['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) && remaining > 0;
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return (
    <section className="card order-page">
      <PageHeader
        eyebrow={`Pesanan •${order.id.slice(-8)}`}
        title={order.packageName}
        description={`${order.branchName ?? ''} · ${order.sessionCount} sesi · ${order.durationDays} hari`}
        context={
          <StatusBadge
            tone={
              order.status === 'APPROVED'
                ? 'success'
                : order.status === 'REJECTED' || order.status === 'EXPIRED'
                  ? 'danger'
                  : 'warning'
            }
          >
            {order.status.replaceAll('_', ' ')}
          </StatusBadge>
        }
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      {order.status === 'ACTION_REQUIRED' && (
        <Feedback kind="warning">
          {reasonLabels[order.decisionReasonCode ?? ''] ??
            'Bukti pembayaran perlu diperbaiki pada pesanan yang sama.'}
        </Feedback>
      )}
      {order.status === 'PENDING' && (
        <Feedback kind="info">
          Bukti sudah diterima dan sedang diperiksa oleh tim Daily Dose.
        </Feedback>
      )}
      {order.status === 'APPROVED' && (
        <Feedback kind="status">Pembayaran disetujui. Paket sudah masuk ke Paket Saya.</Feedback>
      )}
      <div className="order-grid">
        <article className="order-panel order-panel-accent">
          <p className="eyebrow">Tujuan transfer</p>
          <h2>{order.paymentAccount?.bankName}</h2>
          <div className="account-number">
            <strong>{order.paymentAccount?.accountNumber}</strong>
            <button
              className="button-quiet"
              onClick={async () => {
                await navigator.clipboard.writeText(order.paymentAccount?.accountNumber ?? '');
                setCopied('Nomor rekening disalin.');
              }}
            >
              Salin
            </button>
          </div>
          <p>a.n. {order.paymentAccount?.accountHolderName}</p>
          {copied && <small role="status">{copied}</small>}
        </article>
        <article className="order-panel">
          <p className="eyebrow">Jumlah transfer</p>
          <h2>{rupiah.format(order.priceRp)}</h2>
          <p>Batas waktu</p>
          <strong className="countdown">
            {remaining > 0 ? `${hours}j ${minutes}m ${seconds}d` : 'Kedaluwarsa'}
          </strong>
        </article>
      </div>
      {canUpload && (
        <div className="upload-panel">
          <div>
            <p className="eyebrow">Bukti pembayaran</p>
            <h2>
              {order.status === 'ACTION_REQUIRED'
                ? 'Unggah bukti pengganti'
                : 'Unggah setelah transfer'}
            </h2>
            <p>JPEG, PNG, atau PDF asli. Maksimum 10 MB.</p>
          </div>
          <label className="file-drop">
            Pilih bukti pembayaran
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {preview && (
            <Image
              className="proof-preview"
              src={preview}
              alt="Preview bukti pembayaran"
              width={640}
              height={420}
              unoptimized
            />
          )}
          {file && (
            <p>
              <strong>{file.name}</strong> · {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
          <button
            disabled={!file || uploading}
            onClick={async () => {
              if (!file) return;
              setUploading(true);
              setError('');
              try {
                setOrder(
                  await browserOrderClient.uploadProof(order, file, await sha256Upload(file)),
                );
                setFile(null);
              } catch (e) {
                setError(orderError(e));
              } finally {
                setUploading(false);
              }
            }}
          >
            {uploading ? 'Mengunggah dan memeriksa…' : 'Kirim bukti pembayaran'}
          </button>
        </div>
      )}
      <div className="order-actions">
        <Link href="/orders">Semua pesanan</Link>
        {order.status === 'APPROVED' && (
          <Link
            href={
              order.continuationSlotId
                ? `/bookings/new?slot=${order.continuationSlotId}`
                : '/account/packages'
            }
          >
            Lanjutkan booking
          </Link>
        )}
        {order.status === 'EXPIRED' && (
          <Link
            href={`/checkout?package=${order.packageId}${order.continuationSlotId ? `&slot=${order.continuationSlotId}` : ''}`}
          >
            Buat pesanan baru
          </Link>
        )}
      </div>
    </section>
  );
}
