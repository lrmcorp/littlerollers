'use client';

import { MessageCircle, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  accountClient,
  type MyProfile,
  type PreferredStudio,
  type PublicSiteConfig,
} from '@/api-clients/account-client';
import { useSessionContext } from '../../session-context';
import { isCustomerOnlySession } from '@/lib/session-audience';
import { Button } from '../actions';
import { Modal, useAppFeedback } from '../app-feedback';
import { RadioCard } from '../forms';

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
  '/checkout',
  '/bookings/new',
  '/bookings/',
  '/orders/',
  '/ledger',
  '/health',
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

export interface StudioPreferenceController {
  preferredStudio: PreferredStudio | null;
  openStudioPreference(): void;
  closeStudioPreference(): void;
}

const StudioPreferenceContext = createContext<StudioPreferenceController | null>(null);

export function useStudioPreference() {
  return useContext(StudioPreferenceContext);
}

export function PublicExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const context = useSessionContext();
  const feedback = useAppFeedback();
  const session = context?.session;
  const customerOnly = isCustomerOnlySession(session);
  const [config, setConfig] = useState<PublicSiteConfig | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [selectedStudioId, setSelectedStudioId] = useState('');
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
      setSelectedStudioId(nextProfile?.preferredBranch?.id ?? session?.preferredBranch?.id ?? '');
      setState('idle');
    } catch {
      setState('error');
    }
  }, [customerOnly, session?.preferredBranch?.id]);
  useEffect(() => {
    void load();
  }, [load]);

  const preferred = profile?.preferredBranch ?? session?.preferredBranch ?? null;
  const mandatory = customerOnly && state === 'idle' && !preferred;
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
      feedback.showToast({
        tone: 'success',
        title: 'Studio utama diperbarui',
        message: `${studio.name} menjadi default untuk jadwal dan paket berikutnya.`,
      });
      await context?.refresh();
    } catch {
      setState('error');
      feedback.showAlert({
        tone: 'danger',
        title: 'Studio belum dapat disimpan',
        message: 'Muat ulang pilihan studio lalu coba kembali.',
      });
    }
  };

  const dialogOpen = mandatory || chooserOpen;
  return (
    <StudioPreferenceContext.Provider
      value={{
        preferredStudio: preferred,
        openStudioPreference: () => {
          setSelectedStudioId(preferred?.id ?? '');
          setChooserOpen(true);
        },
        closeStudioPreference: () => {
          if (!mandatory) setChooserOpen(false);
        },
      }}
    >
      {children}
      {showFab && supportAvailable && !dialogOpen && (
        <button
          type="button"
          aria-label="Hubungi Daily Dose melalui WhatsApp"
          onClick={() => (preferred ? openWhatsapp(preferred) : setChooserOpen(true))}
          className={`public-whatsapp-fab fixed right-3 z-40 grid size-14 min-h-14 w-14 place-items-center rounded-full border border-white/30 bg-[#1f8f5f] p-0 text-white shadow-dd-float transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-dd-forest/25 motion-reduce:transform-none sm:right-6 ${
            pathname === '/checkout'
              ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-6'
              : 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-6'
          }`}
        >
          <MessageCircle className="size-6" aria-hidden="true" />
        </button>
      )}
      <Modal
        open={dialogOpen}
        title="Pilih studio utama Anda"
        description="Studio ini menjadi default untuk jadwal, paket baru, checkout baru, dan bantuan WhatsApp. Pesanan serta booking yang sudah ada tidak berubah."
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
          <div className="mt-5 grid gap-4">
            <fieldset className="grid gap-3">
              <legend className="sr-only">Studio utama</legend>
              {config?.branches.map((studio) => (
                <RadioCard
                  key={studio.id}
                  name="preferredStudio"
                  value={studio.id}
                  checked={selectedStudioId === studio.id}
                  disabled={state === 'saving'}
                  onChange={() => setSelectedStudioId(studio.id)}
                  label={studio.name}
                  description={`${studio.timezone === 'Asia/Jakarta' ? 'WIB' : studio.timezone} · Menjadi default untuk aktivitas baru`}
                  className="min-h-16 items-center"
                />
              ))}
            </fieldset>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {!mandatory && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={state === 'saving'}
                  onClick={() => setChooserOpen(false)}
                >
                  Batal
                </Button>
              )}
              <Button
                type="button"
                loading={state === 'saving'}
                loadingLabel="Menyimpan studio…"
                disabled={!selectedStudioId}
                onClick={() => {
                  const studio = config?.branches.find((item) => item.id === selectedStudioId);
                  if (studio) void choose(studio);
                }}
              >
                <MapPin className="size-4" aria-hidden="true" />
                {customerOnly ? 'Simpan studio' : 'Lanjutkan ke WhatsApp'}
              </Button>
            </div>
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
    </StudioPreferenceContext.Provider>
  );
}
