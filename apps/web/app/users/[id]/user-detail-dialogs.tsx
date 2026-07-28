'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ApplicationRole, RoleCatalogItem, UserSummary } from '../../identity-client';
import {
  Button,
  DestructiveActionDialog,
  Dialog,
  FormSection,
} from '../../components/admin/admin-ui';
import {
  inputClass,
  RoleSelection,
  rolesFromSelection,
  roleSummary,
  selectionFromRoles,
  type RoleSelectionValue,
} from '../user-admin-controls';

export function ProfileDialog({
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

export function RoleDialog({
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

export function PasswordDialog({
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

export function StatusDialog({
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
