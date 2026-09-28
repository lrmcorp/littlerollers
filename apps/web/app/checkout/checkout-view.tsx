'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CustomerPaymentFlow } from '../components/customer/customer-payment-flow';
import { AlertBanner, useAppFeedback } from '../components/app-feedback';
import { useTrackedRouter } from '../components/app-loading';
import { Button, ButtonLink, StickyActionBar } from '../components/actions';
import { SearchSelect, TextInput } from '../components/forms';
import { PackagePrice } from '../components/public/package-price';
import {
  browserOrderClient,
  orderError,
  type CheckoutOptions,
  type CustomerOrder,
} from '@/api-clients/order-client';
import { Skeleton } from '../ui';
import { formatRupiah } from '../lib/formatters';
import { useSessionContext } from '../session-context';

export function CheckoutView() {
  const params = useSearchParams();
  const router = useTrackedRouter();
  const feedback = useAppFeedback();
  const session = useSessionContext();
  const packageId = params.get('package') ?? '';
  const branchId = params.get('branch');
  const requestedClassTypeId = params.get('classType') ?? '';
  const slot = params.get('slot');
  const orderId = params.get('order');
  const [options, setOptions] = useState<CheckoutOptions | null>(null);
  const [selectedClassTypeId, setSelectedClassTypeId] = useState('');
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherPreview, setVoucherPreview] = useState<{
    code: string;
    packagePromotionDiscountRp: number;
    discountRp: number;
    priceAfterDiscountRp: number;
  } | null>(null);
  const [voucherBusy, setVoucherBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    const request = orderId
      ? browserOrderClient.detail(orderId).then((value) => setOrder(value))
      : packageId
        ? browserOrderClient.checkout(packageId, branchId).then((value) => {
            setOptions(value);

            const requestedIsValid = value.package.classTypes.some(
              (item) => item.id === requestedClassTypeId,
            );

            setSelectedClassTypeId(
              requestedIsValid
                ? requestedClassTypeId
                : value.package.classTypes.length === 1
                  ? value.package.classTypes[0]!.id
                  : '',
            );
          })
        : Promise.reject(new Error('RESOURCE_NOT_FOUND'));
    request.catch((cause) => setError(orderError(cause))).finally(() => setLoading(false));
  }, [branchId, orderId, packageId, requestedClassTypeId]);

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

  if (!packageId || !options) {
    const isAuthError =
      error?.toLowerCase().includes('sesi') ||
      error?.toLowerCase().includes('unauthorized') ||
      error?.toLowerCase().includes('401') ||
      session?.status === 'unauthenticated';

    if (isAuthError && packageId) {
      const checkoutDestination = `/checkout?package=${packageId}${branchId ? `&branch=${branchId}` : ''}${requestedClassTypeId ? `&classType=${requestedClassTypeId}` : ''}${slot ? `&slot=${encodeURIComponent(slot)}` : ''}`;
      const returnTo = encodeURIComponent(checkoutDestination);
      return (
        <section className="rounded-dd-xl border border-dd-line bg-white p-8 shadow-dd-card max-w-xl mx-auto text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-dd-forest/10 text-dd-forest">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
            Pembelian Paket Sesi
          </p>
          <h1 className="text-2xl font-semibold text-dd-ink">Masuk untuk Melanjutkan Pembelian</h1>
          <p className="text-sm leading-6 text-dd-muted">
            Untuk mengaitkan paket sesi Pilates dengan akun Anda dan memproses pembayaran secara aman,
            silakan masuk atau buat akun baru terlebih dahulu.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <ButtonLink href={`/sign-in?returnTo=${returnTo}`} className="w-full sm:w-auto">
              Masuk ke Akun
            </ButtonLink>
            <ButtonLink variant="secondary" href={`/register?returnTo=${returnTo}`} className="w-full sm:w-auto">
              Daftar Akun Baru
            </ButtonLink>
          </div>
        </section>
      );
    }

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
  }

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
            {options.package.classTypes.find((item) => item.id === selectedClassTypeId)?.name ??
              'Pilih jenis kelas'}{' '}
            · {options.package.branchName}
          </p>

          {options.package.classTypes.length > 1 && (
            <div className="mt-5 max-w-md">
              <SearchSelect
                label="Jenis kelas"
                description="Pilih satu jenis kelas yang akan digunakan untuk paket ini."
                value={selectedClassTypeId}
                placeholder="Pilih jenis kelas"
                options={options.package.classTypes.map((item) => ({
                  id: item.id,
                  label: item.name,
                }))}
                onChange={(value) => {
                  setSelectedClassTypeId(value);
                  setVoucherPreview(null);
                }}
              />
            </div>
          )}
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
              <dd className="mt-2">
                <PackagePrice
                  priceRp={options.package.priceRp}
                  effectivePriceRp={options.package.effectivePriceRp}
                  promotion={options.package.promotion}
                  compact
                />
              </dd>
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

      <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6">
        <h2 className="text-lg font-semibold text-dd-ink">Punya voucher?</h2>
        <p className="mt-1 text-sm text-dd-muted">
          Masukkan kode voucher sebelum membuat pesanan. Diskon dihitung otomatis oleh sistem.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextInput
            label="Kode voucher"
            value={voucherCode}
            onChange={(event) => {
              setVoucherCode(event.target.value.toUpperCase());
              setVoucherPreview(null);
            }}
            placeholder="Contoh: WELCOME10"
            wrapperClassName="sm:flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={
              voucherBusy || !branchId || !selectedClassTypeId || voucherCode.trim().length < 3
            }
            loading={voucherBusy}
            onClick={async () => {
              setVoucherBusy(true);
              setError('');
              try {
                const effectiveBranchId = branchId?.trim();
                if (!effectiveBranchId) {
                  setVoucherPreview(null);
                  setError('Cabang checkout tidak valid.');
                  return;
                }

                const result = await browserOrderClient.previewVoucher(
                  packageId,
                  effectiveBranchId,
                  selectedClassTypeId,
                  voucherCode,
                );
                setVoucherPreview(result);
              } catch (cause) {
                setVoucherPreview(null);
                setError(orderError(cause));
              } finally {
                setVoucherBusy(false);
              }
            }}
          >
            Terapkan voucher
          </Button>
        </div>
        {voucherPreview && (
          <dl className="mt-4 grid gap-2 rounded-dd-lg bg-dd-surface-muted p-4 text-sm sm:grid-cols-4">
            {voucherPreview.packagePromotionDiscountRp > 0 && (
              <div>
                <dt className="text-dd-muted">Promo paket</dt>
                <dd className="font-semibold text-dd-forest">
                  -{formatRupiah(voucherPreview.packagePromotionDiscountRp)}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-dd-muted">Voucher</dt>
              <dd className="font-semibold">{voucherPreview.code}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Diskon</dt>
              <dd className="font-semibold text-dd-forest">
                -{formatRupiah(voucherPreview.discountRp)}
              </dd>
            </div>
            <div>
              <dt className="text-dd-muted">Harga setelah diskon</dt>
              <dd className="font-semibold">{formatRupiah(voucherPreview.priceAfterDiscountRp)}</dd>
            </div>
          </dl>
        )}
      </section>

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
          disabled={!selectedClassTypeId}
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
              const created = await browserOrderClient.create(
                packageId,
                slot,
                branchId,
                selectedClassTypeId,
                voucherPreview?.code,
                options.package,
              );
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
