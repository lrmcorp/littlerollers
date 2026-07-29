'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarCheck2, CheckCircle2, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type Booking,
  type BookingClient,
  type CustomerBookingOptions,
} from '../../booking-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';
import { Button } from '../../components/actions';
import { Panel } from '../../components/admin/admin-ui';
import { controlClassName } from '../../components/forms';

const dateTime = (value: Date, timezone: string) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(value);

const eligibilityCopy = {
  IDENTITY_VERIFICATION_REQUIRED: {
    title: 'Verifikasi identitas diperlukan',
    description: 'Selfie dan KTP harus disetujui sebelum sesi dapat direservasi atas nama Anda.',
  },
  MATCHING_PACKAGE_REQUIRED: {
    title: 'Paket yang sesuai diperlukan',
    description: 'Anda belum memiliki paket aktif untuk studio dan tipe kelas ini.',
  },
  INSUFFICIENT_AVAILABLE_SESSION: {
    title: 'Saldo sesi belum mencukupi',
    description:
      'Paket yang sesuai tersedia, tetapi seluruh saldonya sudah terpakai atau direservasi.',
  },
  SLOT_FULL: {
    title: 'Kelas sudah penuh',
    description: 'Kapasitas kelas ini tidak lagi tersedia. Pilih jadwal lain untuk melanjutkan.',
  },
  SLOT_UNAVAILABLE: {
    title: 'Kelas tidak tersedia',
    description: 'Status kelas berubah dan booking tidak dapat dilanjutkan.',
  },
  BOOKING_CUTOFF_PASSED: {
    title: 'Waktu booking sudah ditutup',
    description: 'Hubungi studio jika Anda memerlukan bantuan untuk jadwal ini.',
  },
} as const;

const createIntent = () => ({ signature: '', key: crypto.randomUUID() });

