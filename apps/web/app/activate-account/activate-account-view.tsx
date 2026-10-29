'use client';

import { useState } from 'react';
import { browserIdentityClient, type IdentityClient } from '../identity-client';
import { Feedback } from '../ui';
import { useSessionContext } from '../session-context';
import { AuthPageShell } from '../components/auth/auth-page-shell';

export function ActivateAccountView({
  client = browserIdentityClient,
}: {
  client?: IdentityClient;
}) {
  const context = useSessionContext();
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  return (
    <AuthPageShell
      eyebrow="Activate your account"
      title="Choose a password"
      description="Set a password to activate your invitation. The link works once."
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const password = String(data.get('password'));
          if (password !== String(data.get('confirmation'))) {
            setStatus('error');
            return;
          }
          const token = new URLSearchParams(window.location.search).get('token') ?? '';
          setStatus('loading');
          void client
            .activatePassword(token, password)
            .then(async () => {
              setStatus('done');
              await context?.completeSignIn('/workspace');
            })
            .catch(() => setStatus('error'));
        }}
      >
        <label className="grid gap-2 text-sm font-bold">
          Password
          <span className="relative">
            <input
              className="min-h-[50px] w-full rounded-dd-sm border border-dd-line px-4 pr-24"
              name="password"
              type={show ? 'text' : 'password'}
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              required
            />
            <button
              className="absolute inset-y-0 right-1 px-3 text-sm font-bold text-dd-forest"
              type="button"
              onClick={() => setShow((value) => !value)}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Password again
          <input
            className="min-h-[50px] rounded-dd-sm border border-dd-line px-4"
            name="confirmation"
            type={show ? 'text' : 'password'}
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
          />
        </label>
        <button
          className="min-h-[50px] rounded-dd-sm bg-dd-forest px-5 font-bold text-white"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Activating…' : 'Activate account'}
        </button>
      </form>
      {status === 'done' && <Feedback kind="status">Your account is active.</Feedback>}
      {status === 'error' && (
        <Feedback kind="error">
          The passwords must match and the activation link must still be valid.
        </Feedback>
      )}
    </AuthPageShell>
  );
}
