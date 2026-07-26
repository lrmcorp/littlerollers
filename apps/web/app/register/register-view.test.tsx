import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegisterView } from './register-view';

describe('customer self-registration', () => {
  it('requires identity fields, private image evidence and explicit consent', () => {
    render(<RegisterView />);
    expect(screen.getByRole('heading', { name: 'Buat akun Daily Dose' })).toBeVisible();
    expect(screen.getByLabelText('Nama lengkap')).toBeRequired();
    expect(screen.getByLabelText('Nama lengkap')).toHaveAttribute(
      'placeholder',
      'Contoh: Nadia Putri',
    );
    expect(screen.getByLabelText('Nomor WhatsApp')).toBeRequired();
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Foto selfie')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp',
    );
    expect(screen.getByLabelText('Foto KTP bagian depan')).toHaveAttribute(
      'capture',
      'environment',
    );
    expect(
      screen.getByLabelText(
        'Saya menyetujui pemrosesan selfie dan KTP untuk verifikasi identitas.',
      ),
    ).toBeRequired();
  });

  it('allows both password fields to be revealed independently', async () => {
    const user = userEvent.setup();
    render(<RegisterView />);

    const password = screen.getByLabelText('Password');
    const confirmation = screen.getByLabelText('Ulangi password');
    expect(password).toHaveAttribute('type', 'password');
    expect(confirmation).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Tampilkan password' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(confirmation).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Sembunyikan password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows a local preview after an identity image is selected', async () => {
    const user = userEvent.setup();
    const createObjectUrl = vi.fn(() => 'blob:https://daily-dose.test/selfie');
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    });
    render(<RegisterView />);

    const selfie = new File(['selfie'], 'selfie.webp', { type: 'image/webp' });
    await user.upload(screen.getByLabelText('Foto selfie'), selfie);

    expect(screen.getByAltText('Pratinjau foto selfie')).toHaveAttribute(
      'src',
      'blob:https://daily-dose.test/selfie',
    );
    expect(screen.getByText('selfie.webp')).toBeVisible();
  });
});
