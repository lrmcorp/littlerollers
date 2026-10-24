import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { browserIdentityClient } from '@/api-clients/identity-client';
import { SupportCaseDetailView } from './support-case-detail-view';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockDeletability = vi.fn();
const mockRemove = vi.fn();
vi.mock('../../api-clients/lifecycle-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api-clients/lifecycle-client')>();
  return {
    ...actual,
    lifecycleClient: {
      deletability: (...args: unknown[]) => mockDeletability(...args),
      remove: (...args: unknown[]) => mockRemove(...args),
      archive: vi.fn(),
    },
  };
});

const detail = (overrides: Record<string, unknown> = {}) => ({
  id: 'case-1',
  subject: 'Reschedule sesi',
  status: 'OPEN',
  priority: 'NORMAL',
  tags: ['vip'],
  version: 3,
  customer: { id: 'cust-1', displayName: 'Maya', email: 'm@x.test', phoneE164: '+628111' },
  branch: { id: 'b1', name: 'Green Garden' },
  assignedUser: { id: 'staff-1', displayName: 'Admin GG' },
  notes: [
    {
      id: 'n1',
      body: 'Pelanggan menelepon',
      internal: true,
      createdAt: '2026-09-02T03:00:00Z',
      author: { displayName: 'Admin GG' },
    },
  ],
  ...overrides,
});

