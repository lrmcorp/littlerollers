'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type Booking,
  type BookingClient,
  type CustomerBookingOptions,
} from '../../booking-client';
import {
  ConfirmationPanel,
  EmptyState,
  Feedback,
  PageHeader,
  Skeleton,
  StatusBadge,
} from '../../ui';

const dateTime = (value: Date, timezone: string) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(value);

export function CustomerBookingFlow({ client = browserBookingClient }: { client?: BookingClient }) {
  const [options, setOptions] = useState<CustomerBookingOptions | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const intentKey = useRef(crypto.randomUUID());

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
      <EmptyState
        title={status === 'error' ? 'Kelas tidak dapat dibuka' : 'Pilih kelas terlebih dahulu'}
        description={message || 'Buka jadwal kelas dan pilih satu kelas yang ingin Anda ikuti.'}
      />
    );

  const { slot } = options;
  const purchaseUrl = `/packages?branch=${encodeURIComponent(slot.branchId)}&classType=${encodeURIComponent(slot.classTypeId)}&slot=${encodeURIComponent(slot.id)}`;

  return (
    <section className="customer-booking-flow" aria-labelledby="customer-booking-title">
      <PageHeader
        eyebrow="Booking kelas"
        title="Konfirmasi kelas Anda"
        titleId="customer-booking-title"
        description="Pilih paket aktif yang sesuai. Satu sesi baru direservasi setelah konfirmasi berhasil."
        context={
          <StatusBadge tone={slot.available > 0 ? 'success' : 'danger'}>
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
        <StatusBadge tone="info">{slot.status}</StatusBadge>
      </article>

      {options.packages.length === 0 ? (
        <div className="card">
          <Feedback kind="warning">
            Anda belum memiliki paket aktif dengan saldo yang sesuai untuk kelas ini.
          </Feedback>
          <Link className="customer-card-action" href={purchaseUrl}>
            Lihat paket yang sesuai
          </Link>
        </div>
      ) : (
        <form
          aria-label="Konfirmasi booking mandiri"
          onSubmit={(event) => {
            event.preventDefault();
            if (!selectedPackageId) return;
            setStatus('submitting');
            setMessage('');
            void client
              .create(
                {
                  classSlotId: slot.id,
                  customerPackageId: selectedPackageId,
                  source: 'SELF',
                },
                intentKey.current,
              )
              .then((result) => {
                setBooking(result);
                setStatus('ready');
                intentKey.current = crypto.randomUUID();
              })
              .catch(async (error) => {
                setMessage(await bookingFailure(error));
                setStatus('error');
              });
          }}
        >
          <fieldset>
            <legend>Pilih paket aktif</legend>
            {options.packages.map((item) => (
              <label className="customer-package-option" key={item.id}>
                <input
                  type="radio"
                  name="customerPackageId"
                  value={item.id}
                  checked={selectedPackageId === item.id}
                  onChange={() => setSelectedPackageId(item.id)}
                />
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.available} sesi tersedia · berlaku sampai{' '}
                    {item.expiryAt.toLocaleDateString('id-ID')}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <ConfirmationPanel title="Ringkasan booking">
            <p>
              {slot.classType.name} di {slot.branch.name}. Satu sesi akan direservasi dari paket
              terpilih.
            </p>
            <button disabled={status === 'submitting'} type="submit">
              {status === 'submitting' ? 'Mengonfirmasi…' : 'Konfirmasi booking'}
            </button>
          </ConfirmationPanel>
        </form>
      )}

      {booking && (
        <Feedback kind="status">
          Booking berhasil dibuat. <Link href="/bookings">Lihat booking saya</Link>
        </Feedback>
      )}
      {message && <Feedback kind="error">{message}</Feedback>}
    </section>
  );
}
