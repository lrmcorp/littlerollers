'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '../components/actions';
import { SearchInput, SearchSelect, SelectInput, TextInput } from '../components/forms';
import { Pagination } from '../components/admin/admin-ui';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import { customerClient, type CustomerSummary } from './customer-client';

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
      setError('Data customer belum dapat dimuat. Data halaman sebelumnya tetap dipertahankan.');
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
            : 'Customer belum dapat dibuat. Periksa data dan password.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="customers-title">
      <div className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card sm:p-8">
        <PageHeader
          eyebrow="Administrasi customer"
          title="Manajemen Customer"
          titleId="customers-title"
          description="Cari customer dan lihat profil terpadu tanpa mengubah saldo atau transaksi di luar workflow resmi."
          context={<StatusBadge tone="info">Super Admin</StatusBadge>}
        />
        {canCreate && (
          <div className="mt-5">
            <Button onClick={() => setShowCreate((value) => !value)}>
              {showCreate ? 'Tutup form' : 'Buat customer aktif'}
            </Button>
          </div>
        )}
      </div>
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
              Customer langsung aktif, tetapi hanya dapat membuka keamanan akun sampai password awal
              diganti. Email belum dianggap terverifikasi.
            </Feedback>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={submitting}>
              Simpan customer
            </Button>
          </div>
        </form>
      )}
      <div className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-4 sm:grid-cols-3">
        <SearchInput
          label="Cari customer"
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
      {loading && !items.length ? (
        <Skeleton label="Memuat customer" />
      ) : (
        <div className="overflow-x-auto rounded-dd-lg border border-dd-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-dd-surface-muted text-xs uppercase text-dd-muted">
              <tr>
                <th className="w-14 min-w-[3.5rem] p-4 text-center text-xs font-bold text-dd-muted uppercase tracking-wider">
                  No.
                </th>
                <th className="p-4">Customer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Paket</th>
                <th className="p-4">Aktivitas</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-t border-dd-line">
                  <td className="w-14 p-4 text-center font-mono text-xs text-dd-muted align-middle bg-dd-surface-muted/30">
                    {history.length * 20 + index + 1}
                  </td>
                  <td className="p-4">
                    <strong>{item.displayName}</strong>
                    <div className="text-dd-muted">{item.email || item.phoneE164 || item.id}</div>
                  </td>
                  <td className="p-4">
                    <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {customerStatusLabels[item.status] ?? item.status}
                    </StatusBadge>
                    <div className="mt-1 text-xs text-dd-muted">
                      {verificationStatusLabels[item.verificationStatus] ?? item.verificationStatus}
                    </div>
                  </td>
                  <td className="p-4">
                    {item.activePackageCount} aktif · {item.purchasedSessions} sesi pembelian
                  </td>
                  <td className="p-4">
                    {item._count?.purchases ?? 0} order · {item._count?.customerBookings ?? 0} booking
                  </td>
                  <td className="p-4">
                    <Link
                      className="font-semibold text-dd-forest hover:underline"
                      href={`/customers/${item.id}`}
                    >
                      Buka profil
                    </Link>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-dd-muted">
                    Tidak ada customer yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        currentPage={history.length + 1}
        totalPages={Math.ceil(total / 20) || 1}
        totalItems={total}
        pageSize={20}
        hasPrevious={Boolean(history.length) && !loading}
        hasNext={Boolean(nextCursor) && !loading}
        totalLabel={`${total.toLocaleString('id-ID')} customer`}
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
