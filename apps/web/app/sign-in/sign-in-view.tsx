'use client';

import Image from 'next/image';
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
import { BrandMark } from '../components/public/brand-mark';

const messages: Record<UiFailure, string> = {
  AUTHENTICATION_REQUIRED: 'Email atau password tidak valid.',
  CONFIGURATION_REQUIRED: 'Konfigurasi autentikasi belum tersedia. Hubungi administrator.',
  INTERNAL_ERROR: 'Autentikasi mengalami gangguan internal.',
  RATE_LIMITED: 'Terlalu banyak percobaan. Coba kembali nanti.',
  SERVICE_UNAVAILABLE: 'Layanan autentikasi tidak dapat dihubungi.',
  FORBIDDEN: 'Akses tidak diizinkan.',
  IDENTITY_CONFLICT: 'Identitas memerlukan tinjauan dukungan.',
  STALE_VERSION: 'Data telah berubah. Muat ulang lalu coba kembali.',
  SESSION_REVOKED: 'Sesi telah berakhir. Silakan masuk kembali.',
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
        locale: 'id',
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
    document.head.append(script);
  }, [client, clientId, onComplete, onFailure]);

  return clientId ? (
    <div className="flex min-h-[44px] w-full justify-center overflow-hidden" ref={target} />
  ) : (
    <Feedback kind="info">Login Google menunggu konfigurasi client production.</Feedback>
  );
}

export function SignInView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const [state, setState] = useState<AuthState>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const sessionContext = useSessionContext();

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
        Langsung ke formulir masuk
      </a>

      <section
        className="relative isolate min-h-svh overflow-hidden max-[900px]:min-h-[330px] max-[540px]:min-h-[280px]"
        aria-label="Daily Dose Pilates"
      >
        <Image
          className="-z-20 object-cover object-[58%_center]"
          src="/images/public/landing/hero-pilates.png"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 52vw"
          alt=""
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(14,43,31,0.05)_28%,rgba(14,43,31,0.8)_100%),linear-gradient(90deg,rgba(14,43,31,0.09),transparent_50%)]" />
        <div className="absolute right-[clamp(28px,5vw,72px)] bottom-[clamp(38px,7vw,82px)] left-[clamp(28px,5vw,72px)] max-w-[670px] text-white max-[540px]:right-5 max-[540px]:bottom-6 max-[540px]:left-5">
          <p className="mb-4 text-xs font-bold tracking-[0.16em] uppercase">
            Move better, live better
          </p>
          <h1 className="m-0 max-w-[620px] font-sans text-[clamp(3.2rem,5.2vw,5.4rem)] leading-[0.92] font-semibold tracking-[-0.035em] max-[900px]:text-[clamp(2.7rem,8vw,4.3rem)] max-[540px]:text-[2.75rem]">
            Welcome back to your Daily Dose.
          </h1>
          <blockquote className="mt-6 border-l border-white/60 pl-[18px] font-sans text-[1.35rem] max-[900px]:hidden">
            “Stronger body. Calmer mind.”
          </blockquote>
        </div>
      </section>

      <section
        className="grid min-w-0 place-items-center p-[clamp(28px,5vw,72px)] max-[900px]:py-12 max-[540px]:px-5"
        aria-labelledby="sign-in-title"
      >
        <div className="w-full max-w-[510px]" id="auth-form">
          <div className="mb-10 flex items-center justify-between gap-6">
            <BrandMark className="w-[172px] max-[540px]:w-[145px]" priority />
            <Link className="text-sm font-bold text-dd-forest-dark no-underline" href="/">
              Kembali ke beranda
            </Link>
          </div>

          <p className="mb-3 text-xs font-bold tracking-[0.13em] text-dd-forest uppercase">
            Secure member access
          </p>
          <h2
            className="m-0 font-sans text-[clamp(2.7rem,4vw,4rem)] leading-[0.98] font-semibold tracking-[-0.035em]"
            id="sign-in-title"
          >
            Masuk ke Daily Dose
          </h2>
          <p className="mt-5 text-base leading-7 text-dd-muted">
            Gunakan email yang terdaftar atau lanjutkan dengan identitas Google Anda.
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
                className="min-h-[50px] rounded-dd-sm border border-dd-line bg-white px-4 outline-none focus:border-dd-forest"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="nama@perusahaan.com"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Password
              <span className="relative">
                <input
                  className="min-h-[50px] w-full rounded-dd-sm border border-dd-line bg-white px-4 pr-24 outline-none focus:border-dd-forest"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={128}
                  placeholder="Masukkan password"
                  required
                />
                <button
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-1 min-h-11 px-3 text-sm font-bold text-dd-forest"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Sembunyikan' : 'Lihat'}
                </button>
              </span>
            </label>
            <div className="auth-sign-in-meta flex items-center justify-between gap-4 text-sm">
              <Link className="font-bold text-dd-forest" href="/forgot-password">
                Lupa password?
              </Link>
              <span className="text-dd-muted">Akses sesuai permission</span>
            </div>
            <button
              className="auth-primary-action min-h-[52px] w-full rounded-dd-sm bg-dd-forest px-5 font-bold text-white shadow-dd-soft hover:bg-dd-forest-dark disabled:bg-dd-sage"
              disabled={state === 'loading'}
              type="submit"
            >
              {state === 'loading' ? 'Memeriksa akses…' : 'Masuk dengan email'}
            </button>
          </form>

          {state === 'invalid' && (
            <Feedback kind="error">Email atau password tidak valid.</Feedback>
          )}
          {state in messages && (
            <Feedback kind="error">
              {messages[state as UiFailure]}
              {reference && (state === 'INTERNAL_ERROR' || state === 'SERVICE_UNAVAILABLE')
                ? ` Kode referensi: ${reference}.`
                : ''}
            </Feedback>
          )}
          {state === 'success' && <Feedback kind="status">Identitas terverifikasi.</Feedback>}

          <div className="my-6 flex items-center gap-4 text-xs font-bold tracking-wider text-dd-muted uppercase before:h-px before:flex-1 before:bg-dd-line after:h-px after:flex-1 after:bg-dd-line">
            atau
          </div>

          <GoogleIdentityButton client={client} onComplete={complete} onFailure={fail} />

          <div className="mt-6 border-y border-dd-line py-4 text-[13px] leading-6 text-dd-muted">
            <strong className="block text-sm text-dd-ink">Akses terlindungi</strong>
            Seluruh akses dan tindakan dibatasi berdasarkan permission serta scope cabang.
          </div>
          <p className="mt-6 text-center text-sm text-dd-muted">
            Belum punya akun?{' '}
            <Link className="font-bold text-dd-forest" href="/register">
              Daftar sebagai customer
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
