'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  Clipboard,
  Clock3,
  Eye,
  FileCheck2,
  FileClock,
  FileQuestion,
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
} from '../../order-client';
import { formatPaymentCode, orderReasonLabels, orderStatusLabels } from '../../order-presenters';
import { Button, ButtonLink, IconButton } from '../actions';
import { AlertBanner, useAppFeedback } from '../app-feedback';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const steps = ['Order', 'Payment', 'Upload proof', 'Status'];

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
  ISSUING: 'Preparing a secure upload…',
  UPLOADING: 'Uploading your proof…',
  SCANNING: 'Checking the file…',
  ATTACHING: 'Adding the proof to your order…',
  COMPLETED: 'Proof of payment received.',
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
    paymentAccountAvailable;
  const paymentCode = formatPaymentCode(order.paymentUniqueCode);
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
      ? `${duration.hours} h ${duration.minutes} min`
      : duration.minutes > 0
        ? `${duration.minutes} min`
        : `${duration.seconds} s`;

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    feedback.showToast({ tone: 'success', title: `${label} copied` });
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
        setProofPreviewError('This file type cannot be previewed.');
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
        aria-label="Checkout steps"
        className="grid grid-cols-2 gap-2 rounded-[22px] border border-dd-line bg-white p-3 sm:grid-cols-4"
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
          title="Your proof of payment needs a fix"
          message={
            orderReasonLabels[order.decisionReasonCode ?? ''] ??
            'Upload a new proof on this same order.'
          }
        />
      )}
      {order.status === 'PENDING' && (
        <AlertBanner
          tone="info"
          title="We are checking your payment"
          message="We have your proof. You will get a notification once our finance team decides."
        />
      )}
      {order.status === 'APPROVED' && (
        <AlertBanner
          tone="success"
          title="Payment approved"
          message="Your package is active. You can book sessions now."
        />
      )}
      {order.status === 'EXPIRED' && (
        <AlertBanner
          tone="danger"
          title="Order expired"
          message="The payment deadline passed. Place a new order to get a new amount to pay."
        />
      )}
      {failure && (
        <AlertBanner
          tone="danger"
          title={
            failure.stage === 'ISSUING'
              ? 'The upload could not start'
              : failure.stage === 'UPLOADING'
                ? 'The file did not finish uploading'
                : failure.stage === 'SCANNING'
                  ? 'The file check did not finish'
                  : failure.stage === 'ATTACHING'
                    ? 'The proof was not added to the order'
                    : 'The upload did not work'
          }
          message={`${failure.message}${
            failure.correlationReference ? ` Support code: ${failure.correlationReference}.` : ''
          }`}
        />
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <section className="rounded-[22px] border border-dd-line bg-white p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-forest">
            Order summary
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-dd-ink sm:text-2xl">{order.packageName}</h2>
              <p className="mt-1 text-sm text-dd-muted">
                {order.branchName} · {order.sessionCount} sessions ·{' '}
                {(order.sessionDurationMinutes ?? 60) >= 120 ? '2 hours' : '1 hour'} each · valid{' '}
                {order.durationDays} days
              </p>
            </div>
            <span className="rounded-full bg-dd-surface-muted px-3 py-1 text-xs font-semibold text-dd-ink">
              {orderStatusLabels[order.status]}
            </span>
          </div>
          <dl className="mt-6 divide-y divide-dd-line rounded-dd-lg border border-dd-line">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-dd-muted">Package price</dt>
              <dd className="font-semibold">{rupiah.format(order.baseAmountRp)}</dd>
            </div>
            {order.promotion && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-dd-muted">Package offer · {order.promotion.name}</dt>
                <dd className="font-semibold text-dd-forest">
                  -{rupiah.format(order.promotion.discountRp)}
                </dd>
              </div>
            )}
            {order.promotion && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-dd-muted">Offer price</dt>
                <dd className="font-semibold">
                  {rupiah.format(order.promotionalPriceRp ?? order.baseAmountRp)}
                </dd>
              </div>
            )}
            {order.voucher && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-dd-muted">Voucher discount · {order.voucher.code}</dt>
                <dd className="font-semibold text-dd-forest">
                  -{rupiah.format(order.voucher.discountRp)}
                </dd>
              </div>
            )}
            {order.priceAfterDiscountRp !== order.baseAmountRp && (
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-dd-muted">Price after discount</dt>
                <dd className="font-semibold">
                  {rupiah.format(order.priceAfterDiscountRp ?? order.baseAmountRp)}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 bg-dd-surface-muted px-4 py-4">
              <dt>
                <span className="block font-semibold text-dd-ink">Amount to transfer</span>
                <span className="mt-1 block text-xs text-dd-muted">
                  {paymentCode ? `Matching code · ${paymentCode}` : 'Standard amount'}
                </span>
              </dt>
              <dd className="text-xl font-bold text-dd-forest">
                {rupiah.format(order.payableAmountRp)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-dd-muted">
            The last three digits of the amount help our finance team match your transfer to this
            order.
          </p>
        </section>

        {paymentAccountAvailable ? (
          <section className="rounded-[22px] border border-dd-forest/25 bg-dd-forest p-5 text-white sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">Pay to</p>
            <h2 className="mt-2 text-xl font-semibold">{order.paymentAccount!.bankName}</h2>
            <p className="mt-1 text-sm text-white/70">
              Account name: {order.paymentAccount!.accountHolderName}
            </p>
            <div className="mt-5 space-y-3">
              <CopyRow
                label="Account number"
                value={order.paymentAccount!.accountNumber}
                onCopy={() => copy(order.paymentAccount!.accountNumber, 'Account number')}
              />
              <CopyRow
                label="Amount"
                value={rupiah.format(order.payableAmountRp)}
                onCopy={() => copy(String(order.payableAmountRp), 'Amount')}
              />
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-dd-lg bg-white/10 px-3 py-3 text-sm">
              <Clock3 className="size-4 shrink-0" />
              <span>
                {remaining > 0 ? `${durationLabel} left to pay` : 'The payment deadline has passed'}
              </span>
            </div>
          </section>
        ) : (
          <section
            className={`rounded-[22px] border border-dd-line bg-dd-surface-muted ${
              ['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) ? 'p-5 sm:p-6' : 'p-4'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
              Bank account
            </p>
            <h2
              className={`mt-2 font-semibold ${
                ['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status)
                  ? 'text-xl'
                  : 'text-base'
              }`}
            >
              No bank account on this order
            </h2>
            <p className="mt-2 text-sm leading-6 text-dd-muted">
              {['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status)
                ? 'This order has no bank account saved. Please do not transfer money for it.'
                : 'This older order has no bank account saved. You can still see its status and history.'}
            </p>
            {['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) && (
              <ButtonLink href="/packages" className="mt-4">
                Place a new order
              </ButtonLink>
            )}
          </section>
        )}
      </div>

      {order.paymentProofId && (
        <section
          className="rounded-[22px] border border-dd-line bg-white p-5 sm:p-6"
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
                  Your proof of payment
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
                  Close preview
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                disabled={!proofReady || proofPreviewLoading}
                loading={proofPreviewLoading}
                loadingLabel="Loading proof…"
                onClick={() => void loadProofPreview()}
                leadingIcon={<Eye className="size-4" aria-hidden="true" />}
              >
                {proofPreviewUrl ? 'Reload preview' : 'View proof of payment'}
              </Button>
            </div>
          </div>

          {proofPreviewError && (
            <div className="mt-5">
              <AlertBanner
                tone="danger"
                title="The proof could not be shown"
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
              aria-label="Proof of payment preview"
            >
              {proofPreviewType.startsWith('image/') ? (
                <img
                  src={proofPreviewUrl}
                  alt="Your proof of payment"
                  className="max-h-[34rem] w-full rounded-dd-lg border border-dd-line bg-white object-contain"
                />
              ) : (
                <object
                  data={proofPreviewUrl}
                  type={proofPreviewType}
                  title="Your proof of payment"
                  className="h-[34rem] w-full rounded-dd-lg border border-dd-line bg-white"
                >
                  <p>This browser cannot preview PDFs.</p>
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
                  ? 'Choose “View proof of payment” to open your private file.'
                  : proofUnavailableLabel(order.paymentProofStatus)}
              </div>
            )
          )}
        </section>
      )}

      {canUpload && (
        <section className="rounded-[22px] border border-dd-line bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-dd-lg bg-dd-brass-soft text-dd-warning">
              <UploadCloud className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">
                {order.status === 'ACTION_REQUIRED'
                  ? 'Upload a new proof'
                  : 'Upload proof of payment'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-dd-muted">
                JPEG, PNG or PDF up to 10 MB. Make sure the amount and the receiving account are
                easy to read.
              </p>
            </div>
          </div>
          <label className="mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-dd-line bg-dd-surface-muted p-5 text-center focus-within:ring-2 focus-within:ring-dd-forest">
            <UploadCloud className="size-7 text-dd-forest" />
            <strong className="mt-2 text-sm">Choose or drop your proof of payment</strong>
            <span className="mt-1 text-xs text-dd-muted">JPEG, PNG, PDF · up to 10 MB</span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                if (selected && selected.size > 10_000_000) {
                  setFailure({
                    code: 'PAYMENT_PROOF_TOO_LARGE',
                    message: 'The file is larger than 10 MB.',
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
              alt="Preview of your proof of payment"
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
                Change file
              </Button>
            </div>
          )}
          <p className="mt-4 min-h-5 text-sm text-dd-muted" aria-live="polite" role="status">
            {busy && uploadSession
              ? uploadStageLabels[uploadSession.stage]
              : !file
                ? 'Choose your proof of payment first.'
                : failure?.retryable
                  ? 'Your file is still selected. Try again to continue.'
                  : ''}
          </p>
          <Button
            type="button"
            disabled={!file || busy || (failure ? !failure.retryable : false)}
            fullWidth
            size="lg"
            loading={busy}
            loadingLabel={
              uploadSession ? uploadStageLabels[uploadSession.stage] : 'Preparing a secure upload…'
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
                  title: 'Proof of payment received',
                  message: `Our finance team will check it next.${
                    updated.correlationReference
                      ? ` Reference: ${updated.correlationReference}.`
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
            {failure?.retryable ? 'Try again' : 'Send proof of payment'}
          </Button>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-wrap justify-end gap-3">
          {order.status === 'APPROVED' && (
            <>
              <ButtonLink href="/account/packages" variant="secondary">
                My packages
              </ButtonLink>
              <ButtonLink
                href={
                  order.continuationSlotId
                    ? `/bookings/new?slot=${order.continuationSlotId}`
                    : '/classes#schedule'
                }
              >
                Book a session
              </ButtonLink>
            </>
          )}
          {order.status === 'EXPIRED' && (
            <ButtonLink
              href={`/checkout?package=${encodeURIComponent(order.packageId)}&branch=${encodeURIComponent(order.branchId)}${order.continuationSlotId ? `&slot=${encodeURIComponent(order.continuationSlotId)}` : ''}`}
            >
              Place a new order
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}

function proofStatusLabel(status: CustomerOrder['paymentProofStatus']) {
  if (!status) return 'No proof status yet.';
  if (status.uploadStatus !== 'FINALIZED') return 'The upload has not finished.';
  if (status.scanStatus === 'CLEAN') return 'Uploaded · file check passed.';
  if (status.scanStatus === 'PENDING') return 'Uploaded · file check in progress.';
  if (status.scanStatus === 'REJECTED' || status.scanStatus === 'INFECTED')
    return 'The file failed the safety check.';
  return 'The file check ran into a problem.';
}

function proofStatusVisual(status: CustomerOrder['paymentProofStatus']) {
  if (!status)
    return {
      icon: FileQuestion,
      classes: 'bg-stone-100 text-stone-600',
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
    classes: 'bg-stone-100 text-stone-600',
  };
}

function proofUnavailableLabel(status: CustomerOrder['paymentProofStatus']) {
  if (!status || status.uploadStatus !== 'FINALIZED')
    return 'The preview is ready once the upload finishes.';
  if (status.scanStatus === 'PENDING') return 'The preview is ready once the file check finishes.';
  if (status.scanStatus === 'REJECTED' || status.scanStatus === 'INFECTED')
    return 'Files that failed the safety check cannot be opened.';
  return 'The proof cannot be previewed yet. Try again once the check updates.';
}

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy(): void }) {
  return (
    <div className="rounded-dd-lg border border-white/15 bg-white/10 p-3">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
        {label}
      </span>
      <div className="mt-1 flex items-center justify-between gap-3">
        <strong className="break-all text-lg">{value || 'Not available'}</strong>
        <IconButton
          label={`Copy ${label.toLowerCase()}`}
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
