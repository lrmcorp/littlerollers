'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  type ApplicationRole,
  type RoleCatalogItem,
  type UserRoleSummary,
} from '../identity-client';
import { Button, Drawer } from '../components/admin/admin-ui';

export const roleLabels: Record<ApplicationRole, string> = {
  SUPER_OWNER: 'Super Owner',
  OWNER: 'Owner cabang',
  ADMIN: 'Admin cabang',
  MANAGER: 'Manager cabang',
  FINANCE: 'Finance',
  OPS: 'Operations',
  INSTRUCTOR: 'Instruktur',
  CUSTOMER: 'Customer',
};

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
      <legend className="px-2 text-sm font-bold text-dd-ink">Role dan scope</legend>
      {catalog.map((item) => {
        const selected = value[item.role] !== undefined;
        return (
          <div key={item.role} className="rounded-dd-md border border-dd-line bg-white p-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                className="mt-1 size-4 accent-dd-forest"
                type="checkbox"
                checked={selected}
                onChange={(event) => {
                  const next = { ...value };
                  if (event.target.checked) next[item.role] = '';
                  else delete next[item.role];
                  onChange(next);
                }}
              />
              <span>
                <strong className="block text-sm text-dd-ink">{roleLabels[item.role]}</strong>
                <small className="mt-1 block text-xs leading-5 text-dd-muted">
                  {item.scope === 'BRANCH' ? 'Wajib dibatasi pada satu cabang.' : 'Scope global.'}
                </small>
              </span>
            </label>
            {selected && item.scope === 'BRANCH' && (
              <label className="mt-3 block text-xs font-bold text-dd-muted">
                Cabang untuk {roleLabels[item.role]}
                <select
                  className={inputClass}
                  value={value[item.role] ?? ''}
                  onChange={(event) => onChange({ ...value, [item.role]: event.target.value })}
                  required
                >
                  <option value="">Pilih cabang</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
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
    roles: { role: ApplicationRole; branchId?: string | null }[];
  }): Promise<void>;
}) {
  const [selection, setSelection] = useState<RoleSelectionValue>({});
  const selectedRoles = useMemo(() => rolesFromSelection(roles, selection), [roles, selection]);
  const invalid =
    selectedRoles.length === 0 ||
    selectedRoles.some(
      (item) => roles.find(({ role }) => role === item.role)?.scope === 'BRANCH' && !item.branchId,
    );
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void onSubmit({
      email: String(data.get('email')),
      displayName: String(data.get('displayName')),
      roles: selectedRoles,
    });
  };
  return (
    <Drawer open={open} title="Buat pengguna internal" onClose={onClose}>
      <form className="grid gap-5" aria-label="Buat pengguna internal" onSubmit={submit}>
        <p className="text-sm leading-6 text-dd-muted">
          Akun dibuat sebagai menunggu aktivasi. Pengguna menentukan password melalui tautan aman.
        </p>
        <label className="text-sm font-bold text-dd-ink">
          Nama tampilan
          <input className={inputClass} name="displayName" minLength={2} maxLength={160} required />
        </label>
        <label className="text-sm font-bold text-dd-ink">
          Email kerja
          <input className={inputClass} name="email" type="email" autoComplete="off" required />
        </label>
        <RoleSelection
          catalog={roles}
          branches={branches}
          value={selection}
          onChange={setSelection}
        />
        <div className="flex justify-end gap-3 border-t border-dd-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={invalid || submitting}>
            {submitting ? 'Membuat pengguna…' : 'Buat pengguna dan kirim aktivasi'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

export function roleSummary(roles: UserRoleSummary[]) {
  return roles.map(({ role, branch }) => `${roleLabels[role]}${branch ? ` · ${branch.name}` : ''}`);
}

export { inputClass };
