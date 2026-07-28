'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CustomerPaymentFlow } from '../components/customer/customer-payment-flow';
import { AlertBanner, useAppFeedback } from '../components/app-feedback';
import { Button, ButtonLink, StickyActionBar } from '../components/actions';
import {
  browserOrderClient,
  orderError,
  type CheckoutOptions,
  type CustomerOrder,
} from '../order-client';
import { Skeleton } from '../ui';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function CheckoutView() {
  const params = useSearchParams();
  const router = useRouter();
  const feedback = useAppFeedback();
  const packageId = params.get('package') ?? '';
  const branchId = params.get('branch');
  const slot = params.get('slot');
  const orderId = params.get('order');
  const [options, setOptions] = useState<CheckoutOptions | null>(null);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const request = orderId
      ? browserOrderClient.detail(orderId).then((value) => setOrder(value))
      : packageId
        ? browserOrderClient.checkout(packageId, branchId).then(setOptions)
        : Promise.reject(new Error('RESOURCE_NOT_FOUND'));
    request.catch((cause) => setError(orderError(cause))).finally(() => setLoading(false));
  }, [branchId, orderId, packageId]);

  if (loading)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
        <Skeleton label="Menyiapkan checkout" />
      </section>
    );

  if (order) {
    return (
      <main className="space-y-6 pt-2" aria-labelledby="checkout-title">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
            Checkout aman
          </p>
          <h1 id="checkout-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
            Selesaikan pembayaran
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-dd-muted">
            Gunakan nominal yang ditampilkan agar transfer dapat dicocokkan, lalu unggah bukti pada
            halaman ini.
          </p>
        </header>
        <CustomerPaymentFlow order={order} onUpdated={setOrder} />
      </main>
    );
  }

  if (!packageId || !options)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">Checkout</p>
        <h1 className="mt-2 text-2xl font-semibold">Paket belum tersedia</h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Checkout harus dimulai dari paket dan studio yang sesuai.
        </p>
        {error && (
          <div className="mt-5">
            <AlertBanner tone="danger" title="Checkout belum dapat dimuat" message={error} />
          </div>
        )}
        <ButtonLink className="mt-5" href="/packages">
          Lihat paket
        </ButtonLink>
      </section>
    );

  return (
    <main className="space-y-6 pt-2" aria-labelledby="checkout-title">
      <header>
        <Link
          href={`/packages?branch=${encodeURIComponent(options.package.branchId)}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
        >
          <ArrowLeft className="size-4" />
          Kembali ke paket
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
          Checkout aman
        </p>
        <h1 id="checkout-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
          Ringkasan pembelian
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-dd-muted">
          Periksa paket dan studio sebelum membuat pesanan. Nominal transfer terverifikasi akan
          ditampilkan setelah pesanan berhasil dibuat.
        </p>
      </header>

      {error && <AlertBanner tone="danger" title="Pesanan belum berhasil dibuat" message={error} />}

      <ol
        aria-label="Tahapan checkout"
        className="grid grid-cols-2 gap-2 rounded-dd-xl border border-dd-line bg-white p-3 sm:grid-cols-4"
      >
        {['Ringkasan', 'Pembayaran', 'Unggah bukti', 'Status'].map((label, index) => (
          <li
            key={label}
            aria-current={index === 0 ? 'step' : undefined}
            className={`flex items-center gap-2 rounded-dd-lg px-3 py-2 text-xs font-semibold sm:text-sm ${
              index === 0 ? 'bg-dd-forest text-white' : 'text-dd-muted'
            }`}
          >
            <span className="grid size-6 place-items-center rounded-full border border-current text-[11px]">
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-forest">
            Paket dipilih
          </p>
          <h2 className="mt-3 text-2xl font-semibold">{options.package.name}</h2>
          <p className="mt-1 text-sm text-dd-muted">
            {options.package.classTypeName} · {options.package.branchName}
          </p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-dd-lg bg-dd-surface-muted p-4">
              <dt className="text-xs text-dd-muted">Jumlah sesi</dt>
              <dd className="mt-1 font-semibold">{options.package.sessionCount} sesi</dd>
            </div>
            <div className="rounded-dd-lg bg-dd-surface-muted p-4">
              <dt className="text-xs text-dd-muted">Masa berlaku</dt>
              <dd className="mt-1 font-semibold">{options.package.durationDays} hari</dd>
            </div>
            <div className="rounded-dd-lg bg-dd-surface-muted p-4">
              <dt className="text-xs text-dd-muted">Harga paket</dt>
              <dd className="mt-1 font-semibold">{rupiah.format(options.package.priceRp)}</dd>
            </div>
          </dl>
        </section>

        <aside className="rounded-dd-xl border border-dd-brass/50 bg-dd-brass-soft p-5 sm:p-6">
          <ShieldCheck className="size-8 text-dd-forest" />
          <h2 className="mt-4 text-lg font-semibold">Transfer manual terverifikasi</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-dd-muted">
            <li className="flex gap-2">
              <Check className="mt-1 size-4 shrink-0 text-dd-forest" />
              Rekening tujuan disimpan sebagai snapshot pesanan.
            </li>
            <li className="flex gap-2">
              <Check className="mt-1 size-4 shrink-0 text-dd-forest" />
              Tiga digit terakhir pada nominal digunakan sebagai identifikasi transfer.
            </li>
            <li className="flex gap-2">
              <Check className="mt-1 size-4 shrink-0 text-dd-forest" />
              Bukti pembayaran diperiksa privat oleh Finance.
            </li>
          </ul>
          <p className="mt-4 text-xs leading-5 text-dd-muted">
            Jangan transfer sebelum pesanan berhasil dibuat dan nominal pembayaran sudah muncul.
          </p>
        </aside>
      </div>

      <StickyActionBar
        description={
          <p>Pesanan memiliki batas pembayaran {options.paymentAccount.paymentWindowHours} jam.</p>
        }
        className="border-dd-forest/15"
      >
        <Button
          type="button"
          size="lg"
          fullWidth
          loading={submitting}
          loadingLabel="Membuat pesanan…"
          trailingIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          className="sm:min-w-80"
          onClick={async () => {
            const confirmed = await feedback.confirm({
              title: 'Buat pesanan ini?',
              message: `${options.package.name} di ${options.package.branchName} akan dibuat. Setelah itu Anda memperoleh rekening dan nominal pembayaran.`,
              confirmLabel: 'Buat pesanan',
            });
            if (!confirmed) return;
            setSubmitting(true);
            setError('');
            try {
              const created = await browserOrderClient.create(packageId, slot, branchId);
              setOrder(created);
              router.replace(`/checkout?order=${encodeURIComponent(created.id)}`);
              feedback.showToast({
                tone: 'success',
                title: 'Pesanan berhasil dibuat',
                message: 'Silakan transfer sesuai nominal yang ditampilkan.',
              });
            } catch (cause) {
              setError(orderError(cause));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          Buat pesanan dan lanjutkan pembayaran
        </Button>
      </StickyActionBar>
    </main>
  );
}
