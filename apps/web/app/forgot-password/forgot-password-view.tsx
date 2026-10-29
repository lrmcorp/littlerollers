'use client';

import { useState } from 'react';
import { browserIdentityClient, failureCode, type IdentityClient } from '../identity-client';
import { Feedback } from '../ui';
import { AuthPageShell } from '../components/auth/auth-page-shell';

export function ForgotPasswordView({
  client = browserIdentityClient,
}: {
  client?: IdentityClient;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  return (
    <AuthPageShell
      eyebrow="Account help"
      title="Forgot your password?"
      description="Enter the email on your account. If it matches, we will send you a reset link."
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus('loading');
          void client
            .requestPasswordReset(String(new FormData(event.currentTarget).get('email')))
            .then(() => setStatus('sent'))
            .catch((error) => {
              failureCode(error);
              setStatus('error');
            });
        }}
      >
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            className="min-h-[50px] rounded-dd-sm border border-dd-line px-4"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <button
          className="min-h-[50px] rounded-dd-sm bg-dd-forest px-5 font-bold text-white"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      {status === 'sent' && (
        <Feedback kind="status">
          If that email has an account, we sent a reset link. Check your inbox and spam folder.
        </Feedback>
      )}
      {status === 'error' && (
        <Feedback kind="error">We could not send the link. Please try again later.</Feedback>
      )}
    </AuthPageShell>
  );
}
