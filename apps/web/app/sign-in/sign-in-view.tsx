'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  failureReference,
  type IdentityClient,
  type UiFailure,
} from '../identity-client';
import { Feedback } from '../ui';
import { useSessionContext } from '../session-context';
import { SceneBackdrop } from '../components/public/scene-backdrop';
import { BrandMark } from '../components/public/brand-mark';

const messages: Record<UiFailure, string> = {
  AUTHENTICATION_REQUIRED: 'That email or password is not right.',
  CONFIGURATION_REQUIRED: 'Sign-in is unavailable right now. Please try again later.',
  INTERNAL_ERROR: 'Something went wrong while signing you in.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  SERVICE_UNAVAILABLE: 'Sign-in is unavailable right now. Please try again later.',
  FORBIDDEN: 'This account cannot sign in here.',
  IDENTITY_CONFLICT: 'Your account needs a check by our team. Please contact your club.',
  STALE_VERSION: 'Something changed. Reload the page and try again.',
  SESSION_REVOKED: 'You were signed out. Please sign in again.',
};

type AuthState = 'idle' | 'loading' | 'success' | 'invalid' | UiFailure;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(input: {
            client_id: string;
            nonce: string;
            callback(response: { credential: string }): void;
          }): void;
          renderButton(element: HTMLElement, options: Record<string, string | number>): void;
        };
      };
    };
  }
}

function GoogleIdentityButton({
  client,
  onComplete,
  onFailure,
}: {
  client: IdentityClient;
  onComplete(): Promise<void>;
  onFailure(error: unknown): void;
}) {
  const target = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !target.current) return;
    const nonce = crypto.randomUUID();
    const render = () => {
      if (!window.google || !target.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce,
        callback: ({ credential }) => {
          void client.signInWithGoogleToken(credential, nonce).then(onComplete).catch(onFailure);
        },
      });
      window.google.accounts.id.renderButton(target.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 420,
        locale: 'en',
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    if (existing) {
      if (window.google) render();
      else existing.addEventListener('load', render, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', render, { once: true });
    script.addEventListener('error', () => setUnavailable(true), { once: true });
    document.head.append(script);
  }, [client, clientId, onComplete, onFailure]);

  if (!clientId) return null;
  if (unavailable)
    return (
      <Feedback kind="info">
        Masuk dengan Google sementara tidak tersedia. Gunakan email dan password.
      </Feedback>
    );
  return <div className="flex min-h-[44px] w-full justify-center overflow-hidden" ref={target} />;
}

