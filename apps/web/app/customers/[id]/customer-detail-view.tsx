'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ActionGroup, Button } from '../../components/actions';
import { SearchSelect } from '../../components/forms';
import { useSessionContext } from '../../session-context';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';
import { customerClient, type CustomerDetail } from '../customer-client';

const fieldClass = 'min-h-11 w-full rounded-dd-md border border-dd-line bg-white px-3 text-sm';

export function CustomerDetailView({ id }: { id: string }) {
  const session = useSessionContext()?.session;
  const [customer, setCustomer] = useState<CustomerDetail>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      setCustomer(await customerClient.detail(id));
      setError('');
    } catch {
      setError('Profil customer tidak tersedia atau berada di luar hak akses Anda.');
    }
  }, [id]);
  useEffect(() => void load(), [load]);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await customerClient.updateProfile(
        id,
        {
          displayName: data.get('displayName'),
          email: data.get('email'),
          phoneE164: data.get('phoneE164'),
          preferredBranchId: data.get('preferredBranchId') || null,
          expectedVersion: customer.version,
          reason: data.get('reason'),
        },
        { stepUpToken: String(data.get('stepUpToken') || ''), idempotencyKey: crypto.randomUUID() },
      );
      setSuccess('Profil customer berhasil diperbarui dan tercatat pada audit.');
      await load();
    } catch {
      setError(
        'Perubahan belum dapat disimpan. Periksa MFA, kode verifikasi tindakan, dan versi data.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer) return;
    const data = new FormData(event.currentTarget);
    const action = customer.status === 'ACTIVE' ? 'deactivate' : 'reactivate';
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await customerClient.setStatus(
        id,
        action,
        { expectedVersion: customer.version, reason: String(data.get('reason') || '') },
        { stepUpToken: String(data.get('stepUpToken') || ''), idempotencyKey: crypto.randomUUID() },
      );
      setSuccess(
        action === 'deactivate'
          ? 'Akun customer dinonaktifkan.'
          : 'Akun customer diaktifkan kembali.',
      );
      await load();
    } catch {
      setError(
        'Status akun belum dapat diubah. Periksa MFA, kode verifikasi tindakan, dan versi data.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (!customer)
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat profil customer" />
    );
  const cards = [
    ['Order', customer._count.purchases ?? 0],
    ['Paket', customer._count.customerPackages ?? 0],
    ['Booking', customer._count.customerBookings ?? 0],
    ['Voucher', customer._count.voucherRedemptions ?? 0],
    ['Notifikasi', customer._count.notifications ?? 0],
  ];
  return (
    <section className="space-y-6">
      <Link className="font-semibold text-dd-forest hover:underline" href="/customers">
        ← Kembali ke Customer Management
      </Link>
      <div className="rounded-dd-lg border border-dd-line bg-white p-6">
        <PageHeader
          eyebrow="Customer / Profil terpadu"
          title={customer.displayName}
          description={`${customer.email ?? 'Email belum tersedia'} · ${customer.phoneE164 ?? 'Telepon belum tersedia'}`}
          context={
            <>
              <StatusBadge tone={customer.status === 'ACTIVE' ? 'success' : 'warning'}>
                {customer.status}
              </StatusBadge>
              <StatusBadge
                tone={customer.verificationStatus === 'APPROVED' ? 'success' : 'warning'}
              >
                {customer.verificationStatus}
              </StatusBadge>
            </>
          }
        />
      </div>
      {error && <Feedback kind="error">{error}</Feedback>}
      {success && <Feedback kind="status">{success}</Feedback>}
      {customer.passwordCredential?.mustChangePassword && (
        <Feedback kind="warning">
          Customer wajib mengganti password awal sebelum mengakses transaksi bisnis.
        </Feedback>
      )}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-dd-lg border border-dd-line bg-white p-5">
            <div className="text-xs font-bold uppercase text-dd-muted">{label}</div>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={updateProfile}
          className="space-y-3 rounded-dd-lg border border-dd-line bg-white p-6"
        >
          <h2 className="font-semibold">Profil dan kontak</h2>
          <label className="block text-sm">
            Nama
            <input
              required
              name="displayName"
              defaultValue={customer.displayName}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Email
            <input
              required
              type="email"
              name="email"
              defaultValue={customer.email ?? ''}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            Telepon
            <input
              required
              name="phoneE164"
              defaultValue={customer.phoneE164 ?? ''}
              className={fieldClass}
            />
          </label>
          <SearchSelect
            label="Studio/Cabang pilihan"
            name="preferredBranchId"
            defaultValue={customer.preferredBranch?.id ?? ''}
            placeholder="Belum ditentukan"
            options={(session?.branches ?? []).map((branch) => ({
              id: branch.id,
              label: branch.name,
            }))}
          />
          <label className="block text-sm">
            Alasan perubahan
            <input required minLength={3} name="reason" className={fieldClass} />
          </label>
          <label className="block text-sm">
            Kode verifikasi tindakan
            <input
              required
              type="password"
              autoComplete="off"
              name="stepUpToken"
              className={fieldClass}
            />
          </label>
          <Button type="submit" loading={busy}>
            Simpan profil
          </Button>
        </form>
        <div className="space-y-5">
          <div className="rounded-dd-lg border border-dd-line bg-white p-6">
            <h2 className="font-semibold">Keamanan akun</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-dd-muted">Email terverifikasi</dt>
                <dd>{customer.passwordCredential?.verifiedAt ? 'Ya' : 'Belum'}</dd>
              </div>
              <div>
                <dt className="text-dd-muted">Barcode</dt>
                <dd>{customer.profile?.barcode ?? '—'}</dd>
              </div>
            </dl>
          </div>
          <form
            onSubmit={changeStatus}
            className="space-y-3 rounded-dd-lg border border-dd-line bg-white p-6"
          >
            <h2 className="font-semibold">Status akun</h2>
            <p className="text-sm text-dd-muted">
              Menonaktifkan akun mencabut seluruh sesi aktif. Tindakan ini tidak mengubah saldo atau
              transaksi.
            </p>
            <input
              required
              minLength={3}
              name="reason"
              className={fieldClass}
              placeholder="Alasan perubahan status"
            />
            <input
              required
              type="password"
              autoComplete="off"
              name="stepUpToken"
              className={fieldClass}
              placeholder="Kode verifikasi tindakan"
            />
            <ActionGroup>
              <Button
                type="submit"
                variant={customer.status === 'ACTIVE' ? 'danger' : 'primary'}
                loading={busy}
              >
                {customer.status === 'ACTIVE' ? 'Nonaktifkan customer' : 'Aktifkan customer'}
              </Button>
            </ActionGroup>
          </form>
          <div className="rounded-dd-lg border border-dd-line bg-white p-6">
            <h2 className="font-semibold">Workflow transaksi</h2>
            <p className="mt-3 text-sm leading-6 text-dd-muted">
              Saldo, pembayaran, booking, dan voucher tidak diedit dari profil ini. Gunakan
              Penyesuaian Sesi, Pembayaran, Booking, atau Voucher agar approval dan audit tetap
              utuh.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
