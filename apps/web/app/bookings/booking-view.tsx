'use client';
import { useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type Booking,
  type BookingClient,
} from '../booking-client';
import { ConfirmationPanel, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';

export function BookingView({ client = browserBookingClient }: { client?: BookingClient }) {
  const [branchId, setBranchId] = useActiveBranchState();
  const sessionContext = useSessionContext();
  const canCreate = !sessionContext || sessionContext.hasCapability('booking:create:assisted');
  const [items, setItems] = useState<Booking[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setMessage(undefined);
    setFailure(undefined);
    try {
      await action();
      setMessage(success);
    } catch (error) {
      setFailure(bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" aria-labelledby="bookings-title">
      <PageHeader
        eyebrow="Booking branch-scoped"
        title="Booking bantuan pelanggan"
        titleId="bookings-title"
        description="Satu konfirmasi memesan satu kursi dan mereservasi satu sesi. Cutoff synthetic H-2; otorisasi dan saldo tetap divalidasi backend."
        context={
          <>
            <StatusBadge tone="info">Admin / Manager</StatusBadge>
            <StatusBadge tone="warning">Synthetic H-2</StatusBadge>
          </>
        }
      />
      <label>
        ID cabang booking
        <input value={branchId} onChange={(event) => setBranchId(event.target.value)} />
      </label>
      <button
        disabled={busy || !branchId}
        onClick={() =>
          void run(async () => setItems(await client.list({ branchId })), 'Daftar booking dimuat.')
        }
      >
        Muat booking
      </button>

      <form
        aria-label="Buat booking bantuan"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void run(async () => {
            const booking = await client.create({
              classSlotId: String(data.get('classSlotId')),
              customerPackageId: String(data.get('customerPackageId')),
              customerUserId: String(data.get('customerUserId')),
              source: 'ADMIN_ASSISTED',
            });
            setItems((current) => [booking, ...current.filter(({ id }) => id !== booking.id)]);
          }, 'Booking dibuat; satu sesi telah direservasi.');
        }}
      >
        <h2>Konfirmasi booking bantuan</h2>
        <label>
          ID class slot
          <input name="classSlotId" required />
        </label>
        <label>
          ID customer
          <input name="customerUserId" required />
        </label>
        <label>
          ID customer package
          <input name="customerPackageId" required />
        </label>
        <ConfirmationPanel title="Konsekuensi reservasi">
          Konsekuensi: kapasitas kelas berkurang satu dan saldo tersedia ditahan satu sesi. Tidak
          ada debit ledger pada tahap booking.
        </ConfirmationPanel>
        <button type="submit" disabled={busy || !branchId || !canCreate}>
          Konfirmasi booking satu sesi
        </button>
      </form>

      {busy && <Skeleton label="Memproses booking" />}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      {message && !busy && <Feedback kind="status">{message}</Feedback>}
      <h2>Booking branch</h2>
      {items.length === 0 ? (
        <EmptyState
          title="Belum ada booking"
          description="Pilih cabang untuk memuat booking atau konfirmasi booking bantuan baru."
        />
      ) : (
        <ul aria-label="Daftar booking">
          {items.map((booking) => (
            <li key={booking.id}>
              <strong>{booking.status}</strong> · slot {booking.classSlotId} · package{' '}
              {booking.customerPackageId} · reservasi {booking.reservedQuantity} sesi
              {booking.idempotentReplay ? ' · replay idempotent' : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
