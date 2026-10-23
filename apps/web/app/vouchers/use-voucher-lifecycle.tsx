'use client';

import { useState, type ReactNode } from 'react';
import { useAppFeedback } from '../components/app-feedback';
import type { ActionMenuItem } from '../components/admin/admin-ui';
import { LifecycleDialog, type LifecycleAction } from '../components/admin/lifecycle-dialog';
import { lifecycleFailureMessage } from '../api-clients/lifecycle-client';
import { browserVoucherClient, type VoucherRecord } from '@/api-clients/voucher-client';

type Target = Pick<VoucherRecord, 'id' | 'code' | 'name' | 'status' | 'version'>;

/**
 * Jeda / Arsipkan / Hapus voucher, dipakai bersama oleh daftar dan halaman detail.
 * Jeda = sementara; Arsip = permanen dan tersembunyi; Hapus hanya bila belum pernah dipakai (server yang menentukan).
 */
export function useVoucherLifecycle(
  onChanged: (action: LifecycleAction | 'activate', updated?: VoucherRecord) => void | Promise<void>,
) {
  const feedback = useAppFeedback();
  const [target, setTarget] = useState<{ voucher: Target; action: LifecycleAction } | null>(null);

  const activate = async (voucher: Target) => {
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: `${voucher.status === 'ARCHIVED' ? 'Buka arsip dan aktifkan' : 'Aktifkan'} voucher ${voucher.code}?`,
      message: `Voucher "${voucher.name}" akan dapat digunakan pelanggan sesuai kuota dan periode.`,
      confirmLabel: 'Aktifkan',
    });
    if (!accepted) return;
    try {
      const updated = await browserVoucherClient.transition(voucher.id, 'activate', voucher.version);
      feedback.showToast({ tone: 'success', title: 'Voucher berhasil diaktifkan' });
      await onChanged('activate', updated);
    } catch (failure) {
      feedback.showAlert({
        tone: 'danger',
        title: 'Gagal mengaktifkan voucher',
        message: lifecycleFailureMessage(failure),
      });
    }
  };

  const open = (voucher: Target, action: LifecycleAction) => setTarget({ voucher, action });

  const items = (voucher: Target): ActionMenuItem[] => [
    {
      id: 'pause',
      label: 'Jeda',
      hidden: voucher.status !== 'ACTIVE',
      onClick: () => open(voucher, 'deactivate'),
    },
    {
      id: 'activate',
      label: voucher.status === 'ARCHIVED' ? 'Buka arsip & aktifkan' : 'Aktifkan',
      tone: 'success',
      hidden: !['PAUSED', 'DRAFT', 'ARCHIVED'].includes(voucher.status),
      onClick: () => void activate(voucher),
    },
    {
      id: 'archive',
      label: 'Arsipkan',
      hidden: voucher.status === 'ARCHIVED',
      onClick: () => open(voucher, 'archive'),
    },
    {
      id: 'delete',
      label: 'Hapus',
      tone: 'danger',
      divider: true,
      onClick: () => open(voucher, 'delete'),
    },
  ];

  const dialog: ReactNode = (
    <LifecycleDialog
      request={
        target
          ? { kind: 'voucher', id: target.voucher.id, name: target.voucher.code, action: target.action }
          : null
      }
      deactivate={(reason) =>
        browserVoucherClient.transition(target!.voucher.id, 'pause', target!.voucher.version, reason)
      }
      archive={(reason) =>
        browserVoucherClient.transition(target!.voucher.id, 'archive', target!.voucher.version, reason)
      }
      onClose={() => setTarget(null)}
      onDone={async (message) => {
        const action = target!.action;
        setTarget(null);
        feedback.showToast({
          tone: 'success',
          title: action === 'delete' ? 'Voucher dihapus' : 'Status voucher diperbarui',
          message,
        });
        await onChanged(action);
      }}
    />
  );

  return { items, activate, open, dialog };
}
