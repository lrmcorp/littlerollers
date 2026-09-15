'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import {
  browserIdentityClient,
  failureCode,
  failureReference,
  type IdentityClient,
  type UiFailure,
} from '@/api-clients/identity-client';
import { Feedback } from '../ui';
import { useSessionContext } from '../session-context';
import { BrandMark } from '../components/public/brand-mark';

const messages: Record<UiFailure, string> = {
  AUTHENTICATION_REQUIRED: 'Email atau password tidak valid.',
  CONFIGURATION_REQUIRED: 'Layanan masuk sementara tidak tersedia. Silakan coba kembali nanti.',
  INTERNAL_ERROR: 'Layanan masuk sedang mengalami gangguan.',
  RATE_LIMITED: 'Terlalu banyak percobaan. Coba kembali nanti.',
  SERVICE_UNAVAILABLE: 'Proses masuk sementara tidak tersedia. Silakan coba kembali nanti.',
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
      className="grid min-h-svh grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(460px,0.9fr)] bg-dd-cream font-sans text-dd-ink"
      id="main-content"
    >
      <a className="skip-link" href="#auth-form">
        Langsung ke formulir masuk
      </a>

      {/* Left Visual Panel */}
      <section
        className="relative isolate hidden lg:flex flex-col justify-between overflow-hidden p-12 min-h-svh sticky top-0 self-start"
        aria-label="Daily Dose Pilates"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <Image
            className="object-cover object-[58%_center]"
            src="/images/public/landing/hero-pilates.png"
            fill
            priority
            sizes="55vw"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dd-forest-dark/95 via-dd-forest-dark/65 to-dd-forest-dark/35" />
        </div>

        {/* Top Badge */}
        <div className="flex items-center gap-2 text-white">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="size-3.5 text-dd-brass" /> Daily Dose Portal
          </span>
        </div>

        {/* Bottom Tagline */}
        <div className="space-y-6 text-white max-w-lg">
          <div className="space-y-3">
            <p className="text-xs font-bold tracking-[0.16em] text-dd-brass uppercase">
              Move better, live better
            </p>
            <h1 className="font-sans text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight">
              Welcome back to your Daily Dose.
            </h1>
            <blockquote className="border-l-2 border-dd-brass/80 pl-4 font-sans text-lg italic text-white/90">
              “Stronger body. Calmer mind.”
            </blockquote>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-white/75 pt-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-dd-brass" /> Enkripsi SSL 256-Bit
            </span>
            <span>•</span>
            <span>Akses Multi-Cabang</span>
          </div>
        </div>
      </section>

      {/* Right Form Panel */}
      <section
        className="grid min-w-0 place-items-center p-6 sm:p-12 lg:p-16"
        aria-labelledby="sign-in-title"
      >
        <div
          className="w-full max-w-[480px] rounded-dd-xl border border-dd-line/80 bg-white/95 p-6 sm:p-10 shadow-dd-card backdrop-blur-md"
          id="auth-form"
        >
          {/* Header Top */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-dd-line/60 pb-5">
            <BrandMark className="w-36 sm:w-40" priority />
            <Link
              className="inline-flex items-center gap-1.5 text-xs font-bold text-dd-forest hover:underline transition no-underline"
              href="/"
            >
              <ArrowLeft className="size-3.5" />
              <span>Ke beranda</span>
            </Link>
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-dd-forest/10 px-3 py-0.5 text-[11px] font-bold tracking-wider text-dd-forest uppercase">
              Akses Member Resmi
            </span>
            <h2
              className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-dd-ink"
              id="sign-in-title"
            >
              Masuk ke Daily Dose
            </h2>
            <p className="text-sm leading-relaxed text-dd-muted">
              {googleEnabled
                ? 'Gunakan email yang terdaftar atau lanjutkan dengan identitas Google Anda.'
                : 'Gunakan email dan password yang terdaftar untuk mengakses akun.'}
            </p>
          </div>

          <form
            className="mt-6 space-y-4"
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
            <label className="block space-y-1.5 text-xs font-bold text-dd-ink">
              <span>Email</span>
              <div className="relative flex items-center">
                <input
                  className="w-full min-h-11 rounded-dd-md border border-dd-line bg-white px-3.5 py-2.5 text-sm text-dd-ink outline-none transition focus:border-dd-forest focus:ring-2 focus:ring-dd-forest/15"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </label>

            <label className="block space-y-1.5 text-xs font-bold text-dd-ink">
              <span>Password</span>
              <div className="relative flex items-center">
                <input
                  className="w-full min-h-11 rounded-dd-md border border-dd-line bg-white px-3.5 pr-20 py-2.5 text-sm text-dd-ink outline-none transition focus:border-dd-forest focus:ring-2 focus:ring-dd-forest/15"
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
                  className="absolute right-2 px-2.5 py-1 text-xs font-bold text-dd-forest hover:text-dd-forest-dark transition"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between gap-4 pt-1 text-xs">
              <Link className="font-bold text-dd-forest hover:underline" href="/forgot-password">
                Lupa password?
              </Link>
              <span className="text-dd-muted">Akses sesuai hak akun</span>
            </div>

            <button
              className="mt-2 flex min-h-11 w-full items-center justify-center rounded-dd-md bg-dd-forest px-5 text-sm font-bold text-white shadow-dd-soft transition hover:bg-dd-forest-dark disabled:bg-dd-sage active:scale-[0.99]"
              disabled={state === 'loading'}
              type="submit"
            >
              {state === 'loading' ? 'Memeriksa akses…' : 'Masuk dengan email'}
            </button>
          </form>

          {state === 'invalid' && (
            <div className="mt-4">
              <Feedback kind="error">Email atau password tidak valid.</Feedback>
            </div>
          )}
          {state in messages && (
            <div className="mt-4">
              <Feedback kind="error">
                {messages[state as UiFailure]}
                {reference && (state === 'INTERNAL_ERROR' || state === 'SERVICE_UNAVAILABLE')
                  ? ` Kode bantuan: ${reference}.`
                  : ''}
              </Feedback>
            </div>
          )}
          {state === 'success' && (
            <div className="mt-4">
              <Feedback kind="status">Identitas terverifikasi.</Feedback>
            </div>
          )}

          {googleEnabled && (
            <>
              <div className="my-6 flex items-center gap-4 text-xs font-bold tracking-wider text-dd-muted uppercase before:h-px before:flex-1 before:bg-dd-line after:h-px after:flex-1 after:bg-dd-line">
                atau
              </div>
              <GoogleIdentityButton client={client} onComplete={complete} onFailure={fail} />
            </>
          )}

          <div className="mt-6 border-t border-dd-line/80 pt-4 text-xs leading-relaxed text-dd-muted">
            <strong className="block font-semibold text-dd-ink">
              Akses terlindungi &amp; Terenkripsi
            </strong>
            Seluruh data dan tindakan dibatasi berdasarkan hak akses peran serta cabang resmi
            terdaftar.
          </div>

          <p className="mt-6 text-center text-xs text-dd-muted">
            Belum punya akun?{' '}
            <Link className="font-bold text-dd-forest hover:underline" href="/register">
              Daftar akun member
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
