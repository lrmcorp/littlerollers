import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { AppFeedbackProvider, useAppFeedback } from './app-feedback';

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
});
