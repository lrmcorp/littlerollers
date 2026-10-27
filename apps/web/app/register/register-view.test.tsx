import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { verificationClient } from '@/api-clients/identity-verification-client';
import { RegisterView } from './register-view';

describe('customer self-registration', () => {
  it('requires identity fields, uses a safe POST fallback and has no axe violations', async () => {
    const view = render(<RegisterView />);
    expect(screen.getByRole('heading', { name: 'Buat akun Daily Dose' })).toBeVisible();
    expect(screen.getByRole('form', { name: 'Registrasi customer' })).toHaveAttribute(
      'method',
      'post',
    );
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
        /Saya menyetujui Syarat & Ketentuan Layanan/i,
      ),
    ).not.toBeRequired();
    expect(
      screen.getByText(/Data pendaftaran dan dokumen identitas Anda disimpan secara privat/i),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Daftar dan masuk' })).toHaveClass(
      'min-h-12',
      'w-full',
      'bg-dd-forest',
      'text-white',
    );
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('numbers the form sections 1 to 3 in order and states what is needed before booking', () => {
    render(<RegisterView />);
    expect(screen.getByText(/1\. Data Diri/)).toBeVisible();
    expect(screen.getByText(/2\. Keamanan Akun/)).toBeVisible();
    expect(screen.getByText(/3\. Dokumen Identitas/)).toBeVisible();
    expect(screen.queryByText(/siap digunakan untuk memilih paket dan memesan jadwal/)).toBeNull();
    expect(
      screen.getByText(/Verifikasi KTP dan identitas diri baru diminta nanti saat pembelian paket pertama/i),
    ).toBeVisible();
  });

  it('renders callout for existing studio members with direct link to sign in (Tiket T-09)', () => {
    render(<RegisterView />);
    expect(screen.getByText('Sudah pernah latihan di studio?')).toBeVisible();
    expect(
      screen.getByText(/Akun kamu mungkin sudah dibuatkan staf\. Masuk pakai nomor WhatsApp/i),
    ).toBeVisible();
    const waLoginLinks = screen.getAllByRole('link', { name: /Masuk dengan nomor WhatsApp/i });
    expect(waLoginLinks.length).toBeGreaterThanOrEqual(1);
    expect(waLoginLinks[0]).toBeVisible();
    expect(waLoginLinks[0]).toHaveAttribute('href', '/sign-in');
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
    expect(screen.getByText('Ganti foto')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(screen.queryByAltText('Pratinjau foto selfie')).not.toBeInTheDocument();
    expect(screen.getAllByText('Pilih foto')).toHaveLength(2);
  });

  it('shows Indonesian inline errors, focuses the first invalid field and clears corrected input', async () => {
    const user = userEvent.setup();
    render(<RegisterView />);

    await user.click(screen.getByRole('button', { name: 'Daftar dan masuk' }));
    const displayName = screen.getByLabelText('Nama lengkap');
    expect(displayName).toHaveFocus();
    expect(displayName).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Nama lengkap wajib diisi.')).toHaveAttribute(
      'id',
      'register-displayName-error',
    );

    await user.type(displayName, 'Nadia Putri');
    expect(screen.queryByText('Nama lengkap wajib diisi.')).not.toBeInTheDocument();

    const phone = screen.getByLabelText('Nomor WhatsApp');
    await user.type(phone, 'bukan-nomor');
    await user.tab();
    expect(
      screen.getByText('Masukkan nomor WhatsApp yang valid (awalan 08 atau +62), misalnya 0812 3456 7890.'),
    ).toBeVisible();
  });

  it('validates password confirmation inline', async () => {
    const user = userEvent.setup();
    render(<RegisterView />);

    await user.type(screen.getByLabelText('Password'), 'password-aman');
    await user.type(screen.getByLabelText('Ulangi password'), 'password-lain');
    await user.tab();
    expect(screen.getByText('Konfirmasi password tidak sama.')).toBeVisible();
    expect(screen.getByLabelText('Ulangi password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejects an oversized upload before sending a request', async () => {
    const user = userEvent.setup({ applyAccept: false });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:https://daily-dose.test/large');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const register = vi.spyOn(verificationClient, 'register');
    render(<RegisterView />);

    const oversized = new File([new Uint8Array(8_000_001)], 'selfie.png', {
      type: 'image/png',
    });
    await user.upload(screen.getByLabelText('Foto selfie'), oversized);

    expect(screen.getByText('Foto selfie maksimal berukuran 8 MB.')).toBeVisible();
    expect(register).not.toHaveBeenCalled();
  });

  it('sends one valid multipart registration and locks the form while loading', async () => {
    const user = userEvent.setup();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:https://daily-dose.test/valid');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const register = vi
      .spyOn(verificationClient, 'register')
      .mockImplementation(() => new Promise(() => undefined));
    render(<RegisterView />);

    await user.type(screen.getByLabelText('Nama lengkap'), ' Nadia Putri ');
    await user.type(screen.getByLabelText('Nomor WhatsApp'), '0812 3456 7890');
    await user.type(screen.getByLabelText('Email'), 'nadia@example.com');
    await user.type(screen.getByLabelText('Password'), 'password-aman');
    await user.type(screen.getByLabelText('Ulangi password'), 'password-aman');
    await user.upload(
      screen.getByLabelText('Foto selfie'),
      new File(['selfie'], 'selfie.webp', { type: 'image/webp' }),
    );
    await user.upload(
      screen.getByLabelText('Foto KTP bagian depan'),
      new File(['ktp'], 'ktp.png', { type: 'image/png' }),
    );
    await user.click(
      screen.getByLabelText(
        /Saya menyetujui Syarat & Ketentuan Layanan/i,
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Daftar dan masuk' }));

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'Nadia Putri',
        phone: '0812 3456 7890',
        email: 'nadia@example.com',
        consent: true,
      }),
    );
    expect(screen.getByRole('button', { name: 'Membuat akun…' })).toBeDisabled();
    expect(screen.getByLabelText('Nama lengkap')).toBeDisabled();
  });

  it('requires consent to register and clears the error when checked', async () => {
    const user = userEvent.setup();
    render(<RegisterView />);

    await user.type(screen.getByLabelText('Nama lengkap'), 'Nadia Putri');
    await user.type(screen.getByLabelText('Nomor WhatsApp'), '0812 3456 7890');
    await user.type(screen.getByLabelText('Email'), 'nadia@example.com');
    await user.type(screen.getByLabelText('Password'), 'password-aman');
    await user.type(screen.getByLabelText('Ulangi password'), 'password-aman');

    await user.click(screen.getByRole('button', { name: 'Daftar dan masuk' }));
    expect(
      screen.getByText('Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi Daily Dose.'),
    ).toBeVisible();

    await user.click(screen.getByLabelText(/Saya menyetujui Syarat & Ketentuan Layanan/i));
    expect(
      screen.queryByText('Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi Daily Dose.'),
    ).not.toBeInTheDocument();
  });
});
