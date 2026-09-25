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
    expect(screen.getByRole('option', { name: 'Mendesak' })).toBeInTheDocument();
  });
});
