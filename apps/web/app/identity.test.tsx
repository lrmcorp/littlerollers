import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { SignInView } from './sign-in/sign-in-view';
import { UsersView } from './users/users-view';
import type { IdentityClient } from './identity-client';

const client = (overrides: Partial<IdentityClient> = {}): IdentityClient => ({
  signIn: vi.fn().mockResolvedValue(undefined),
  stepUp: vi.fn().mockResolvedValue(undefined),
  invite: vi.fn().mockResolvedValue('CREATED'),
  deactivate: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('identity UI', () => {
  it('renders an accessible sign-in success and safe failure', async () => {
    const view = render(<SignInView client={client()} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('terverifikasi');
    view.unmount();
    render(
      <SignInView
        client={client({ signIn: vi.fn().mockRejectedValue({ response: { status: 429 } }) })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Terlalu banyak');
  });

  it('requires MFA then supports invite, duplicate, deactivate and forbidden states', async () => {
    const fake = client();
    render(<UsersView client={fake} />);
    await userEvent.click(screen.getByRole('button', { name: /MFA/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Undang pengguna' }));
    await userEvent.type(screen.getByLabelText('Email kerja'), 'staff@example.test');
    await userEvent.click(screen.getByRole('button', { name: /Buat undangan/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil');
    expect(fake.invite).toHaveBeenCalledWith('staff@example.test', 'ADMIN');
    await userEvent.click(screen.getByRole('button', { name: /Nonaktifkan/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('dinonaktifkan');
  });
});
