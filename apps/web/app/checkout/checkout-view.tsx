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
} from '../order-client';
import { Skeleton } from '../ui';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function CheckoutView() {
  const params = useSearchParams();
  const router = useTrackedRouter();
  const feedback = useAppFeedback();
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
      <section className="rounded-[22px] bg-white p-6">
        <Skeleton label="Preparing checkout" />
      </section>
    );

  if (order) {
    return (
      <main className="space-y-6 pt-2" aria-labelledby="checkout-title">
        <header>
          <h1 id="checkout-title" className="m-0 font-display text-3xl text-dd-forest sm:text-4xl">
            Finish your payment
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-dd-muted">
            Transfer the exact amount shown so we can match it, then upload your proof of payment on
            this page.
          </p>
        </header>
        <CustomerPaymentFlow order={order} onUpdated={setOrder} />
      </main>
    );
  }

  if (!packageId || !options)
    return (
      <section className="rounded-[22px] bg-white p-6">
        <h1 className="m-0 font-display text-3xl text-dd-forest">Package not available</h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Start checkout from a package at your club.
        </p>
        {error && (
          <div className="mt-5">
            <AlertBanner tone="danger" title="Checkout did not load" message={error} />
          </div>
        )}
        <ButtonLink className="mt-5" href="/packages">
          See packages
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
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to packages
        </Link>
        <h1 id="checkout-title" className="mt-3 font-display text-3xl text-dd-forest sm:text-4xl">
          Your order
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-dd-muted">
          Check the package and club before placing the order. The exact amount to transfer appears
          once the order is placed.
        </p>
      </header>

      {error && <AlertBanner tone="danger" title="The order was not placed" message={error} />}

      <ol
        aria-label="Checkout steps"
        className="grid grid-cols-2 gap-2 rounded-[22px] bg-white p-3 sm:grid-cols-4"
      >
        {['Order', 'Payment', 'Upload proof', 'Status'].map((label, index) => (
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
        <section className="rounded-[22px] bg-white p-5 sm:p-6">
          <p className="m-0 text-sm font-semibold text-dd-forest">Your package</p>
          <h2 className="mt-1 mb-0 font-display text-2xl text-dd-forest">{options.package.name}</h2>
          <p className="mt-1 text-sm text-dd-muted">
            {options.package.classTypes.find((item) => item.id === selectedClassTypeId)?.name ??
              'Choose a class'}{' '}
            · {options.package.branchName}
          </p>

          {options.package.classTypes.length > 1 && (
            <SearchSelect
              wrapperClassName="mt-5 max-w-md"
              label="Class"
              description="Choose the class this package will be used for."
              placeholder="Choose a class"
              value={selectedClassTypeId}
              required
              options={options.package.classTypes.map((item) => ({
                id: item.id,
                label: item.name,
              }))}
              onChange={(value) => {
                setSelectedClassTypeId(value);
                setVoucherPreview(null);
              }}
            />
          )}
          <dl className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-[15px] bg-lr-sky p-4">
              <dt className="text-xs text-dd-ink/75">Sessions</dt>
              <dd className="mt-1 font-semibold">{options.package.sessionCount}</dd>
            </div>
            <div className="rounded-[15px] bg-lr-sky p-4">
              <dt className="text-xs text-dd-ink/75">Each session</dt>
              <dd className="mt-1 font-semibold">
                {(options.package.sessionDurationMinutes ?? 60) >= 120 ? '2 hours' : '1 hour'}
              </dd>
            </div>
            <div className="rounded-[15px] bg-lr-sky p-4">
              <dt className="text-xs text-dd-ink/75">Valid for</dt>
              <dd className="mt-1 font-semibold">{options.package.durationDays} days</dd>
            </div>
            <div className="rounded-[15px] bg-lr-sky p-4">
              <dt className="text-xs text-dd-ink/75">Price</dt>
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

        <aside className="rounded-[22px] border border-lr-sun bg-lr-sun-soft p-5 sm:p-6">
          <ShieldCheck className="size-8 text-dd-forest" aria-hidden="true" />
          <h2 className="mt-3 mb-0 font-display text-xl text-dd-forest">How paying works</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-dd-ink">
            <li className="flex gap-2">
              <Check className="mt-1 size-4 shrink-0 text-dd-forest" />
              You pay by bank transfer to the account shown on your order.
            </li>
            <li className="flex gap-2">
              <Check className="mt-1 size-4 shrink-0 text-dd-forest" />
              The last three digits of the amount help us match your transfer.
            </li>
            <li className="flex gap-2">
              <Check className="mt-1 size-4 shrink-0 text-dd-forest" />
              Our finance team checks your proof of payment privately.
            </li>
          </ul>
          <p className="mt-4 text-sm leading-6 text-dd-ink">
            Please wait until the order is placed and the amount appears before you transfer.
          </p>
        </aside>
      </div>

      <section className="rounded-[22px] bg-white p-5 sm:p-6">
        <h2 className="m-0 font-display text-xl text-dd-forest">Got a voucher?</h2>
        <p className="mt-1 text-sm text-dd-muted">
          Enter the code before placing the order. The discount is worked out for you.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextInput
            label="Voucher code"
            value={voucherCode}
            onChange={(event) => {
              setVoucherCode(event.target.value.toUpperCase());
              setVoucherPreview(null);
            }}
            placeholder="Voucher code"
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
                  setError('This club is not valid for checkout.');
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
            Apply voucher
          </Button>
        </div>
        {voucherPreview && (
          <dl className="mt-4 grid gap-2 rounded-[15px] bg-dd-surface-muted p-4 text-sm sm:grid-cols-4">
            {voucherPreview.packagePromotionDiscountRp > 0 && (
              <div>
                <dt className="text-dd-muted">Package offer</dt>
                <dd className="font-semibold text-dd-forest">
                  -{rupiah.format(voucherPreview.packagePromotionDiscountRp)}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-dd-muted">Voucher</dt>
              <dd className="font-semibold">{voucherPreview.code}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Discount</dt>
              <dd className="font-semibold text-dd-forest">
                -{rupiah.format(voucherPreview.discountRp)}
              </dd>
            </div>
            <div>
              <dt className="text-dd-muted">Price after discount</dt>
              <dd className="font-semibold">
                {rupiah.format(voucherPreview.priceAfterDiscountRp)}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <StickyActionBar
        description={
          <p>
            You have {options.paymentAccount.paymentWindowHours} hours to pay after placing the
            order.
          </p>
        }
        className="border-dd-forest/15"
      >
        <Button
          type="button"
          size="lg"
          fullWidth
          disabled={!selectedClassTypeId}
          loading={submitting}
          loadingLabel="Placing order…"
          trailingIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          className="sm:min-w-80"
          onClick={async () => {
            const confirmed = await feedback.confirm({
              title: 'Place this order?',
              message: `We will create an order for ${options.package.name} at ${options.package.branchName}. Then you will see the bank account and amount to pay.`,
              confirmLabel: 'Place order',
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
                title: 'Order placed',
                message: 'Please transfer the exact amount shown.',
              });
            } catch (cause) {
              setError(orderError(cause));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          Place order and pay
        </Button>
      </StickyActionBar>
    </main>
  );
}
