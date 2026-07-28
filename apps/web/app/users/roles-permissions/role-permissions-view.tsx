'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Copy,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCog,
  X,
} from 'lucide-react';
import {
  accessFailureCode,
  browserAccessClient,
  type AccessClient,
  type AccessRole,
  type CapabilityDefinition,
  type OverrideEffect,
  type UserAccess,
} from '../../access-client';
import { useAppFeedback } from '../../components/app-feedback';
import { SearchInput } from '../../components/forms';
import {
  browserIdentityClient,
  type IdentityClient,
  type LookupOption,
} from '../../identity-client';
import { browserMasterClient, type MasterClient } from '../../master-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';

const REASONS = [
  ['POLICY_UPDATE', 'Pembaruan kebijakan'],
  ['DUTY_CHANGE', 'Perubahan tanggung jawab'],
  ['SECURITY_HARDENING', 'Penguatan keamanan'],
  ['ACCESS_CORRECTION', 'Koreksi akses'],
  ['TEMPORARY_DUTY', 'Tugas sementara'],
  ['ACCESS_EXCEPTION', 'Pengecualian akses'],
  ['SECURITY_RESTRICTION', 'Pembatasan keamanan'],
  ['ROLE_REPLACEMENT', 'Penggantian role'],
] as const;

type RoleDraft = {
  code: string;
  displayName: string;
  description: string;
  scope: 'GLOBAL' | 'BRANCH';
  capabilityKeys: string[];
};

type RoleAssignmentDraft = { roleId: string; branchId: string | null };

const idempotencyKey = () => crypto.randomUUID();
const normalized = (items: string[]) => [...new Set(items)].sort();

function errorMessage(code: string) {
  const messages: Record<string, string> = {
    FORBIDDEN: 'Hanya Super Owner dengan role-permission:manage yang dapat membuka halaman ini.',
    CONFIGURATION_REQUIRED:
      'Management RBAC belum diaktifkan. Set RBAC_POLICY_SOURCE=database dan RBAC_MANAGEMENT_ENABLED=true.',
    ROLE_CODE_CONFLICT: 'Kode role sudah digunakan.',
    ROLE_IN_USE: 'Role masih digunakan user aktif dan tidak dapat dinonaktifkan.',
    PROTECTED_ROLE_CHANGE: 'Perubahan ini melanggar proteksi system role.',
    PROTECTED_CAPABILITY: 'Capability inti hanya dapat dimiliki SUPER_OWNER.',
    LAST_SUPER_OWNER: 'Perubahan ditolak karena akan menghilangkan Super Owner aktif terakhir.',
    SELF_ACCESS_CHANGE_FORBIDDEN: 'Super Owner tidak boleh mengubah akses akunnya sendiri.',
    PERMISSION_OVERRIDE_EXISTS: 'Override aktif untuk user, capability, dan scope itu sudah ada.',
    STALE_VERSION: 'Data telah berubah. Muat ulang sebelum menyimpan kembali.',
    IDEMPOTENCY_KEY_REUSED: 'Intent penyimpanan telah berubah. Ulangi dari data terbaru.',
  };
  return messages[code] ?? `Perubahan gagal (${code}).`;
}

function capabilityMatches(item: CapabilityDefinition, search: string, category: string) {
  const query = search.trim().toLowerCase();
  return (
    (!category || item.category === category) &&
    (!query ||
      item.key.toLowerCase().includes(query) ||
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query))
  );
}

