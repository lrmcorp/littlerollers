'use client';

import { useMemo, useState, type FormEvent } from 'react';
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
                <strong className="block text-sm text-dd-ink">{roleLabel(item.role)}</strong>
                <small className="mt-1 block text-xs leading-5 text-dd-muted">
                  {item.scope === 'BRANCH' ? 'Wajib dibatasi pada satu cabang.' : 'Scope global.'}
                </small>
              </span>
            </label>
            {selected && item.scope === 'BRANCH' && (
              <SearchSelect
                wrapperClassName="mt-3"
                label={`Cabang untuk ${roleLabel(item.role)}`}
                value={value[item.role] ?? ''}
                required
                placeholder="Pilih cabang"
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
    roles: { role: ApplicationRole; branchId?: string | null }[];
  }): Promise<void>;
}) {
  const feedback = useOptionalAppFeedback();
  const [selection, setSelection] = useState<RoleSelectionValue>({});
  const [dirty, setDirty] = useState(false);
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
  const hasChanges = dirty || Object.keys(selection).length > 0;
  const confirmDiscard = () =>
    feedback?.confirm({
      tone: 'warning',
      title: 'Batalkan pembuatan pengguna?',
      message: 'Profil dan role yang belum disimpan akan hilang.',
      confirmLabel: 'Buang input',
    }) ?? Promise.resolve(true);
  const cancel = async () => {
    if (!hasChanges || (await confirmDiscard())) {
      setDirty(false);
      setSelection({});
      onClose();
    }
  };
  return (
    <Drawer
      open={open}
      title="Buat pengguna internal"
      busy={submitting}
      dirty={hasChanges}
      onDirtyClose={confirmDiscard}
      onClose={() => {
        setDirty(false);
        setSelection({});
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
            Buat pengguna dan kirim aktivasi
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
          Akun dibuat sebagai menunggu aktivasi. Pengguna menentukan password melalui tautan aman.
        </p>
        <TextInput
          label="Nama tampilan"
          name="displayName"
          minLength={2}
          maxLength={160}
          required
        />
        <TextInput label="Email kerja" name="email" type="email" autoComplete="off" required />
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
