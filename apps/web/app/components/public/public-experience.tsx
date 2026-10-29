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
} from '../../account-client';
import { useSessionContext } from '../../session-context';
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
      ? 'packages'
      : pathname === '/classes'
        ? 'the timetable'
        : 'the club';
  const message = `Hi ${studio.name}, I have a question about ${context}.`;
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
  const customerOnly = Boolean(
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER'),
  );
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
        title: 'Home club updated',
        message: `${studio.name} is now your default for the timetable and new packages.`,
      });
      await context?.refresh();
    } catch {
      setState('error');
      feedback.showAlert({
        tone: 'danger',
        title: 'Could not save your club',
        message: 'Reload the list of clubs and try again.',
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
          aria-label="Message Little Rollers on WhatsApp"
          onClick={() => (preferred ? openWhatsapp(preferred) : setChooserOpen(true))}
          className={`public-whatsapp-fab fixed right-3 z-40 grid size-14 min-h-14 w-14 place-items-center rounded-full border border-white/30 bg-[#1f8f5f] p-0 text-white shadow-dd-float transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-dd-forest/25 motion-reduce:transform-none sm:right-6 ${
            pathname === '/checkout'
              ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-6'
              : 'bottom-[calc(0.75rem+env(safe-area-inset-bottom))] sm:bottom-6'
          }`}
        >
          <MessageCircle className="size-6" aria-hidden="true" />
        </button>
      )}
      <Modal
        open={dialogOpen}
        title="Choose your home club"
        description="Your home club is used for the timetable, new packages, checkout and WhatsApp help. Existing orders and bookings stay as they are."
        onClose={() => {
          if (!mandatory) setChooserOpen(false);
        }}
        closeOnEscape={!mandatory}
        closeOnBackdrop={!mandatory}
        showCloseButton={!mandatory}
      >
        {state === 'loading' ? (
          <p className="mt-5 animate-pulse rounded-dd-md bg-dd-surface-muted p-5 text-center">
            Loading clubs…
          </p>
        ) : state === 'error' && !config ? (
          <div className="mt-5 rounded-dd-md bg-dd-danger-soft p-4 text-dd-danger">
            <p>We could not load the clubs.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            <fieldset className="grid gap-3">
              <legend className="sr-only">Home club</legend>
              {config?.branches.map((studio) => (
                <RadioCard
                  key={studio.id}
                  name="preferredStudio"
                  value={studio.id}
                  checked={selectedStudioId === studio.id}
                  disabled={state === 'saving'}
                  onChange={() => setSelectedStudioId(studio.id)}
                  label={studio.name}
                  description={`${studio.timezone === 'Asia/Jakarta' ? 'WIB' : studio.timezone} · Default for new bookings and packages`}
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
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                loading={state === 'saving'}
                loadingLabel="Saving club…"
                disabled={!selectedStudioId}
                onClick={() => {
                  const studio = config?.branches.find((item) => item.id === selectedStudioId);
                  if (studio) void choose(studio);
                }}
              >
                <MapPin className="size-4" aria-hidden="true" />
                {customerOnly ? 'Save club' : 'Continue to WhatsApp'}
              </Button>
            </div>
          </div>
        )}
        {state === 'error' && config && (
          <p
            role="alert"
            className="mt-4 rounded-dd-md bg-dd-danger-soft p-3 text-sm text-dd-danger"
          >
            Your choice was not saved. Reload and try again.
          </p>
        )}
      </Modal>
    </StudioPreferenceContext.Provider>
  );
}
