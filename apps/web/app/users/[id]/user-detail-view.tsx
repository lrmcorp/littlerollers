'use client';

import Link from 'next/link';
import { ArrowLeft, KeyRound, RefreshCw, ShieldCheck, UserRoundCog } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type ApplicationRole,
  type AuditSummary,
  type IdentityClient,
  type RoleCatalogItem,
  type UiFailure,
  type UserSummary,
} from '../../identity-client';
import {
  AdminPageState,
  Badge,
  Button,
  DestructiveActionDialog,
  Dialog,
  FormSection,
  Panel,
} from '../../components/admin/admin-ui';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';
import { useSessionContext } from '../../session-context';
import {
  inputClass,
  roleLabels,
  RoleSelection,
  rolesFromSelection,
  roleSummary,
  selectionFromRoles,
  statusLabels,
  type RoleSelectionValue,
} from '../user-admin-controls';

type DetailAction = 'profile' | 'roles' | 'password' | 'status' | null;

const failureCopy: Record<UiFailure, string> = {
  CONFIGURATION_REQUIRED: 'Layanan identitas belum dapat dihubungi.',
  RATE_LIMITED: 'Terlalu banyak permintaan. Coba kembali nanti.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk membuka pengguna ini.',
  IDENTITY_CONFLICT: 'Data pengguna berubah atau tindakan tidak dapat diterapkan.',
  STALE_VERSION: 'Data pengguna telah berubah. Muat ulang detail sebelum mencoba kembali.',
  SESSION_REVOKED: 'Sesi berakhir. Silakan masuk kembali.',
};

function initialAction(): DetailAction {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('action');
  return ['profile', 'roles', 'password', 'status'].includes(value ?? '')
    ? (value as DetailAction)
    : null;
}

function maskPhone(value: string | null) {
  if (!value) return 'Belum tersedia';
  if (value.length <= 6) return '••••••';
  return `${value.slice(0, 3)}••••${value.slice(-3)}`;
}