export function CustomerBookingFlow({ client = browserBookingClient }: { client?: BookingClient }) {
  const [options, setOptions] = useState<CustomerBookingOptions | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const intent = useRef(createIntent());

  useEffect(() => {
    const slot = new URLSearchParams(window.location.search).get('slot');
    if (!slot) {
      setStatus('ready');
      return;
    }
    client
      .options(slot)
      .then((result) => {
        setOptions(result);
        setSelectedPackageId(result.packages[0]?.id ?? '');
        setStatus('ready');
      })
      .catch(async (error) => {
        setMessage(await bookingFailure(error));
        setStatus('error');
      });
  }, [client]);

  if (status === 'loading') return <Skeleton label="Memuat pilihan booking" />;
  if (!options)
    return (
      <section className="space-y-5">
        <EmptyState
          title={status === 'error' ? 'Kelas tidak dapat dibuka' : 'Pilih kelas terlebih dahulu'}
          description={message || 'Buka jadwal kelas dan pilih satu kelas yang ingin Anda ikuti.'}
        />
        <div className="flex flex-wrap gap-3">
          <Link className="customer-card-action" href="/classes#schedule">
            Kembali ke jadwal
          </Link>
          {status === 'error' && (
            <Link className="customer-card-action" href="/contact">
              Hubungi studio
            </Link>
          )}
        </div>
      </section>
    );

  const { slot } = options;
  const selectedPackage = options.packages.find(({ id }) => id === selectedPackageId);
  const purchaseUrl = `/packages?branch=${encodeURIComponent(slot.branchId)}&classType=${encodeURIComponent(slot.classTypeId)}&slot=${encodeURIComponent(slot.id)}`;
  const eligibility = options.eligibility;
  const eligibilityMessage = eligibility.reasonCode
    ? eligibilityCopy[eligibility.reasonCode]
    : null;

  return (
    <section className="customer-booking-flow" aria-labelledby="customer-booking-title">
      <PageHeader
        eyebrow="Booking kelas"
        title="Konfirmasi kelas Anda"
        titleId="customer-booking-title"
        description="Pilih paket aktif yang sesuai. Satu sesi baru direservasi setelah konfirmasi berhasil."
        context={
          <StatusBadge tone={eligibility.canBook ? 'success' : 'warning'}>
            {slot.available} tempat
          </StatusBadge>
        }
      />

      <article className="customer-selected-class">
        <div>
          <p className="eyebrow">{slot.branch.name}</p>
          <h2>{slot.classType.name}</h2>
          <p>{dateTime(slot.startAt, slot.timezone)}</p>
        </div>
        <StatusBadge tone="info">
          {slot.status === 'CONFIRMED' ? 'Kelas dikonfirmasi' : 'Terbuka untuk booking'}
        </StatusBadge>
      </article>

      {!eligibility.canBook && eligibilityMessage ? (
        <div className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
          <Feedback kind="warning">
            <strong className="block text-dd-ink">{eligibilityMessage.title}</strong>
            <span className="mt-1 block">{eligibilityMessage.description}</span>
          </Feedback>
          <div className="mt-4 flex flex-wrap gap-3">
            {eligibility.requiredAction === 'COMPLETE_IDENTITY_VERIFICATION' && (
              <Link className="customer-card-action" href="/account/verification">
                Selesaikan verifikasi
              </Link>
            )}
            {eligibility.requiredAction === 'BUY_MATCHING_PACKAGE' && (
              <Link className="customer-card-action" href={purchaseUrl}>
                Lihat paket yang sesuai
              </Link>
            )}
            {eligibility.requiredAction === 'CONTACT_STUDIO' && (
              <Link className="customer-card-action" href="/contact">
                Hubungi studio
              </Link>
            )}
            <Link className="customer-card-action" href="/classes#schedule">
              Pilih jadwal lain
            </Link>
          </div>
        </div>
      ) : booking ? (
        <section
          className="rounded-dd-xl border border-emerald-200 bg-dd-success-soft p-6 shadow-dd-card"
          aria-live="polite"
        >
          <CheckCircle2 className="size-9 text-dd-success" aria-hidden="true" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-dd-success">
            Booking berhasil
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{slot.classType.name}</h2>
          <p className="mt-2 text-sm leading-6 text-dd-success">
            {dateTime(slot.startAt, slot.timezone)} · {slot.branch.name}
          </p>
          <dl className="mt-5 grid gap-3 rounded-dd-lg bg-white/70 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-dd-muted">Referensi booking</dt>
              <dd className="mt-1 font-semibold">•{booking.id.slice(-8)}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Sisa sesi tersedia</dt>
              <dd className="mt-1 font-semibold">
                {selectedPackage?.projectedAvailable ?? 0} sesi
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="customer-card-action" href={`/bookings/${booking.id}`}>
              Lihat detail booking
            </Link>
            <Link className="customer-card-action" href="/classes#schedule">
              Kembali ke jadwal
            </Link>
          </div>
        </section>
      ) : (
        <form
          aria-label="Konfirmasi booking mandiri"
          onSubmit={(event) => {
            event.preventDefault();
            if (!selectedPackageId || step === 'select') {
              setStep('review');
              return;
            }
            setStatus('submitting');
            setMessage('');
            const signature = `${slot.id}:${selectedPackageId}`;
            if (intent.current.signature !== signature) {
              intent.current = { signature, key: crypto.randomUUID() };
            }
            void client
              .create(
                {
                  classSlotId: slot.id,
                  customerPackageId: selectedPackageId,
                  source: 'SELF',
                },
                intent.current.key,
              )
              .then((result) => {
                setBooking(result);
                setStatus('ready');
              })
              .catch(async (error) => {
                setMessage(await bookingFailure(error));
                setStatus('error');
              });
          }}
        >
          <ol className="grid grid-cols-2 gap-2 text-sm" aria-label="Tahapan booking">
            <li
              className={`rounded-full px-4 py-2 font-semibold ${step === 'select' ? 'bg-dd-forest text-white' : 'bg-dd-success-soft text-dd-success'}`}
            >
              1. Pilih paket
            </li>
            <li
              className={`rounded-full px-4 py-2 font-semibold ${step === 'review' ? 'bg-dd-forest text-white' : 'bg-dd-surface-muted text-dd-muted'}`}
            >
              2. Review
            </li>
          </ol>
          {step === 'select' ? (
            <>
              <fieldset>
                <legend>Pilih paket aktif</legend>
                {options.packages.map((item) => (
                  <label className="customer-package-option" key={item.id}>
                    <input
                      className={controlClassName}
                      type="radio"
                      name="customerPackageId"
                      value={item.id}
                      checked={selectedPackageId === item.id}
                      onChange={() => {
                        setSelectedPackageId(item.id);
                        intent.current = createIntent();
                      }}
                    />
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {item.available} sesi tersedia · setelah booking {item.projectedAvailable}{' '}
                        sesi · berlaku sampai {item.expiryAt.toLocaleDateString('id-ID')}
                      </small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <Button
                disabled={!selectedPackageId}
                type="submit"
                trailingIcon={<CalendarCheck2 className="size-4" aria-hidden="true" />}
              >
                Review booking
              </Button>
            </>
          ) : (
            <Panel
              className="border-amber-200 bg-dd-warning-soft p-4"
              aria-label="Review final booking"
            >
              <strong className="text-dd-warning">Review final booking</strong>
              <dl className="mt-3 grid gap-3 text-dd-ink sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-dd-muted">Kelas dan studio</dt>
                  <dd className="font-semibold">
                    {slot.classType.name} · {slot.branch.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-dd-muted">Jadwal</dt>
                  <dd className="font-semibold">{dateTime(slot.startAt, slot.timezone)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-dd-muted">Paket</dt>
                  <dd className="font-semibold">{selectedPackage?.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-dd-muted">Saldo tersedia</dt>
                  <dd className="font-semibold">
                    {selectedPackage?.available} → {selectedPackage?.projectedAvailable} sesi
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-amber-200 pt-3">
                Satu sesi akan direservasi. Reschedule dapat diajukan sampai tepat H-24.
              </p>
              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={status === 'submitting'}
                  leadingIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
                  onClick={() => setStep('select')}
                >
                  Kembali ubah paket
                </Button>
                <Button
                  disabled={status === 'submitting'}
                  loading={status === 'submitting'}
                  loadingLabel="Mengonfirmasi…"
                  type="submit"
                  leadingIcon={<CalendarCheck2 className="size-4" aria-hidden="true" />}
                >
                  Ya, konfirmasi booking
                </Button>
              </div>
            </Panel>
          )}
        </form>
      )}

      {message && <Feedback kind="error">{message}</Feedback>}
      {!booking && (
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline hover:underline"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Hubungi studio jika Anda memerlukan bantuan
        </Link>
      )}
    </section>
  );
}
