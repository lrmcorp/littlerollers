import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../../components/app-feedback';
import { reminderClient, type ReminderLogItem } from '../../api-clients/reminder-client';
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
    vi.spyOn(reminderClient, 'listLogs').mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
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

describe('RemindersView pagination', () => {
  const createMockItem = (id: number): ReminderLogItem => ({
    id: `log-${id}`,
    recipientPhone: `0812345678${id.toString().padStart(2, '0')}`,
    recipientType: 'CUSTOMER',
    reminderType: 'EXPIRY_H7',
    payload: { textPreview: `Pesan pengingat ${id}` },
    status: 'SENT',
    sentAt: '2026-09-29T10:00:00.000Z',
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    capabilities = ['automation:read'];
    vi.spyOn(reminderClient, 'getSummary').mockResolvedValue({
      totalRecentSent: 45,
      totalRecentFailed: 0,
      lastSentAt: '2026-09-29T10:00:00.000Z',
      provider: 'META_CLOUD_API',
    });
  });

  it('renders pagination and handles page navigation', async () => {
    const listSpy = vi.spyOn(reminderClient, 'listLogs').mockImplementation(async (params) => {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const start = (page - 1) * limit;
      const items = Array.from({ length: 45 }, (_, i) => createMockItem(i + 1)).slice(
        start,
        start + limit,
      );
      return {
        items,
        total: 45,
        page,
        limit,
        totalPages: 3,
      };
    });

    renderView();

    // Verify first page renders items and pagination info
    await screen.findByText('081234567801');
    expect(screen.getByText('081234567820')).toBeVisible();
    expect(screen.queryByText('081234567821')).toBeNull();

    const paginationNav = screen.getByRole('navigation', { name: 'Paginasi data' });
    expect(paginationNav).toBeVisible();
    expect(within(paginationNav).getByText(/Menampilkan 1–20 dari 45 data/)).toBeVisible();

    // Click next page button
    const nextBtn = within(paginationNav).getByRole('button', { name: /Berikutnya/ });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 20 }),
      );
    });

    await screen.findByText('081234567821');
    expect(within(paginationNav).getByText(/Menampilkan 21–40 dari 45 data/)).toBeVisible();

    // Reset to page 1 on search change
    const searchInput = screen.getByPlaceholderText('Cari nomor HP penerima...');
    fireEvent.change(searchInput, { target: { value: '0812' } });

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, phone: '0812' }),
      );
    });
  });
});
