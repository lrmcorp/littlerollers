'use client';

import Link from 'next/link';
import { MoreHorizontal, Plus, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type ApplicationRole,
  type IdentityClient,
  type RoleCatalogItem,
  type UiFailure,
  type UserListSummary,
  type UserSummary,
} from '@/api-clients/identity-client';
import {
  AdminPageState,
  Badge,
  DataTable,
  FilterBar,
  Pagination,
} from '../components/admin/admin-ui';
import { Button, ButtonLink } from '../components/actions';
import { Feedback, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';
import { InviteUserDrawer, roleSummary, statusLabels } from './user-admin-controls';
import { roleLabel } from '../lib/role-labels';
import { SearchInput, SearchSelect, SelectInput } from '../components/forms';
import { ADMIN_PAGE_SIZE, pageOffset } from '../lib/pagination';

const failureCopy: Record<UiFailure, string> = {
  AUTHENTICATION_REQUIRED: 'Sesi berakhir. Silakan masuk kembali.',
  CONFIGURATION_REQUIRED: 'Layanan identitas belum dapat dihubungi.',
  INTERNAL_ERROR: 'Layanan identitas mengalami gangguan internal.',
  RATE_LIMITED: 'Terlalu banyak permintaan. Coba kembali nanti.',
  SERVICE_UNAVAILABLE: 'Layanan identitas tidak dapat dihubungi.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk tindakan ini.',
  IDENTITY_CONFLICT: 'Data pengguna berubah atau tindakan tidak dapat diterapkan.',
  STALE_VERSION: 'Data pengguna telah berubah. Muat ulang sebelum mencoba kembali.',
  SESSION_REVOKED: 'Sesi berakhir. Silakan masuk kembali.',
  NOT_IMPLEMENTED: 'Fitur ini belum tersedia.',
};

const emptySummary: UserListSummary = { total: 0, active: 0, pendingActivation: 0, inactive: 0 };

function queryValue(name: string) {
  return typeof window === 'undefined'
    ? ''
    : (new URLSearchParams(window.location.search).get(name) ?? '');
}

export function UsersView({
  client = browserIdentityClient,
  capabilitiesOverride,
}: {
  client?: IdentityClient;
  capabilitiesOverride?: readonly string[];
}) {
  const context = useSessionContext();
  const capabilities = capabilitiesOverride ?? context?.session?.capabilities ?? [];
  const globalCapabilities =
    capabilitiesOverride ??
    context?.session?.globalCapabilities ??
    (capabilities.includes('branch:all') ? capabilities : []);
  const sessionReady = Boolean(capabilitiesOverride || context?.session);
  const canAdmin = sessionReady && capabilities.includes('user:admin');
  const canViewCustomers = false;
  const canReadIdentity = sessionReady && globalCapabilities.includes('identity-verification:read');
  const branches = context?.session?.branches ?? [];
  const [items, setItems] = useState<UserSummary[]>([]);
  const [catalog, setCatalog] = useState<RoleCatalogItem[]>([]);
  const [summary, setSummary] = useState<UserListSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<UiFailure>();
  const [message, setMessage] = useState<string>();
  const [draftSearch, setDraftSearch] = useState(() => queryValue('search'));
  const [search, setSearch] = useState(() => queryValue('search'));
  const [status, setStatus] = useState(() => queryValue('status'));
  const [role, setRole] = useState(() => queryValue('role'));
  const [audience, setAudience] = useState<'STAFF' | 'CUSTOMER'>('STAFF');
  // Cakupan cabang mengikuti pemilih "Cabang aktif" di topbar; daftar pelanggan tidak dibatasi cabang.
  const branchId = audience === 'STAFF' ? (context?.activeBranchId ?? '') : '';
  const [verificationStatus, setVerificationStatus] = useState(() =>
    queryValue('verificationStatus'),
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailure(undefined);
    try {
      const [users, roles] = await Promise.all([
        client.listUsers({
          branchId: branchId || undefined,
          cursor,
          search: search || undefined,
          status: (status || undefined) as UserSummary['status'] | undefined,
          role: (role || undefined) as ApplicationRole | undefined,
          audience,
          verificationStatus:
            audience === 'CUSTOMER' && canReadIdentity
              ? (verificationStatus as 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED') || undefined
              : undefined,
        }),
        client.roleCatalog(),
      ]);
      setItems(users.items);
      setNextCursor(users.page.nextCursor);
      setSummary({
        total: users.summary.total ?? 0,
        active: users.summary.active ?? 0,
        pendingActivation: users.summary.pendingActivation ?? 0,
        inactive: users.summary.inactive ?? 0,
      });
      setCatalog(roles);
    } catch (error) {
      setFailure(failureCode(error));
    } finally {
      setLoading(false);
    }
  }, [
    audience,
    branchId,
    canReadIdentity,
    client,
    cursor,
    role,
    search,
    status,
    verificationStatus,
  ]);

  useEffect(() => void load(), [load]);

  useEffect(() => {
    if (sessionReady && audience === 'CUSTOMER' && !canViewCustomers) setAudience('STAFF');
  }, [audience, canViewCustomers, sessionReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (role) params.set('role', role);
    if (audience === 'CUSTOMER') params.set('audience', audience);
    if (verificationStatus && audience === 'CUSTOMER')
      params.set('verificationStatus', verificationStatus);
    const query = params.toString();
    window.history.replaceState(window.history.state, '', `/users${query ? `?${query}` : ''}`);
  }, [audience, role, search, status, verificationStatus]);

  const assignable = useMemo(() => catalog.filter((item) => item.assignable), [catalog]);
  const resetPage = () => {
    setCursor(undefined);
    setCursorHistory([]);
  };
  const setStatusFilter = (next: string) => {
    setStatus((current) => (current === next ? '' : next));
    resetPage();
  };

  return (
    <section className="space-y-6" aria-labelledby="users-title">
      <AdminPageHeader
        title="Pengguna internal"
        titleId="users-title"
        description="Kelola profil staf, peran, cakupan cabang, aktivasi, dan riwayat perubahan. Pelanggan dikelola lewat Data Pelanggan."
        badges={
          <>
            <StatusBadge tone={canAdmin ? 'info' : 'neutral'}>
              {canAdmin ? 'Dapat mengelola' : 'Hanya lihat'}
            </StatusBadge>
            <StatusBadge tone="success">Hak akses terverifikasi</StatusBadge>
          </>
        }
        actions={
          canAdmin ? (
            <>
              <Button
                leadingIcon={<Plus className="size-4" aria-hidden="true" />}
                onClick={() => setInviteOpen(true)}
              >
                Buat pengguna internal
              </Button>
              <ButtonLink
                variant="secondary"
                href="/users/roles-permissions"
                leadingIcon={<ShieldCheck className="size-4" aria-hidden="true" />}
              >
                Peran &amp; hak akses
              </ButtonLink>
              <ButtonLink variant="secondary" href="/assignments">
                Kelola penugasan
              </ButtonLink>
            </>
          ) : undefined
        }
      />

      <div
        className="flex gap-2 border-b border-dd-line"
        role="tablist"
        aria-label="Jenis pengguna"
      >
        <button
          type="button"
          role="tab"
          aria-selected={audience === 'STAFF'}
          className={`border-b-2 px-4 py-3 text-sm font-bold ${audience === 'STAFF' ? 'border-dd-forest text-dd-forest' : 'border-transparent text-dd-muted'}`}
          onClick={() => {
            setAudience('STAFF');
            setVerificationStatus('');
            resetPage();
          }}
        >
          Staf
        </button>
        {canViewCustomers && (
          <button
            type="button"
            role="tab"
            aria-selected={audience === 'CUSTOMER'}
            className={`border-b-2 px-4 py-3 text-sm font-bold ${audience === 'CUSTOMER' ? 'border-dd-forest text-dd-forest' : 'border-transparent text-dd-muted'}`}
            onClick={() => {
              setAudience('CUSTOMER');
              setRole('');
              resetPage();
            }}
          >
            Pelanggan
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan pengguna">
        <SummaryFilterCard
          label="Total pengguna"
          value={summary.total}
          helper="Dalam cakupan saat ini"
          active={!status}
          onClick={() => setStatusFilter('')}
        />
        <SummaryFilterCard
          label="Aktif"
          value={summary.active}
          helper="Dapat menggunakan akun"
          active={status === 'ACTIVE'}
          tone="success"
          onClick={() => setStatusFilter('ACTIVE')}
        />
        <SummaryFilterCard
          label="Menunggu aktivasi"
          value={summary.pendingActivation}
          helper="Belum menyelesaikan setup"
          active={status === 'PENDING_ACTIVATION'}
          tone="warning"
          onClick={() => setStatusFilter('PENDING_ACTIVATION')}
        />
        <SummaryFilterCard
          label="Nonaktif"
          value={summary.inactive}
          helper="Login dinonaktifkan"
          active={status === 'INACTIVE'}
          onClick={() => setStatusFilter('INACTIVE')}
        />
      </div>

      <FilterBar
        onApply={() => {
          setSearch(draftSearch.trim());
          resetPage();
        }}
        onReset={() => {
          setDraftSearch('');
          setSearch('');
          setStatus('');
          setRole('');
          setVerificationStatus('');
          resetPage();
        }}
        showReset={Boolean(search || status || role || verificationStatus)}
        label="Filter pengguna"
      >
        <SearchInput
          label="Cari nama"
          value={draftSearch}
          onChange={(event) => setDraftSearch(event.target.value)}
          placeholder="Nama pengguna"
        />
        <SelectInput
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            resetPage();
          }}
        >
          <option value="">Semua status</option>
          <option value="PENDING_ACTIVATION">Menunggu aktivasi</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
        </SelectInput>
        {audience === 'STAFF' && (
          <SearchSelect
            label="Role"
            value={role}
            placeholder="Semua role"
            options={catalog.map((item) => ({
              id: item.role,
              label: roleLabel(item.role),
              description: item.scope === 'BRANCH' ? 'Cakupan cabang' : 'Cakupan global',
            }))}
            onChange={(value) => {
              setRole(value);
              resetPage();
            }}
          />
        )}
        {audience === 'CUSTOMER' && canReadIdentity && (
          <SelectInput
            label="Status verifikasi"
            value={verificationStatus}
            onChange={(event) => {
              setVerificationStatus(event.target.value);
              resetPage();
            }}
          >
            <option value="">Semua status</option>
            <option value="PENDING">Menunggu pemeriksaan</option>
            <option value="ACTION_REQUIRED">Perlu perbaikan</option>
            <option value="APPROVED">Terverifikasi</option>
          </SelectInput>
        )}
      </FilterBar>

      {failure && items.length === 0 ? (
        <AdminPageState
          kind={
            failure === 'FORBIDDEN' ? 'forbidden' : failure === 'STALE_VERSION' ? 'stale' : 'error'
          }
          description={failureCopy[failure]}
          action={<Button onClick={() => void load()}>Coba lagi</Button>}
        />
      ) : (
        <DataTable
          items={items}
          loading={loading}
          rowNumberOffset={pageOffset(cursorHistory.length)}
          rowKey={(user) => user.id}
          emptyTitle={
            search || status || role || verificationStatus
              ? 'Tidak ada hasil filter'
              : audience === 'CUSTOMER'
                ? 'Belum ada pelanggan'
                : 'Belum ada staf'
          }
          emptyDescription="Ubah filter atau buat pengguna internal sesuai cakupan yang tersedia."
          columns={[
            {
              id: 'user',
              header: 'Pengguna',
              cell: (user) => (
                <div>
                  <Link
                    className="font-bold text-dd-ink no-underline hover:text-dd-forest"
                    href={`/users/${user.id}`}
                  >
                    {user.displayName}
                  </Link>
                  {user.username && (
                    <span className="block text-xs font-mono text-dd-forest">
                      @{user.username}
                    </span>
                  )}
                  <p className="mt-1 text-xs text-dd-muted">
                    Diperbarui {new Date(user.updatedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              cell: (user) => (
                <Badge
                  tone={
                    user.status === 'ACTIVE'
                      ? 'success'
                      : user.status === 'INACTIVE'
                        ? 'neutral'
                        : 'warning'
                  }
                >
                  {statusLabels[user.status]}
                </Badge>
              ),
            },
            {
              id: 'role',
              header: audience === 'CUSTOMER' ? 'Verifikasi' : 'Role',
              cell: (user) =>
                audience === 'CUSTOMER'
                  ? verificationLabel(user.identityVerification?.status)
                  : roleSummary(user.roles).join(', ') || 'Belum ada role',
            },
            {
              id: 'scope',
              header: audience === 'CUSTOMER' ? 'Dokumen' : 'Cakupan',
              cell: (user) =>
                audience === 'CUSTOMER'
                  ? user.identityVerification
                    ? `${user.identityVerification.documents.length}/2 tersedia`
                    : 'Status privat'
                  : [...new Set(user.roles.map((item) => item.branch?.name).filter(Boolean))].join(
                      ', ',
                    ) || 'Global',
            },
            {
              id: 'action',
              header: <span className="sr-only">Tindakan</span>,
              className: 'w-14',
              cell: (user) => <UserActions user={user} canAdmin={canAdmin} />,
            },
          ]}
          mobileCard={(user) => (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link className="font-bold text-dd-ink no-underline" href={`/users/${user.id}`}>
                  {user.displayName}
                </Link>
                {user.username && (
                  <span className="block text-xs font-mono text-dd-forest">
                    @{user.username}
                  </span>
                )}
                <p className="mt-1 text-sm text-dd-muted">
                  {audience === 'CUSTOMER'
                    ? verificationLabel(user.identityVerification?.status)
                    : roleSummary(user.roles).join(', ') || 'Belum ada role'}
                </p>
                <div className="mt-3">
                  <Badge
                    tone={
                      user.status === 'ACTIVE'
                        ? 'success'
                        : user.status === 'INACTIVE'
                          ? 'neutral'
                          : 'warning'
                    }
                  >
                    {statusLabels[user.status]}
                  </Badge>
                </div>
              </div>
              <UserActions user={user} canAdmin={canAdmin} />
            </div>
          )}
        />
      )}

      <Pagination
        currentPage={cursorHistory.length + 1}
        totalPages={Math.ceil((summary?.total ?? 0) / ADMIN_PAGE_SIZE) || 1}
        totalItems={summary?.total ?? 0}
        pageSize={ADMIN_PAGE_SIZE}
        hasPrevious={cursorHistory.length > 0 && !loading}
        hasNext={Boolean(nextCursor) && !loading}
        totalLabel={`${items.length.toLocaleString('id-ID')} ditampilkan dari ${(summary?.total ?? 0).toLocaleString('id-ID')} pengguna`}
        onPrevious={() => {
          const history = [...cursorHistory];
          setCursor(history.pop());
          setCursorHistory(history);
        }}
        onNext={() => {
          setCursorHistory((history) => [...history, cursor]);
          setCursor(nextCursor ?? undefined);
        }}
      />

      <InviteUserDrawer
        open={inviteOpen && canAdmin}
        branches={branches}
        roles={assignable}
        submitting={submitting}
        onClose={() => setInviteOpen(false)}
        onSubmit={async (input) => {
          setSubmitting(true);
          setFailure(undefined);
          try {
            const result = await client.invite(input.email, input.displayName, input.roles, {
              phone: input.phone,
              password: input.password,
            });
            setMessage(
              result === 'EXISTS'
                ? 'Akun email ini sudah terdaftar sebelumnya.'
                : 'Pengguna staf berhasil dibuat dan akun langsung aktif.',
            );
            setInviteOpen(false);
            await load();
          } catch (error) {
            setFailure(failureCode(error));
          } finally {
            setSubmitting(false);
          }
        }}
      />
      {message && <Feedback kind="status">{message}</Feedback>}
      {failure && items.length > 0 && <Feedback kind="error">{failureCopy[failure]}</Feedback>}
    </section>
  );
}

function SummaryFilterCard({
  label,
  value = 0,
  helper,
  active,
  tone = 'neutral',
  onClick,
}: {
  label: string;
  value?: number;
  helper: string;
  active: boolean;
  tone?: 'neutral' | 'success' | 'warning';
  onClick(): void;
}) {
  const accent =
    tone === 'warning' ? 'bg-dd-brass' : tone === 'success' ? 'bg-dd-success' : 'bg-dd-forest';
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`relative overflow-hidden rounded-dd-lg border bg-dd-surface p-5 text-left shadow-dd-card transition hover:-translate-y-0.5 hover:shadow-dd-float ${active ? 'border-dd-forest ring-2 ring-dd-forest/10' : 'border-dd-line'}`}
      onClick={onClick}
    >
      <span className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} aria-hidden="true" />
      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">
        {label}
      </span>
      <strong className="mt-3 block text-2xl font-semibold tracking-tight text-dd-ink">
        {(value ?? 0).toLocaleString('id-ID')}
      </strong>
      <span className="mt-2 block text-sm text-dd-muted">{helper}</span>
    </button>
  );
}

function UserActions({ user, canAdmin }: { user: UserSummary; canAdmin: boolean }) {
  return (
    <details className="relative">
      <summary
        className="grid size-10 cursor-pointer list-none place-items-center rounded-dd-md border border-dd-line bg-white text-dd-muted hover:text-dd-ink"
        aria-label={`Tindakan untuk ${user.displayName}`}
      >
        <MoreHorizontal className="size-4" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 grid w-56 rounded-dd-lg border border-dd-line bg-white p-2 shadow-dd-float">
        <Link
          className="rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
          href={`/users/${user.id}`}
        >
          Lihat detail
        </Link>
        {canAdmin && (
          <>
            <Link
              className="rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
              href={`/users/${user.id}?action=profile`}
            >
              Edit profil
            </Link>
            <Link
              className="rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
              href={`/users/${user.id}?action=roles`}
            >
              Kelola role
            </Link>
            {user.status === 'ACTIVE' && (
              <Link
                className="rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                href={`/users/${user.id}?action=password`}
              >
                Reset kata sandi
              </Link>
            )}
            {user.status !== 'PENDING_ACTIVATION' && (
              <Link
                className="rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-danger no-underline hover:bg-dd-danger-soft"
                href={`/users/${user.id}?action=status`}
              >
                {user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan kembali'}
              </Link>
            )}
          </>
        )}
      </div>
    </details>
  );
}

function verificationLabel(status?: 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED') {
  if (status === 'APPROVED') return 'Terverifikasi';
  if (status === 'ACTION_REQUIRED') return 'Perlu perbaikan';
  if (status === 'PENDING') return 'Menunggu pemeriksaan';
  return 'Tidak dapat dilihat';
}
