import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider, Drawer, Modal, useAppFeedback } from './app-feedback';

function Harness() {
  const feedback = useAppFeedback();
  const [answer, setAnswer] = useState('');
  return (
    <>
      <button
        onClick={() =>
          feedback.showToast({ id: 'saved', tone: 'success', title: 'Tersimpan', durationMs: 0 })
        }
      >
        Toast
      </button>
      <button
        onClick={() =>
          void feedback
            .confirm({ title: 'Nonaktifkan akun?', message: 'Sesi aktif akan dicabut.' })
            .then((value) => setAnswer(value ? 'ya' : 'tidak'))
        }
      >
        Konfirmasi
      </button>
      <output>{answer}</output>
    </>
  );
}

describe('AppFeedbackProvider', () => {
  it('deduplicates toast ids and resolves an accessible confirmation', async () => {
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <Harness />
      </AppFeedbackProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Toast' }));
    await user.click(screen.getByRole('button', { name: 'Toast' }));
    expect(screen.getAllByText('Tersimpan')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Konfirmasi' }));
    expect(screen.getByRole('dialog', { name: 'Nonaktifkan akun?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lanjutkan' }));
    expect(screen.getByText('ya')).toBeInTheDocument();
  });

  it('keeps drawer header and footer outside its scrollable body', () => {
    const onClose = vi.fn();
    render(
      <Drawer
        open
        title="Edit cabang"
        description="Form panjang tetap dapat digunakan pada viewport kecil."
        onClose={onClose}
        footer={<button>Simpan perubahan</button>}
      >
        <div style={{ height: 1600 }}>Konten form</div>
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Edit cabang' });
    expect(dialog).toHaveClass('h-dvh', 'overflow-hidden');
    expect(screen.getByText('Konten form').parentElement).toHaveClass('overflow-y-auto');
    expect(screen.getByRole('button', { name: 'Simpan perubahan' })).toBeVisible();
  });

  it('prevents accidental close while a drawer is dirty', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onDirtyClose = vi.fn().mockResolvedValue(false);
    render(
      <Drawer open dirty title="Edit paket" onClose={onClose} onDirtyClose={onDirtyClose}>
        <button>Field pertama</button>
      </Drawer>,
    );

    await user.keyboard('{Escape}');
    expect(onDirtyClose).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Tutup dialog' })).toBeEnabled();
  });

  it('only lets the topmost modal respond to Escape', async () => {
    const user = userEvent.setup();
    const closeDrawer = vi.fn();
    const closeModal = vi.fn();
    render(
      <>
        <Drawer open title="Drawer dasar" onClose={closeDrawer}>
          <button>Konten drawer</button>
        </Drawer>
        <Modal open title="Konfirmasi teratas" onClose={closeModal}>
          <button>Konten konfirmasi</button>
        </Modal>
      </>,
    );

    await user.keyboard('{Escape}');
    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(closeDrawer).not.toHaveBeenCalled();
  });

  it('renders through a portal and keeps an exiting phase before unmount', async () => {
    const user = userEvent.setup();
    function AnimatedHarness() {
      const [open, setOpen] = useState(true);
      return (
        <div data-testid="page-container">
          <Modal open={open} title="Modal animasi" onClose={() => setOpen(false)}>
            <p>Isi modal</p>
          </Modal>
        </div>
      );
    }
    render(<AnimatedHarness />);
    const dialog = screen.getByRole('dialog', { name: 'Modal animasi' });
    expect(screen.getByTestId('page-container')).not.toContainElement(dialog);
    await user.click(screen.getByRole('button', { name: 'Tutup dialog' }));
    expect(dialog.parentElement).toHaveAttribute('data-overlay-phase', 'exiting');
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Modal animasi' }));
  });
});
