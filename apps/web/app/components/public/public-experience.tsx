'use client';

import { MessageCircle, MapPin, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  accountClient,
  type MyProfile,
  type PreferredStudio,
  type PublicSiteConfig,
} from '../../account-client';
import { useSessionContext } from '../../session-context';

const visiblePaths = new Set(['/', '/classes', '/packages', '/locations', '/contact']);
const hiddenPathPrefixes = [
  '/sign-in',
  '/register',
  '/activate-account',
  '/forgot-password',
  '/reset-password',
  '/check-in-pass',
  '/workspace',
  '/check-ins',
];

function whatsappHref(phone: string, studio: PreferredStudio, pathname: string) {
  const number = phone.replace(/\D/g, '');
  const context =
    pathname === '/packages'
      ? 'paket'
      : pathname === '/classes'
        ? 'jadwal kelas'
        : 'informasi studio';
  const message = `Halo Daily Dose ${studio.name.replace(/^Daily Dose\s+/i, '')}, saya ingin bertanya tentang ${context}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function PublicExperience() {
  const pathname = usePathname();
  const context = useSessionContext();
  const session = context?.session;
  const customerOnly = Boolean(
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER'),
  );
  const [config, setConfig] = useState<PublicSiteConfig | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle');
  const dialogRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [nextConfig, nextProfile] = await Promise.all([
        accountClient.siteConfig(),
        customerOnly ? accountClient.profile() : Promise.resolve(null),
      ]);
      setConfig(nextConfig);
      setProfile(nextProfile);
      setState('idle');
    } catch {
      setState('error');
    }
  }, [customerOnly]);
  useEffect(() => {
    void load();
  }, [load]);

  const preferred = profile?.preferredBranch ?? session?.preferredBranch ?? null;
  const mandatory = customerOnly && state !== 'loading' && !preferred;
  const showFab =
    !hiddenPathPrefixes.some((prefix) => pathname.startsWith(prefix)) &&
    (visiblePaths.has(pathname) || customerOnly);
  const supportAvailable = useMemo(
    () =>
      Boolean(
        config?.fallbackWhatsappE164 ||
        config?.branches.some((branch) => branch.supportWhatsappE164),
      ),
    [config],
  );

  const openWhatsapp = (studio: PreferredStudio) => {
    const phone = studio.supportWhatsappE164 || config?.fallbackWhatsappE164;
    if (phone) window.open(whatsappHref(phone, studio, pathname), '_blank', 'noopener,noreferrer');
  };

  const choose = async (studio: PreferredStudio) => {
    if (!customerOnly || !profile) {
      openWhatsapp(studio);
      setChooserOpen(false);
      return;
    }
    setState('saving');
    try {
      const updated = await accountClient.updateProfile({
        displayName: profile.displayName,
        preferredBranchId: studio.id,
        expectedVersion: profile.version,
      });
      setProfile(updated);
      setChooserOpen(false);
      setState('idle');
      await context?.refresh();
    } catch {
      setState('error');
    }
  };

  const dialogOpen = mandatory || chooserOpen;
  useEffect(() => {
    if (!dialogOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled])',
        ) ?? [],
      );
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!mandatory) setChooserOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0]!;
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [dialogOpen, mandatory]);
  return (
    <>
      {showFab && supportAvailable && !dialogOpen && (
        <button
          type="button"
          aria-label="Hubungi Daily Dose melalui WhatsApp"
          onClick={() => (preferred ? openWhatsapp(preferred) : setChooserOpen(true))}
          className="fixed right-4 z-40 grid size-14 place-items-center rounded-full border border-white/30 bg-[#1f8f5f] p-0 text-white shadow-dd-float transition hover:-translate-y-1 motion-reduce:transform-none sm:right-6"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <MessageCircle className="size-6" aria-hidden="true" />
        </button>
      )}
      {dialogOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-dd-sidebar/60 p-4 backdrop-blur-sm">
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-choice-title"
            className="w-full max-w-lg rounded-dd-xl border border-dd-line bg-dd-paper p-6 shadow-dd-float"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-brass-dark">
                  Studio Daily Dose
                </p>
                <h2 id="studio-choice-title" className="mt-2 text-2xl font-bold">
                  Pilih studio utama Anda
                </h2>
              </div>
              {!mandatory && (
                <button
                  type="button"
                  aria-label="Tutup pilihan studio"
                  onClick={() => setChooserOpen(false)}
                  className="grid size-10 place-items-center rounded-full border border-dd-line bg-white p-0"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <p className="mt-3 text-sm leading-6 text-dd-muted">
              Studio ini menjadi acuan jadwal, paket, checkout, dan bantuan WhatsApp. Anda dapat
              mengubahnya kembali melalui Pengaturan.
            </p>
            {state === 'loading' ? (
              <p className="mt-5 animate-pulse rounded-dd-md bg-dd-surface-muted p-5 text-center">
                Memuat studio…
              </p>
            ) : state === 'error' && !config ? (
              <div className="mt-5 rounded-dd-md bg-dd-danger-soft p-4 text-dd-danger">
                <p>Studio belum dapat dimuat.</p>
                <button className="mt-3" onClick={() => void load()}>
                  Coba lagi
                </button>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {config?.branches.map((studio) => (
                  <button
                    key={studio.id}
                    type="button"
                    disabled={state === 'saving'}
                    onClick={() => void choose(studio)}
                    className="flex min-h-16 items-center gap-3 rounded-dd-lg border border-dd-line bg-white px-4 text-left hover:border-dd-forest"
                  >
                    <span className="grid size-10 place-items-center rounded-dd-md bg-dd-brass-soft text-dd-forest">
                      <MapPin className="size-5" />
                    </span>
                    <span>
                      <strong className="block">{studio.name}</strong>
                      <small className="text-dd-muted">
                        {studio.timezone === 'Asia/Jakarta' ? 'WIB' : studio.timezone}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {state === 'error' && config && (
              <p
                role="alert"
                className="mt-4 rounded-dd-md bg-dd-danger-soft p-3 text-sm text-dd-danger"
              >
                Pilihan belum tersimpan. Muat ulang lalu coba kembali.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
