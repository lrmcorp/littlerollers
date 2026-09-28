import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckInScannerView } from './scanner-view';

const state = vi.hoisted(() => ({
  capabilities: [] as string[],
  consumeCheckIn: vi.fn(),
  consumeInstructorCheckIn: vi.fn(),
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => ({ hasCapability: (c: string) => state.capabilities.includes(c) }),
}));
vi.mock('@zxing/browser', () => ({ BrowserMultiFormatReader: class {} }));
vi.mock('@/api-clients/booking-client', () => ({
  browserBookingClient: {
    consumeCheckIn: state.consumeCheckIn,
    consumeInstructorCheckIn: state.consumeInstructorCheckIn,
  },
  bookingFailure: async (error: unknown) => (error as Error).message,
}));

const paste = async (value: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Token QR manual'), value);
  return user;
};

describe('check-in scanner by capability', () => {
  beforeEach(() => {
    state.capabilities = [];
    state.consumeCheckIn.mockReset();
    state.consumeInstructorCheckIn.mockReset();
  });

  it('blocks sessions that hold neither attendance capability', () => {
    render(<CheckInScannerView />);
    expect(screen.getByText(/tidak memiliki akses/i)).toBeInTheDocument();
  });

  it('gives an instructor-only session the instructor flow without a customer toggle', async () => {
    state.capabilities = ['attendance:self'];
    state.consumeInstructorCheckIn.mockResolvedValue({
      success: true,
      type: 'INSTRUCTOR',
      classSlotId: 'slot-1',
      checkedInAt: '2026-06-01T09:00:00.000Z',
    });
    render(<CheckInScannerView />);
    expect(screen.queryByRole('button', { name: 'QR pelanggan' })).not.toBeInTheDocument();
    const user = await paste('dd-checkin:v1:abc');
    await user.click(screen.getByRole('button', { name: 'Catat presensi' }));
    await waitFor(() =>
      expect(state.consumeInstructorCheckIn).toHaveBeenCalledWith('dd-checkin:v1:abc', expect.any(String)),
    );
    expect(await screen.findByText('Presensi instruktur tercatat')).toBeInTheDocument();
    expect(state.consumeCheckIn).not.toHaveBeenCalled();
  });

  it('shows the backend rejection instead of a false success', async () => {
    state.capabilities = ['attendance:self'];
    state.consumeInstructorCheckIn.mockRejectedValue(new Error('QR presensi sudah kedaluwarsa.'));
    render(<CheckInScannerView />);
    const user = await paste('dd-checkin:v1:old');
    await user.click(screen.getByRole('button', { name: 'Catat presensi' }));
    expect(await screen.findByText('QR presensi sudah kedaluwarsa.')).toBeInTheDocument();
    expect(screen.queryByText('Presensi instruktur tercatat')).not.toBeInTheDocument();
  });

  it('keeps staff on the customer flow and never calls the instructor endpoint', async () => {
    state.capabilities = ['attendance:manage'];
    state.consumeCheckIn.mockResolvedValue({
      customerName: 'Nadia',
      className: 'Reformer',
      branch: { name: 'Jakarta' },
      auditReference: 'AUD-1',
    });
    render(<CheckInScannerView />);
    expect(screen.queryByRole('button', { name: 'QR presensi instruktur' })).not.toBeInTheDocument();
    const user = await paste('dd-checkin:v1:cust');
    await user.click(screen.getByRole('button', { name: 'Validasi check-in' }));
    expect(await screen.findByText('Check-in berhasil')).toBeInTheDocument();
    expect(state.consumeInstructorCheckIn).not.toHaveBeenCalled();
  });

  it('lets a session with both capabilities switch between the two flows', async () => {
    state.capabilities = ['attendance:manage', 'attendance:self'];
    render(<CheckInScannerView />);
    const user = userEvent.setup();
    expect(screen.getByRole('button', { name: 'Validasi check-in' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'QR presensi instruktur' }));
    expect(screen.getByRole('button', { name: 'Catat presensi' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'QR pelanggan' }));
    expect(screen.getByRole('button', { name: 'Validasi check-in' })).toBeInTheDocument();
  });
});