describe('SupportCaseDetailView', () => {
  const fetchMock = vi.fn();
  let respond: (url: string, init?: RequestInit) => { ok: boolean; status?: number; body: unknown };

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchMock.mockReset();
    respond = (_url, init) => ({
      ok: true,
      body: init?.method === 'PATCH' || init?.method === 'POST' ? { ok: true } : detail(),
    });
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      const result = respond(url, init);
      return { ok: result.ok, status: result.status ?? 200, json: async () => result.body };
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  const calls = (method: string) =>
    fetchMock.mock.calls.filter(([, init]) => init?.method === method);

  it('shows the case with its internal notes and no preview notice', async () => {
    render(<SupportCaseDetailView id="case-1" />);
    expect(await screen.findByRole('heading', { name: 'Reschedule sesi' })).toBeVisible();
    expect(screen.getByText('Pelanggan menelepon')).toBeVisible();
    expect(screen.queryByText(/Pratinjau/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Simpan perubahan' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Tambah catatan internal' })).toBeEnabled();
  });

  it('saves status, priority, tags and the loaded version', async () => {
    const user = userEvent.setup();
    render(<SupportCaseDetailView id="case-1" />);
    await screen.findByRole('heading', { name: 'Reschedule sesi' });
    await user.selectOptions(screen.getByLabelText('Status Case'), 'RESOLVED');
    await user.selectOptions(screen.getByLabelText('Prioritas'), 'HIGH');
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(calls('PATCH')).toHaveLength(1));
    const [url, init] = calls('PATCH')[0]!;
    expect(url).toBe('/api/v1/support-cases/case-1');
    expect(JSON.parse(init.body)).toEqual({
      status: 'RESOLVED',
      priority: 'HIGH',
      assignedUserId: 'staff-1',
      tags: ['vip'],
      expectedVersion: 3,
    });
    expect(await screen.findByText('Kasus bantuan diperbarui.')).toBeVisible();
  });

  it('reassigns through the staff picker and offers staff only, not customers', async () => {
    vi.spyOn(browserIdentityClient, 'lookupUsers').mockResolvedValue({
      items: [
        { id: 'staff-2', label: 'Manager GG', description: 'mgr@x.test', metadata: { roles: ['MANAGER'], branchIds: [] } },
        { id: 'cust-9', label: 'Pelanggan Biasa', description: 'c@x.test', metadata: { roles: ['CUSTOMER'], branchIds: [] } },
      ],
      page: { nextCursor: null, hasMore: false },
    } as never);
    const user = userEvent.setup();
    render(<SupportCaseDetailView id="case-1" />);
    await screen.findByRole('heading', { name: 'Reschedule sesi' });
    await user.click(screen.getByRole('combobox', { name: /Staf ditugaskan/ }));
    expect(await screen.findByRole('option', { name: /Manager GG/ })).toBeVisible();
    expect(screen.queryByRole('option', { name: /Pelanggan Biasa/ })).toBeNull();
    await user.click(screen.getByRole('option', { name: /Manager GG/ }));
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(calls('PATCH')).toHaveLength(1));
    expect(JSON.parse(calls('PATCH')[0]![1].body).assignedUserId).toBe('staff-2');
  });

  it('adds an internal note and reloads the case', async () => {
    const user = userEvent.setup();
    render(<SupportCaseDetailView id="case-1" />);
    await screen.findByRole('heading', { name: 'Reschedule sesi' });
    await user.type(screen.getByLabelText(/Isi Catatan/), '  Sudah dihubungi ulang  ');
    await user.click(screen.getByRole('button', { name: 'Tambah catatan internal' }));
    await waitFor(() => expect(calls('POST')).toHaveLength(1));
    const [url, init] = calls('POST')[0]!;
    expect(url).toBe('/api/v1/support-cases/case-1/internal-notes');
    expect(JSON.parse(init.body)).toEqual({ body: 'Sudah dihubungi ulang' });
    expect(
      await screen.findByText('Catatan internal ditambahkan dan tidak terlihat oleh pelanggan.'),
    ).toBeVisible();
  });

  it('explains a version conflict in Indonesian', async () => {
    respond = (_url, init) =>
      init?.method === 'PATCH'
        ? { ok: false, status: 409, body: { code: 'STALE_VERSION' } }
        : { ok: true, body: detail() };
    const user = userEvent.setup();
    render(<SupportCaseDetailView id="case-1" />);
    await screen.findByRole('heading', { name: 'Reschedule sesi' });
    await user.selectOptions(screen.getByLabelText('Status Case'), 'CLOSED');
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('diubah orang lain');
  });

  it('explains why a handled case cannot be deleted and offers no delete', async () => {
    mockDeletability.mockResolvedValue({
      kind: 'support-case',
      id: 'case-1',
      deletable: false,
      blockers: [{ kind: 'support_case_note', label: 'catatan penanganan', count: 1 }],
    });
    const user = userEvent.setup();
    render(<SupportCaseDetailView id="case-1" />);
    await user.click(await screen.findByRole('button', { name: 'Hapus kasus' }));
    expect(await screen.findByText('Kasus bantuan belum dapat dihapus')).toBeVisible();
    expect(screen.getByText(/hanya bisa ditutup/)).toBeVisible();
    expect(screen.getByText('Catatan penanganan')).toBeVisible();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('deletes an untouched case only with a reason, then shows the deleted state', async () => {
    mockDeletability.mockResolvedValue({ kind: 'support-case', id: 'case-1', deletable: true, blockers: [] });
    mockRemove.mockResolvedValue({ id: 'case-1', deleted: true });
    const user = userEvent.setup();
    render(<SupportCaseDetailView id="case-1" />);
    await user.click(await screen.findByRole('button', { name: 'Hapus kasus' }));
    const dialog = await screen.findByRole('dialog', { name: 'Hapus kasus bantuan permanen?' });
    expect(within(dialog).getByRole('button', { name: 'Hapus permanen' })).toBeDisabled();
    await user.type(within(dialog).getByLabelText('Alasan'), 'Kasus dibuat dobel');
    await user.click(within(dialog).getByRole('button', { name: 'Hapus permanen' }));
    await waitFor(() => expect(mockRemove).toHaveBeenCalledWith('support-case', 'case-1', 'Kasus dibuat dobel'));
    expect(await screen.findByText('Kasus bantuan telah dihapus')).toBeVisible();
  });
});
