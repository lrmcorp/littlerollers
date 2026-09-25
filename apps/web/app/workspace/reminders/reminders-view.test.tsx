import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../../components/app-feedback';
import { reminderClient } from '../../api-clients/reminder-client';
import { RemindersView } from './reminders-view';

let capabilities: string[] = [];

vi.mock('../../session-context', () => ({
  useSessionContext: () => ({
    status: 'authenticated',
    session: { capabilities },
    hasCapability: (...required: string[]) =>
      required.some((capability) => capabilities.includes(capability)),
  }),
}));

const renderView = () =>
  render(
    <AppFeedbackProvider>
      <RemindersView />
    </AppFeedbackProvider>,
  );

describe('RemindersView access and provider mode', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    capabilities = [];
    vi.spyOn(reminderClient, 'listLogs').mockResolvedValue([]);
    vi.spyOn(reminderClient, 'getSummary').mockResolvedValue({
      totalRecentSent: 0,
      totalRecentFailed: 0,
      lastSentAt: null,
      provider: 'MOCK',
    });
  });

  it('is forbidden without automation:read and never loads WhatsApp logs', async () => {
    capabilities = ['class:assigned:read', 'attendance:self'];
    renderView();
    expect(await screen.findByText('Akses tidak tersedia')).toBeVisible();
    expect(reminderClient.listLogs).not.toHaveBeenCalled();
    expect(reminderClient.getSummary).not.toHaveBeenCalled();
  });

  it('lets read-only roles see logs but hides the trigger buttons', async () => {
    capabilities = ['automation:read'];
    renderView();
    await waitFor(() => expect(reminderClient.getSummary).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /Jalankan Auto-Cancel H-24/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Jalankan Reminder Batch/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Segarkan/ })).toBeVisible();
  });

  it('shows the trigger buttons to roles that can run automation', async () => {
    capabilities = ['automation:read', 'automation:run'];
    renderView();
    expect(await screen.findByRole('button', { name: /Jalankan Auto-Cancel H-24/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /Jalankan Reminder Batch/ })).toBeVisible();
  });

  it('warns that messages are only logged when the provider is the mock', async () => {
    capabilities = ['automation:read'];
    renderView();
    expect(await screen.findByText(/Mode uji/)).toBeVisible();
  });

  it('does not show the mock warning for the live provider', async () => {
    capabilities = ['automation:read'];
    vi.spyOn(reminderClient, 'getSummary').mockResolvedValue({
      totalRecentSent: 4,
      totalRecentFailed: 0,
      lastSentAt: null,
      provider: 'META_CLOUD_API',
    });
    renderView();
    await screen.findByText('4');
    expect(screen.queryByText(/Mode uji/)).toBeNull();
  });
});
