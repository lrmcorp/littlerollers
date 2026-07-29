'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type BookingClient,
  type CustomerBookingRecord,
  type CustomerRescheduleOptions,
} from '../../booking-client';
import { AlertBanner } from '../../components/app-feedback';
import { Button, ButtonLink } from '../../components/actions';
import { SearchSelect, SelectInput } from '../../components/forms';
import { Skeleton } from '../../ui';

const statusLabels: Record<string, string> = {
  BOOKED: 'Terjadwal',
  RESCHEDULE_PENDING: 'Perubahan jadwal diproses',
  CANCELLED: 'Dibatalkan',
  ATTENDED: 'Hadir',
  NO_SHOW: 'Tidak hadir',
};

const reasonLabels = {
  PERSONAL_UNAVAILABLE: 'Saya tidak dapat hadir pada jadwal semula',
  CUSTOMER_SCHEDULE_CONFLICT: 'Jadwal saya berbenturan',
  WRONG_CLASS_SELECTED: 'Saya memilih jadwal yang keliru',
} as const;

const dateTime = (value: Date, timezone: string) =>
  value.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

const newIntentKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `reschedule-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function BookingDetailView({
  id,
  client = browserBookingClient,
}: {
  id: string;
  client?: BookingClient;
}) {
  const [booking, setBooking] = useState<CustomerBookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [options, setOptions] = useState<CustomerRescheduleOptions | null>(null);
  const [targetId, setTargetId] = useState('');
  const [reasonCode, setReasonCode] = useState<keyof typeof reasonLabels>('PERSONAL_UNAVAILABLE');
  const [showForm, setShowForm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState('');
  const intentKey = useRef(newIntentKey());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const bookingResult = await client.detail(id);
      setBooking(bookingResult);
      try {
        const optionResult = await client.rescheduleOptions(id);
        setOptions(optionResult);
        setTargetId(optionResult.targets[0]?.id ?? '');
      } catch (cause) {
        setOptions(null);
        setError(await bookingFailure(cause));
      }
    } catch (cause) {
      setBooking(null);
      setError(await bookingFailure(cause));
    } finally {
      setLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-6">
        <Skeleton label="Memuat detail booking" />
      </section>
    );
  if (!booking)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-6">
        <h1 className="text-2xl font-semibold">Booking tidak tersedia</h1>
        {error && (
          <div className="mt-4">
            <AlertBanner tone="danger" title="Detail belum dapat dimuat" message={error} />
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/bookings">Kembali</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Hubungi studio
          </ButtonLink>
        </div>
      </section>
    );

  return (
    <main className="space-y-6" aria-labelledby="booking-detail-title">
      <header>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
        >
          <ArrowLeft className="size-4" />
          Booking Saya
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
          Detail booking
        </p>
        <h1 id="booking-detail-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
          {booking.classSlot?.classType.name ?? 'Kelas Daily Dose'}
        </h1>
        <p className="mt-2 text-sm text-dd-muted">
          {statusLabels[booking.status] ?? 'Status booking'} · Booking •{booking.id.slice(-8)}
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
          <CalendarDays className="size-6 text-dd-forest" />
          <h2 className="mt-4 text-lg font-semibold">Waktu kelas</h2>
          <p className="mt-2 text-sm leading-6 text-dd-muted">
            {booking.classSlot
              ? booking.classSlot.startAt.toLocaleString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: booking.classSlot.timezone,
                })
              : 'Jadwal tidak tersedia'}
          </p>
        </article>
        <article className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
          <MapPin className="size-6 text-dd-forest" />
          <h2 className="mt-4 text-lg font-semibold">Studio dan paket</h2>
          <p className="mt-2 text-sm leading-6 text-dd-muted">
            {booking.branch?.name ?? 'Studio Daily Dose'}
            <br />
            {booking.package?.name ?? 'Paket customer'}
          </p>
        </article>
      </section>
      {booking.attendance && (
        <AlertBanner
          tone="success"
          title="Kehadiran tercatat"
          message={`Check-in pada ${booking.attendance.checkedInAt.toLocaleString('id-ID')}.`}
        />
      )}
      {booking.status === 'BOOKED' && (
        <AlertBanner
          tone="info"
          title="Siap untuk kelas"
          message="Datang lebih awal dan tunjukkan QR check-in yang dikirim oleh studio."
        />
      )}
      {options?.latestRequest && (
        <AlertBanner
          tone={
            options.latestRequest.status === 'APPROVED'
              ? 'success'
              : options.latestRequest.status === 'REJECTED'
                ? 'danger'
                : 'warning'
          }
          title={
            options.latestRequest.status === 'APPROVED'
              ? 'Reschedule disetujui'
              : options.latestRequest.status === 'REJECTED'
                ? 'Reschedule ditolak'
                : 'Reschedule sedang ditinjau'
          }
          message={
            options.latestRequest.status === 'PENDING'
              ? 'Reservation tetap berada di kelas semula sampai tim studio memberikan keputusan.'
              : options.latestRequest.status === 'APPROVED'
                ? 'Booking Anda sudah dipindahkan ke jadwal baru.'
                : 'Booking tetap berada di jadwal semula. Hubungi studio bila Anda memerlukan bantuan.'
          }
        />
      )}
      {options?.supportAction === 'CONTACT_STUDIO' && (
        <div className="space-y-3">
          <AlertBanner
            tone="warning"
            title="Batas reschedule telah lewat"
            message={`Pengajuan ditutup pada ${dateTime(options.cutoffAt, booking.classSlot?.timezone ?? 'Asia/Jakarta')}. Hubungi studio untuk bantuan atau adjustment manual.`}
          />
          <ButtonLink href="/contact" variant="secondary">
            Hubungi studio
          </ButtonLink>
        </div>
      )}
      {rescheduleMessage && (
        <AlertBanner
          tone="success"
          title="Permintaan berhasil dikirim"
          message={rescheduleMessage}
        />
      )}
      {options?.canRequest && !showForm && (
        <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
          <h2 className="text-lg font-semibold">Perlu mengganti jadwal?</h2>
          <p className="mt-2 text-sm leading-6 text-dd-muted">
            Pengajuan dapat dibuat sampai tepat H-24. Reservation tetap di kelas ini selama
            permintaan ditinjau.
          </p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            Ajukan reschedule
          </Button>
        </section>
      )}
      {showForm && options?.canRequest && (
        <form
          className="space-y-5 rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card"
          aria-label="Pengajuan reschedule"
          onSubmit={(event) => {
            event.preventDefault();
            if (!targetId) return;
            if (!confirming) {
              setConfirming(true);
              return;
            }
            setSubmitting(true);
            setError('');
            void client
              .requestReschedule(
                {
                  bookingId: booking.id,
                  targetClassSlotId: targetId,
                  reasonCode,
                  expectedBookingVersion: options.bookingVersion,
                },
                intentKey.current,
              )
              .then(async () => {
                intentKey.current = newIntentKey();
                setRescheduleMessage(
                  'Tim studio akan meninjau jadwal tujuan. Anda akan menerima notifikasi setelah keputusan dibuat.',
                );
                setShowForm(false);
                setConfirming(false);
                await load();
              })
              .catch(async (cause) => {
                setError(await bookingFailure(cause));
                setConfirming(false);
              })
              .finally(() => setSubmitting(false));
          }}
        >
          <div>
            <h2 className="text-lg font-semibold">Pilih jadwal pengganti</h2>
            <p className="mt-1 text-sm text-dd-muted">
              Hanya jadwal yang masih memenuhi syarat ditampilkan.
            </p>
          </div>
          {options.targets.length ? (
            <>
              <SearchSelect
                label="Jadwal tujuan"
                value={targetId}
                options={options.targets.map((target) => ({
                  id: target.id,
                  label: dateTime(target.startAt, target.timezone),
                  description: `${target.availableCapacity} tempat tersedia`,
                }))}
                onChange={(value) => {
                  setTargetId(value);
                  setConfirming(false);
                }}
              />
              <SelectInput
                label="Alasan"
                value={reasonCode}
                onChange={(event) => {
                  setReasonCode(event.target.value as keyof typeof reasonLabels);
                  setConfirming(false);
                }}
              >
                {Object.entries(reasonLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectInput>
              {confirming && (
                <AlertBanner
                  tone="warning"
                  title="Konfirmasi perubahan jadwal"
                  message="Setelah dikirim, jadwal asal tetap berlaku sampai permintaan disetujui oleh studio."
                />
              )}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" loading={submitting} loadingLabel="Mengirim…">
                  {confirming ? 'Kirim permintaan' : 'Tinjau permintaan'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setConfirming(false);
                  }}
                >
                  Batal
                </Button>
              </div>
            </>
          ) : (
            <AlertBanner
              tone="warning"
              title="Belum ada jadwal pengganti"
              message="Tidak ada kelas dengan cabang dan jenis yang sama yang masih memiliki tempat."
            />
          )}
        </form>
      )}
      {error && (
        <AlertBanner tone="danger" title="Permintaan belum dapat diproses" message={error} />
      )}
    </main>
  );
}
