'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import {
  type ApplicationRole,
  type RoleCatalogItem,
  type UserRoleSummary,
} from '@/api-clients/identity-client';
import { Button } from '../components/actions';
import { Drawer, useOptionalAppFeedback } from '../components/app-feedback';
import { SearchSelect, TextInput } from '../components/forms';
import { roleLabel } from '../lib/role-labels';

export const statusLabels = {
  PENDING_ACTIVATION: 'Menunggu aktivasi',
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
} as const;

const inputClass =
  'mt-1 min-h-11 w-full rounded-dd-md border border-dd-line bg-white px-3 py-2 text-sm text-dd-ink outline-none focus:border-dd-forest focus:ring-2 focus:ring-dd-forest/15';

export type RoleSelectionValue = Partial<Record<ApplicationRole, string>>;

export function RoleSelection({
  catalog,
  branches,
  value,
  onChange,
}: {
  catalog: RoleCatalogItem[];
  branches: { id: string; code: string; name: string }[];
  value: RoleSelectionValue;
  onChange(value: RoleSelectionValue): void;
}) {
  return (
    <fieldset className="grid gap-3 rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4">
      <div className="flex flex-col gap-1 pb-1">
        <legend className="text-sm font-bold text-dd-ink">Peran Staf &amp; Cabang Studio</legend>
        <p className="text-xs text-dd-muted">
          Pilih peran staf yang ditugaskan. Jika peran memerlukan cabang, pilih studio tempat staf bertugas.
        </p>
      </div>
      {catalog.map((item) => {
        const selected = value[item.role] !== undefined;
        return (
          <div
            key={item.role}
            className={`rounded-dd-md border p-3 transition ${
              selected ? 'border-dd-forest bg-dd-success-soft/20 shadow-sm' : 'border-dd-line bg-white'
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                className="mt-1 size-4 accent-dd-forest cursor-pointer"
                type="checkbox"
                checked={selected}
                aria-label={roleLabel(item.role)}
                onChange={(event) => {
                  const next = { ...value };
                  if (event.target.checked) next[item.role] = '';
                  else delete next[item.role];
                  onChange(next);
                }}
              />
              <span className="flex-1">
                <span className="flex items-center justify-between">
                  <strong className="block text-sm text-dd-ink">{roleLabel(item.role)}</strong>
                  <span
                    className={`rounded px-2 py-0.5 text-[13px] font-bold ${
                      item.scope === 'BRANCH'
                        ? 'bg-dd-forest/10 text-dd-forest'
                        : 'bg-dd-surface-muted text-dd-muted'
                    }`}
                  >
                    {item.scope === 'BRANCH' ? 'Per Cabang' : 'Semua Cabang'}
                  </span>
                </span>
                <small className="mt-1 block text-xs leading-5 text-dd-muted">
                  {item.scope === 'BRANCH'
                    ? 'Staf ditugaskan pada satu studio/cabang spesifik.'
                    : 'Akses berlaku secara global di seluruh cabang studio.'}
                </small>
              </span>
            </label>
            {selected && item.scope === 'BRANCH' && (
              <SearchSelect
                wrapperClassName="mt-3 pl-7"
                label={`Cabang untuk ${roleLabel(item.role)}`}
                value={value[item.role] ?? ''}
                required
                placeholder="Pilih cabang studio..."
                options={branches.map((branch) => ({ id: branch.id, label: branch.name }))}
                onChange={(branchId) => onChange({ ...value, [item.role]: branchId })}
              />
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

export function rolesFromSelection(catalog: RoleCatalogItem[], value: RoleSelectionValue) {
  return catalog
    .filter(({ role }) => value[role] !== undefined)
    .map(({ role, scope }) => ({
      role,
      branchId: scope === 'BRANCH' ? value[role] || null : null,
    }));
}

export function selectionFromRoles(roles: UserRoleSummary[]): RoleSelectionValue {
  return Object.fromEntries(roles.map(({ role, branchId }) => [role, branchId ?? '']));
}

export function InviteUserDrawer({
  open,
  branches,
  roles,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  branches: { id: string; code: string; name: string }[];
  roles: RoleCatalogItem[];
  submitting?: boolean;
  onClose(): void;
  onSubmit(input: {
    email: string;
    displayName: string;
    phone?: string;
    password?: string;
    roles: { role: ApplicationRole; branchId?: string | null }[];
  }): Promise<void>;
}) {
  const feedback = useOptionalAppFeedback();
  const [selection, setSelection] = useState<RoleSelectionValue>({});
  const [dirty, setDirty] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const selectedRoles = useMemo(() => rolesFromSelection(roles, selection), [roles, selection]);
  const invalid =
    selectedRoles.length === 0 ||
    selectedRoles.some(
      (item) => roles.find(({ role }) => role === item.role)?.scope === 'BRANCH' && !item.branchId,
    );

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = 'Dose';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += '!';
    setPassword(res);
    setShowPassword(true);
    setDirty(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void onSubmit({
      email: String(data.get('email')),
      displayName: String(data.get('displayName')),
      phone: String(data.get('phone') || '').trim() || undefined,
      password: password.trim() || undefined,
      roles: selectedRoles,
    });
  };

  const hasChanges = dirty || Object.keys(selection).length > 0 || password.length > 0;
  const confirmDiscard = () =>
    feedback?.confirm({
      tone: 'warning',
      title: 'Batalkan pembuatan pengguna?',
      message: 'Data pengguna dan role yang belum disimpan akan hilang.',
      confirmLabel: 'Buang input',
    }) ?? Promise.resolve(true);

  const cancel = async () => {
    if (!hasChanges || (await confirmDiscard())) {
      setDirty(false);
      setSelection({});
      setPassword('');
      onClose();
    }
  };

  return (
    <Drawer
      open={open}
      title="Tambah Pengguna Baru"
      busy={submitting}
      dirty={hasChanges}
      onDirtyClose={confirmDiscard}
      onClose={() => {
        setDirty(false);
        setSelection({});
        setPassword('');
        onClose();
      }}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => void cancel()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="internal-user-create-form"
            loading={submitting}
            disabled={invalid}
          >
            Simpan Pengguna &amp; Aktifkan
          </Button>
        </div>
      }
    >
      <form
        id="internal-user-create-form"
        className="grid gap-5"
        aria-label="Buat pengguna internal"
        onChange={() => setDirty(true)}
        onSubmit={submit}
      >
        <p className="text-sm leading-6 text-dd-muted">
          Buat akun staf baru untuk operasional studio. Pengguna langsung aktif dan dapat segera login dengan email serta kata sandi yang ditentukan.
        </p>
        <TextInput
          label="Nama Lengkap"
          name="displayName"
          placeholder="contoh: Sarah Kartika"
          minLength={2}
          maxLength={160}
          required
        />
        <TextInput
          label="Alamat Email"
          name="email"
          type="email"
          placeholder="contoh: sarah@dailydose.test"
          autoComplete="off"
          required
        />
        <TextInput
          label="Nomor WhatsApp / HP (Opsional)"
          name="phone"
          type="tel"
          placeholder="contoh: 081234567890"
        />

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-dd-ink" htmlFor="user-password-input">
              Kata Sandi Awal (Minimal 8 karakter)
            </label>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="inline-flex items-center gap-1 text-xs font-semibold text-dd-forest hover:underline"
            >
              <RefreshCw className="h-3 w-3" /> Buat Sandi Acak
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              id="user-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setDirty(true);
              }}
              placeholder="Masukkan password atau klik Buat Sandi Acak"
              minLength={8}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-dd-muted hover:text-dd-ink"
              tabIndex={-1}
              aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-dd-muted">
            Jika dikosongkan, pengguna dapat login via Google OAuth atau sandi diset nanti oleh admin.
          </p>
        </div>

        <RoleSelection
          catalog={roles}
          branches={branches}
          value={selection}
          onChange={setSelection}
        />
      </form>
    </Drawer>
  );
}

export function roleSummary(roles: UserRoleSummary[]) {
  return roles.map(({ role, branch }) => `${roleLabel(role)}${branch ? ` · ${branch.name}` : ''}`);
}

export { inputClass };
