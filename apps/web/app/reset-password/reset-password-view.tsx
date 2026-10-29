'use client';

import Link from 'next/link';
import { useState } from 'react';
import { browserIdentityClient, type IdentityClient } from '../identity-client';
import { Feedback } from '../ui';
import { AuthPageShell } from '../components/auth/auth-page-shell';

export function ResetPasswordView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  return (
    <AuthPageShell
      eyebrow="Account help"
      title="Reset password"
      description="Choose a new password of 8 to 128 characters. You will be signed out on other devices."
    >
      <form
        className="grid min-w-0 max-w-full gap-4 overflow-x-clip"
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
            .resetPassword(token, password)
            .then(() => setStatus('done'))
            .catch(() => setStatus('error'));
        }}
      >
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          New password
          <span className="relative min-w-0">
            <input
              className="min-h-[50px] w-full min-w-0 rounded-dd-sm border border-dd-line px-4 pr-24"
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
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          New password again
          <input
            className="min-h-[50px] w-full min-w-0 rounded-dd-sm border border-dd-line px-4"
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
          Save new password
        </button>
      </form>
      {status === 'done' && (
        <Feedback kind="status">
          Your password is updated. <Link href="/sign-in">Sign in</Link>.
        </Feedback>
      )}
      {status === 'error' && (
        <Feedback kind="error">The passwords must match and the link must still be valid.</Feedback>
      )}
    </AuthPageShell>
  );
}
