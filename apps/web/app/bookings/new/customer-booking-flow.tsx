'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Sparkles,
  Timer,
  UserCheck,
  UsersRound,
} from 'lucide-react';
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

  const durationMinutes = Math.max(
    15,
    Math.round((slot.endAt.getTime() - slot.startAt.getTime()) / 60_000),
  );

  return (
    <section className="customer-booking-flow space-y-6" aria-labelledby="customer-booking-title">
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

      {/* Selected Class Card with Comprehensive Schedule Information */}
      <article className="customer-selected-class rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-dd-forest uppercase tracking-wider">
              <MapPin className="size-3.5" />
              Studio {slot.branch.name}
            </span>
            <h2 className="mt-1 text-2xl font-bold text-dd-ink sm:text-3xl">
              {slot.classType.name}
            </h2>
            <p className="mt-1 text-sm text-dd-muted">
              {dateTime(slot.startAt, slot.timezone)}
            </p>
          </div>
          <StatusBadge tone={slot.status === 'CONFIRMED' ? 'success' : 'info'}>
            {slot.status === 'CONFIRMED' ? 'Kelas dikonfirmasi' : 'Terbuka untuk booking'}
          </StatusBadge>
        </div>

        {/* Fact Pills */}
        <div className="mt-5 flex flex-wrap gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dd-line bg-dd-paper px-3 py-1.5 font-medium text-dd-ink">
            <CalendarDays className="size-3.5 text-dd-forest" />
            {new Intl.DateTimeFormat('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: slot.timezone,
            }).format(slot.startAt)}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-dd-line bg-dd-paper px-3 py-1.5 font-medium text-dd-ink">
            <Clock3 className="size-3.5 text-dd-forest" />
            {new Intl.DateTimeFormat('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: slot.timezone,
            }).format(slot.startAt)}{' '}
            –{' '}
            {new Intl.DateTimeFormat('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: slot.timezone,
            }).format(slot.endAt)}{' '}
            WIB
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800">
            <Timer className="size-3.5 text-emerald-600" />
            Durasi {durationMinutes} Menit
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-dd-line bg-dd-paper px-3 py-1.5 font-medium text-dd-ink">
            <UserCheck className="size-3.5 text-dd-forest" />
            {slot.instructor?.displayName
              ? `Instruktur: ${slot.instructor.displayName}`
              : 'Instruktur: Tim Daily Dose'}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-dd-line bg-dd-paper px-3 py-1.5 font-medium text-dd-ink">
            <UsersRound className="size-3.5 text-dd-forest" />
            {slot.available} dari {slot.capacity} tempat tersisa
          </span>
        </div>

        {/* Quick Links */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-dd-line pt-3 text-xs">
          <Link
            href={`/schedule/${slot.id}`}
            className="font-semibold text-dd-forest hover:underline"
          >
            Lihat detail jadwal lengkap →
          </Link>
          <Link href="/classes#schedule" className="text-dd-muted hover:text-dd-forest">
            Ganti pilihan jadwal
          </Link>
        </div>
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
            <div className="mt-4 space-y-4">
              <fieldset>
                <legend className="text-base font-semibold text-dd-ink mb-3">Pilih paket aktif untuk sesi ini</legend>
                <div className="space-y-3">
                  {options.packages.map((item) => (
                    <label className="customer-package-option block rounded-dd-lg border border-dd-line bg-white p-4 cursor-pointer hover:border-dd-forest transition-colors" key={item.id}>
                      <div className="flex items-start gap-3">
                        <input
                          className={`${controlClassName} mt-1`}
                          type="radio"
                          name="customerPackageId"
                          value={item.id}
                          checked={selectedPackageId === item.id}
                          onChange={() => {
                            setSelectedPackageId(item.id);
                            intent.current = createIntent();
                          }}
                        />
                        <div className="flex-1">
                          <strong className="block text-base font-semibold text-dd-ink">{item.name}</strong>
                          <div className="mt-1 text-xs text-dd-muted">
                            <span className="font-medium text-dd-forest">{item.available} sesi tersedia</span>
                            {' · '}
                            setelah booking sisa {item.projectedAvailable} sesi
                            {' · '}
                            berlaku sampai {item.expiryAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="rounded-dd-sm bg-dd-paper p-3.5 text-xs leading-relaxed text-dd-muted">
                <Sparkles className="inline size-3.5 mr-1 text-dd-forest" />
                1 kuota sesi akan dipotong dari paket yang Anda pilih setelah konfirmasi booking berhasil.
              </div>

              <Button
                disabled={!selectedPackageId}
                type="submit"
                trailingIcon={<CalendarCheck2 className="size-4" aria-hidden="true" />}
              >
                Review booking
              </Button>
            </div>
          ) : (
            <Panel
              className="mt-4 border-amber-200 bg-dd-warning-soft p-5"
              aria-label="Review final booking"
            >
              <strong className="text-dd-warning text-base font-bold">Review final booking</strong>
              <dl className="mt-4 grid gap-3.5 text-dd-ink sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-dd-muted">Kelas dan studio</dt>
                  <dd className="font-semibold">
                    {slot.classType.name} · {slot.branch.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-dd-muted">Jadwal Sesi</dt>
                  <dd className="font-semibold">{dateTime(slot.startAt, slot.timezone)} ({durationMinutes} Menit)</dd>
                </div>
                <div>
                  <dt className="text-xs text-dd-muted">Instruktur</dt>
                  <dd className="font-semibold">{slot.instructor?.displayName ?? 'Tim Daily Dose'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-dd-muted">Paket Digunakan</dt>
                  <dd className="font-semibold">{selectedPackage?.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-dd-muted">Saldo Sesi</dt>
                  <dd className="font-semibold">
                    {selectedPackage?.available} → {selectedPackage?.projectedAvailable} sesi
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-amber-200/80 pt-3 text-xs leading-relaxed text-dd-muted">
                Satu sesi akan direservasi. Permohonan reschedule dapat diajukan secara mandiri sampai tepat H-24 sebelum sesi dimulai.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
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

