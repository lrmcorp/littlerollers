import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCode from 'qrcode';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckInPassView } from './check-in-pass-view';

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('check-in pass', () => {
  beforeEach(() => {
    vi.mocked(QRCode.toCanvas).mockClear();
    window.history.replaceState({}, '', '/check-in-pass');
  });

  it('renders a primary download action and keeps the PNG download behavior', async () => {
    window.history.replaceState({}, '', '/check-in-pass#token=dd-checkin%3Av1%3Atest-pass');
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,cXI=');

    render(<CheckInPassView />);

    const download = await screen.findByRole('button', { name: 'Download QR' });
    expect(download).toHaveClass('min-h-11', 'bg-dd-forest', 'text-white');
    expect(QRCode.toCanvas).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      'dd-checkin:v1:test-pass',
      expect.objectContaining({ width: 320 }),
    );

    await userEvent.click(download);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('does not expose a download action for an invalid token', async () => {
    render(<CheckInPassView />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Pass QR tidak valid atau sudah tidak tersedia.',
    );
    expect(screen.queryByRole('button', { name: 'Download QR' })).not.toBeInTheDocument();
  });
});