export function SignInView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const [state, setState] = useState<AuthState>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const sessionContext = useSessionContext();
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const complete = useCallback(async () => {
    if (sessionContext) {
      const completed = await sessionContext.completeSignIn(
        new URLSearchParams(window.location.search).get('returnTo') ?? '/workspace',
      );
      if (!completed) throw { response: { status: 401 } };
    }
    setState('success');
  }, [sessionContext]);

  const fail = useCallback((error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const code = failureCode(error);
    setReference(failureReference(error));
    setState(status === 401 || code === 'AUTHENTICATION_REQUIRED' ? 'invalid' : code);
  }, []);

  return (
    <main
      className="auth-sign-in grid min-h-svh grid-cols-[minmax(0,1.06fr)_minmax(480px,0.94fr)] bg-dd-cream font-sans text-dd-ink max-[900px]:grid-cols-1"
      id="main-content"
    >
      <a className="skip-link" href="#auth-form">
        Skip to the sign-in form
      </a>

      <section
        className="relative isolate min-h-svh overflow-hidden max-[900px]:min-h-[330px] max-[540px]:min-h-[280px]"
        aria-label="Little Rollers"
      >
        <SceneBackdrop />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,58,104,0.35)_0%,rgba(20,58,104,0.05)_45%,rgba(7,50,40,0.7)_100%)]" />
        <div className="absolute right-[clamp(28px,5vw,72px)] bottom-[clamp(38px,7vw,82px)] left-[clamp(28px,5vw,72px)] max-w-[670px] text-white max-[540px]:right-5 max-[540px]:bottom-6 max-[540px]:left-5">
          <p className="mb-3 font-display text-xl">LITTLE ROLLERS</p>
          <h1 className="m-0 max-w-[620px] font-display text-[clamp(3rem,5vw,5rem)] leading-[0.95] max-[900px]:text-[clamp(2.5rem,8vw,4rem)] max-[540px]:text-[2.5rem]">
            Welcome back to the club.
          </h1>
        </div>
      </section>

      <section
        className="grid min-w-0 place-items-center p-[clamp(28px,5vw,72px)] max-[900px]:py-12 max-[540px]:px-5"
        aria-labelledby="sign-in-title"
      >
        <div className="w-full max-w-[510px]" id="auth-form">
          <div className="mb-10 flex items-center justify-between gap-6">
            <BrandMark priority />
            <Link
              className="inline-flex min-h-11 items-center text-sm font-medium text-dd-forest no-underline"
              href="/"
            >
              Back to home
            </Link>
          </div>

          <h2
            className="m-0 font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.98] text-dd-forest"
            id="sign-in-title"
          >
            Sign in
          </h2>
          <p className="mt-5 text-base leading-7 text-dd-muted">
            {googleEnabled
              ? 'Use the email you registered with, or continue with Google.'
              : 'Use the email and password you registered with.'}
          </p>

          <form
            className="auth-sign-in-form mt-7 grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              setReference(null);
              setState('loading');
              void client
                .signInWithPassword(String(form.get('email')), String(form.get('password')))
                .then(complete)
                .catch(fail);
            }}
          >
            <label className="grid gap-2 text-sm font-bold">
              Email
              <input
                className="min-h-[50px] rounded-dd-md border border-dd-line bg-white px-4 outline-none focus:border-dd-forest"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Password
              <span className="relative">
                <input
                  className="min-h-[50px] w-full rounded-dd-md border border-dd-line bg-white px-4 pr-24 outline-none focus:border-dd-forest"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={128}
                  placeholder="Your password"
                  required
                />
                <button
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-1 min-h-11 px-3 text-sm font-bold text-dd-forest"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
            <div className="auth-sign-in-meta flex items-center justify-between gap-4 text-sm">
              <Link className="font-bold text-dd-forest" href="/forgot-password">
                Forgot your password?
              </Link>
            </div>
            <button
              className="auth-primary-action min-h-[52px] w-full rounded-full bg-dd-forest px-5 font-medium text-white hover:bg-dd-forest-dark disabled:bg-dd-sage"
              disabled={state === 'loading'}
              type="submit"
            >
              {state === 'loading' ? 'Signing in…' : 'Sign in with email'}
            </button>
          </form>

          {state === 'invalid' && (
            <Feedback kind="error">That email or password is not right.</Feedback>
          )}
          {state in messages && (
            <Feedback kind="error">
              {messages[state as UiFailure]}
              {reference && (state === 'INTERNAL_ERROR' || state === 'SERVICE_UNAVAILABLE')
                ? ` Support code: ${reference}.`
                : ''}
            </Feedback>
          )}
          {state === 'success' && <Feedback kind="status">Signed in.</Feedback>}

          {googleEnabled && (
            <>
              <div className="my-6 flex items-center gap-4 text-xs font-bold tracking-wider text-dd-muted uppercase before:h-px before:flex-1 before:bg-dd-line after:h-px after:flex-1 after:bg-dd-line">
                or
              </div>
              <GoogleIdentityButton client={client} onComplete={complete} onFailure={fail} />
            </>
          )}

          <p className="mt-6 text-center text-sm text-dd-muted">
            New to Little Rollers?{' '}
            <Link className="font-bold text-dd-forest" href="/register">
              Create a parent account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
