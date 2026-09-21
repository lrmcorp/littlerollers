import { apiFetch } from '../lib/api-client';

export interface ReminderLogItem {
  id: string;
  recipientPhone: string;
  recipientType: string;
  reminderType: string;
  payload: any;
  status: string;
  sentAt: string;
}

export interface RemindersSummary {
  totalRecentSent: number;
  totalRecentFailed: number;
  lastSentAt: string | null;
}

export interface AutoCancelResult {
  evaluatedAt: string;
  evaluatedSlotsCount: number;
  cancelledSlotsCount: number;
  confirmedSlotsCount: number;
  cancelledSlots: Array<{
    slotId: string;
    branchId: string;
    branchName: string;
    className: string;
    startAt: string;
    bookedCount: number;
    minQuota: number;
    refundedBookingsCount: number;
  }>;
}

export interface BatchRemindersResult {
  evaluatedAt: string;
  adminDigestsSent: number;
  ownerRecapsSent: number;
  customerH7Sent: number;
  customerH3Sent: number;
  customerH1Sent: number;
  customerExpiredRenewSent: number;
  stoppedCustomersProtected: number;
}

export const reminderClient = {
  async listLogs(params?: {
    phone?: string;
    reminderType?: string;
    status?: string;
    limit?: number;
  }): Promise<ReminderLogItem[]> {
    const query = new URLSearchParams();
    if (params?.phone) query.set('phone', params.phone);
    if (params?.reminderType) query.set('reminderType', params.reminderType);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const res = await apiFetch<{ success: boolean; data: ReminderLogItem[] }>(
      `/api/v1/operations/reminders/logs${qs ? `?${qs}` : ''}`,
    );
    return res.data;
  },

  async getSummary(): Promise<RemindersSummary> {
    const res = await apiFetch<{ success: boolean; data: RemindersSummary }>(
      '/api/v1/operations/reminders/summary',
    );
    return res.data;
  },

  async triggerAutoCancel(): Promise<AutoCancelResult> {
    const res = await apiFetch<{ success: boolean; data: AutoCancelResult }>(
      '/api/v1/operations/auto-cancel/evaluate',
      {
        method: 'POST',
      },
    );
    return res.data;
  },

  async triggerBatchReminders(): Promise<BatchRemindersResult> {
    const res = await apiFetch<{ success: boolean; data: BatchRemindersResult }>(
      '/api/v1/operations/reminders/evaluate-batch',
      {
        method: 'POST',
      },
    );
    return res.data;
  },
};
