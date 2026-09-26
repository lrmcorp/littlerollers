import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../app-feedback';
import { ReasonDialog } from './reason-dialog';

const view = (props: Partial<React.ComponentProps<typeof ReasonDialog>> = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <AppFeedbackProvider>
      <ReasonDialog
        open
        title="Bekukan paket?"
        confirmLabel="Bekukan"
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />
    </AppFeedbackProvider>,
  );
  return { onConfirm, onCancel };
};

describe('ReasonDialog', () => {
  it('keeps confirm disabled until the reason is long enough and sends it trimmed', async () => {
    const { onConfirm } = view({ minLength: 5 });
    const user = userEvent.setup();
    const confirm = screen.getByRole('button', { name: 'Bekukan' });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText('Alasan'), '  abc  ');
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText('Alasan'), 'de');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith('abc  de');
  });

  it('shows extra fields, an error, and cancels', async () => {
    const { onCancel } = view({ error: 'Gagal diproses', children: <p>Jumlah hari</p> });
    expect(screen.getByText('Jumlah hari')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Gagal diproses');
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('starts empty every time it opens', async () => {
    const { rerender } = render(
      <AppFeedbackProvider>
        <ReasonDialog open title="T" confirmLabel="OK" onConfirm={() => {}} onCancel={() => {}} />
      </AppFeedbackProvider>,
    );
    await userEvent.type(screen.getByLabelText('Alasan'), 'alasan pertama');
    rerender(
      <AppFeedbackProvider>
        <ReasonDialog open={false} title="T" confirmLabel="OK" onConfirm={() => {}} onCancel={() => {}} />
      </AppFeedbackProvider>,
    );
    rerender(
      <AppFeedbackProvider>
        <ReasonDialog open title="T" confirmLabel="OK" onConfirm={() => {}} onCancel={() => {}} />
      </AppFeedbackProvider>,
    );
    expect(screen.getByLabelText('Alasan')).toHaveValue('');
  });
});
