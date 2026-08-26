'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck2, Plus, RefreshCw, Search } from 'lucide-react';
import {
  bookingFailure,
  browserBookingClient,
  type BookingClient,
  type BookingCustomer,
  type ClassSlot,
  type CheckInIssue,
  type CustomerBookingRecord,
  type CustomerPackageBalance,
  type ManagementReschedule,
} from '@/api-clients/booking-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { DateInput, SearchInput, SearchSelect, SelectInput } from '../components/forms';
import { Button } from '../components/actions';
import { Drawer, useAppFeedback } from '../components/app-feedback';
import {
  Badge,
  DataTable,
  FilterBar,
  Pagination,
  Panel,
  StatCard,
  Tabs,
} from '../components/admin/admin-ui';

const newIntentKey = () => crypto.randomUUID();
const shortId = (id: string) => id.slice(0, 8);

export function BookingView({
  client = browserBookingClient,
  activeBranchId,
  access,
  initialTab = 'bookings',
  onTabChange,
  initialFilters,
  onFiltersChange,
  initialCursor,
  onCursorChange,
  initialRescheduleCursor,
  onRescheduleCursorChange,
}: {
  client?: BookingClient;
  activeBranchId?: string;
  access?: { canRead: boolean; canCreate: boolean; canReview: boolean; canDecide: boolean };
  initialTab?: 'bookings' | 'reschedules' | 'attendance';
  onTabChange?(value: 'bookings' | 'reschedules' | 'attendance'): void;
  initialFilters?: {
    q?: string;
    status?: string;
    from?: string;
    until?: string;
    classSlotId?: string;
    rosterStatus?: string;
  };
  onFiltersChange?(value: {
    q: string;
    status: string;
    from: string;
    until: string;
    classSlotId: string;
    rosterStatus: string;
  }): void;
  initialCursor?: string;
  onCursorChange?(cursor?: string): void;
  initialRescheduleCursor?: string;
  onRescheduleCursorChange?(cursor?: string): void;
}) {
  const [contextBranchId] = useActiveBranchState();
  const branchId = activeBranchId ?? contextBranchId;
  const sessionContext = useSessionContext();
  const feedback = useAppFeedback();
  const fixtureClient = client !== browserBookingClient;
  const injectedAccess =
    access ??
    (fixtureClient && activeBranchId !== undefined
      ? { canRead: true, canCreate: true, canReview: true, canDecide: true }
      : undefined);
  const canRead =
    injectedAccess?.canRead ??
    (sessionContext?.status === 'authenticated' && sessionContext.hasCapability('booking:read'));
  const canCreate =
    injectedAccess?.canCreate ??
    (sessionContext?.status === 'authenticated' &&
      sessionContext.hasCapability('booking:create:assisted'));
  const canReview =
    injectedAccess?.canReview ??
    (sessionContext?.status === 'authenticated' && sessionContext.hasCapability('reschedule:read'));
  const canDecide =
    injectedAccess?.canDecide ??
    (sessionContext?.status === 'authenticated' &&
      sessionContext.hasCapability('reschedule:decide'));
  const canManageAttendance =
    injectedAccess?.canCreate ??
    (sessionContext?.status === 'authenticated' &&
      sessionContext.hasCapability('attendance:manage'));
  const [customers, setCustomers] = useState<BookingCustomer[]>([]);
  const [packages, setPackages] = useState<CustomerPackageBalance[]>([]);
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [items, setItems] = useState<CustomerBookingRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    booked: 0,
    reschedulePending: 0,
    attended: 0,
    cancelled: 0,
    noShow: 0,
  });
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status ?? '');
  const [search, setSearch] = useState(initialFilters?.q ?? '');
  const [from, setFrom] = useState(initialFilters?.from ?? '');
  const [until, setUntil] = useState(initialFilters?.until ?? '');
  const [rosterSlotId, setRosterSlotId] = useState(initialFilters?.classSlotId ?? '');
  const [rosterStatus, setRosterStatus] = useState(initialFilters?.rosterStatus ?? '');
  const [selectedRosterIds, setSelectedRosterIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'reschedules' | 'attendance'>(initialTab);
  const [createOpen, setCreateOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [reschedules, setReschedules] = useState<ManagementReschedule[]>([]);
  const [rescheduleCursor, setRescheduleCursor] = useState<string | null>();
  const [reviewId, setReviewId] = useState('');
  const [rejectionCode, setRejectionCode] = useState<
    'TARGET_UNAVAILABLE' | 'OUTSIDE_POLICY' | 'OUT_OF_SCOPE'
  >('TARGET_UNAVAILABLE');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const createDirty = Boolean(customerId || packageId || slotId);
  const [checkInIssues, setCheckInIssues] = useState<Record<string, CheckInIssue>>({});
  const intentKey = useRef(newIntentKey());
  const decisionKey = useRef(newIntentKey());
  const lastFilterSignature = useRef(
    JSON.stringify({
      q: initialFilters?.q ?? '',
      status: initialFilters?.status ?? '',
      from: initialFilters?.from ?? '',
      until: initialFilters?.until ?? '',
      classSlotId: initialFilters?.classSlotId ?? '',
      rosterStatus: initialFilters?.rosterStatus ?? '',
    }),
  );

  useEffect(() => setActiveTab(initialTab), [initialTab]);
  useEffect(() => setCursor(initialCursor), [initialCursor]);
  useEffect(() => {
    const next = {
      q: initialFilters?.q ?? '',
      status: initialFilters?.status ?? '',
      from: initialFilters?.from ?? '',
      until: initialFilters?.until ?? '',
      classSlotId: initialFilters?.classSlotId ?? '',
      rosterStatus: initialFilters?.rosterStatus ?? '',
    };
    lastFilterSignature.current = JSON.stringify(next);
    setSearch(next.q);
    setStatusFilter(next.status);
    setFrom(next.from);
    setUntil(next.until);
    setRosterSlotId(next.classSlotId);
    setRosterStatus(next.rosterStatus);
  }, [
    initialFilters?.classSlotId,
    initialFilters?.from,
    initialFilters?.q,
    initialFilters?.rosterStatus,
    initialFilters?.status,
    initialFilters?.until,
  ]);
  useEffect(() => {
    if (!onFiltersChange) return;
    const value = {
      q: search.trim(),
      status: statusFilter,
      from,
      until,
      classSlotId: rosterSlotId,
      rosterStatus,
    };
    const signature = JSON.stringify(value);
    if (signature === lastFilterSignature.current) return;
    setCursor(undefined);
    setCursorHistory([]);
    const timer = window.setTimeout(() => {
      lastFilterSignature.current = signature;
      onFiltersChange(value);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [from, onFiltersChange, rosterSlotId, rosterStatus, search, statusFilter, until]);

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
    setSelectedRosterIds([]);
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
    if (!canRead) return;
    setBusy(true);
    setFailure(undefined);
    setMessage(undefined);
    try {
      const [discovery, bookingPage, reschedulePage] = await Promise.all([
        branchId
          ? client.discover(branchId)
          : Promise.resolve({ customers: [], packages: [], slots: [] }),
        client.list({
          branchId: branchId || undefined,
          status:
            activeTab === 'attendance' ? rosterStatus || undefined : statusFilter || undefined,
          q: search.trim() || undefined,
          from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
          until: until ? new Date(`${until}T23:59:59.999`).toISOString() : undefined,
          cursor,
          classSlotId: activeTab === 'attendance' ? rosterSlotId || undefined : undefined,
        }),
        canReview
          ? client.listReschedules({
              branchId: branchId || undefined,
              status: 'PENDING',
              cursor: initialRescheduleCursor,
            })
          : Promise.resolve({ items: [], nextCursor: null }),
      ]);
      setCustomers(discovery.customers);
      setPackages(discovery.packages);
      setSlots(discovery.slots);
      setItems(bookingPage.items);
      if (bookingPage.summary) setSummary(bookingPage.summary);
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

  useEffect(() => {
    const timer = window.setTimeout(() => void loadWorkspace(), 0);
    return () => window.clearTimeout(timer);
    // Data follows global branch and the active status filter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    branchId,
    statusFilter,
    search,
    from,
    until,
    rosterSlotId,
    rosterStatus,
    activeTab,
    canRead,
    cursor,
    initialRescheduleCursor,
  ]);

  const loadMoreReschedules = async () => {
    if (!rescheduleCursor || !canReview) return;
    setBusy(true);
    setFailure(undefined);
    try {
      const cursor = rescheduleCursor;
      const page = await client.listReschedules({
        branchId: branchId || undefined,
        status: 'PENDING',
        cursor,
      });
      setReschedules((current) => [
        ...current,
        ...page.items.filter((item) => !current.some(({ id }) => id === item.id)),
      ]);
      setRescheduleCursor(page.nextCursor);
      onRescheduleCursorChange?.(cursor);
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  const decideReschedule = async (decision: 'approve' | 'reject') => {
    const selected = reschedules.find(({ id }) => id === reviewId);
    if (!selected || !canDecide || !branchId) return;
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
      await loadWorkspace();
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

  const openNextPage = () => {
    if (!nextCursor || busy) return;
    setCursorHistory((current) => [...current, cursor ?? '']);
    setCursor(nextCursor);
    onCursorChange?.(nextCursor);
  };

  const openPreviousPage = () => {
    if (cursorHistory.length === 0 || busy) return;
    const previous = cursorHistory.at(-1) ?? '';
    setCursorHistory((current) => current.slice(0, -1));
    setCursor(previous || undefined);
    onCursorChange?.(previous || undefined);
  };

  const submit = async () => {
    if (!selectedPackage || !selectedSlot || !selectedCustomer) return;
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: 'Buat booking manual?',
      message: `${selectedCustomer.displayName} akan memperoleh satu reservasi pada kelas terpilih dan saldo tersedia berkurang satu sesi.`,
      confirmLabel: 'Buat booking',
    });
    if (!accepted) return;
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
      await loadWorkspace();
      setMessage(
        booking.idempotentReplay
          ? 'Booking sebelumnya ditemukan kembali; tidak ada reservasi ganda.'
          : 'Booking dibuat; satu sesi telah direservasi.',
      );
      intentKey.current = newIntentKey();
      setCustomerId('');
      setPackageId('');
      setSlotId('');
      setCreateOpen(false);
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };
  const confirmDiscardCreate = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan booking manual?',
      message: 'Pilihan customer, paket, dan kelas akan dikosongkan.',
      confirmLabel: 'Buang pilihan',
    });
  const closeCreate = async () => {
    if (!createDirty || (await confirmDiscardCreate())) {
      setCustomerId('');
      setPackageId('');
      setSlotId('');
      setCreateOpen(false);
    }
  };

  const issueCheckIn = async (booking: CustomerBookingRecord) => {
    if (!canManageAttendance || !branchId || booking.status !== 'BOOKED') return;
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

  const issueBulkCheckIn = async () => {
    if (!canManageAttendance || !branchId || !rosterSlotId || selectedRosterIds.length === 0)
      return;
    if (!client.issueBulkCheckIns) return;
    setBusy(true);
    setFailure(undefined);
    try {
      const result = await client.issueBulkCheckIns(
        rosterSlotId,
        selectedRosterIds,
        newIntentKey(),
      );
      const successes = result.items.filter((item) => item.ok && item.result);
      setCheckInIssues((current) => {
        const next = { ...current };
        for (const item of successes) next[item.bookingId] = item.result!;
        return next;
      });
      setSelectedRosterIds([]);
      const failed = result.items.length - successes.length;
      setMessage(
        failed
          ? `${successes.length} QR diterbitkan, ${failed} peserta memerlukan peninjauan.`
          : `${successes.length} QR berhasil diterbitkan.`,
      );
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  const revokeCheckIn = async (booking: CustomerBookingRecord) => {
    const token = booking.checkInToken;
    if (
      !canManageAttendance ||
      !branchId ||
      !token ||
      token.status !== 'ACTIVE' ||
      !client.revokeCheckIn
    )
      return;
    setBusy(true);
    setFailure(undefined);
    try {
      const result = await client.revokeCheckIn(
        token.id,
        token.version,
        'QR tidak lagi diperlukan oleh operasional',
        newIntentKey(),
      );
      setCheckInIssues((current) => ({ ...current, [booking.id]: result }));
      setMessage('QR berhasil dicabut.');
    } catch (error) {
      setFailure(await bookingFailure(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-5" aria-labelledby="bookings-title">
      <PageHeader
        eyebrow="Operasional booking"
        title="Manajemen Booking"
        titleId="bookings-title"
        description="Pilih pelanggan, paket, dan kelas yang tersedia. Backend tetap memvalidasi cutoff, saldo, kapasitas, dan scope saat konfirmasi."
        context={
          <>
            <StatusBadge tone="info">
              {branchId
                ? (sessionContext?.activeBranch?.name ?? 'Cabang aktif')
                : 'Semua cabang yang diizinkan'}
            </StatusBadge>
            <StatusBadge tone="warning">Kebijakan H-2</StatusBadge>
            <Button
              type="button"
              variant="secondary"
              leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
              disabled={busy || !canRead}
              onClick={() => void loadWorkspace()}
            >
              Segarkan
            </Button>
            {canCreate && (
              <Button
                type="button"
                leadingIcon={<Plus className="size-4" aria-hidden="true" />}
                disabled={!branchId}
                title={!branchId ? 'Pilih cabang dari topbar untuk membuat booking' : undefined}
                onClick={() => setCreateOpen(true)}
              >
                Buat booking manual
              </Button>
            )}
          </>
        }
      />
      {!branchId && canCreate && (
        <Panel className="border-dd-brass/40 bg-dd-brass-soft/35 p-4 text-sm text-dd-warning">
          Mode semua cabang bersifat baca saja. Pilih cabang dari topbar untuk membuat booking,
          memutus reschedule, atau menerbitkan QR.
        </Panel>
      )}
      {!canRead && (
        <Feedback kind="error">Anda tidak memiliki akses untuk melihat booking.</Feedback>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total booking" value={summary.total.toLocaleString('id-ID')} />
        <StatCard label="Aktif" value={summary.booked.toLocaleString('id-ID')} tone="success" />
        <StatCard
          label="Reschedule"
          value={summary.reschedulePending.toLocaleString('id-ID')}
          tone="warning"
        />
        <StatCard label="Sudah hadir" value={summary.attended.toLocaleString('id-ID')} />
      </div>

      <Tabs
        value={activeTab}
        onChange={(value) => {
          const next = value as 'bookings' | 'reschedules' | 'attendance';
          setCursor(undefined);
          setCursorHistory([]);
          setActiveTab(next);
          onTabChange?.(next);
        }}
        items={[
          { value: 'bookings', label: 'Booking', count: summary.total },
          {
            value: 'reschedules',
            label: 'Antrean Reschedule',
            count: summary.reschedulePending,
          },
          ...(sessionContext?.hasCapability('attendance:read')
            ? [{ value: 'attendance', label: 'Check-in & Kehadiran', count: summary.attended }]
            : []),
        ]}
      />

      {activeTab === 'bookings' && (
        <FilterBar>
          <SearchInput
            label="Cari booking"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Customer, paket, kelas, atau studio"
            leadingIcon={<Search className="size-4" aria-hidden="true" />}
            wrapperClassName="min-w-64 flex-1"
          />
          <SelectInput
            label="Status booking"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            wrapperClassName="min-w-48"
          >
            <option value="">Semua status</option>
            <option value="BOOKED">Aktif</option>
            <option value="RESCHEDULE_PENDING">Menunggu reschedule</option>
            <option value="ATTENDED">Sudah hadir</option>
            <option value="CANCELLED">Dibatalkan</option>
            <option value="NO_SHOW">Tidak hadir</option>
          </SelectInput>
          <DateInput
            label="Dari tanggal"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            wrapperClassName="min-w-44"
          />
          <DateInput
            label="Sampai tanggal"
            value={until}
            onChange={(event) => setUntil(event.target.value)}
            wrapperClassName="min-w-44"
          />
          {(search || statusFilter || from || until) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setFrom('');
                setUntil('');
              }}
            >
              Reset filter
            </Button>
          )}
        </FilterBar>
      )}

      <Drawer
        open={createOpen && canCreate && Boolean(branchId)}
        title="Buat booking manual"
        description="Pilih customer, paket aktif, dan kelas dalam cabang operasional."
        busy={busy}
        dirty={createDirty}
        onDirtyClose={confirmDiscardCreate}
        onClose={() => {
          setCustomerId('');
          setPackageId('');
          setSlotId('');
          setCreateOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void closeCreate()}
              disabled={busy}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="assisted-booking-form"
              loading={busy}
              disabled={!selectedPackage || !selectedSlot || !selectedCustomer}
              leadingIcon={<Plus className="size-4" aria-hidden="true" />}
            >
              Konfirmasi booking satu sesi
            </Button>
          </div>
        }
      >
        <form
          id="assisted-booking-form"
          className="grid gap-4"
          aria-label="Buat booking bantuan"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <p className="text-sm leading-6 text-dd-muted">
            Pilih customer, paket aktif, dan kelas dalam cabang{' '}
            <strong>{sessionContext?.activeBranch?.name ?? 'aktif'}</strong>. Sistem memeriksa
            saldo, kapasitas, dan cutoff kembali saat konfirmasi.
          </p>
          <SearchSelect
            label="Pelanggan"
            value={customerId}
            disabled={busy || customers.length === 0}
            placeholder="Pilih pelanggan"
            options={customers.map((customer) => ({
              id: customer.id,
              label: customer.displayName,
              description:
                customer.phoneMasked ??
                `${customer.eligiblePackageCount ?? 0} paket dapat digunakan`,
            }))}
            onChange={(value) => {
              setCustomerId(value);
              setPackageId('');
              setSlotId('');
              resetIntent();
            }}
          />
          <SearchSelect
            label="Paket pelanggan"
            value={packageId}
            disabled={busy || !customerId || customerPackages.length === 0}
            placeholder="Pilih paket aktif"
            options={customerPackages.map((item) => ({
              id: item.id,
              label: `Paket aktif · ${item.available} sesi tersedia`,
              description: `${item.reserved} sesi direservasi`,
            }))}
            onChange={(value) => {
              setPackageId(value);
              setSlotId('');
              resetIntent();
            }}
          />
          <SearchSelect
            label="Kelas"
            value={slotId}
            disabled={busy || !packageId || eligibleSlots.length === 0}
            placeholder="Pilih jadwal kelas"
            options={eligibleSlots.map((slot) => ({
              id: slot.id,
              label: new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: slot.timezone,
              }).format(slot.startAt),
              description: `${slot.bookedCount}/${slot.capacity} peserta`,
            }))}
            onChange={(value) => {
              setSlotId(value);
              resetIntent();
            }}
          />
          {customerId && customerPackages.length === 0 && (
            <Feedback kind="status">
              Pelanggan tidak memiliki paket aktif dengan saldo tersedia.
            </Feedback>
          )}
          {packageId && eligibleSlots.length === 0 && (
            <Feedback kind="status">Tidak ada kelas eligible untuk tipe paket ini.</Feedback>
          )}
          {selectedPackage && selectedSlot && selectedCustomer && (
            <Panel
              className="border-amber-200 bg-dd-warning-soft p-4 text-sm text-dd-warning"
              aria-label="Konsekuensi reservasi"
            >
              <strong className="mb-1 block">Konsekuensi reservasi</strong>
              <strong>{selectedCustomer.displayName}</strong> akan memakai paket aktif untuk kelas
              pada{' '}
              {new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short',
                timeZone: selectedSlot.timezone,
              }).format(selectedSlot.startAt)}{' '}
              ({selectedSlot.timezone}). Saldo tersedia berubah dari {selectedPackage.available}{' '}
              menjadi {selectedPackage.available - 1}; kapasitas menjadi{' '}
              {selectedSlot.bookedCount + 1}/{selectedSlot.capacity}. Tidak ada debit ledger pada
              tahap booking.
            </Panel>
          )}
        </form>
      </Drawer>

      {busy && <Skeleton label="Memproses booking" />}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      {message && !busy && <Feedback kind="status">{message}</Feedback>}
      {canReview && activeTab === 'reschedules' && (
        <section aria-labelledby="reschedule-queue-title">
          <div className="mb-4">
            <h2 id="reschedule-queue-title" className="text-xl font-semibold text-dd-ink">
              Antrean reschedule
            </h2>
            <p className="mt-1 text-sm text-dd-muted">
              Permintaan tertua ditinjau lebih dahulu. Pilih cabang untuk mengambil keputusan.
            </p>
          </div>
          {reschedules.length === 0 ? (
            <EmptyState
              title="Tidak ada reschedule pending"
              description="Request pelanggan yang masih menunggu keputusan akan tampil di sini."
            />
          ) : (
            <ul className="grid gap-3" aria-label="Antrean reschedule">
              {reschedules.map((reschedule) => {
                const source =
                  reschedule.sourceClassSlot ??
                  slots.find(({ id }) => id === reschedule.sourceClassSlotId);
                const target =
                  reschedule.targetClassSlot ??
                  slots.find(({ id }) => id === reschedule.targetClassSlotId);
                return (
                  <li
                    key={reschedule.id}
                    className="rounded-dd-lg border border-dd-line bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <strong className="block">
                          {reschedule.customer?.displayName ?? 'Customer'}
                        </strong>
                        <span className="mt-1 block text-xs text-dd-muted">
                          {reschedule.customer?.phoneMasked ?? 'Kontak termasking'} ·{' '}
                          {reschedule.branch?.name ?? 'Cabang'} ·{' '}
                          {reschedule.package?.name ?? 'Paket customer'}
                        </span>
                      </div>
                      <Badge tone="warning">Menunggu keputusan</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 rounded-dd-md bg-dd-surface-muted p-3 text-sm sm:grid-cols-2">
                      <div>
                        <span className="block text-xs text-dd-muted">Jadwal asal</span>
                        <strong>
                          {source
                            ? formatBookingTime(source.startAt, source.timezone)
                            : 'Kelas sumber'}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-xs text-dd-muted">Jadwal tujuan</span>
                        <strong>
                          {target
                            ? formatBookingTime(target.startAt, target.timezone)
                            : 'Kelas tujuan'}
                        </strong>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-dd-muted">
                        Diajukan {formatBookingTime(reschedule.requestedAt, 'Asia/Jakarta')}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!canDecide || !branchId || busy}
                        title={!branchId ? 'Pilih cabang untuk mengambil keputusan' : undefined}
                        onClick={() => {
                          setReviewId(reschedule.id);
                          decisionKey.current = newIntentKey();
                        }}
                      >
                        Tinjau reschedule
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {rescheduleCursor && (
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void loadMoreReschedules()}
            >
              Muat reschedule berikutnya
            </Button>
          )}
          {reviewId && (
            <Panel
              className="grid gap-4 border-amber-200 bg-dd-warning-soft p-4 text-sm text-dd-warning"
              aria-label="Keputusan reschedule"
            >
              <strong>Keputusan reschedule</strong>
              Approval memindahkan reservation dari kelas sumber ke target secara atomik. Rejection
              mempertahankan reservation sumber dan tidak mengubah ledger.
              <SelectInput
                label="Alasan penolakan"
                value={rejectionCode}
                onChange={(event) =>
                  setRejectionCode(
                    event.target.value as 'TARGET_UNAVAILABLE' | 'OUTSIDE_POLICY' | 'OUT_OF_SCOPE',
                  )
                }
              >
                <option value="TARGET_UNAVAILABLE">Target tidak tersedia</option>
                <option value="OUTSIDE_POLICY">Di luar kebijakan reschedule</option>
                <option value="OUT_OF_SCOPE">Di luar scope cabang</option>
              </SelectInput>
              <Button
                type="button"
                disabled={busy}
                onClick={() => void decideReschedule('approve')}
              >
                Setujui reschedule
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={busy}
                onClick={() => void decideReschedule('reject')}
              >
                Tolak reschedule
              </Button>
            </Panel>
          )}
        </section>
      )}
      {activeTab === 'attendance' && (
        <Panel className="grid gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <CalendarCheck2 className="mt-0.5 size-6 text-dd-forest" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold text-dd-ink">Check-in & Kehadiran</h2>
              <p className="mt-1 text-sm leading-6 text-dd-muted">
                Booking yang sudah hadir tercatat pada tabel di bawah. Untuk memindai pass customer,
                buka scanner dan pastikan cabang operasional sudah dipilih.
              </p>
              <Link
                className="mt-4 inline-flex min-h-10 items-center rounded-dd-md border border-dd-forest bg-dd-forest px-4 text-sm font-bold text-white no-underline"
                href="/check-in-scanner"
              >
                Buka scanner check-in
              </Link>
            </div>
          </div>
          <FilterBar>
            <SearchSelect
              label="Jadwal kelas"
              value={rosterSlotId}
              placeholder="Semua jadwal"
              wrapperClassName="min-w-56 flex-1"
              options={Array.from(
                new Map(
                  items
                    .filter((item) => item.classSlot)
                    .map((item) => [item.classSlot!.id, item.classSlot!]),
                ).values(),
              ).map((slot) => ({
                id: slot.id,
                label: slot.classType.name,
                description: formatBookingTime(slot.startAt, slot.timezone),
              }))}
              onChange={setRosterSlotId}
            />
            <SelectInput
              label="Status roster"
              value={rosterStatus}
              onChange={(event) => setRosterStatus(event.target.value)}
              wrapperClassName="min-w-44"
            >
              <option value="">Semua status</option>
              <option value="BOOKED">Belum hadir</option>
              <option value="ATTENDED">Sudah hadir</option>
              <option value="CANCELLED">Dibatalkan</option>
              <option value="NO_SHOW">Tidak hadir</option>
            </SelectInput>
            {(search || rosterSlotId || rosterStatus) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setRosterSlotId('');
                  setRosterStatus('');
                }}
              >
                Reset roster
              </Button>
            )}
          </FilterBar>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-dd-md border border-dd-line bg-dd-surface-muted p-3">
            <span className="text-sm text-dd-muted">
              {selectedRosterIds.length} peserta dipilih
            </span>
            <Button
              type="button"
              disabled={
                busy ||
                !canManageAttendance ||
                !branchId ||
                !rosterSlotId ||
                selectedRosterIds.length === 0
              }
              title={
                !branchId
                  ? 'Pilih cabang untuk menerbitkan QR'
                  : !rosterSlotId
                    ? 'Pilih jadwal untuk menerbitkan QR'
                    : undefined
              }
              onClick={() => void issueBulkCheckIn()}
            >
              Terbitkan QR untuk peserta terpilih
            </Button>
          </div>
        </Panel>
      )}
      {(activeTab === 'bookings' || activeTab === 'attendance') && (
        <>
          <h2 className="text-xl font-semibold text-dd-ink">
            {activeTab === 'attendance' ? 'Riwayat kehadiran' : 'Daftar booking'}
          </h2>
          <DataTable
            items={items}
            rowKey={(booking) => booking.id}
            loading={busy && items.length === 0}
            emptyTitle="Belum ada booking"
            emptyDescription="Tidak ada booking yang sesuai dengan scope dan filter saat ini."
            columns={[
              {
                id: 'customer',
                header: 'Customer',
                cell: (booking) => (
                  <div>
                    {activeTab === 'attendance' && (
                      <input
                        type="checkbox"
                        aria-label={`Pilih ${booking.customer?.displayName ?? 'customer'}`}
                        className="mr-2 size-4 accent-dd-forest"
                        checked={selectedRosterIds.includes(booking.id)}
                        onChange={(event) =>
                          setSelectedRosterIds((current) =>
                            event.target.checked
                              ? [...current, booking.id]
                              : current.filter((id) => id !== booking.id),
                          )
                        }
                      />
                    )}
                    <strong className="block">{booking.customer?.displayName ?? 'Customer'}</strong>
                    <span className="text-xs text-dd-muted">{booking.customer?.phoneMasked}</span>
                  </div>
                ),
              },
              {
                id: 'class',
                header: 'Kelas',
                cell: (booking) => (
                  <div>
                    <strong className="block">
                      {booking.classSlot?.classType.name ?? 'Kelas'}
                    </strong>
                    <span className="text-xs text-dd-muted">
                      {booking.classSlot
                        ? formatBookingTime(booking.classSlot.startAt, booking.classSlot.timezone)
                        : 'Jadwal tidak tersedia'}
                    </span>
                  </div>
                ),
              },
              {
                id: 'branch',
                header: 'Studio',
                cell: (booking) => booking.branch?.name ?? 'Studio',
              },
              {
                id: 'balance',
                header: 'Sesi',
                cell: (booking) =>
                  booking.sessionBalance
                    ? `${booking.sessionBalance.available} tersedia · ${booking.sessionBalance.reserved} direservasi`
                    : 'Saldo tidak tersedia',
              },
              {
                id: 'status',
                header: 'Status',
                cell: (booking) => (
                  <Badge
                    tone={
                      booking.status === 'ATTENDED'
                        ? 'success'
                        : booking.status === 'CANCELLED' || booking.status === 'NO_SHOW'
                          ? 'danger'
                          : booking.status === 'RESCHEDULE_PENDING'
                            ? 'warning'
                            : 'info'
                    }
                  >
                    {bookingStatusLabel(booking.status)}
                  </Badge>
                ),
              },
              {
                id: 'action',
                header: <span className="sr-only">Tindakan</span>,
                cell: (booking) => (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      className="inline-flex min-h-10 items-center rounded-dd-md border border-dd-line px-3 text-sm font-bold text-dd-forest no-underline hover:bg-dd-surface-muted"
                      href={`/workspace/bookings/${booking.id}?returnTo=${encodeURIComponent('/workspace/bookings')}`}
                    >
                      Lihat detail
                    </Link>
                    {booking.status === 'BOOKED' && canManageAttendance && branchId && (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => void issueCheckIn(booking)}
                      >
                        Buat/Kirim QR
                      </Button>
                    )}
                    {activeTab === 'attendance' &&
                      booking.checkInToken?.status === 'ACTIVE' &&
                      canManageAttendance &&
                      branchId && (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => void revokeCheckIn(booking)}
                        >
                          Cabut QR
                        </Button>
                      )}
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
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            void navigator.clipboard.writeText(
                              checkInIssues[booking.id]?.passUrl ?? '',
                            )
                          }
                        >
                          Salin link
                        </Button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            mobileCard={(booking) => (
              <div className="grid gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block">{booking.customer?.displayName ?? 'Customer'}</strong>
                    <span className="text-sm text-dd-muted">
                      {booking.classSlot?.classType.name ?? 'Kelas'} ·{' '}
                      {booking.branch?.name ?? 'Studio'}
                    </span>
                  </div>
                  <Badge
                    tone={
                      booking.status === 'ATTENDED'
                        ? 'success'
                        : booking.status === 'CANCELLED' || booking.status === 'NO_SHOW'
                          ? 'danger'
                          : 'info'
                    }
                  >
                    {bookingStatusLabel(booking.status)}
                  </Badge>
                </div>
                <p className="text-sm text-dd-muted">
                  {booking.classSlot
                    ? formatBookingTime(booking.classSlot.startAt, booking.classSlot.timezone)
                    : 'Jadwal tidak tersedia'}
                </p>
                {activeTab === 'attendance' && (
                  <label className="inline-flex items-center gap-2 text-sm text-dd-muted">
                    <input
                      type="checkbox"
                      className="size-4 accent-dd-forest"
                      checked={selectedRosterIds.includes(booking.id)}
                      onChange={(event) =>
                        setSelectedRosterIds((current) =>
                          event.target.checked
                            ? [...current, booking.id]
                            : current.filter((id) => id !== booking.id),
                        )
                      }
                    />
                    Pilih peserta
                  </label>
                )}
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-dd-md border border-dd-line px-3 text-sm font-bold text-dd-forest no-underline"
                  href={`/workspace/bookings/${booking.id}?returnTo=${encodeURIComponent('/workspace/bookings')}`}
                >
                  Lihat detail
                </Link>
              </div>
            )}
          />
          <Pagination
            hasPrevious={cursorHistory.length > 0}
            hasNext={Boolean(nextCursor)}
            totalLabel={`Halaman ${cursorHistory.length + 1} · ${items.length.toLocaleString('id-ID')} data dari ${summary.total.toLocaleString('id-ID')} booking`}
            onPrevious={openPreviousPage}
            onNext={openNextPage}
          />
        </>
      )}
    </section>
  );
}

function bookingStatusLabel(status: string) {
  return (
    {
      BOOKED: 'Aktif',
      RESCHEDULE_PENDING: 'Menunggu reschedule',
      CANCELLED: 'Dibatalkan',
      ATTENDED: 'Sudah hadir',
      NO_SHOW: 'Tidak hadir',
    }[status] ?? 'Status booking'
  );
}

function formatBookingTime(value: Date, timeZone: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(value);
}
