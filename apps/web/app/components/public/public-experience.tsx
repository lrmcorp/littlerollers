'use client';

import { MessageCircle, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  accountClient,
  type MyProfile,
  type PreferredStudio,
  type PublicSiteConfig,
} from '../../account-client';
import { useSessionContext } from '../../session-context';
import { Button } from '../actions';
import { Modal } from '../app-feedback';

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
  return (
    <>
      {showFab && supportAvailable && !dialogOpen && (
        <button
          type="button"
          aria-label="Hubungi Daily Dose melalui WhatsApp"
          onClick={() => (preferred ? openWhatsapp(preferred) : setChooserOpen(true))}
          className={`public-whatsapp-fab fixed right-4 z-40 grid size-14 min-h-14 w-14 place-items-center rounded-full border border-white/30 bg-[#1f8f5f] p-0 text-white shadow-dd-float transition hover:-translate-y-1 motion-reduce:transform-none sm:right-6 ${
            pathname === '/checkout'
              ? 'bottom-[calc(6.5rem+env(safe-area-inset-bottom))] sm:bottom-6'
              : 'bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6'
          }`}
        >
          <MessageCircle className="size-6" aria-hidden="true" />
        </button>
      )}
      <Modal
        open={dialogOpen}
        title="Pilih studio utama Anda"
        description="Studio ini menjadi acuan jadwal, paket, checkout, dan bantuan WhatsApp. Anda dapat mengubahnya kembali melalui Pengaturan."
        onClose={() => {
          if (!mandatory) setChooserOpen(false);
        }}
        closeOnEscape={!mandatory}
        closeOnBackdrop={!mandatory}
        showCloseButton={!mandatory}
      >
        {state === 'loading' ? (
          <p className="mt-5 animate-pulse rounded-dd-md bg-dd-surface-muted p-5 text-center">
            Memuat studio…
          </p>
        ) : state === 'error' && !config ? (
          <div className="mt-5 rounded-dd-md bg-dd-danger-soft p-4 text-dd-danger">
            <p>Studio belum dapat dimuat.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void load()}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {config?.branches.map((studio) => (
              <Button
                key={studio.id}
                type="button"
                variant="secondary"
                size="lg"
                disabled={state === 'saving'}
                onClick={() => void choose(studio)}
                className="min-h-16 justify-start text-left"
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
              </Button>
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
      </Modal>
    </>
  );
}
