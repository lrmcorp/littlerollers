import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customerClient } from '../customers/customer-client';
import { SupportCasesView } from './support-cases-view';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    session: { branches: [{ id: 'b1', name: 'Gading Serpong', code: 'DD-GG' }] },
  }),
}));

const existingCase = {
  id: 'case-1',
  subject: 'Reschedule sesi',
  priority: 'HIGH',
  status: 'IN_PROGRESS',
  customer: { id: 'cust-9', displayName: 'Amanda' },
  branch: null,
  _count: { notes: 2 },
};

describe('SupportCasesView', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => ({
      ok: true,
      json: async () => (init?.method === 'POST' ? { id: 'case-2' } : { items: [existingCase] }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(customerClient, 'list').mockResolvedValue({
      items: [
        {
          id: 'cust-1',
          displayName: 'Budi Santoso',
          email: 'budi@example.test',
          phoneE164: '+628111',
        },
      ],
      summary: { total: 1 },
      page: { hasMore: false, nextCursor: null },
    } as never);
  });

  it('picks the customer by search instead of asking for a raw ID', async () => {
    render(<SupportCasesView />);
    await screen.findByText('Reschedule sesi');
    expect(screen.queryByLabelText(/Customer ID/i)).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: /Pelanggan/ }));
    await user.click(await screen.findByRole('option', { name: /Budi Santoso/ }));
    await user.type(screen.getByLabelText(/Subjek Case/), 'Lupa membawa QR');
    await user.click(screen.getByRole('button', { name: 'Buat kasus bantuan' }));

    await waitFor(() => {
      const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
      expect(post).toBeTruthy();
      expect(JSON.parse(post![1].body)).toMatchObject({
        customerUserId: 'cust-1',
        subject: 'Lupa membawa QR',
        priority: 'NORMAL',
      });
    });
  });

  it('shows priority and status in Indonesian', async () => {
    render(<SupportCasesView />);
    await screen.findByText('Reschedule sesi');
    const list = within(screen.getByRole('list'));
    expect(list.getByText('Tinggi')).toBeVisible();
    expect(list.getByText('Diproses')).toBeVisible();
    expect(screen.queryByText('IN_PROGRESS')).not.toBeInTheDocument();
    // Satu di formulir buat kasus, satu di filter prioritas.
    expect(screen.getAllByRole('option', { name: 'Mendesak' })).toHaveLength(2);
  });

  it('filters by status chip and searches, sending the filters to the API', async () => {
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => ({
        items: [existingCase],
        summary: { total: 5, open: 2, inProgress: 1, resolved: 2 },
        page: { nextCursor: null },
      }),
    }));
    render(<SupportCasesView />);
    await screen.findByText('Reschedule sesi');
    const user = userEvent.setup();
    expect(screen.getByRole('button', { name: 'Semua (5)' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Terbuka (2)' }));
    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('status=OPEN'))).toBe(true),
    );
    await user.type(screen.getByLabelText('Cari kasus'), 'amanda');
    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('q=amanda'))).toBe(true),
    );
    await user.click(screen.getByLabelText('Ditugaskan ke saya'));
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) => String(url).includes('assignedUserId=me')),
      ).toBe(true),
    );
  });

  it('loads the next page with the cursor and appends it', async () => {
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      json: async () =>
        String(url).includes('cursor=c1')
          ? {
              items: [{ ...existingCase, id: 'case-3', subject: 'Kasus kedua' }],
              page: { nextCursor: null },
            }
          : { items: [existingCase], page: { nextCursor: 'c1' } },
    }));
    render(<SupportCasesView />);
    await screen.findByText('Reschedule sesi');
    await userEvent.click(screen.getByRole('button', { name: 'Muat kasus berikutnya' }));
    expect(await screen.findByText('Kasus kedua')).toBeVisible();
    expect(screen.getByText('Reschedule sesi')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Muat kasus berikutnya' })).toBeNull();
  });
});
