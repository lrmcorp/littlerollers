'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { browserOrderClient, orderError, type CheckoutOptions } from '../order-client';
import { Feedback, PageHeader, Skeleton } from '../ui';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });

export function CheckoutView() {
  const params = useSearchParams();
  const router = useRouter();
  const packageId = params.get('package') ?? '';
  const slot = params.get('slot');
  const [options, setOptions] = useState<CheckoutOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!packageId) {
      setLoading(false);
      return;
    }
    browserOrderClient
      .checkout(packageId)
      .then(setOptions)
      .catch((cause) => setError(orderError(cause)))
      .finally(() => setLoading(false));
  }, [packageId]);

  if (loading)
    return (
      <section className="card">
        <Skeleton label="Menyiapkan checkout" />
      </section>
    );
  if (!packageId || !options)
    return (
      <section className="card">
        <PageHeader
          eyebrow="Checkout"
          title="Pilih paket dahulu"
          description="Checkout dimulai dari katalog paket agar harga dan cabang selalu tepat."
        />
        {error && <Feedback kind="error">{error}</Feedback>}
        <Link className="button-link" href="/packages">
          Lihat paket
        </Link>
      </section>
    );

  return (
    <section className="card order-page" aria-labelledby="checkout-title">
      <PageHeader
        eyebrow="Checkout aman"
        title="Konfirmasi pesanan"
        titleId="checkout-title"
        description="Pesanan dibuat sebelum transfer. Instruksi rekening tersimpan sebagai snapshot pesanan Anda."
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      <div className="order-grid">
        <article className="order-panel">
          <p className="eyebrow">Paket dipilih</p>
          <h2>{options.package.name}</h2>
          <p>
            {options.package.classTypeName} · {options.package.branchName}
          </p>
          <dl className="purchase-summary">
            <div>
              <dt>Sesi</dt>
              <dd>{options.package.sessionCount} sesi</dd>
            </div>
            <div>
              <dt>Masa aktif</dt>
              <dd>{options.package.durationDays} hari</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{rupiah.format(options.package.priceRp)}</dd>
            </div>
          </dl>
        </article>
        <article className="order-panel order-panel-accent">
          <p className="eyebrow">Setelah konfirmasi</p>
          <h2>Transfer manual</h2>
          <p>
            Rekening {options.paymentAccount.bankName} akan tampil pada detail pesanan. Batas
            pembayaran {options.paymentAccount.paymentWindowHours} jam.
          </p>
          <p className="privacy-note">
            Jangan transfer sebelum pesanan berhasil dibuat dan nomor rekening tampil di detail
            pesanan.
          </p>
        </article>
      </div>
      <div className="order-actions">
        <Link href="/packages" className="button-quiet">
          Kembali ke paket
        </Link>
        <button
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            setError('');
            try {
              const order = await browserOrderClient.create(packageId, slot);
              router.push(`/orders/${order.id}`);
            } catch (cause) {
              setError(orderError(cause));
              setSubmitting(false);
            }
          }}
        >
          {submitting
            ? 'Membuat pesanan…'
            : `Konfirmasi · ${rupiah.format(options.package.priceRp)}`}
        </button>
      </div>
    </section>
  );
}
