'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type Booking,
  type BookingClient,
  type BookingCustomer,
  type ClassSlot,
  type CheckInIssue,
  type CustomerPackageBalance,
  type Reschedule,
} from '../booking-client';
import { ConfirmationPanel, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';

const newIntentKey = () => crypto.randomUUID();
const shortId = (id: string) => id.slice(0, 8);

export function BookingView({
  client = browserBookingClient,
  activeBranchId,
}: {
  client?: BookingClient;
  activeBranchId?: string;
}) {
  const [contextBranchId] = useActiveBranchState();
  const branchId = activeBranchId ?? contextBranchId;
  const sessionContext = useSessionContext();
  const canRead = !sessionContext || sessionContext.hasCapability('booking:read');
  const canCreate = !sessionContext || sessionContext.hasCapability('booking:create:assisted');
  const canReview = !sessionContext || sessionContext.hasCapability('reschedule:read');
  const canDecide = !sessionContext || sessionContext.hasCapability('reschedule:decide');
  const [customers, setCustomers] = useState<BookingCustomer[]>([]);
  const [packages, setPackages] = useState<CustomerPackageBalance[]>([]);
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [items, setItems] = useState<Booking[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [reschedules, setReschedules] = useState<Reschedule[]>([]);
  const [rescheduleCursor, setRescheduleCursor] = useState<string | null>();
  const [reviewId, setReviewId] = useState('');
  const [rejectionCode, setRejectionCode] = useState<
    'TARGET_UNAVAILABLE' | 'OUTSIDE_POLICY' | 'OUT_OF_SCOPE'
  >('TARGET_UNAVAILABLE');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [checkInIssues, setCheckInIssues] = useState<Record<string, CheckInIssue>>({});
  const intentKey = useRef(newIntentKey());
  const decisionKey = useRef(newIntentKey());

  const resetIntent = () => {
    intentKey.current = newIntentKey();
    setMessage(undefined);
    setFailure(undefined);
  };

  useEffect(() => {
    setCustomers([]);
    setPackages([]);
    setSlots([]);
    setItems([]);
    setNextCursor(undefined);
    setReschedules([]);
    setRescheduleCursor(undefined);
    setReviewId('');
    setCustomerId('');
    setPackageId('');
    setSlotId('');
    resetIntent();
  }, [branchId]);

  const customerPackages = useMemo(
    () => packages.filter((item) => item.customerUserId === customerId),
    [customerId, packages],
  );
  const selectedPackage = packages.find(({ id }) => id === packageId);
  const eligibleSlots = useMemo(
    () => slots.filter((slot) => slot.classTypeId === selectedPackage?.classTypeId),
    [selectedPackage, slots],
  );
  const selectedSlot = slots.find(({ id }) => id === slotId);
  const selectedCustomer = customers.find(({ id }) => id === customerId);

  const loadWorkspace = async () => {
    if (!branchId || !canRead) return;
    setBusy(true);
    setFailure(undefined);
    setMessage(undefined);
    try {
      const [discovery, bookingPage, reschedulePage] = await Promise.all([
        client.discover(branchId),
        client.list({ branchId }),
        canReview
          ? client.listReschedules({ branchId, status: 'PENDING' })
          : Promise.resolve({ items: [], nextCursor: null }),
      ]);
      setCustomers(discovery.customers);
      setPackages(discovery.packages);
      setSlots(discovery.slots);
      setItems(bookingPage.items);
      setNextCursor(bookingPage.nextCursor);
      setReschedules(reschedulePage.items);
      setRescheduleCursor(reschedulePage.nextCursor);
      setMessage('Data booking siap digunakan.');
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  const loadMoreReschedules = async () => {
    if (!branchId || !rescheduleCursor || !canReview) return;
    setBusy(true);
    setFailure(undefined);
    try {
      const page = await client.listReschedules({
        branchId,
        status: 'PENDING',
        cursor: rescheduleCursor,
      });
      setReschedules((current) => [
        ...current,
        ...page.items.filter((item) => !current.some(({ id }) => id === item.id)),
      ]);
      setRescheduleCursor(page.nextCursor);
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  const decideReschedule = async (decision: 'approve' | 'reject') => {
    const selected = reschedules.find(({ id }) => id === reviewId);
    if (!selected || !canDecide) return;
    setBusy(true);
    setFailure(undefined);
    setMessage(undefined);
    try {
      const result = await client.decideReschedule(
        selected.id,
        decision,
        {
          reasonCode: decision === 'approve' ? 'ELIGIBILITY_VERIFIED' : rejectionCode,
          expectedVersion: selected.version,
        },
        decisionKey.current,
      );
      setReschedules((current) => current.filter(({ id }) => id !== selected.id));
      setItems((current) => [
        result.booking,
        ...current.filter(({ id }) => id !== result.booking.id),
      ]);
      setReviewId('');
      setMessage(
        result.idempotentReplay
          ? 'Keputusan authoritative ditemukan kembali; tidak ada pemindahan ganda.'
          : decision === 'approve'
            ? 'Reschedule disetujui dan reservation dipindahkan secara atomik.'
            : 'Reschedule ditolak; reservation tetap pada kelas sumber.',
      );
      decisionKey.current = newIntentKey();
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  const loadMore = async () => {
    if (!branchId || !nextCursor) return;
    setBusy(true);
    setFailure(undefined);
    try {
      const page = await client.list({ branchId, cursor: nextCursor });
      setItems((current) => [
        ...current,
        ...page.items.filter((item) => !current.some(({ id }) => id === item.id)),
      ]);
      setNextCursor(page.nextCursor);
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!selectedPackage || !selectedSlot || !selectedCustomer) return;
    setBusy(true);
    setFailure(undefined);
    setMessage(undefined);
    try {
      const booking = await client.create(
        {
          classSlotId: selectedSlot.id,
          customerPackageId: selectedPackage.id,
          customerUserId: selectedCustomer.id,
          source: 'ADMIN_ASSISTED',
        },
        intentKey.current,
      );
      setItems((current) => [booking, ...current.filter(({ id }) => id !== booking.id)]);
      setMessage(
        booking.idempotentReplay
          ? 'Booking sebelumnya ditemukan kembali; tidak ada reservasi ganda.'
          : 'Booking dibuat; satu sesi telah direservasi.',
      );
      intentKey.current = newIntentKey();
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  const issueCheckIn = async (booking: Booking) => {
    if (!canCreate || booking.status !== 'BOOKED') return;
    setBusy(true);
    setFailure(undefined);
    try {
      if (!client.issueCheckIn) return;
      const issue = await client.issueCheckIn(booking.id, booking.version, crypto.randomUUID());
      setCheckInIssues((current) => ({ ...current, [booking.id]: issue }));
      setMessage(
        issue.idempotentReplay
          ? 'Pass QR sebelumnya ditemukan kembali.'
          : 'Pass QR berhasil dibuat.',
      );
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  if (!branchId)
    return (
      <section
        className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
        aria-labelledby="bookings-title"
      >
        <PageHeader
          eyebrow="Booking branch-scoped"
          title="Booking bantuan pelanggan"
          titleId="bookings-title"
          description="Pilih cabang aktif sebelum membuka data booking."
        />
        <EmptyState
          title="Pilih cabang aktif"
          description="Pilih cabang dari bagian atas workspace sebelum membuka data atau membuat booking."
        />
      </section>
    );

  return (
    <section
      className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
      aria-labelledby="bookings-title"
    >
      <PageHeader
        eyebrow="Booking branch-scoped"
        title="Booking bantuan pelanggan"
        titleId="bookings-title"
        description="Pilih pelanggan, paket, dan kelas yang tersedia. Backend tetap memvalidasi cutoff, saldo, kapasitas, dan scope saat konfirmasi."
        context={
          <>
            <StatusBadge tone="info">Cabang {shortId(branchId)}</StatusBadge>
            <StatusBadge tone="warning">Kebijakan H-2</StatusBadge>
          </>
        }
      />
      <button disabled={busy || !canRead} onClick={() => void loadWorkspace()}>
        Muat data booking
      </button>
      {!canRead && (
        <Feedback kind="error">Anda tidak memiliki akses untuk melihat booking.</Feedback>
      )}

      {canCreate && (
        <form
          aria-label="Buat booking bantuan"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <h2>Konfirmasi booking bantuan</h2>
          <label>
            Pelanggan
            <select
              aria-label="Pelanggan"
              value={customerId}
              disabled={busy || customers.length === 0}
              onChange={(event) => {
                setCustomerId(event.target.value);
                setPackageId('');
                setSlotId('');
                resetIntent();
              }}
            >
              <option value="">Pilih pelanggan</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.displayName} · {shortId(customer.id)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Paket pelanggan
            <select
              aria-label="Paket pelanggan"
              value={packageId}
              disabled={busy || !customerId || customerPackages.length === 0}
              onChange={(event) => {
                setPackageId(event.target.value);
                setSlotId('');
                resetIntent();
              }}
            >
              <option value="">Pilih paket aktif</option>
              {customerPackages.map((item) => (
                <option key={item.id} value={item.id}>
                  Paket {shortId(item.packageId)} · tersedia {item.available} sesi
                </option>
              ))}
            </select>
          </label>
          <label>
            Kelas
            <select
              aria-label="Kelas"
              value={slotId}
              disabled={busy || !packageId || eligibleSlots.length === 0}
              onChange={(event) => {
                setSlotId(event.target.value);
                resetIntent();
              }}
            >
              <option value="">Pilih jadwal kelas</option>
              {eligibleSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {new Intl.DateTimeFormat('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: slot.timezone,
                  }).format(slot.startAt)}{' '}
                  · {slot.bookedCount}/{slot.capacity}
                </option>
              ))}
            </select>
          </label>
          {customerId && customerPackages.length === 0 && (
            <Feedback kind="status">
              Pelanggan tidak memiliki paket aktif dengan saldo tersedia.
            </Feedback>
          )}
          {packageId && eligibleSlots.length === 0 && (
            <Feedback kind="status">Tidak ada kelas eligible untuk tipe paket ini.</Feedback>
          )}
          {selectedPackage && selectedSlot && selectedCustomer && (
            <ConfirmationPanel title="Konsekuensi reservasi">
              <strong>{selectedCustomer.displayName}</strong> akan memakai paket{' '}
              {shortId(selectedPackage.packageId)} untuk kelas pada{' '}
              {new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short',
                timeZone: selectedSlot.timezone,
              }).format(selectedSlot.startAt)}{' '}
              ({selectedSlot.timezone}). Saldo tersedia berubah dari {selectedPackage.available}{' '}
              menjadi {selectedPackage.available - 1}; kapasitas menjadi{' '}
              {selectedSlot.bookedCount + 1}/{selectedSlot.capacity}. Tidak ada debit ledger pada
              tahap booking.
            </ConfirmationPanel>
          )}
          <button
            type="submit"
            disabled={busy || !selectedPackage || !selectedSlot || !selectedCustomer}
          >
            Konfirmasi booking satu sesi
          </button>
        </form>
      )}

      {busy && <Skeleton label="Memproses booking" />}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      {message && !busy && <Feedback kind="status">{message}</Feedback>}
      {canReview && (
        <section aria-labelledby="reschedule-queue-title">
          <h2 id="reschedule-queue-title">Queue reschedule H-24</h2>
          {reschedules.length === 0 ? (
            <EmptyState
              title="Tidak ada reschedule pending"
              description="Request pelanggan yang masih menunggu keputusan akan tampil di sini."
            />
          ) : (
            <ul aria-label="Queue reschedule">
              {reschedules.map((reschedule) => {
                const source = slots.find(({ id }) => id === reschedule.sourceClassSlotId);
                const target = slots.find(({ id }) => id === reschedule.targetClassSlotId);
                return (
                  <li key={reschedule.id}>
                    <strong>{reschedule.status}</strong> · booking {shortId(reschedule.bookingId)} ·{' '}
                    sumber {source ? shortId(source.id) : shortId(reschedule.sourceClassSlotId)} →
                    target {target ? shortId(target.id) : shortId(reschedule.targetClassSlotId)} ·
                    alasan {reschedule.requestReasonCode}
                    <button
                      disabled={!canDecide || busy}
                      onClick={() => {
                        setReviewId(reschedule.id);
                        decisionKey.current = newIntentKey();
                      }}
                    >
                      Tinjau reschedule {shortId(reschedule.id)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {rescheduleCursor && (
            <button disabled={busy} onClick={() => void loadMoreReschedules()}>
              Muat reschedule berikutnya
            </button>
          )}
          {reviewId && (
            <ConfirmationPanel title="Keputusan reschedule">
              Approval memindahkan reservation dari kelas sumber ke target secara atomik. Rejection
              mempertahankan reservation sumber dan tidak mengubah ledger.
              <label>
                Alasan penolakan
                <select
                  value={rejectionCode}
                  onChange={(event) =>
                    setRejectionCode(
                      event.target.value as
                        'TARGET_UNAVAILABLE' | 'OUTSIDE_POLICY' | 'OUT_OF_SCOPE',
                    )
                  }
                >
                  <option value="TARGET_UNAVAILABLE">Target tidak tersedia</option>
                  <option value="OUTSIDE_POLICY">Di luar kebijakan reschedule</option>
                  <option value="OUT_OF_SCOPE">Di luar scope cabang</option>
                </select>
              </label>
              <button disabled={busy} onClick={() => void decideReschedule('approve')}>
                Setujui reschedule
              </button>
              <button disabled={busy} onClick={() => void decideReschedule('reject')}>
                Tolak reschedule
              </button>
            </ConfirmationPanel>
          )}
        </section>
      )}
      <h2>Riwayat booking cabang</h2>
      {items.length === 0 ? (
        <EmptyState
          title="Belum ada booking"
          description="Muat data untuk melihat histori cabang ini."
        />
      ) : (
        <ul aria-label="Daftar booking">
          {items.map((booking) => (
            <li key={booking.id}>
              <strong>{booking.status}</strong> · kelas {shortId(booking.classSlotId)} · paket{' '}
              {shortId(booking.customerPackageId)} · reservasi {booking.reservedQuantity} sesi
              {booking.idempotentReplay ? ' · replay authoritative' : ''}
              {booking.status === 'BOOKED' && canCreate && (
                <span className="ml-3 inline-flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => void issueCheckIn(booking)}>
                    Buat/Kirim QR
                  </button>
                  {checkInIssues[booking.id]?.whatsappUrl && (
                    <a
                      className="button-quiet"
                      href={checkInIssues[booking.id]?.whatsappUrl ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka WhatsApp
                    </a>
                  )}
                  {checkInIssues[booking.id]?.passUrl && (
                    <>
                      <a
                        className="button-quiet"
                        href={checkInIssues[booking.id]?.passUrl ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Buka pass
                      </a>
                      <button
                        type="button"
                        className="button-quiet"
                        onClick={() =>
                          void navigator.clipboard.writeText(
                            checkInIssues[booking.id]?.passUrl ?? '',
                          )
                        }
                      >
                        Salin link
                      </button>
                    </>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {nextCursor && (
        <button disabled={busy} onClick={() => void loadMore()}>
          Muat booking berikutnya
        </button>
      )}
    </section>
  );
}
