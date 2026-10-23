'use client';

import { useState, type ReactNode } from 'react';
import { Archive, Power, Trash2 } from 'lucide-react';
import { useAppFeedback } from '../components/app-feedback';
import type { ActionMenuItem } from '../components/admin/admin-ui';
import { LifecycleDialog, type LifecycleAction } from '../components/admin/lifecycle-dialog';
import { lifecycleFailureMessage } from '../api-clients/lifecycle-client';
import { browserBranchClient, type BranchManagementItem } from '@/api-clients/branch-client';

type Target = Pick<BranchManagementItem, 'id' | 'name' | 'version' | 'active' | 'archivedAt'>;

/**
 * Nonaktifkan / Arsipkan / Hapus untuk cabang, dipakai bersama oleh daftar dan halaman detail.
 * Ketiganya selalu meminta alasan; Hapus ditanyakan dulu ke server (data terkait dijelaskan, bukan ditebak).
 */
export function useBranchLifecycle(
  onChanged: (action: LifecycleAction | 'reactivate') => void | Promise<void>,
) {
  const feedback = useAppFeedback();
  const [target, setTarget] = useState<{ branch: Target; action: LifecycleAction } | null>(null);

  const reactivate = async (branch: Target) => {
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: branch.archivedAt ? 'Buka arsip dan aktifkan cabang?' : 'Aktifkan kembali cabang?',
      message: `Cabang "${branch.name}" akan kembali tersedia untuk konfigurasi dan operasi baru.`,
      confirmLabel: 'Aktifkan kembali',
    });
    if (!accepted) return;
    try {
      await browserBranchClient.transition(branch.id, 'reactivate', { expectedVersion: branch.version });
      feedback.showToast({
        tone: 'success',
        title: 'Status cabang diperbarui',
        message: `Cabang "${branch.name}" berhasil diaktifkan kembali.`,
      });
      await onChanged('reactivate');
    } catch (failure) {
      feedback.showAlert({
        tone: 'danger',
        title: 'Gagal mengaktifkan cabang',
        message: lifecycleFailureMessage(failure),
      });
    }
  };

  const items = (branch: Target): ActionMenuItem[] => [
    branch.archivedAt || !branch.active
      ? {
          key: 'reactivate',
          label: branch.archivedAt ? 'Buka arsip & aktifkan' : 'Aktifkan',
          icon: <Power className="size-4" aria-hidden="true" />,
          onClick: () => void reactivate(branch),
        }
      : {
          key: 'deactivate',
          label: 'Nonaktifkan',
          icon: <Power className="size-4" aria-hidden="true" />,
          onClick: () => setTarget({ branch, action: 'deactivate' }),
        },
    {
      key: 'archive',
      label: 'Arsipkan',
      icon: <Archive className="size-4" aria-hidden="true" />,
      hidden: Boolean(branch.archivedAt),
      onClick: () => setTarget({ branch, action: 'archive' }),
    },
    {
      key: 'delete',
      label: 'Hapus',
      icon: <Trash2 className="size-4" aria-hidden="true" />,
      tone: 'danger',
      divider: true,
      onClick: () => setTarget({ branch, action: 'delete' }),
    },
  ];

  const dialog: ReactNode = (
    <LifecycleDialog
      request={
        target
          ? { kind: 'branch', id: target.branch.id, name: target.branch.name, action: target.action }
          : null
      }
      deactivate={(reason) =>
        browserBranchClient.transition(target!.branch.id, 'deactivate', {
          expectedVersion: target!.branch.version,
          reason,
        })
      }
      onClose={() => setTarget(null)}
      onDone={async (message) => {
        const action = target!.action;
        const deleted = action === 'delete';
        setTarget(null);
        feedback.showToast({
          tone: 'success',
          title: deleted ? 'Cabang dihapus' : 'Status cabang diperbarui',
          message,
        });
        await onChanged(action);
      }}
    />
  );

  return { items, dialog };
}