export function UserDetailView({
  id,
  client = browserIdentityClient,
  capabilitiesOverride,
}: {
  id: string;
  client?: IdentityClient;
  capabilitiesOverride?: readonly string[];
}) {
  const context = useSessionContext();
  const capabilities = capabilitiesOverride ?? context?.session?.capabilities ?? [];
  const sessionReady = Boolean(capabilitiesOverride || context?.session);
  const canAdmin = sessionReady && capabilities.includes('user:admin');
  const canAudit = sessionReady && capabilities.includes('audit:read');
  const branches = context?.session?.branches ?? [];
  const [user, setUser] = useState<UserSummary>();
  const [catalog, setCatalog] = useState<RoleCatalogItem[]>([]);
  const [audit, setAudit] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<UiFailure>();
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState<string>();
  const [action, setAction] = useState<DetailAction>(initialAction);

  const load = useCallback(async () => {
    setLoading(true);
    setFailure(undefined);
    setNotFound(false);
    try {
      const [nextUser, roles, nextAudit] = await Promise.all([
        client.getUser(id),
        client.roleCatalog(),
        canAudit ? client.listAudit(id) : Promise.resolve([]),
      ]);
      setUser(nextUser);
      setCatalog(roles);
      setAudit(nextAudit);
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 404)
        setNotFound(true);
      else setFailure(failureCode(error));
    } finally {
      setLoading(false);
    }
  }, [canAudit, client, id]);

  useEffect(() => void load(), [load]);

  const closeAction = () => {
    setAction(null);
    if (typeof window !== 'undefined')
      window.history.replaceState(window.history.state, '', `/users/${id}`);
  };
  const runMutation = async (operation: () => Promise<void>, success: string) => {
    setSubmitting(true);
    setFailure(undefined);
    try {
      await operation();
      setMessage(success);
      closeAction();
      await load();
    } catch (error) {
      setFailure(failureCode(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !user) return <Skeleton label="Memuat detail pengguna" />;
  if (notFound)
    return (
      <AdminPageState
        kind="error"
        title="Pengguna tidak ditemukan"
        description="Pengguna tidak tersedia atau berada di luar scope cabang Anda."
        action={
          <Link className="button-primary" href="/users">
            Kembali ke Pengguna
          </Link>
        }
      />
    );
  if (failure && !user)
    return (
      <AdminPageState
        kind={failure === 'FORBIDDEN' ? 'forbidden' : 'error'}
        description={failureCopy[failure]}
        action={<Button onClick={() => void load()}>Coba lagi</Button>}
      />
    );
  if (!user) return null;

  const directRoles = user.directRoles;
  const assignmentRoles = user.assignmentRoles;
  return (
    <section className="space-y-6" aria-labelledby="user-detail-title">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm font-bold text-dd-forest no-underline hover:underline"
      >
        <ArrowLeft className="size-4" /> Kembali ke Pengguna
      </Link>
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Pengguna / Detail"
          title={user.displayName}
          titleId="user-detail-title"
          description="Profil, role, assignment, keamanan akun, dan aktivitas audit dalam satu halaman."
          context={
            <>
              <StatusBadge
                tone={
                  user.status === 'ACTIVE'
                    ? 'success'
                    : user.status === 'INACTIVE'
                      ? 'neutral'
                      : 'warning'
                }
              >
                {statusLabels[user.status]}
              </StatusBadge>
              <StatusBadge tone={canAdmin ? 'info' : 'neutral'}>
                {canAdmin ? 'Dapat mengelola' : 'Read only'}
              </StatusBadge>
            </>
          }
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void load()}>
            <RefreshCw className="size-4" /> Muat ulang
          </Button>
          {canAdmin && (
            <Button onClick={() => setAction('profile')}>
              <UserRoundCog className="size-4" /> Edit profil
            </Button>
          )}
          {canAdmin && (
            <Button variant="secondary" onClick={() => setAction('roles')}>
              <ShieldCheck className="size-4" /> Kelola role
            </Button>
          )}
          {canAdmin && user.status === 'ACTIVE' && (
            <Button variant="secondary" onClick={() => setAction('password')}>
              <KeyRound className="size-4" /> Setup password
            </Button>
          )}
          {canAdmin && user.status !== 'PENDING_ACTIVATION' && (
            <Button
              variant={user.status === 'ACTIVE' ? 'danger' : 'secondary'}
              onClick={() => setAction('status')}
            >
              {user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan kembali'}
            </Button>
          )}
        </div>
      </Panel>

      {message && <Feedback kind="status">{message}</Feedback>}
      {failure && <Feedback kind="error">{failureCopy[failure]}</Feedback>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
        <div className="grid gap-6">
          <Panel className="p-5 sm:p-6" aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="text-lg font-bold text-dd-ink">
              Ringkasan
            </h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Nama tampilan" value={user.displayName} />
              <DetailItem label="Kontak" value={maskPhone(user.phoneE164)} />
              <DetailItem label="Status" value={statusLabels[user.status]} />
              <DetailItem label="Versi data" value={`v${user.version}`} />
              <DetailItem label="Dibuat" value={new Date(user.createdAt).toLocaleString('id-ID')} />
              <DetailItem
                label="Diperbarui"
                value={new Date(user.updatedAt).toLocaleString('id-ID')}
              />
            </dl>
          </Panel>

          <Panel className="p-5 sm:p-6" aria-labelledby="roles-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="roles-heading" className="text-lg font-bold text-dd-ink">
                  Role &amp; Scope
                </h2>
                <p className="mt-1 text-sm text-dd-muted">
                  Role langsung dapat dikelola; role assignment mengikuti periode penugasan.
                </p>
              </div>
              <Link className="button-quiet" href="/users/roles-permissions">
                Lihat matrix permission
              </Link>
            </div>
            <RoleList title="Role langsung" roles={directRoles} empty="Belum ada role langsung." />
            <RoleList
              title="Role dari assignment"
              roles={assignmentRoles}
              empty="Tidak ada role berbasis assignment."
            />
            {assignmentRoles.length > 0 && (
              <Link
                className="mt-4 inline-flex text-sm font-bold text-dd-forest"
                href="/assignments"
              >
                Kelola melalui halaman Assignment
              </Link>
            )}
          </Panel>

          <Panel className="p-5 sm:p-6" aria-labelledby="security-heading">
            <h2 id="security-heading" className="text-lg font-bold text-dd-ink">
              Keamanan akun
            </h2>
            <p className="mt-2 text-sm leading-6 text-dd-muted">
              Perubahan role dan deaktivasi mencabut sesi aktif. Tautan setup password dikirim
              melalui workflow aman dan tidak pernah ditampilkan di panel.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={user.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {user.status === 'ACTIVE' ? 'Login diizinkan' : 'Login tidak aktif'}
              </Badge>
              <Badge tone="info">Optimistic locking v{user.version}</Badge>
            </div>
          </Panel>
        </div>

        <Panel className="self-start p-5 sm:p-6" aria-labelledby="audit-heading">
          <h2 id="audit-heading" className="text-lg font-bold text-dd-ink">
            Aktivitas Audit
          </h2>
          {!canAudit ? (
            <p className="mt-3 text-sm text-dd-muted">
              Capability audit diperlukan untuk melihat aktivitas.
            </p>
          ) : audit.length === 0 ? (
            <p className="mt-3 text-sm text-dd-muted">
              Belum ada aktivitas yang dapat ditampilkan.
            </p>
          ) : (
            <ol className="mt-5 grid gap-4">
              {audit.map((item) => (
                <li key={item.id} className="border-l-2 border-dd-brass pl-4">
                  <strong className="block text-sm text-dd-ink">{item.action}</strong>
                  <span className="mt-1 block text-xs text-dd-muted">
                    {new Date(item.occurredAt).toLocaleString('id-ID')}
                  </span>
                  <small className="mt-1 block break-all text-xs text-dd-muted">
                    Referensi: {item.correlationId}
                  </small>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <ProfileDialog
        open={action === 'profile' && canAdmin}
        user={user}
        submitting={submitting}
        onClose={closeAction}
        onSubmit={(input) =>
          runMutation(async () => {
            await client.updateProfile(user.id, { ...input, expectedVersion: user.version });
          }, 'Profil staf berhasil diperbarui.')
        }
      />
      <RoleDialog
        open={action === 'roles' && canAdmin}
        user={user}
        catalog={catalog.filter((item) => item.assignable)}
        branches={branches}
        submitting={submitting}
        onClose={closeAction}
        onSubmit={(roles, reason) =>
          runMutation(async () => {
            await client.updateRoles(user.id, roles, user.version, reason);
          }, 'Role dan scope berhasil diperbarui. Seluruh sesi pengguna telah dicabut.')
        }
      />
      <PasswordDialog
        open={action === 'password' && canAdmin}
        submitting={submitting}
        onClose={closeAction}
        onSubmit={(email, reason) =>
          runMutation(
            () => client.requestPasswordSetup(user.id, email, reason),
            'Tautan setup password berhasil dikirim.',
          )
        }
      />
      <StatusDialog
        open={action === 'status' && canAdmin}
        user={user}
        submitting={submitting}
        onClose={closeAction}
        onSubmit={(reason) =>
          runMutation(
            () =>
              user.status === 'ACTIVE'
                ? client.deactivate(user.id, user.version, reason)
                : client.reactivate(user.id, user.version, reason),
            user.status === 'ACTIVE'
              ? 'Pengguna dinonaktifkan dan seluruh sesi dicabut.'
              : 'Pengguna berhasil diaktifkan kembali.',
          )
        }
      />
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-dd-md bg-dd-surface-muted p-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-dd-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-dd-ink">{value}</dd>
    </div>
  );
}

function RoleList({
  title,
  roles,
  empty,
}: {
  title: string;
  roles: UserSummary['roles'];
  empty: string;
}) {
  return (
    <section className="mt-5">
      <h3 className="text-sm font-bold text-dd-ink">{title}</h3>
      {roles.length === 0 ? (
        <p className="mt-2 text-sm text-dd-muted">{empty}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {roleSummary(roles).map((label) => (
            <Badge key={label} tone="info">
              {label}
            </Badge>
          ))}
        </div>
      )}
    </section>
  );
}

function ProfileDialog({
  open,
  user,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  user: UserSummary;
  submitting: boolean;
  onClose(): void;
  onSubmit(input: { displayName: string; phoneE164: string | null; reason: string }): Promise<void>;
}) {
  return (
    <Dialog
      open={open}
      title="Edit profil staf"
      description="Perubahan profil dicatat dalam audit dan menggunakan versi data terbaru."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void onSubmit({
            displayName: String(data.get('displayName')),
            phoneE164: String(data.get('phoneE164')).trim() || null,
            reason: String(data.get('reason')),
          });
        }}
      >
        <FormSection title="Informasi profil">
          <label className="text-sm font-bold">
            Nama tampilan
            <input
              className={inputClass}
              name="displayName"
              defaultValue={user.displayName}
              minLength={2}
              maxLength={160}
              required
            />
          </label>
          <label className="text-sm font-bold">
            Nomor WhatsApp
            <input
              className={inputClass}
              name="phoneE164"
              type="tel"
              defaultValue={user.phoneE164 ?? ''}
            />
          </label>
        </FormSection>
        <label className="text-sm font-bold">
          Alasan perubahan
          <textarea className={inputClass} name="reason" minLength={3} maxLength={500} required />
        </label>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan profil'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function RoleDialog({
  open,
  user,
  catalog,
  branches,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  user: UserSummary;
  catalog: RoleCatalogItem[];
  branches: { id: string; code: string; name: string }[];
  submitting: boolean;
  onClose(): void;
  onSubmit(
    roles: { role: ApplicationRole; branchId?: string | null }[],
    reason: string,
  ): Promise<void>;
}) {
  const [selection, setSelection] = useState<RoleSelectionValue>(() =>
    selectionFromRoles(user.directRoles),
  );
  useEffect(() => {
    if (open) setSelection(selectionFromRoles(user.directRoles));
  }, [open, user.directRoles]);
  const roles = useMemo(() => rolesFromSelection(catalog, selection), [catalog, selection]);
  const invalid =
    roles.length === 0 ||
    roles.some(
      (item) =>
        catalog.find(({ role }) => role === item.role)?.scope === 'BRANCH' && !item.branchId,
    );
  return (
    <Dialog
      open={open}
      title="Kelola role dan scope"
      description="Role dari Assignment tidak diubah dari dialog ini."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(roles, String(new FormData(event.currentTarget).get('reason')));
        }}
      >
        <RoleSelection
          catalog={catalog}
          branches={branches}
          value={selection}
          onChange={setSelection}
        />
        <label className="text-sm font-bold">
          Alasan perubahan
          <textarea className={inputClass} name="reason" minLength={3} maxLength={500} required />
        </label>
        <div className="rounded-dd-md border border-amber-200 bg-dd-warning-soft p-4 text-sm text-dd-warning">
          Hak akses berubah segera dan seluruh sesi pengguna akan dicabut.
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={invalid || submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan role dan cabut sesi'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function PasswordDialog({
  open,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  submitting: boolean;
  onClose(): void;
  onSubmit(email: string, reason: string): Promise<void>;
}) {
  return (
    <Dialog
      open={open}
      title="Kirim setup password"
      description="Tautan aman dikirim ke email terverifikasi dan tidak ditampilkan kembali."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void onSubmit(String(data.get('email')), String(data.get('reason')));
        }}
      >
        <label className="text-sm font-bold">
          Email terverifikasi
          <input className={inputClass} name="email" type="email" required />
        </label>
        <label className="text-sm font-bold">
          Alasan
          <input className={inputClass} name="reason" minLength={3} maxLength={500} required />
        </label>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim tautan setup'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function StatusDialog({
  open,
  user,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  user: UserSummary;
  submitting: boolean;
  onClose(): void;
  onSubmit(reason: string): Promise<void>;
}) {
  const deactivate = user.status === 'ACTIVE';
  return (
    <DestructiveActionDialog
      open={open}
      title={deactivate ? 'Nonaktifkan pengguna' : 'Aktifkan kembali pengguna'}
      impact={
        deactivate
          ? 'Login dihentikan dan seluruh sesi aktif pengguna dicabut.'
          : 'Pengguna dapat login kembali menggunakan role efektif yang masih tersedia.'
      }
      scope={roleSummary(user.roles).join(', ') || 'Tanpa role'}
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(String(new FormData(event.currentTarget).get('reason')));
        }}
      >
        <label className="text-sm font-bold">
          Alasan {deactivate ? 'deaktivasi' : 'reaktivasi'}
          <textarea className={inputClass} name="reason" minLength={3} maxLength={500} required />
        </label>
        <p className="text-xs text-dd-muted">Expected version: v{user.version}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant={deactivate ? 'danger' : 'primary'} disabled={submitting}>
            {submitting
              ? 'Memproses…'
              : deactivate
                ? 'Konfirmasi nonaktifkan'
                : 'Konfirmasi aktifkan'}
          </Button>
        </div>
      </form>
    </DestructiveActionDialog>
  );
}