export function RolePermissionsView({
  accessClient = browserAccessClient,
  identityClient,
  client,
  masterClient = browserMasterClient,
}: {
  accessClient?: AccessClient;
  identityClient?: IdentityClient;
  /** Compatibility alias retained for existing callers during the RBAC UI migration. */
  client?: IdentityClient;
  masterClient?: MasterClient;
}) {
  const resolvedIdentityClient = identityClient ?? client ?? browserIdentityClient;
  const feedback = useAppFeedback();
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [capabilities, setCapabilities] = useState<CapabilityDefinition[]>([]);
  const [branches, setBranches] = useState<
    Array<{ id: string; code: string; name: string; active: boolean }>
  >([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleDraft, setRoleDraft] = useState<RoleDraft | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [capabilitySearch, setCapabilitySearch] = useState('');
  const [category, setCategory] = useState('');
  const [reasonCode, setReasonCode] = useState('POLICY_UPDATE');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<LookupOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignmentDraft[]>([]);
  const [overrideCapability, setOverrideCapability] = useState('');
  const [overrideEffect, setOverrideEffect] = useState<OverrideEffect>('GRANT');
  const [overrideBranchId, setOverrideBranchId] = useState('');

  const selectedRole = roles.find(({ id }) => id === selectedRoleId) ?? null;
  const categories = useMemo(
    () => [...new Set(capabilities.map(({ category }) => category))].sort(),
    [capabilities],
  );
  const visibleCapabilities = capabilities.filter((item) =>
    capabilityMatches(item, capabilitySearch, category),
  );
  const assignableRoles = roles.filter(
    (role) =>
      role.active &&
      (!role.systemRole ||
        ['ADMIN', 'MANAGER', 'FINANCE', 'OPS', 'SUPER_OWNER'].includes(role.systemRole)),
  );

  function beginRole(role: AccessRole) {
    setSelectedRoleId(role.id);
    setCreatingRole(false);
    setRoleDraft({
      code: role.code,
      displayName: role.displayName,
      description: role.description,
      scope: role.scope,
      capabilityKeys: role.capabilities.map(({ key }) => key),
    });
  }

  async function load() {
    setLoading(true);
    setFailure('');
    try {
      const [nextRoles, nextCapabilities, nextBranches] = await Promise.all([
        accessClient.listRoles(),
        accessClient.listCapabilities({ active: true }),
        masterClient.listBranches(),
      ]);
      setRoles(nextRoles);
      setCapabilities(nextCapabilities);
      setBranches(nextBranches.filter(({ active }) => active));
      const selected = nextRoles.find(({ id }) => id === selectedRoleId) ?? nextRoles[0];
      if (selected) beginRole(selected);
    } catch (error) {
      setFailure(accessFailureCode(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveRole() {
    if (!roleDraft) return;
    const beforeKeys = selectedRole?.capabilities.map(({ key }) => key) ?? [];
    const added = roleDraft.capabilityKeys.filter((key) => !beforeKeys.includes(key));
    const removed = beforeKeys.filter((key) => !roleDraft.capabilityKeys.includes(key));
    const accepted = await feedback.confirm({
      tone: removed.length ? 'danger' : 'warning',
      title: creatingRole ? 'Buat role baru?' : 'Aktifkan perubahan role?',
      message: creatingRole
        ? `${roleDraft.code} akan dibuat dengan ${roleDraft.capabilityKeys.length} capability.`
        : `${added.length} capability ditambahkan, ${removed.length} dicabut, dan session ${selectedRole?.affectedUsers ?? 0} user terdampak akan dicabut.`,
      confirmLabel: creatingRole ? 'Buat role' : 'Simpan perubahan',
    });
    if (!accepted) return;
    setSaving(true);
    setFailure('');
    try {
      if (creatingRole) {
        const created = await accessClient.createRole(
          { ...roleDraft, reasonCode, note: note.trim() || undefined },
          idempotencyKey(),
        );
        await load();
        beginRole(created);
      } else if (selectedRole) {
        let next = selectedRole;
        if (
          roleDraft.displayName !== selectedRole.displayName ||
          roleDraft.description !== selectedRole.description
        )
          next = await accessClient.updateRole(
            selectedRole.id,
            {
              displayName: roleDraft.displayName,
              description: roleDraft.description,
              expectedVersion: selectedRole.version,
              reasonCode,
              note: note.trim() || undefined,
            },
            idempotencyKey(),
          );
        if (
          JSON.stringify(normalized(roleDraft.capabilityKeys)) !==
          JSON.stringify(normalized(beforeKeys))
        )
          next = await accessClient.replaceRoleCapabilities(
            selectedRole.id,
            {
              capabilityKeys: roleDraft.capabilityKeys,
              expectedVersion: next.version,
              reasonCode,
              note: note.trim() || undefined,
            },
            idempotencyKey(),
          );
        await load();
        beginRole(next);
      }
      setNote('');
      feedback.showToast({
        tone: 'success',
        title: 'Role tersimpan',
        message: 'Perubahan aktif dan session user terdampak telah dicabut.',
      });
    } catch (error) {
      setFailure(accessFailureCode(error));
    } finally {
      setSaving(false);
    }
  }

  function createRoleFrom(source?: AccessRole) {
    setCreatingRole(true);
    setSelectedRoleId('');
    setRoleDraft({
      code: source ? `${source.code}_COPY` : '',
      displayName: source ? `${source.displayName} Copy` : '',
      description: source?.description ?? '',
      scope: source?.scope ?? 'BRANCH',
      capabilityKeys:
        source?.capabilities
          .filter(
            ({ systemOnly, globalOnly }) =>
              !systemOnly && (source.scope === 'GLOBAL' || !globalOnly),
          )
          .map(({ key }) => key) ?? [],
    });
  }

  async function deactivateRole() {
    if (!selectedRole || selectedRole.system) return;
    const accepted = await feedback.confirm({
      tone: 'danger',
      title: 'Nonaktifkan role?',
      message: `${selectedRole.code} tidak dapat dipilih lagi. Aksi ditolak jika role masih digunakan.`,
      confirmLabel: 'Nonaktifkan',
    });
    if (!accepted) return;
    try {
      await accessClient.deactivateRole(
        selectedRole.id,
        { expectedVersion: selectedRole.version, reasonCode, note: note.trim() || undefined },
        idempotencyKey(),
      );
      await load();
    } catch (error) {
      setFailure(accessFailureCode(error));
    }
  }

  async function searchUsers() {
    setFailure('');
    try {
      const result = await resolvedIdentityClient.lookupUsers({ q: userSearch, limit: 12 });
      setUserOptions(result.items);
    } catch (error) {
      setFailure(accessFailureCode(error));
    }
  }

  async function loadUser(userId: string) {
    setSelectedUserId(userId);
    setFailure('');
    try {
      const result = await accessClient.getUserAccess(userId);
      setUserAccess(result);
      setRoleAssignments(
        result.roleAssignments
          .filter(({ source, roleId }) => source === 'DIRECT' && roleId)
          .map(({ roleId, branchId }) => ({ roleId: roleId!, branchId })),
      );
    } catch (error) {
      setFailure(accessFailureCode(error));
    }
  }

  function toggleAssignment(role: AccessRole, enabled: boolean, branchId: string | null = null) {
    setRoleAssignments((current) => {
      const matches = (item: RoleAssignmentDraft) =>
        item.roleId === role.id && item.branchId === branchId;
      return enabled
        ? current.some(matches)
          ? current
          : [...current, { roleId: role.id, branchId }]
        : current.filter((item) => !matches(item));
    });
  }

  async function saveUserRoles() {
    if (!userAccess) return;
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: 'Ganti role langsung user?',
      message: `Role langsung ${userAccess.user.displayName} akan diganti dan seluruh session aktifnya dicabut. Role lifecycle/assignment tidak berubah.`,
      confirmLabel: 'Ganti role',
    });
    if (!accepted) return;
    try {
      await accessClient.replaceUserRoles(
        userAccess.user.id,
        {
          roles: roleAssignments,
          expectedVersion: userAccess.user.version,
          reasonCode: 'ROLE_REPLACEMENT',
          note: note.trim() || undefined,
        },
        idempotencyKey(),
      );
      await loadUser(userAccess.user.id);
      feedback.showToast({
        tone: 'success',
        title: 'Role user diperbarui',
        message: 'User wajib login ulang agar akses baru digunakan.',
      });
    } catch (error) {
      setFailure(accessFailureCode(error));
    }
  }

  async function createOverride() {
    if (!userAccess || !overrideCapability) return;
    const accepted = await feedback.confirm({
      tone: overrideEffect === 'DENY' ? 'danger' : 'warning',
      title: `${overrideEffect === 'DENY' ? 'Tolak' : 'Berikan'} permission langsung?`,
      message: `${overrideCapability} berlaku ${
        overrideBranchId ? 'pada cabang terpilih' : 'secara global'
      } sampai dicabut eksplisit. Session user akan dicabut.`,
      confirmLabel: 'Aktifkan override',
    });
    if (!accepted) return;
    try {
      await accessClient.createOverride(
        userAccess.user.id,
        {
          capabilityKey: overrideCapability,
          effect: overrideEffect,
          branchId: overrideBranchId || null,
          reasonCode,
          note: note.trim() || undefined,
        },
        idempotencyKey(),
      );
      await loadUser(userAccess.user.id);
      setOverrideCapability('');
    } catch (error) {
      setFailure(accessFailureCode(error));
    }
  }

  async function revokeOverride(override: UserAccess['overrides'][number]) {
    if (!userAccess) return;
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: 'Cabut permission override?',
      message: `${override.effect} ${override.capabilityKey} akan berhenti berlaku dan user harus login ulang.`,
      confirmLabel: 'Cabut override',
    });
    if (!accepted) return;
    try {
      await accessClient.revokeOverride(
        userAccess.user.id,
        override.id,
        { expectedVersion: override.version, reasonCode, note: note.trim() || undefined },
        idempotencyKey(),
      );
      await loadUser(userAccess.user.id);
    } catch (error) {
      setFailure(accessFailureCode(error));
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="roles-permissions-title">
      <div className="rounded-dd-xl border border-dd-line bg-dd-surface p-6 shadow-dd-card sm:p-8">
        <PageHeader
          eyebrow="Administrasi akses"
          title="Roles & Permissions"
          titleId="roles-permissions-title"
          description="Super Owner mengelola system role, custom role, assignment langsung, dan GRANT/DENY user. Semua mutation diaudit dan mencabut session terdampak."
          context={
            <>
              <StatusBadge tone="success">Database-managed RBAC</StatusBadge>
              <StatusBadge tone="info">Super Owner only</StatusBadge>
            </>
          }
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="button-quiet" href="/users">
            Daftar pengguna <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link className="button-quiet" href="/audit">
            Audit akses
          </Link>
        </div>
      </div>

      {failure && <Feedback kind="error">{errorMessage(failure)}</Feedback>}
      {loading ? (
        <Skeleton label="Memuat role dan capability" />
      ) : failure === 'FORBIDDEN' ? null : (
        <>
          <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-dd-xl border border-dd-line bg-white p-4 shadow-dd-card">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg">Katalog role</h2>
                <button
                  className="button-quiet min-h-10 px-3"
                  type="button"
                  onClick={() => createRoleFrom()}
                >
                  <Plus className="size-4" /> Baru
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`rounded-dd-lg border p-3 text-left ${
                      role.id === selectedRoleId
                        ? 'border-dd-forest bg-dd-surface-muted'
                        : 'border-dd-line'
                    }`}
                    onClick={() => beginRole(role)}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <strong className="text-sm">{role.displayName}</strong>
                      <span className="flex items-center gap-2">
                        {!role.active && <StatusBadge tone="neutral">Nonaktif</StatusBadge>}
                        {role.protected && <LockKeyhole className="size-4 text-dd-muted" />}
                      </span>
                    </span>
                    <span className="mt-1 block font-mono text-xs text-dd-muted">{role.code}</span>
                    <span className="mt-2 block text-xs text-dd-muted">
                      {role.scope === 'GLOBAL' ? 'Global' : 'Per cabang'} · {role.affectedUsers}{' '}
                      user
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {roleDraft ? (
              <div className="space-y-5">
                <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">
                        {creatingRole ? 'Custom role baru' : 'Konfigurasi role'}
                      </p>
                      <h2>{creatingRole ? 'Buat role' : selectedRole?.displayName}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole && (
                        <button
                          className="button-quiet"
                          type="button"
                          onClick={() => createRoleFrom(selectedRole)}
                        >
                          <Copy className="size-4" /> Clone
                        </button>
                      )}
                      <StatusBadge tone={selectedRole?.system ? 'info' : 'neutral'}>
                        {selectedRole?.system ? 'System role' : 'Custom role'}
                      </StatusBadge>
                      {selectedRole && !selectedRole.active && (
                        <StatusBadge tone="neutral">Nonaktif</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">
                      Kode immutable
                      <input
                        value={roleDraft.code}
                        disabled={!creatingRole}
                        maxLength={64}
                        onChange={(event) =>
                          setRoleDraft({
                            ...roleDraft,
                            code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
                          })
                        }
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold">
                      Scope immutable
                      <select
                        value={roleDraft.scope}
                        disabled={!creatingRole}
                        onChange={(event) => {
                          const scope = event.target.value as 'GLOBAL' | 'BRANCH';
                          setRoleDraft({
                            ...roleDraft,
                            scope,
                            capabilityKeys:
                              scope === 'BRANCH'
                                ? roleDraft.capabilityKeys.filter(
                                    (key) =>
                                      !capabilities.find((item) => item.key === key)?.globalOnly,
                                  )
                                : roleDraft.capabilityKeys,
                          });
                        }}
                      >
                        <option value="GLOBAL">Global</option>
                        <option value="BRANCH">Per cabang</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-bold">
                      Nama role
                      <input
                        value={roleDraft.displayName}
                        disabled={Boolean(selectedRole && !selectedRole.active)}
                        maxLength={160}
                        onChange={(event) =>
                          setRoleDraft({ ...roleDraft, displayName: event.target.value })
                        }
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">
                      Deskripsi
                      <textarea
                        value={roleDraft.description}
                        disabled={Boolean(selectedRole && !selectedRole.active)}
                        maxLength={500}
                        rows={3}
                        onChange={(event) =>
                          setRoleDraft({ ...roleDraft, description: event.target.value })
                        }
                      />
                    </label>
                  </div>
                </section>

                <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-64 flex-1">
                      <SearchInput
                        id="capability-search"
                        label="Cari capability"
                        description="Cari key, label, atau deskripsi."
                        placeholder="Contoh: ledger:adjust"
                        value={capabilitySearch}
                        leadingIcon={<Search className="size-4" />}
                        onChange={(event) => setCapabilitySearch(event.target.value)}
                      />
                    </div>
                    <label className="grid min-w-48 gap-2 text-sm font-bold">
                      Kategori
                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                      >
                        <option value="">Semua kategori</option>
                        {categories.map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    {(category || capabilitySearch) && (
                      <button
                        className="button-quiet"
                        type="button"
                        onClick={() => {
                          setCategory('');
                          setCapabilitySearch('');
                        }}
                      >
                        <X className="size-4" /> Bersihkan
                      </button>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-dd-muted">
                    {visibleCapabilities.length} dari {capabilities.length} capability ·{' '}
                    {roleDraft.capabilityKeys.length} dipilih
                  </p>
                  <div className="mt-3 grid max-h-[560px] gap-2 overflow-y-auto pr-1">
                    {visibleCapabilities.map((capability) => {
                      const protectedCapability =
                        capability.systemOnly && selectedRole?.systemRole !== 'SUPER_OWNER';
                      const invalidScope = capability.globalOnly && roleDraft.scope === 'BRANCH';
                      return (
                        <label
                          key={capability.key}
                          className="flex gap-3 rounded-dd-lg border border-dd-line p-3"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 size-4"
                            checked={roleDraft.capabilityKeys.includes(capability.key)}
                            disabled={
                              protectedCapability ||
                              invalidScope ||
                              Boolean(selectedRole && !selectedRole.active)
                            }
                            onChange={(event) =>
                              setRoleDraft({
                                ...roleDraft,
                                capabilityKeys: event.target.checked
                                  ? normalized([...roleDraft.capabilityKeys, capability.key])
                                  : roleDraft.capabilityKeys.filter(
                                      (value) => value !== capability.key,
                                    ),
                              })
                            }
                          />
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <strong className="font-mono text-xs">{capability.key}</strong>
                              {capability.sensitive && (
                                <StatusBadge tone="warning">Sensitif</StatusBadge>
                              )}
                              {capability.globalOnly && (
                                <StatusBadge tone="info">Global only</StatusBadge>
                              )}
                              {capability.systemOnly && (
                                <StatusBadge tone="danger">SUPER_OWNER only</StatusBadge>
                              )}
                            </span>
                            <span className="mt-1 block text-sm">{capability.label}</span>
                            <span className="block text-xs leading-5 text-dd-muted">
                              {capability.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">
                      Alasan perubahan
                      <select
                        value={reasonCode}
                        onChange={(event) => setReasonCode(event.target.value)}
                      >
                        {REASONS.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-bold">
                      Catatan opsional
                      <input
                        value={note}
                        maxLength={500}
                        placeholder="Tidak ditulis mentah ke log"
                        onChange={(event) => setNote(event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="button-primary"
                      type="button"
                      disabled={saving || Boolean(selectedRole && !selectedRole.active)}
                      onClick={() => void saveRole()}
                    >
                      <ShieldCheck className="size-4" />
                      {saving ? 'Menyimpan…' : creatingRole ? 'Review & buat' : 'Review & simpan'}
                    </button>
                    {selectedRole && !selectedRole.system && selectedRole.active && (
                      <button
                        className="button-quiet text-dd-danger"
                        type="button"
                        onClick={() => void deactivateRole()}
                      >
                        Nonaktifkan role
                      </button>
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <EmptyState
                title="Pilih atau buat role"
                description="Pilih role untuk melihat metadata dan capability."
              />
            )}
          </section>

          <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Effective permissions user</p>
                <h2>Assignment & override</h2>
                <p className="mt-1 text-sm text-dd-muted">
                  DENY lebih kuat daripada GRANT dan role. Override tetap aktif sampai dicabut.
                </p>
              </div>
              <UserRoundCog className="size-6 text-dd-forest" />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <SearchInput
                  id="access-user-search"
                  label="Cari user"
                  description="Cari nama, email, atau nomor telepon."
                  placeholder="Nama customer atau staf"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                />
              </div>
              <button className="button-primary" type="button" onClick={() => void searchUsers()}>
                <Search className="size-4" /> Cari
              </button>
            </div>
            {userOptions.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {userOptions.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`rounded-dd-lg border p-3 text-left ${
                      selectedUserId === user.id ? 'border-dd-forest' : 'border-dd-line'
                    }`}
                    onClick={() => void loadUser(user.id)}
                  >
                    <strong className="block text-sm">{user.label}</strong>
                    <span className="block text-xs text-dd-muted">{user.description}</span>
                  </button>
                ))}
              </div>
            )}

            {userAccess && (
              <div className="mt-6 grid gap-5 xl:grid-cols-2">
                <section className="rounded-dd-lg border border-dd-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3>{userAccess.user.displayName}</h3>
                      <p className="text-xs text-dd-muted">
                        {userAccess.user.status} · version {userAccess.user.version}
                      </p>
                    </div>
                    <button
                      className="button-quiet min-h-10 px-3"
                      type="button"
                      onClick={() => void loadUser(userAccess.user.id)}
                    >
                      <RefreshCw className="size-4" /> Refresh
                    </button>
                  </div>
                  <h4 className="mt-5 text-sm">Role langsung</h4>
                  <div className="mt-2 grid gap-2">
                    {assignableRoles.map((role) => {
                      const assignments = roleAssignments.filter(
                        ({ roleId }) => roleId === role.id,
                      );
                      return (
                        <div
                          key={role.id}
                          className="rounded-dd-lg border border-dd-line p-3 text-sm"
                        >
                          <div className="flex items-center gap-3 font-bold">
                            {role.scope === 'GLOBAL' && (
                              <input
                                type="checkbox"
                                className="size-4"
                                aria-label={`${role.displayName} ${role.code}`}
                                checked={assignments.some(({ branchId }) => branchId === null)}
                                onChange={(event) =>
                                  toggleAssignment(role, event.target.checked, null)
                                }
                              />
                            )}
                            {role.displayName}
                            <span className="font-mono text-xs text-dd-muted">{role.code}</span>
                          </div>
                          {role.scope === 'BRANCH' && (
                            <fieldset className="mt-3 grid gap-2">
                              <legend className="text-xs font-bold">Cabang</legend>
                              {branches.map((branch) => (
                                <label key={branch.id} className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    className="size-4"
                                    aria-label={`${role.displayName} · ${branch.code}`}
                                    checked={assignments.some(
                                      ({ branchId }) => branchId === branch.id,
                                    )}
                                    onChange={(event) =>
                                      toggleAssignment(role, event.target.checked, branch.id)
                                    }
                                  />
                                  {branch.code} — {branch.name}
                                </label>
                              ))}
                            </fieldset>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {userAccess.roleAssignments.some(({ source }) => source === 'ASSIGNMENT') && (
                    <div className="mt-4 rounded-dd-lg bg-dd-surface-muted p-3 text-sm">
                      <strong>Role dari lifecycle/assignment</strong>
                      <ul className="mt-2 list-disc pl-5 text-dd-muted">
                        {userAccess.roleAssignments
                          .filter(({ source }) => source === 'ASSIGNMENT')
                          .map((item) => (
                            <li key={item.id}>
                              {item.displayName} · {item.branch?.name ?? 'Global'}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  <button
                    className="button-primary mt-4"
                    type="button"
                    disabled={roleAssignments.some(
                      ({ roleId, branchId }) =>
                        roles.find((role) => role.id === roleId)?.scope === 'BRANCH' && !branchId,
                    )}
                    onClick={() => void saveUserRoles()}
                  >
                    Review & ganti role
                  </button>
                </section>

                <section className="rounded-dd-lg border border-dd-line p-4">
                  <h3>Permission override</h3>
                  <div className="mt-4 grid gap-3">
                    <label className="grid gap-2 text-sm font-bold">
                      Capability
                      <select
                        value={overrideCapability}
                        onChange={(event) => {
                          const key = event.target.value;
                          setOverrideCapability(key);
                          if (capabilities.find((item) => item.key === key)?.globalOnly)
                            setOverrideBranchId('');
                        }}
                      >
                        <option value="">Pilih capability</option>
                        {capabilities
                          .filter(({ systemOnly }) => !systemOnly)
                          .map((item) => (
                            <option key={item.key} value={item.key}>
                              {item.key} — {item.label}
                            </option>
                          ))}
                      </select>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold">
                        Efek
                        <select
                          value={overrideEffect}
                          onChange={(event) =>
                            setOverrideEffect(event.target.value as OverrideEffect)
                          }
                        >
                          <option value="GRANT">GRANT</option>
                          <option value="DENY">DENY</option>
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-bold">
                        Scope
                        <select
                          value={overrideBranchId}
                          disabled={
                            capabilities.find((item) => item.key === overrideCapability)?.globalOnly
                          }
                          onChange={(event) => setOverrideBranchId(event.target.value)}
                        >
                          <option value="">Global</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.code} — {branch.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <button
                      className="button-primary"
                      type="button"
                      disabled={!overrideCapability}
                      onClick={() => void createOverride()}
                    >
                      Tambahkan override
                    </button>
                  </div>
                  <div className="mt-5 grid gap-2">
                    {userAccess.overrides.length === 0 ? (
                      <p className="text-sm text-dd-muted">Belum ada override aktif.</p>
                    ) : (
                      userAccess.overrides.map((override) => (
                        <article
                          key={override.id}
                          className="rounded-dd-lg border border-dd-line p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <StatusBadge tone={override.effect === 'DENY' ? 'danger' : 'success'}>
                                {override.effect}
                              </StatusBadge>
                              <strong className="ml-2 font-mono text-xs">
                                {override.capabilityKey}
                              </strong>
                              <p className="mt-2 text-xs text-dd-muted">
                                {override.branch?.name ?? 'Global'} · {override.reasonCode}
                              </p>
                            </div>
                            <button
                              className="button-quiet min-h-9 px-3 text-xs"
                              type="button"
                              onClick={() => void revokeOverride(override)}
                            >
                              Cabut
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-dd-lg border border-dd-line p-4 xl:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3>Effective permission</h3>
                    <Link
                      className="text-sm font-bold text-dd-forest"
                      href={`/audit?targetUserId=${userAccess.user.id}`}
                    >
                      Lihat audit history <ArrowRight className="inline size-4" />
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-dd-muted">
                    Hasil per capability dan cabang. DENIED selalu mengalahkan role maupun GRANT.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ...new Map(
                        userAccess.effective.grants.map((grant) => [
                          `${grant.capability}:${grant.branchId ?? 'GLOBAL'}`,
                          grant,
                        ]),
                      ).values(),
                    ].map((grant) => {
                      const denied = userAccess.effective.denials.some(
                        (item) =>
                          item.capability === grant.capability &&
                          (item.branchId === null || item.branchId === grant.branchId),
                      );
                      const branch =
                        branches.find(({ id }) => id === grant.branchId)?.code ?? 'GLOBAL';
                      return (
                        <article
                          key={`${grant.capability}:${grant.branchId ?? 'GLOBAL'}`}
                          className="rounded-dd-lg border border-dd-line p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <strong className="font-mono text-xs">{grant.capability}</strong>
                            <StatusBadge tone={denied ? 'danger' : 'success'}>
                              {denied ? 'DENIED' : 'GRANTED'}
                            </StatusBadge>
                          </div>
                          <p className="mt-2 text-xs text-dd-muted">
                            {branch} · {grant.source}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
