'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  browserIdentityClient,
  failureCode,
  type ApplicationRole,
  type AuditSummary,
  type IdentityClient,
  type RoleCatalogItem,
  type UiFailure,
  type UserSummary,
} from '../identity-client';
import { ConfirmationPanel, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import {
  Badge as AdminBadge,
  Button,
  DataTable,
  FilterBar,
  Pagination,
} from '../components/admin/admin-ui';
import { useSessionContext } from '../session-context';

const failureCopy: Record<UiFailure, string> = {
  CONFIGURATION_REQUIRED: 'Layanan identitas belum dapat dihubungi.',
  RATE_LIMITED: 'Terlalu banyak permintaan. Coba kembali nanti.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk tindakan ini.',
  IDENTITY_CONFLICT: 'Data pengguna berubah atau tindakan tidak dapat diterapkan.',
  STALE_VERSION: 'Data pengguna telah berubah. Muat ulang detail sebelum mencoba kembali.',
  SESSION_REVOKED: 'Sesi berakhir. Silakan masuk kembali.',
};

const roleCopy: Partial<Record<ApplicationRole, { label: string; description: string }>> = {
  ADMIN: {
    label: 'Admin cabang',
    description: 'Operasional customer, kelas, dan booking pada satu cabang.',
  },
  MANAGER: {
    label: 'Manager cabang',
    description: 'Keputusan purchase, ledger, kelas, dan booking pada satu cabang.',
  },
  FINANCE: { label: 'Finance', description: 'Akses finansial global tanpa scope cabang.' },
  OPS: { label: 'Operations', description: 'Monitoring dan recovery operasional global.' },
};

export function UsersView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const context = useSessionContext();
  const canAdmin = !context || context.hasCapability('user:admin');
  const canAudit = !context || context.hasCapability('audit:read');
  const branches = context?.session?.branches ?? [];
  const activeBranchId = context?.activeBranchId ?? '';
  const [items, setItems] = useState<UserSummary[]>([]);
  const [catalog, setCatalog] = useState<RoleCatalogItem[]>([]);
  const [selected, setSelected] = useState<UserSummary>();
  const [audit, setAudit] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [failure, setFailure] = useState<UiFailure>();
  const [message, setMessage] = useState<string>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailure(undefined);
    try {
      const [users, roles] = await Promise.all([
        client.listUsers({
          branchId: activeBranchId || undefined,
          cursor,
          search: search || undefined,
          status: (status || undefined) as 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE' | undefined,
          role: (role || undefined) as ApplicationRole | undefined,
        }),
        client.roleCatalog(),
      ]);
      setItems(users.items);
      setNextCursor(users.page.nextCursor);
      setCatalog(roles);
    } catch (error) {
      setFailure(failureCode(error));
    } finally {
      setLoading(false);
    }
  }, [activeBranchId, client, cursor, role, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSelected(undefined);
    setAudit([]);
    setCursor(undefined);
    setCursorHistory([]);
  }, [activeBranchId]);

  const openUser = async (id: string) => {
    setDetailLoading(true);
    setFailure(undefined);
    try {
      const user = await client.getUser(id);
      setSelected(user);
      setAudit(canAudit ? await client.listAudit(id) : []);
    } catch (error) {
      setFailure(failureCode(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const assignable = useMemo(() => catalog.filter((item) => item.assignable), [catalog]);

  return (
    <section className="user-admin-workspace space-y-6" aria-labelledby="users-title">
      <div className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card sm:p-8">
        <PageHeader
          eyebrow="Administrasi identitas"
          title="Pengguna, role, dan permission"
          titleId="users-title"
          description="Akses dibatasi oleh cabang dan capability. Permission role bersifat tetap dan diverifikasi backend."
          context={
            <>
              <StatusBadge tone={canAdmin ? 'info' : 'neutral'}>
                {canAdmin ? 'SUPER OWNER' : 'READ ONLY'}
              </StatusBadge>
              <StatusBadge tone="success">Permission terverifikasi</StatusBadge>
            </>
          }
        />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Ringkasan pengguna">
          <div className="rounded-dd-md bg-dd-surface-muted p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-dd-muted">
              Ditampilkan
            </span>
            <strong className="mt-2 block text-2xl">{items.length}</strong>
          </div>
          <div className="rounded-dd-md bg-dd-success-soft p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-dd-success">
              Aktif
            </span>
            <strong className="mt-2 block text-2xl">
              {items.filter((item) => item.status === 'ACTIVE').length}
            </strong>
          </div>
          <div className="rounded-dd-md bg-dd-warning-soft p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-dd-warning">
              Menunggu
            </span>
            <strong className="mt-2 block text-2xl">
              {items.filter((item) => item.status === 'PENDING_ACTIVATION').length}
            </strong>
          </div>
          <div className="rounded-dd-md bg-dd-info-soft p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-dd-info">
              Role tersedia
            </span>
            <strong className="mt-2 block text-2xl">{catalog.length}</strong>
          </div>
        </div>
      </div>

      <FilterBar>
        <label>
          Cari nama
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nama pengguna"
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Semua status</option>
            <option value="PENDING_ACTIVATION">Menunggu aktivasi</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>
        </label>
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="">Semua role</option>
            {catalog.map((item) => (
              <option key={item.role}>{item.role}</option>
            ))}
          </select>
        </label>
        <Button
          onClick={() => {
            setCursor(undefined);
            setCursorHistory([]);
            void load();
          }}
        >
          Terapkan filter
        </Button>
        {canAdmin && (
          <Button onClick={() => setInviteOpen((value) => !value)}>Buat pengguna internal</Button>
        )}
      </FilterBar>

      {inviteOpen && canAdmin && (
        <InviteForm
          branches={branches}
          roles={assignable}
          onCancel={() => setInviteOpen(false)}
          onSubmit={async (email, displayName, roles) => {
            try {
              const result = await client.invite(email, displayName, roles);
              setMessage(
                result === 'EXISTS'
                  ? 'Akun menunggu aktivasi sudah tersedia dan tautan aktivasi dikirim ulang.'
                  : 'Pengguna internal dibuat dan tautan aktivasi berhasil dikirim.',
              );
              setInviteOpen(false);
            } catch (error) {
              setFailure(failureCode(error));
            }
          }}
        />
      )}

      {loading ? (
        <Skeleton label="Memuat pengguna" />
      ) : failure && items.length === 0 ? (
        <Feedback kind="error">
          {failureCopy[failure]} <button onClick={() => void load()}>Coba lagi</button>
        </Feedback>
      ) : items.length === 0 ? (
        <EmptyState
          title={search || status || role ? 'Tidak ada hasil filter' : 'Belum ada pengguna'}
          description="Ubah filter atau undang pengguna baru sesuai scope yang tersedia."
        />
      ) : (
        <DataTable
          items={items}
          rowKey={(user) => user.id}
          columns={[
            { id: 'user', header: 'Pengguna', cell: (user) => <strong>{user.displayName}</strong> },
            {
              id: 'status',
              header: 'Status',
              cell: (user) => (
                <AdminBadge tone={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {user.status === 'ACTIVE'
                    ? 'Aktif'
                    : user.status === 'PENDING_ACTIVATION'
                      ? 'Menunggu aktivasi'
                      : 'Nonaktif'}
                </AdminBadge>
              ),
            },
            {
              id: 'role',
              header: 'Role',
              cell: (user) => user.roles.map((item) => item.role).join(', ') || 'Belum ada',
            },
            {
              id: 'branch',
              header: 'Cabang',
              cell: (user) =>
                user.roles
                  .map((item) => item.branch?.name)
                  .filter(Boolean)
                  .join(', ') || 'Global',
            },
            {
              id: 'action',
              header: 'Tindakan',
              cell: (user) => (
                <Button variant="secondary" onClick={() => void openUser(user.id)}>
                  Lihat detail
                </Button>
              ),
            },
          ]}
          mobileCard={(user) => (
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong className="text-dd-ink">{user.displayName}</strong>
                <p className="mt-1 text-sm text-dd-muted">
                  {user.roles.map((item) => item.role).join(', ') || 'Belum ada role'}
                </p>
                <p className="mt-1 text-xs text-dd-muted">
                  {user.roles
                    .map((item) => item.branch?.name)
                    .filter(Boolean)
                    .join(', ') || 'Global'}
                </p>
              </div>
              <div className="grid justify-items-end gap-3">
                <AdminBadge tone={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {user.status === 'ACTIVE' ? 'Aktif' : 'Perlu tindak lanjut'}
                </AdminBadge>
                <Button variant="secondary" onClick={() => void openUser(user.id)}>
                  Detail
                </Button>
              </div>
            </div>
          )}
        />
      )}

      <Pagination
        hasPrevious={cursorHistory.length > 0 && !loading}
        hasNext={Boolean(nextCursor) && !loading}
        totalLabel={`${items.length.toLocaleString('id-ID')} pengguna pada halaman ini`}
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

      {detailLoading && <Skeleton label="Memuat detail pengguna" />}
      {selected && (
        <UserDetail
          user={selected}
          audit={audit}
          catalog={catalog}
          branches={branches}
          canAdmin={canAdmin}
          editOpen={editOpen}
          setEditOpen={setEditOpen}
          onClose={() => {
            setSelected(undefined);
            setAudit([]);
            setEditOpen(false);
          }}
          onRefresh={async () => {
            await openUser(selected.id);
            await load();
          }}
          onUpdateRoles={async (roles, reason) => {
            try {
              const updated = await client.updateRoles(
                selected.id,
                roles,
                selected.version,
                reason,
              );
              setSelected(updated);
              setEditOpen(false);
              setMessage('Role dan scope berhasil diperbarui. Sesi pengguna telah dicabut.');
              await load();
            } catch (error) {
              setFailure(failureCode(error));
            }
          }}
          onStatus={async (reason) => {
            try {
              if (selected.status === 'ACTIVE') await client.deactivate(selected.id, reason);
              else await client.reactivate(selected.id, reason);
              setMessage(
                selected.status === 'ACTIVE'
                  ? 'Pengguna dinonaktifkan dan seluruh sesi dicabut.'
                  : 'Pengguna berhasil diaktifkan kembali.',
              );
              await openUser(selected.id);
              await load();
            } catch (error) {
              setFailure(failureCode(error));
            }
          }}
          onPasswordSetup={async (email, reason) => {
            try {
              await client.requestPasswordSetup(selected.id, email, reason);
              setMessage('Tautan setup password berhasil dikirim.');
            } catch (error) {
              setFailure(failureCode(error));
            }
          }}
        />
      )}

      <details className="rounded-dd-lg border border-dd-line bg-dd-surface p-5 shadow-sm">
        <summary className="cursor-pointer text-base font-bold text-dd-ink">
          Roles &amp; Permissions
        </summary>
        <p className="mt-2 text-sm text-dd-muted">
          Referensi read-only untuk capability efektif setiap role.
        </p>
        <PermissionMatrix catalog={catalog} />
      </details>
      {message && <Feedback kind="status">{message}</Feedback>}
      {failure && items.length > 0 && <Feedback kind="error">{failureCopy[failure]}</Feedback>}
    </section>
  );
}

function InviteForm({
  branches,
  roles,
  onCancel,
  onSubmit,
}: {
  branches: { id: string; code: string; name: string }[];
  roles: RoleCatalogItem[];
  onCancel(): void;
  onSubmit(
    email: string,
    displayName: string,
    roles: { role: ApplicationRole; branchId?: string | null }[],
  ): Promise<void>;
}) {
  const [selection, setSelection] = useState<Partial<Record<ApplicationRole, string>>>({});
  const selectedRoles = roles
    .filter(({ role }) => selection[role] !== undefined)
    .map(({ role, scope }) => ({
      role,
      branchId: scope === 'BRANCH' ? selection[role] || null : null,
    }));
  return (
    <form
      className="admin-form"
      aria-label="Buat pengguna internal"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void onSubmit(String(data.get('email')), String(data.get('displayName')), selectedRoles);
      }}
    >
      <h2>Buat pengguna internal</h2>
      <p>
        Akun langsung tercatat sebagai menunggu aktivasi. Pengguna menentukan password melalui
        tautan aman.
      </p>
      <label>
        Nama tampilan
        <input name="displayName" minLength={2} required />
      </label>
      <label>
        Email kerja
        <input name="email" type="email" autoComplete="off" required />
      </label>
      <RoleSelection
        catalog={roles}
        branches={branches}
        selection={selection}
        onChange={setSelection}
      />
      <PermissionPreview catalog={roles} selectedRoles={selectedRoles.map(({ role }) => role)} />
      <button
        type="submit"
        disabled={
          selectedRoles.length === 0 ||
          selectedRoles.some(
            (item) =>
              roles.find(({ role }) => role === item.role)?.scope === 'BRANCH' && !item.branchId,
          )
        }
      >
        Buat pengguna dan kirim aktivasi
      </button>
      <button type="button" onClick={onCancel}>
        Batal
      </button>
    </form>
  );
}

function UserDetail({
  user,
  audit,
  catalog,
  branches,
  canAdmin,
  editOpen,
  setEditOpen,
  onClose,
  onRefresh,
  onUpdateRoles,
  onStatus,
  onPasswordSetup,
}: {
  user: UserSummary;
  audit: AuditSummary[];
  catalog: RoleCatalogItem[];
  branches: { id: string; code: string; name: string }[];
  canAdmin: boolean;
  editOpen: boolean;
  setEditOpen(value: boolean): void;
  onClose(): void;
  onRefresh(): Promise<void>;
  onUpdateRoles(
    roles: { role: ApplicationRole; branchId?: string | null }[],
    reason: string,
  ): Promise<void>;
  onStatus(reason: string): Promise<void>;
  onPasswordSetup(email: string, reason: string): Promise<void>;
}) {
  const assignmentRoles = user.assignmentRoles;
  const directRoles = user.directRoles;
  return (
    <aside className="user-detail-panel" aria-labelledby="user-detail-title">
      <header>
        <div>
          <p>Detail pengguna</p>
          <h2 id="user-detail-title">{user.displayName}</h2>
        </div>
        <button onClick={onClose}>Tutup detail</button>
      </header>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{user.status}</dd>
        </div>
        <div>
          <dt>Role langsung</dt>
          <dd>
            {directRoles
              .map((item) => `${item.role}${item.branch ? ` · ${item.branch.name}` : ''}`)
              .join(', ') || 'Tidak ada'}
          </dd>
        </div>
        <div>
          <dt>Role assignment</dt>
          <dd>
            {assignmentRoles
              .map((item) => `${item.role}${item.branch ? ` · ${item.branch.name}` : ''}`)
              .join(', ') || 'Tidak ada'}
          </dd>
        </div>
        <div>
          <dt>Permission efektif</dt>
          <dd>{user.effectiveCapabilities.join(', ') || 'Tidak ada'}</dd>
        </div>
        <div>
          <dt>Diperbarui</dt>
          <dd>{new Date(user.updatedAt).toLocaleString('id-ID')}</dd>
        </div>
      </dl>
      {assignmentRoles.length > 0 && (
        <Feedback kind="info">
          Role {assignmentRoles.map((item) => item.role).join(', ')} berasal dari assignment dan
          hanya dapat diubah melalui <Link href="/assignments">halaman Assignment</Link>.
        </Feedback>
      )}
      {canAdmin && (
        <div className="detail-actions">
          <button onClick={() => setEditOpen(!editOpen)}>Ubah role dan scope</button>
          <button onClick={() => void onRefresh()}>Muat ulang</button>
        </div>
      )}
      {editOpen && (
        <RoleEditForm
          catalog={catalog.filter((item) => item.assignable)}
          branches={branches}
          initialRoles={directRoles}
          onSubmit={onUpdateRoles}
        />
      )}
      {canAdmin && user.status !== 'PENDING_ACTIVATION' && (
        <StatusForm status={user.status} disabled={false} onSubmit={(reason) => onStatus(reason)} />
      )}
      {canAdmin && user.status === 'ACTIVE' && (
        <form
          className="admin-form"
          aria-label="Kirim setup password"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void onPasswordSetup(String(data.get('setupEmail')), String(data.get('setupReason')));
          }}
        >
          <h3>Aktifkan login password</h3>
          <p>Email hanya dipakai untuk mengirim tautan dan tidak ditampilkan kembali.</p>
          <label>
            Email terverifikasi
            <input name="setupEmail" type="email" required />
          </label>
          <label>
            Alasan
            <input name="setupReason" minLength={3} required />
          </label>
          <button>Kirim tautan setup</button>
        </form>
      )}
      <section aria-labelledby="audit-title">
        <h3 id="audit-title">Riwayat perubahan</h3>
        {audit.length === 0 ? (
          <p>Belum ada riwayat yang dapat ditampilkan.</p>
        ) : (
          <ol className="audit-list">
            {audit.map((item) => (
              <li key={item.id}>
                <strong>{item.action}</strong>
                <span>{new Date(item.occurredAt).toLocaleString('id-ID')}</span>
                <small>Referensi: {item.correlationId}</small>
              </li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  );
}

function RoleEditForm({
  catalog,
  branches,
  initialRoles,
  onSubmit,
}: {
  catalog: RoleCatalogItem[];
  branches: { id: string; code: string; name: string }[];
  initialRoles: UserSummary['directRoles'];
  onSubmit(
    roles: { role: ApplicationRole; branchId?: string | null }[],
    reason: string,
  ): Promise<void>;
}) {
  const [selection, setSelection] = useState<Partial<Record<ApplicationRole, string>>>(
    Object.fromEntries(initialRoles.map(({ role, branchId }) => [role, branchId ?? ''])) as Partial<
      Record<ApplicationRole, string>
    >,
  );
  const selectedRoles = catalog
    .filter(({ role }) => selection[role] !== undefined)
    .map(({ role, scope }) => ({
      role,
      branchId: scope === 'BRANCH' ? selection[role] || null : null,
    }));
  return (
    <form
      className="admin-form"
      aria-label="Ubah role pengguna"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void onSubmit(selectedRoles, String(data.get('reason')));
      }}
    >
      <RoleSelection
        catalog={catalog}
        branches={branches}
        selection={selection}
        onChange={setSelection}
      />
      <PermissionPreview catalog={catalog} selectedRoles={selectedRoles.map(({ role }) => role)} />
      <label>
        Alasan perubahan
        <input name="reason" minLength={3} required />
      </label>
      <ConfirmationPanel title="Konfirmasi perubahan role">
        Hak akses berubah segera dan seluruh sesi pengguna akan dicabut.
      </ConfirmationPanel>
      <button
        type="submit"
        disabled={
          selectedRoles.length === 0 ||
          selectedRoles.some(
            (item) =>
              catalog.find(({ role }) => role === item.role)?.scope === 'BRANCH' && !item.branchId,
          )
        }
      >
        Simpan role dan cabut sesi
      </button>
    </form>
  );
}

function RoleSelection({
  catalog,
  branches,
  selection,
  onChange,
}: {
  catalog: RoleCatalogItem[];
  branches: { id: string; code: string; name: string }[];
  selection: Partial<Record<ApplicationRole, string>>;
  onChange(value: Partial<Record<ApplicationRole, string>>): void;
}) {
  return (
    <fieldset className="role-selection">
      <legend>Role dan scope</legend>
      {catalog.map((item) => {
        const selected = selection[item.role] !== undefined;
        const copy = roleCopy[item.role];
        return (
          <div className="role-selection-item" key={item.role}>
            <label>
              <input
                type="checkbox"
                checked={selected}
                onChange={(event) => {
                  const next = { ...selection };
                  if (event.target.checked) next[item.role] = '';
                  else delete next[item.role];
                  onChange(next);
                }}
              />
              <span>
                <strong>{copy?.label ?? item.role}</strong>
                <small>{copy?.description ?? item.role}</small>
              </span>
            </label>
            {selected && item.scope === 'BRANCH' && (
              <label>
                Scope cabang untuk {copy?.label ?? item.role}
                <select
                  value={selection[item.role] ?? ''}
                  onChange={(event) => onChange({ ...selection, [item.role]: event.target.value })}
                  required
                >
                  <option value="">Pilih cabang</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.code} · {branch.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

function PermissionPreview({
  catalog,
  selectedRoles,
}: {
  catalog: RoleCatalogItem[];
  selectedRoles: ApplicationRole[];
}) {
  const capabilities = [
    ...new Set(
      catalog
        .filter(({ role }) => selectedRoles.includes(role))
        .flatMap(({ capabilities }) => capabilities),
    ),
  ].sort();
  return (
    <div className="permission-preview" aria-live="polite">
      <strong>Preview permission efektif</strong>
      <p>{capabilities.length ? capabilities.join(', ') : 'Pilih minimal satu role.'}</p>
    </div>
  );
}

function StatusForm({
  status,
  disabled,
  onSubmit,
}: {
  status: 'ACTIVE' | 'INACTIVE';
  disabled: boolean;
  onSubmit(reason: string): Promise<void>;
}) {
  return (
    <form
      className="admin-form"
      aria-label={status === 'ACTIVE' ? 'Nonaktifkan pengguna' : 'Aktifkan pengguna'}
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(String(new FormData(event.currentTarget).get('statusReason')));
      }}
    >
      <label>
        Alasan {status === 'ACTIVE' ? 'deaktivasi' : 'reaktivasi'}
        <input name="statusReason" minLength={3} required />
      </label>
      <ConfirmationPanel
        title={status === 'ACTIVE' ? 'Nonaktifkan pengguna' : 'Aktifkan kembali pengguna'}
      >
        {status === 'ACTIVE'
          ? 'Akses dihentikan dan seluruh sesi aktif akan dicabut.'
          : 'Pengguna dapat masuk kembali menggunakan role efektif yang masih tersedia.'}
      </ConfirmationPanel>
      <button disabled={disabled} type="submit">
        {status === 'ACTIVE' ? 'Konfirmasi nonaktifkan' : 'Konfirmasi aktifkan'}
      </button>
    </form>
  );
}

function PermissionMatrix({ catalog }: { catalog: RoleCatalogItem[] }) {
  const capabilities = [...new Set(catalog.flatMap((item) => item.capabilities))].sort();
  return (
    <section className="permission-matrix" aria-labelledby="permission-title">
      <h2 id="permission-title">Matrix permission role</h2>
      <p>Matrix ini read-only. Backend menjadi sumber hak akses efektif.</p>
      <div
        className="overflow-x-auto rounded-dd-lg border border-dd-line bg-white shadow-sm"
        role="region"
        aria-label="Matrix permission"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th>Capability</th>
              {catalog.map((item) => (
                <th key={item.role}>{item.role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilities.map((capability) => (
              <tr key={capability}>
                <th>{capability}</th>
                {catalog.map((item) => (
                  <td key={item.role}>{item.capabilities.includes(capability) ? 'Ya' : '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
