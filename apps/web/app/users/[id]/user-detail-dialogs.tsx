'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ApplicationRole, RoleCatalogItem, UserSummary } from '@/api-clients/identity-client';
import { Button } from '../../components/actions';
import { DestructiveDialog, Modal, useOptionalAppFeedback } from '../../components/app-feedback';
import { FormSection } from '../../components/admin/admin-ui';
import { Textarea, TextInput } from '../../components/forms';
import {
  RoleSelection,
  rolesFromSelection,
  roleSummary,
  selectionFromRoles,
  type RoleSelectionValue,
} from '../user-admin-controls';

function useDialogFormGuard(open: boolean, onClose: () => void, subject: string) {
  const feedback = useOptionalAppFeedback();
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (open) setDirty(false);
  }, [open]);
  const confirmDiscard = () =>
    feedback?.confirm({
      tone: 'warning',
      title: `Batalkan ${subject}?`,
      message: 'Perubahan yang belum disimpan akan hilang.',
      confirmLabel: 'Buang perubahan',
    }) ?? Promise.resolve(true);
  return {
    dirty,
    setDirty,
    confirmDiscard,
    closeImmediately() {
      setDirty(false);
      onClose();
    },
    async cancel() {
      if (!dirty || (await confirmDiscard())) {
        setDirty(false);
        onClose();
      }
    },
  };
}

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
  const guard = useDialogFormGuard(open, onClose, 'perubahan profil');
  return (
    <Modal
      open={open}
      title="Edit profil staf"
      description="Perubahan profil dicatat dalam audit dan menggunakan versi data terbaru."
      busy={submitting}
      dirty={guard.dirty}
      onDirtyClose={guard.confirmDiscard}
      onClose={guard.closeImmediately}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => void guard.cancel()}
          >
            Batal
          </Button>
          <Button type="submit" form="staff-profile-form" loading={submitting}>
            Simpan profil
          </Button>
        </div>
      }
    >
      <form
        id="staff-profile-form"
        className="grid gap-4"
        onChange={() => guard.setDirty(true)}
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
          <TextInput
            label="Nama tampilan"
            name="displayName"
            defaultValue={user.displayName}
            minLength={2}
            maxLength={160}
            required
          />
          <TextInput
            label="Nomor WhatsApp"
            name="phoneE164"
            type="tel"
            defaultValue={user.phoneE164 ?? ''}
          />
        </FormSection>
        <Textarea label="Alasan perubahan" name="reason" minLength={3} maxLength={500} required />
      </form>
    </Modal>
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
  const guard = useDialogFormGuard(open, onClose, 'perubahan role');
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
    <Modal
      open={open}
      title="Kelola role dan scope"
      description="Role dari Assignment tidak diubah dari dialog ini."
      busy={submitting}
      dirty={guard.dirty}
      onDirtyClose={guard.confirmDiscard}
      onClose={guard.closeImmediately}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => void guard.cancel()}
          >
            Batal
          </Button>
          <Button type="submit" form="staff-role-form" loading={submitting} disabled={invalid}>
            Simpan role dan cabut sesi
          </Button>
        </div>
      }
    >
      <form
        id="staff-role-form"
        className="grid gap-4"
        onChange={() => guard.setDirty(true)}
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(roles, String(new FormData(event.currentTarget).get('reason')));
        }}
      >
        <RoleSelection
          catalog={catalog}
          branches={branches}
          value={selection}
          onChange={(value) => {
            setSelection(value);
            guard.setDirty(true);
          }}
        />
        <Textarea label="Alasan perubahan" name="reason" minLength={3} maxLength={500} required />
        <div className="rounded-dd-md border border-amber-200 bg-dd-warning-soft p-4 text-sm text-dd-warning">
          Hak akses berubah segera dan seluruh sesi pengguna akan dicabut.
        </div>
      </form>
    </Modal>
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
  const guard = useDialogFormGuard(open, onClose, 'setup password');
  return (
    <Modal
      open={open}
      title="Kirim setup password"
      description="Tautan aman dikirim ke email terverifikasi dan tidak ditampilkan kembali."
      busy={submitting}
      dirty={guard.dirty}
      onDirtyClose={guard.confirmDiscard}
      onClose={guard.closeImmediately}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => void guard.cancel()}
          >
            Batal
          </Button>
          <Button type="submit" form="staff-password-form" loading={submitting}>
            Kirim tautan setup
          </Button>
        </div>
      }
    >
      <form
        id="staff-password-form"
        className="grid gap-4"
        onChange={() => guard.setDirty(true)}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void onSubmit(String(data.get('email')), String(data.get('reason')));
        }}
      >
        <TextInput label="Email terverifikasi" name="email" type="email" required />
        <TextInput label="Alasan" name="reason" minLength={3} maxLength={500} required />
      </form>
    </Modal>
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
  const guard = useDialogFormGuard(open, onClose, 'perubahan status pengguna');
  return (
    <DestructiveDialog
      open={open}
      title={deactivate ? 'Nonaktifkan pengguna' : 'Aktifkan kembali pengguna'}
      impact={
        deactivate
          ? 'Login dihentikan dan seluruh sesi aktif pengguna dicabut.'
          : 'Pengguna dapat login kembali menggunakan role efektif yang masih tersedia.'
      }
      scope={roleSummary(user.roles).join(', ') || 'Tanpa role'}
      busy={submitting}
      dirty={guard.dirty}
      onDirtyClose={guard.confirmDiscard}
      onClose={guard.closeImmediately}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => void guard.cancel()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="staff-status-form"
            variant={deactivate ? 'danger' : 'primary'}
            loading={submitting}
          >
            {deactivate ? 'Konfirmasi nonaktifkan' : 'Konfirmasi aktifkan'}
          </Button>
        </div>
      }
    >
      <form
        id="staff-status-form"
        className="grid gap-4"
        onChange={() => guard.setDirty(true)}
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(String(new FormData(event.currentTarget).get('reason')));
        }}
      >
        <Textarea
          label={`Alasan ${deactivate ? 'deaktivasi' : 'reaktivasi'}`}
          name="reason"
          minLength={3}
          maxLength={500}
          required
        />
        <p className="text-xs text-dd-muted">Expected version: v{user.version}</p>
      </form>
    </DestructiveDialog>
  );
}
