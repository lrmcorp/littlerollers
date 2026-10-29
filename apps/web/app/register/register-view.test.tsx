import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { verificationClient } from '../identity-verification-client';
import { RegisterView } from './register-view';

describe('customer self-registration', () => {
  it('requires identity fields, uses a safe POST fallback and has no axe violations', async () => {
    const view = render(<RegisterView />);
    expect(screen.getByRole('heading', { name: 'Create a parent account' })).toBeVisible();
    expect(screen.getByRole('form', { name: 'Create a parent account' })).toHaveAttribute(
      'method',
      'post',
    );
    expect(screen.getByLabelText('Your full name')).toBeRequired();
    expect(screen.getByLabelText('Your full name')).toHaveAttribute('placeholder', 'Your name');
    expect(screen.getByLabelText('WhatsApp number')).toBeRequired();
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Selfie photo')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp',
    );
    expect(screen.getByLabelText('Front of your KTP')).toHaveAttribute('capture', 'environment');
    expect(
      screen.getByLabelText('I agree to my selfie and KTP being used to verify my identity.'),
    ).toBeRequired();
    expect(
      screen.getByText(/Your selfie and KTP photo are only used to verify your identity/),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create account' })).toHaveClass(
      'min-h-12',
      'w-full',
      'bg-dd-forest',
      'text-white',
    );
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('allows both password fields to be revealed independently', async () => {
    const user = userEvent.setup();
    render(<RegisterView />);

    const password = screen.getByLabelText('Password');
    const confirmation = screen.getByLabelText('Password again');
    expect(password).toHaveAttribute('type', 'password');
    expect(confirmation).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(confirmation).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows a local preview after an identity image is selected', async () => {
    const user = userEvent.setup();
    const createObjectUrl = vi.fn(() => 'blob:https://little-rollers.test/selfie');
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
    await user.upload(screen.getByLabelText('Selfie photo'), selfie);

    expect(screen.getByAltText('Preview of your selfie')).toHaveAttribute(
      'src',
      'blob:https://little-rollers.test/selfie',
    );
    expect(screen.getByText('selfie.webp')).toBeVisible();
    expect(screen.getByText('Change photo')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByAltText('Preview of your selfie')).not.toBeInTheDocument();
    expect(screen.getAllByText('Choose photo')).toHaveLength(2);
  });

  it('shows Indonesian inline errors, focuses the first invalid field and clears corrected input', async () => {
    const user = userEvent.setup();
    render(<RegisterView />);

    await user.click(screen.getByRole('button', { name: 'Create account' }));
    const displayName = screen.getByLabelText('Your full name');
    expect(displayName).toHaveFocus();
    expect(displayName).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Please enter your full name.')).toHaveAttribute(
      'id',
      'register-displayName-error',
    );

    await user.type(displayName, 'Nadia Putri');
    expect(screen.queryByText('Please enter your full name.')).not.toBeInTheDocument();

    const phone = screen.getByLabelText('WhatsApp number');
    await user.type(phone, 'bukan-nomor');
    await user.tab();
    expect(
      screen.getByText('Enter a valid WhatsApp number, for example 0812 3456 7890.'),
    ).toBeVisible();
  });

  it('validates password confirmation inline', async () => {
    const user = userEvent.setup();
    render(<RegisterView />);

    await user.type(screen.getByLabelText('Password'), 'password-aman');
    await user.type(screen.getByLabelText('Password again'), 'password-lain');
    await user.tab();
    expect(screen.getByText('The passwords do not match.')).toBeVisible();
    expect(screen.getByLabelText('Password again')).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejects an oversized upload before sending a request', async () => {
    const user = userEvent.setup({ applyAccept: false });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:https://little-rollers.test/large');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const register = vi.spyOn(verificationClient, 'register');
    render(<RegisterView />);

    const oversized = new File([new Uint8Array(8_000_001)], 'selfie.png', {
      type: 'image/png',
    });
    await user.upload(screen.getByLabelText('Selfie photo'), oversized);

    expect(screen.getByText('The selfie photo must be 8 MB or smaller.')).toBeVisible();
    expect(register).not.toHaveBeenCalled();
  });

  it('sends one valid multipart registration and locks the form while loading', async () => {
    const user = userEvent.setup();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:https://little-rollers.test/valid');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const register = vi
      .spyOn(verificationClient, 'register')
      .mockImplementation(() => new Promise(() => undefined));
    render(<RegisterView />);

    await user.type(screen.getByLabelText('Your full name'), ' Nadia Putri ');
    await user.type(screen.getByLabelText('WhatsApp number'), '0812 3456 7890');
    await user.type(screen.getByLabelText('Email'), 'nadia@example.com');
    await user.type(screen.getByLabelText('Password'), 'password-aman');
    await user.type(screen.getByLabelText('Password again'), 'password-aman');
    await user.upload(
      screen.getByLabelText('Selfie photo'),
      new File(['selfie'], 'selfie.webp', { type: 'image/webp' }),
    );
    await user.upload(
      screen.getByLabelText('Front of your KTP'),
      new File(['ktp'], 'ktp.png', { type: 'image/png' }),
    );
    await user.click(
      screen.getByLabelText('I agree to my selfie and KTP being used to verify my identity.'),
    );
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'Nadia Putri',
        phone: '0812 3456 7890',
        email: 'nadia@example.com',
        consent: true,
      }),
    );
    expect(screen.getByRole('button', { name: 'Creating your account…' })).toBeDisabled();
    expect(screen.getByLabelText('Your full name')).toBeDisabled();
  });
});
