'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  User,
  X,
  ZoomIn,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ActionGroup, Button, ButtonLink } from '../../components/actions';
import { PreviewModal } from '../../components/app-feedback';
import { SearchSelect, TextInput } from '../../components/forms';
import { useSessionContext } from '../../session-context';
import { Feedback, Skeleton, StatusBadge } from '../../ui';
import { AdminPageHeader } from '../../components/admin/admin-page-header';
import { AssistedSaleDrawer } from '../../purchases/assisted-sale-drawer';
import { DataTable } from '../../components/admin/admin-ui';
import { statusLabel } from '../../lib/status-labels';
import { customerStatusLabels, verificationStatusLabels } from '../customers-view';
import { customerClient, type CustomerDetail, type CustomerDetailDocument } from '../customer-client';
import { verificationClient } from '../../api-clients/identity-verification-client';

function CustomerDocumentCard({
  title,
  kind,
  doc,
  onZoom,
}: {
  title: string;
  kind: 'KTP_FRONT' | 'SELFIE';
  doc?: CustomerDetailDocument;
  onZoom: (title: string, blobUrl: string) => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!doc?.id) return;
    let active = true;
    let createdUrl = '';
    setLoading(true);
    verificationClient
      .authorizeView(doc.id)
      .then(({ url }) => verificationClient.readPrivateFile(url))
      .then((blob) => {
        if (!active) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [doc?.id]);

  return (
    <div className="flex flex-col overflow-hidden rounded-dd-lg border border-dd-line bg-white shadow-xs transition hover:shadow-md">
      <div className="flex items-center justify-between border-b border-dd-line/80 px-4 py-3 bg-dd-surface-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-dd-forest" />
          <strong className="text-sm font-semibold text-dd-ink">{title}</strong>
        </div>
        {doc ? (
          <StatusBadge tone="success">Tersedia</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Belum Diunggah</StatusBadge>
        )}
      </div>
      <div className="relative flex aspect-[16/10] w-full items-center justify-center bg-dd-surface-muted/40 p-2">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-xs text-dd-muted animate-pulse">
            <Loader2 className="size-6 animate-spin text-dd-forest" />
            <span>Memuat pratinjau aman…</span>
          </div>
        ) : blobUrl ? (
          <div className="group relative h-full w-full overflow-hidden rounded-dd-md">
            <img
              src={blobUrl}
              alt={title}
              className="h-full w-full object-contain transition group-hover:scale-102"
            />
            <button
              type="button"
              onClick={() => onZoom(title, blobUrl)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-xs transition group-hover:opacity-100 text-white font-medium text-xs gap-1.5 cursor-pointer"
            >
              <ZoomIn className="size-4" /> Perbesar Dokumen
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-4 text-center text-xs text-dd-muted">
            <AlertCircle className="size-6 text-dd-muted" />
            <span>{error ? 'Tidak dapat memuat berkas' : 'Dokumen belum tersedia pada akun ini'}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-3 text-xs text-dd-muted border-t border-dd-line/60 bg-white">
        <span>Format: {kind === 'KTP_FRONT' ? 'KTP Depan' : 'Foto Selfie'}</span>
        {blobUrl && (
          <button
            type="button"
            onClick={() => onZoom(title, blobUrl)}
            className="font-semibold text-dd-forest hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <ZoomIn className="size-3.5" /> Lihat Detail
          </button>
        )}
      </div>
    </div>
  );
}

export function CustomerDetailView({ id }: { id: string }) {
  const sessionContext = useSessionContext();
  const session = sessionContext?.session;
  // Ubah profil, nonaktifkan, dan tandai berhenti dicek API dengan `customer:write`.
  const canWrite = Boolean(sessionContext?.hasCapability('customer:write'));
  const canSell = Boolean(sessionContext?.hasCapability('purchase:record'));
  const saleBranch = sessionContext?.activeBranch ?? null;
  const [saleOpen, setSaleOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetail>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ title: string; src: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'packages' | 'bookings'>('packages');

  const load = useCallback(async () => {
    try {
      setCustomer(await customerClient.detail(id));
      setError('');
    } catch {
      setError('Profil pelanggan tidak tersedia atau berada di luar hak akses Anda.');
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
      setSuccess('Profil pelanggan berhasil diperbarui dan tercatat pada audit.');
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
          ? 'Akun pelanggan dinonaktifkan.'
          : 'Akun pelanggan diaktifkan kembali.',
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

  async function toggleStopped() {
    if (!customer) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      if (customer.stoppedAt) {
        await customerClient.unmarkStopped(id);
        setSuccess('Pelanggan berhasil diaktifkan kembali dan dimasukkan ke antrean reminder.');
      } else {
        await customerClient.markStopped(id, 'Ditandai berhenti oleh Manager');
        setSuccess('Pelanggan ditandai berhenti. Reminder otomatis WhatsApp telah dinonaktifkan.');
      }
      await load();
    } catch {
      setError('Gagal mengubah status berhenti pelanggan. Periksa hak akses Anda.');
    } finally {
      setBusy(false);
    }
  }

  if (!customer)
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat profil pelanggan" />
    );

  const ktpDoc = customer.identityDocuments.find((d) => d.kind === 'KTP_FRONT');
  const selfieDoc = customer.identityDocuments.find((d) => d.kind === 'SELFIE');

  const cards = [
    { label: 'Total Order', value: customer._count.purchases ?? 0, icon: CreditCard },
    { label: 'Paket Dimiliki', value: customer._count.customerPackages ?? 0, icon: Package },
    { label: 'Total Booking', value: customer._count.customerBookings ?? 0, icon: Calendar },
    { label: 'Voucher Dipakai', value: customer._count.voucherRedemptions ?? 0, icon: CheckCircle2 },
    { label: 'Sesi Dibeli', value: customer.purchasedSessions ?? 0, icon: Clock },
  ];

  return (
    <section className="space-y-6">
      {/* Lightbox Zoom Modal */}
      <PreviewModal
        open={Boolean(zoomImage)}
        title={zoomImage?.title ?? 'Pratinjau Dokumen'}
        description="Dokumen identitas privat pelanggan."
        onClose={() => setZoomImage(null)}
        className="max-w-3xl"
      >
        {zoomImage && (
          <div className="flex items-center justify-center p-2 min-h-64">
            <img
              src={zoomImage.src}
              alt={zoomImage.title}
              className="max-h-[70vh] w-auto rounded-dd-md object-contain shadow-sm"
            />
          </div>
        )}
      </PreviewModal>

      {/* Back Link */}
      <Link
        className="inline-flex items-center gap-1.5 font-semibold text-dd-forest hover:underline text-sm"
        href="/customers"
      >
        <ArrowLeft className="size-4" />
        <span>Kembali ke Data Pelanggan</span>
      </Link>

      {/* Profile Header Banner */}
      <AdminPageHeader
          title={customer.displayName}
          description={`${customer.email ?? 'Email belum tersedia'} · ${customer.phoneE164 ?? 'Telepon belum tersedia'}`}
          actions={
            canSell && customer.status === 'ACTIVE' ? (
              <Button
                disabled={!saleBranch}
                title={saleBranch ? undefined : 'Pilih cabang aktif terlebih dahulu'}
                onClick={() => setSaleOpen(true)}
              >
                Jual paket
              </Button>
            ) : undefined
          }
          badges={
            <>
              <StatusBadge tone={customer.status === 'ACTIVE' ? 'success' : 'warning'}>
                {customerStatusLabels[customer.status] ?? customer.status}
              </StatusBadge>
              <StatusBadge
                tone={customer.verificationStatus === 'APPROVED' ? 'success' : 'warning'}
              >
                {verificationStatusLabels[customer.verificationStatus] ?? customer.verificationStatus}
              </StatusBadge>
              {customer.stoppedAt && (
                <StatusBadge tone="danger">
                  Berhenti (pengingat nonaktif)
                </StatusBadge>
              )}
              {customer.preferredBranch && (
                <span className="inline-flex items-center gap-1.5 text-xs text-dd-muted">
                  <MapPin className="size-3.5 text-dd-forest" aria-hidden="true" />
                  Cabang pilihan:{' '}
                  <strong className="text-dd-ink">{customer.preferredBranch.name}</strong> (
                  {customer.preferredBranch.code})
                </span>
              )}
            </>
          }
        />

      {error && <Feedback kind="error">{error}</Feedback>}
      {success && <Feedback kind="status">{success}</Feedback>}
      {customer.passwordCredential?.mustChangePassword && (
        <Feedback kind="warning">
          Pelanggan wajib mengganti password awal sebelum mengakses transaksi bisnis.
        </Feedback>
      )}

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-dd-lg border border-dd-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-dd-muted">{c.label}</span>
                <Icon className="size-4 text-dd-forest/70" />
              </div>
              <strong className="mt-2 block text-2xl font-bold text-dd-ink">{c.value}</strong>
            </div>
          );
        })}
      </div>

      {/* Section: Dokumen Identitas (KTP & Selfie) */}
      <div className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dd-line/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-dd-ink flex items-center gap-2">
              <ShieldCheck className="size-5 text-dd-forest" />
              Dokumen Verifikasi Identitas (KYC)
            </h2>
            <p className="mt-0.5 text-xs text-dd-muted">
              Dokumen KTP dan foto selfie terenkripsi yang diunggah pelanggan saat registrasi atau pembaruan profil.
            </p>
          </div>
          <StatusBadge tone={customer.verificationStatus === 'APPROVED' ? 'success' : 'warning'}>
            Status KYC: {customer.verificationStatus === 'APPROVED' ? 'Lengkap & Terverifikasi' : 'Perlu Kelengkapan'}
          </StatusBadge>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <CustomerDocumentCard
            title="Foto KTP Depan"
            kind="KTP_FRONT"
            doc={ktpDoc}
            onZoom={(title, src) => setZoomImage({ title, src })}
          />
          <CustomerDocumentCard
            title="Foto Selfie Pelanggan"
            kind="SELFIE"
            doc={selfieDoc}
            onZoom={(title, src) => setZoomImage({ title, src })}
          />
        </div>
      </div>

      {/* Section: Data Demografi & Kontak Darurat */}
      <div className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-dd-line/80 pb-3">
          <h2 className="text-base font-bold text-dd-ink flex items-center gap-2">
            <User className="size-5 text-dd-forest" />
            Data Demografi &amp; Informasi Kontak
          </h2>
          <p className="mt-0.5 text-xs text-dd-muted">
            Rincian informasi pribadi, alamat domisili, dan kontak darurat untuk keselamatan member di studio.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div className="rounded-dd-md border border-dd-line/70 bg-dd-surface-muted/20 p-4">
            <span className="text-xs font-medium text-dd-muted uppercase">NIK (Nomor KTP)</span>
            <p className="mt-1 font-semibold text-dd-ink">{customer.profile?.nik || '—'}</p>
          </div>
          <div className="rounded-dd-md border border-dd-line/70 bg-dd-surface-muted/20 p-4">
            <span className="text-xs font-medium text-dd-muted uppercase">Jenis Kelamin</span>
            <p className="mt-1 font-semibold text-dd-ink">
              {customer.profile?.gender === 'FEMALE' || customer.profile?.genderCode === 'F'
                ? 'Perempuan'
                : customer.profile?.gender === 'MALE' || customer.profile?.genderCode === 'M'
                  ? 'Laki-laki'
                  : '—'}
            </p>
          </div>
          <div className="rounded-dd-md border border-dd-line/70 bg-dd-surface-muted/20 p-4">
            <span className="text-xs font-medium text-dd-muted uppercase">Tanggal Lahir</span>
            <p className="mt-1 font-semibold text-dd-ink">
              {customer.profile?.birthDate
                ? new Date(customer.profile.birthDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-2 rounded-dd-md border border-dd-line/70 bg-dd-surface-muted/20 p-4">
            <span className="text-xs font-medium text-dd-muted uppercase flex items-center gap-1.5">
              <MapPin className="size-3.5 text-dd-forest" /> Alamat Domisili
            </span>
            <p className="mt-1 font-semibold text-dd-ink">{customer.profile?.address || '—'}</p>
          </div>
          <div className="rounded-dd-md border border-dd-line/70 bg-dd-surface-muted/20 p-4">
            <span className="text-xs font-medium text-dd-muted uppercase flex items-center gap-1.5">
              <Phone className="size-3.5 text-dd-forest" /> Kontak Darurat
            </span>
            <p className="mt-1 font-semibold text-dd-ink">
              {customer.profile?.emergencyContactName || '—'}
            </p>
            {customer.profile?.emergencyContactPhone && (
              <p className="text-xs text-dd-forest font-medium mt-0.5">
                {customer.profile.emergencyContactPhone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section: Data Tables (Order, Paket Aktif, Booking Kelas) */}
      <div className="rounded-dd-lg border border-dd-line bg-white shadow-xs overflow-hidden">
        {/* Table Tabs Header */}
        <div className="flex border-b border-dd-line bg-dd-surface-muted/30 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'packages'
                ? 'border-dd-forest text-dd-forest'
                : 'border-transparent text-dd-muted hover:text-dd-ink'
            }`}
          >
            <Package className="size-4" />
            Paket Aktif &amp; Sesi ({customer.customerPackages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-dd-forest text-dd-forest'
                : 'border-transparent text-dd-muted hover:text-dd-ink'
            }`}
          >
            <CreditCard className="size-4" />
            Riwayat Order ({customer.purchases.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-dd-forest text-dd-forest'
                : 'border-transparent text-dd-muted hover:text-dd-ink'
            }`}
          >
            <Calendar className="size-4" />
            Riwayat Booking Kelas ({customer.customerBookings.length})
          </button>
        </div>

        {/* Tab 1: Paket Aktif & Sisa Sesi */}
        {activeTab === 'packages' && (
          <div className="p-6">
            {customer.customerPackages.length === 0 ? (
              <div className="rounded-dd-md bg-dd-surface-muted/40 p-8 text-center text-sm text-dd-muted">
                Pelanggan belum memiliki paket aktif saat ini.
              </div>
            ) : (
              <DataTable
                showRowNumbers={false}
                items={customer.customerPackages}
                rowKey={(cp) => cp.id}
                columns={[
                  {
                    id: 'name',
                    header: 'Nama Paket',
                    cell: (cp) => (
                      <span className="font-semibold text-dd-ink">
                        {cp.package?.name ?? 'Paket Pilates'}
                      </span>
                    ),
                  },
                  {
                    id: 'total',
                    header: 'Total Sesi',
                    cell: (cp) => cp.sessionCountSnapshot ?? cp.package?.sessionCount ?? '—',
                  },
                  {
                    id: 'remaining',
                    header: 'Sisa Sesi',
                    cell: (cp) => (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        {cp.remainingSessions} Sesi
                      </span>
                    ),
                  },
                  { id: 'used', header: 'Sesi Digunakan', cell: (cp) => `${cp.usedSessions} Sesi` },
                  {
                    id: 'expiry',
                    header: 'Masa Berlaku',
                    cell: (cp) =>
                      cp.expiryAt
                        ? `s.d. ${new Date(cp.expiryAt).toLocaleDateString('id-ID')}`
                        : 'Permanen',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (cp) => (
                      <StatusBadge tone={cp.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {statusLabel(cp.status)}
                      </StatusBadge>
                    ),
                  },
                ]}
                mobileCard={(cp) => (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-dd-ink">{cp.package?.name ?? 'Paket Pilates'}</strong>
                      <StatusBadge tone={cp.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {statusLabel(cp.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-dd-muted">
                      Sisa {cp.remainingSessions} dari{' '}
                      {cp.sessionCountSnapshot ?? cp.package?.sessionCount ?? '—'} sesi ·{' '}
                      {cp.expiryAt
                        ? `s.d. ${new Date(cp.expiryAt).toLocaleDateString('id-ID')}`
                        : 'Permanen'}
                    </p>
                  </div>
                )}
              />
            )}
          </div>
        )}

        {/* Tab 2: Riwayat Order & Pembelian */}
        {activeTab === 'orders' && (
          <div className="p-6">
            {customer.purchases.length === 0 ? (
              <div className="rounded-dd-md bg-dd-surface-muted/40 p-8 text-center text-sm text-dd-muted">
                Pelanggan belum memiliki riwayat pembelian paket.
              </div>
            ) : (
              <DataTable
                showRowNumbers={false}
                items={customer.purchases}
                rowKey={(p) => p.id}
                columns={[
                  {
                    id: 'invoice',
                    header: 'Invoice / Tanggal',
                    cell: (p) => (
                      <>
                        <strong className="block text-dd-ink">
                          {p.invoiceNumber ?? p.id.slice(0, 8)}
                        </strong>
                        <span className="text-xs text-dd-muted">
                          {new Date(p.submittedAt).toLocaleDateString('id-ID')}
                        </span>
                      </>
                    ),
                  },
                  {
                    id: 'package',
                    header: 'Paket',
                    cell: (p) => (
                      <span className="font-semibold text-dd-ink">
                        {p.packageNameSnapshot ?? 'Paket Pilates'}
                      </span>
                    ),
                  },
                  { id: 'branch', header: 'Cabang', cell: (p) => p.branchName || '—' },
                  {
                    id: 'amount',
                    header: 'Nominal',
                    cell: (p) => (
                      <span className="font-semibold text-dd-forest">
                        Rp {(p.payableAmountRpSnapshot ?? 0).toLocaleString('id-ID')}
                      </span>
                    ),
                  },
                  { id: 'method', header: 'Metode', cell: (p) => p.paymentMethod ?? 'Transfer' },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (p) => (
                      <StatusBadge tone={p.status === 'PAID' ? 'success' : 'warning'}>
                        {statusLabel(p.status)}
                      </StatusBadge>
                    ),
                  },
                  {
                    id: 'proof',
                    header: 'Bukti Bayar',
                    cell: (p) =>
                      p.paymentProofUrl ? (
                        <ButtonLink
                          variant="secondary"
                          size="sm"
                          href={`/workspace/payments/${p.id}`}
                        >
                          Lihat bukti
                        </ButtonLink>
                      ) : (
                        <span className="text-dd-muted">—</span>
                      ),
                  },
                ]}
                mobileCard={(p) => (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-dd-ink">{p.invoiceNumber ?? p.id.slice(0, 8)}</strong>
                      <StatusBadge tone={p.status === 'PAID' ? 'success' : 'warning'}>
                        {statusLabel(p.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-dd-muted">
                      {p.packageNameSnapshot ?? 'Paket Pilates'} · Rp{' '}
                      {(p.payableAmountRpSnapshot ?? 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              />
            )}
          </div>
        )}

        {/* Tab 3: Riwayat Booking Kelas */}
        {activeTab === 'bookings' && (
          <div className="p-6">
            {customer.customerBookings.length === 0 ? (
              <div className="rounded-dd-md bg-dd-surface-muted/40 p-8 text-center text-sm text-dd-muted">
                Pelanggan belum memiliki riwayat pemesanan kelas.
              </div>
            ) : (
              <DataTable
                showRowNumbers={false}
                items={customer.customerBookings}
                rowKey={(b) => b.id}
                columns={[
                  {
                    id: 'number',
                    header: 'No. Booking',
                    cell: (b) => (
                      <span className="font-semibold text-dd-ink">
                        {b.bookingNumber ?? b.id.slice(0, 8)}
                      </span>
                    ),
                  },
                  {
                    id: 'class',
                    header: 'Tipe Kelas',
                    cell: (b) => b.classTypeName ?? 'Kelas Pilates',
                  },
                  { id: 'instructor', header: 'Instruktur', cell: (b) => b.instructorName ?? '—' },
                  {
                    id: 'time',
                    header: 'Waktu Kelas',
                    cell: (b) =>
                      b.startAt
                        ? `${new Date(b.startAt).toLocaleDateString('id-ID')} (${new Date(b.startAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`
                        : '—',
                  },
                  {
                    id: 'status',
                    header: 'Status Booking',
                    cell: (b) => (
                      <StatusBadge tone={b.status === 'BOOKED' ? 'success' : 'neutral'}>
                        {statusLabel(b.status)}
                      </StatusBadge>
                    ),
                  },
                  {
                    id: 'attendance',
                    header: 'Kehadiran',
                    cell: (b) => (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          b.attendanceStatus === 'HADIR'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.attendanceStatus === 'BATAL'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {statusLabel(b.attendanceStatus ?? 'MENUNGGU')}
                      </span>
                    ),
                  },
                ]}
                mobileCard={(b) => (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-dd-ink">{b.classTypeName ?? 'Kelas Pilates'}</strong>
                      <StatusBadge tone={b.status === 'BOOKED' ? 'success' : 'neutral'}>
                        {statusLabel(b.status)}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-dd-muted">
                      {b.bookingNumber ?? b.id.slice(0, 8)} ·{' '}
                      {b.startAt ? new Date(b.startAt).toLocaleDateString('id-ID') : '—'} ·{' '}
                      {statusLabel(b.attendanceStatus ?? 'MENUNGGU')}
                    </p>
                  </div>
                )}
              />
            )}
          </div>
        )}
      </div>

      {/* Forms Section: Profil, Status, & Keaktifan */}
      {!canWrite && (
        <Feedback kind="info">
          Akun Anda hanya dapat melihat data pelanggan. Mengubah profil, status akun, dan status
          berhenti memerlukan izin pengelolaan pelanggan.
        </Feedback>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={updateProfile}
          className="space-y-3 rounded-dd-lg border border-dd-line bg-white p-6 shadow-xs"
        >
          <h2 className="font-semibold text-dd-ink">Edit Profil dan Kontak</h2>
          <TextInput
            required
            label="Nama"
            name="displayName"
            defaultValue={customer.displayName}
          />
          <TextInput
            required
            type="email"
            label="Email"
            name="email"
            defaultValue={customer.email ?? ''}
          />
          <TextInput
            required
            label="Telepon"
            name="phoneE164"
            defaultValue={customer.phoneE164 ?? ''}
          />
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
          <TextInput required minLength={3} label="Alasan perubahan" name="reason" />
          <TextInput
            required
            type="password"
            autoComplete="off"
            label="Kode verifikasi tindakan"
            name="stepUpToken"
          />
          <Button type="submit" loading={busy} disabled={!canWrite}>
            Simpan profil
          </Button>
        </form>

        <div className="space-y-5">
          <form
            onSubmit={changeStatus}
            className="space-y-3 rounded-dd-lg border border-dd-line bg-white p-6 shadow-xs"
          >
            <h2 className="font-semibold text-dd-ink">Status Akun Pelanggan</h2>
            <p className="text-sm text-dd-muted">
              Menonaktifkan akun mencabut seluruh sesi aktif. Tindakan ini tidak mengubah saldo atau
              transaksi.
            </p>
            <TextInput
              required
              minLength={3}
              label="Alasan Perubahan Status"
              name="reason"
              placeholder="Alasan perubahan status"
            />
            <TextInput
              required
              type="password"
              autoComplete="off"
              label="Kode Verifikasi Tindakan"
              name="stepUpToken"
              placeholder="Kode verifikasi tindakan"
            />
            <ActionGroup>
              <Button
                type="submit"
                variant={customer.status === 'ACTIVE' ? 'danger' : 'primary'}
                loading={busy}
                disabled={!canWrite}
              >
                {customer.status === 'ACTIVE' ? 'Nonaktifkan pelanggan' : 'Aktifkan pelanggan'}
              </Button>
            </ActionGroup>
          </form>

          <div className="rounded-dd-lg border border-dd-line bg-white p-6 space-y-3 shadow-xs">
            <h2 className="font-semibold text-dd-ink">Status Reminder &amp; Keaktifan (Rule #12 &amp; #13)</h2>
            <p className="text-sm text-dd-muted">
              Tandai berhenti jika pelanggan telah berhenti pilates agar sistem tidak lagi mengirimkan pesan pengingat kedaluwarsa berkala melalui WhatsApp.
            </p>
            {customer.stoppedAt ? (
              <div className="rounded-dd-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Pelanggan ditandai <strong>BERHENTI</strong> sejak {new Date(customer.stoppedAt).toLocaleDateString('id-ID')}. Pesan reminder otomatis dinonaktifkan.
              </div>
            ) : (
              <div className="rounded-dd-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                Pelanggan aktif dalam antrean reminder berkala normal.
              </div>
            )}
            <ActionGroup>
              <Button
                type="button"
                variant={customer.stoppedAt ? 'primary' : 'danger'}
                loading={busy}
                disabled={!canWrite}
                onClick={toggleStopped}
              >
                {customer.stoppedAt ? 'Aktifkan Kembali ke Reminder' : 'Tandai Pelanggan Berhenti'}
              </Button>
            </ActionGroup>
          </div>
        </div>
      </div>
      {canSell && saleBranch && (
        <AssistedSaleDrawer
          open={saleOpen}
          branch={saleBranch}
          customer={{ id: customer.id, name: customer.displayName }}
          onClose={() => setSaleOpen(false)}
          onRecorded={() => void load()}
        />
      )}
    </section>
  );
}
