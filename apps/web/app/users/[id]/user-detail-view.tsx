'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, KeyRound, RefreshCw, ShieldCheck, UserRoundCog } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type AuditSummary,
  type IdentityClient,
  type RoleCatalogItem,
  type UiFailure,
  type UserSummary,
} from '../../identity-client';
import type { IdentityVerificationReviewCase } from '../../identity-verification-client';
import { Button } from '../../components/actions';
import { AdminPageState, Badge, Panel } from '../../components/admin/admin-ui';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';
import { useSessionContext } from '../../session-context';
import { roleLabels, roleSummary, statusLabels } from '../user-admin-controls';
import { PasswordDialog, ProfileDialog, RoleDialog, StatusDialog } from './user-detail-dialogs';

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
  const globalCapabilities =
    capabilitiesOverride ??
    context?.session?.globalCapabilities ??
    (capabilities.includes('branch:all') ? capabilities : []);
  const canReadIdentity = sessionReady && globalCapabilities.includes('identity-verification:read');
  const branches = context?.session?.branches ?? [];
  const [user, setUser] = useState<UserSummary>();
  const [catalog, setCatalog] = useState<RoleCatalogItem[]>([]);
  const [audit, setAudit] = useState<AuditSummary[]>([]);
  const [verification, setVerification] = useState<IdentityVerificationReviewCase>();
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
      const nextUser = await client.getUser(id);
      const [roles, nextAudit, nextVerification] = await Promise.all([
        client.roleCatalog(),
        canAudit ? client.listAudit(id) : Promise.resolve([]),
        nextUser.audience === 'CUSTOMER' && canReadIdentity
          ? client.getUserIdentityVerification(id).catch(() => undefined)
          : Promise.resolve(undefined),
      ]);
      setUser(nextUser);
      setCatalog(roles);
      setAudit(nextAudit);
      setVerification(nextVerification);
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 404)
        setNotFound(true);
      else setFailure(failureCode(error));
    } finally {
      setLoading(false);
    }
  }, [canAudit, canReadIdentity, client, id]);

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
  // Treat legacy/test clients without the new audience field as staff until all
  // consumers have moved to the generated contract.
  const canAdminStaff = canAdmin && user.audience !== 'CUSTOMER';
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
          <Button
            variant="secondary"
            leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
            onClick={() => void load()}
          >
            Muat ulang
          </Button>
          {canAdminStaff && (
            <Button onClick={() => setAction('profile')}>
              <UserRoundCog className="size-4" /> Edit profil
            </Button>
          )}
          {canAdminStaff && (
            <Button variant="secondary" onClick={() => setAction('roles')}>
              <ShieldCheck className="size-4" /> Kelola role
            </Button>
          )}
          {canAdminStaff && user.status === 'ACTIVE' && (
            <Button variant="secondary" onClick={() => setAction('password')}>
              <KeyRound className="size-4" /> Setup password
            </Button>
          )}
          {canAdminStaff && user.status !== 'PENDING_ACTIVATION' && (
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

          {user.audience === 'CUSTOMER' && (
            <Panel className="p-5 sm:p-6" aria-labelledby="identity-verification-heading">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="identity-verification-heading" className="text-lg font-bold text-dd-ink">
                    Verifikasi Identitas
                  </h2>
                  <p className="mt-1 text-sm text-dd-muted">
                    Status aman Selfie dan KTP. Gambar tidak dimuat pada halaman pengguna.
                  </p>
                </div>
                {verification && (
                  <StatusBadge
                    tone={
                      verification.verificationStatus === 'APPROVED'
                        ? 'success'
                        : verification.verificationStatus === 'ACTION_REQUIRED'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {verification.verificationStatus === 'APPROVED'
                      ? 'Terverifikasi'
                      : verification.verificationStatus === 'ACTION_REQUIRED'
                        ? 'Perlu perbaikan'
                        : 'Menunggu pemeriksaan'}
                  </StatusBadge>
                )}
              </div>
              {!canReadIdentity ? (
                <p className="mt-4 text-sm text-dd-muted">
                  Permission global verifikasi identitas diperlukan untuk melihat status dokumen.
                </p>
              ) : !verification ? (
                <p className="mt-4 text-sm text-dd-muted">
                  Dokumen verifikasi belum tersedia atau fitur review belum diaktifkan.
                </p>
              ) : (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {(['SELFIE', 'KTP_FRONT'] as const).map((kind) => {
                      const document = verification.documents.find((item) => item.kind === kind);
                      return (
                        <div key={kind} className="rounded-dd-md border border-dd-line p-4">
                          <strong>{kind === 'SELFIE' ? 'Selfie' : 'KTP depan'}</strong>
                          <p className="mt-2 text-sm text-dd-muted">
                            {document
                              ? `${document.status} · ${document.uploadStatus} · ${document.scanStatus}`
                              : 'Belum tersedia'}
                          </p>
                          {document?.rejectionReasonCode && (
                            <p className="mt-1 text-xs text-dd-warning">
                              Alasan: {document.rejectionReasonCode}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    className="button-primary mt-5 inline-flex"
                    href={`/identity-verifications?customerUserId=${encodeURIComponent(user.id)}`}
                  >
                    <Eye className="size-4" /> Periksa dokumen
                  </Link>
                </>
              )}
            </Panel>
          )}

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
        open={action === 'profile' && canAdminStaff}
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
        open={action === 'roles' && canAdminStaff}
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
        open={action === 'password' && canAdminStaff}
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
        open={action === 'status' && canAdminStaff}
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
