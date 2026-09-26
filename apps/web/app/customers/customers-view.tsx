'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button, ButtonLink } from '../components/actions';
import { SearchInput, SearchSelect, SelectInput, TextInput } from '../components/forms';
import { DataTable, Pagination } from '../components/admin/admin-ui';
import { Feedback, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';
import { customerClient, type CustomerSummary } from './customer-client';
import { ADMIN_PAGE_SIZE, pageOffset } from '../lib/pagination';
import { statusLabel } from '../lib/status-labels';

export const customerStatusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
  PENDING_ACTIVATION: 'Menunggu aktivasi',
};

export const verificationStatusLabels: Record<string, string> = {
  APPROVED: 'Disetujui',
  ACTION_REQUIRED: 'Perlu perbaikan',
  PENDING: 'Menunggu',
};

export function CustomersView() {
  const session = useSessionContext()?.session;
  const canCreate =
    session?.globalCapabilities?.includes('customer:credential:initialize') ?? false;
  const [items, setItems] = useState<CustomerSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [history, setHistory] = useState<Array<string | undefined>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await customerClient.list({
        q: q || undefined,
        status: status || undefined,
        verificationStatus: verificationStatus || undefined,
        cursor,
      });
      setItems(result.items);
      setTotal(result.summary.total);
      setNextCursor(result.page.nextCursor);
      setError('');
    } catch {
      setError('Data pelanggan belum dapat dimuat. Data halaman sebelumnya tetap dipertahankan.');
    } finally {
      setLoading(false);
    }
  }, [cursor, q, status, verificationStatus]);

  useEffect(() => void load(), [load]);
  const reset = () => {
    setCursor(undefined);
    setHistory([]);
  };

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      await customerClient.create(
        {
          displayName: data.get('displayName'),
          email: data.get('email'),
          phoneE164: data.get('phoneE164'),
          preferredBranchId: data.get('preferredBranchId') || null,
          password: data.get('password'),
          passwordConfirmation: data.get('passwordConfirmation'),
          reason: String(data.get('reason') || '').trim() || undefined,
        },
        { idempotencyKey: crypto.randomUUID() },
      );
      event.currentTarget.reset();
      setShowCreate(false);
      reset();
      await load();
    } catch (failure) {
      const code = (failure as { code?: string }).code;
      setError(
        code === 'IDENTITY_CONFLICT'
          ? 'Email atau nomor telepon sudah digunakan.'
          : code === 'MFA_REQUIRED'
            ? 'Verifikasi MFA Super Admin diperlukan.'
            : 'Pelanggan belum dapat dibuat. Periksa data dan password.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="customers-title">
      <AdminPageHeader
        title="Data Pelanggan"
        titleId="customers-title"
        description="Cari pelanggan dan lihat profil terpadu tanpa mengubah saldo atau transaksi di luar alur resmi."
        actions={
          canCreate ? (
            <Button onClick={() => setShowCreate((value) => !value)}>
              {showCreate ? 'Tutup form' : 'Buat pelanggan aktif'}
            </Button>
          ) : undefined
        }
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      {showCreate && (
        <form
          onSubmit={create}
          className="grid gap-4 rounded-dd-lg border border-dd-line bg-white p-6 sm:grid-cols-2"
        >
          <TextInput required label="Nama" name="displayName" autoComplete="off" />
          <TextInput required type="email" label="Email" name="email" autoComplete="off" />
          <TextInput required label="Telepon" name="phoneE164" placeholder="+62812…" />
          <SearchSelect
            label="Studio/Cabang pilihan"
            name="preferredBranchId"
            placeholder="Belum ditentukan"
            options={(session?.branches ?? []).map((branch) => ({
              id: branch.id,
              label: branch.name,
            }))}
          />
          <TextInput
            required
            type="password"
            label="Password awal"
            name="password"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
          />
          <TextInput
            required
            type="password"
            label="Ulangi password"
            name="passwordConfirmation"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
          />
          <TextInput label="Catatan (opsional)" name="reason" maxLength={500} />
          <div className="sm:col-span-2">
            <Feedback kind="warning">
              Pelanggan langsung aktif, tetapi hanya dapat membuka keamanan akun sampai password awal
              diganti. Email belum dianggap terverifikasi.
            </Feedback>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={submitting}>
              Simpan pelanggan
            </Button>
          </div>
        </form>
      )}
      <div className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-4 sm:grid-cols-3">
        <SearchInput
          label="Cari pelanggan"
          compact
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            reset();
          }}
          placeholder="Nama, email, telepon, barcode, ID"
        />
        <SelectInput
          label="Status akun"
          compact
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            reset();
          }}
        >
          <option value="">Semua status akun</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
          <option value="PENDING_ACTIVATION">Menunggu</option>
        </SelectInput>
        <SelectInput
          label="Status verifikasi"
          compact
          value={verificationStatus}
          onChange={(event) => {
            setVerificationStatus(event.target.value);
            reset();
          }}
        >
          <option value="">Semua verifikasi</option>
          <option value="APPROVED">Disetujui</option>
          <option value="ACTION_REQUIRED">Perlu perbaikan</option>
          <option value="PENDING">Menunggu</option>
        </SelectInput>
      </div>
      <DataTable
        items={items}
        loading={loading && !items.length}
        rowNumberOffset={pageOffset(history.length)}
        rowKey={(item) => item.id}
        emptyTitle="Tidak ada pelanggan yang cocok"
        emptyDescription="Ubah kata kunci atau filter untuk melihat pelanggan lain."
        columns={[
          {
            id: 'customer',
            header: 'Pelanggan',
            cell: (item) => (
              <>
                <strong>{item.displayName}</strong>
                <div className="text-dd-muted">{item.email || item.phoneE164 || item.id}</div>
              </>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => (
              <>
                <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {customerStatusLabels[item.status] ?? statusLabel(item.status)}
                </StatusBadge>
                <div className="mt-1 text-xs text-dd-muted">
                  {verificationStatusLabels[item.verificationStatus] ??
                    statusLabel(item.verificationStatus)}
                </div>
              </>
            ),
          },
          {
            id: 'packages',
            header: 'Paket',
            cell: (item) => `${item.activePackageCount} paket aktif · ${item._count?.purchases ?? 0} order`,
          },
          {
            id: 'activity',
            header: 'Aktivitas',
            cell: (item) =>
              `${item._count?.purchases ?? 0} order · ${item._count?.customerBookings ?? 0} booking`,
          },
          {
            id: 'action',
            header: <span className="sr-only">Tindakan</span>,
            cell: (item) => (
              <ButtonLink variant="secondary" size="sm" href={`/customers/${item.id}`}>
                Lihat detail
              </ButtonLink>
            ),
          },
        ]}
        mobileCard={(item) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="block truncate">{item.displayName}</strong>
                <span className="text-sm text-dd-muted">
                  {item.email || item.phoneE164 || item.id}
                </span>
              </div>
              <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                {customerStatusLabels[item.status] ?? statusLabel(item.status)}
              </StatusBadge>
            </div>
            <p className="text-xs text-dd-muted">
              {verificationStatusLabels[item.verificationStatus] ??
                statusLabel(item.verificationStatus)}{' '}
              · {item.activePackageCount} paket aktif · {item._count?.purchases ?? 0} order ·{' '}
              {item._count?.customerBookings ?? 0} booking
            </p>
            <ButtonLink variant="secondary" size="sm" href={`/customers/${item.id}`}>
              Lihat detail
            </ButtonLink>
          </div>
        )}
      />
      <Pagination
        currentPage={history.length + 1}
        totalPages={Math.ceil(total / ADMIN_PAGE_SIZE) || 1}
        totalItems={total}
        pageSize={ADMIN_PAGE_SIZE}
        hasPrevious={Boolean(history.length) && !loading}
        hasNext={Boolean(nextCursor) && !loading}
        totalLabel={`${total.toLocaleString('id-ID')} pelanggan`}
        onPrevious={() => {
          const next = [...history];
          const previous = next.pop();
          setHistory(next);
          setCursor(previous);
        }}
        onNext={() => {
          if (!nextCursor) return;
          setHistory((value) => [...value, cursor]);
          setCursor(nextCursor);
        }}
      />
    </section>
  );
}
