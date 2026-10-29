'use client';

import { MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { accountClient, type PublicSiteConfig } from '../account-client';
import { publicSecondaryButton } from '../components/public/public-styles';

function whatsappLink(phone: string, clubName: string) {
  const text = `Hi ${clubName}, I have a question about Little Rollers.`;
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export function ContactClubs() {
  const [config, setConfig] = useState<PublicSiteConfig | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(() => {
    let active = true;
    setState('loading');
    accountClient
      .siteConfig()
      .then((result) => {
        if (!active) return;
        setConfig(result);
        setState('ready');
      })
      .catch(() => {
        if (active) setState('error');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  if (state === 'loading')
    return (
      <p className="mt-5 rounded-[15px] bg-white p-6 text-dd-muted" role="status">
        Loading clubs…
      </p>
    );
  if (state === 'error' || !config)
    return (
      <div className="mt-5 rounded-[15px] bg-dd-danger-soft p-6 text-dd-danger" role="alert">
        <p className="m-0">We could not load the club contacts.</p>
        <button type="button" className={`${publicSecondaryButton} mt-3`} onClick={() => load()}>
          Try again
        </button>
      </div>
    );

  const clubs = config.branches.map((club) => ({
    club,
    phone: club.supportWhatsappE164 ?? config.fallbackWhatsappE164,
  }));
  if (clubs.length === 0)
    return (
      <p className="mt-5 rounded-[15px] bg-white p-6 text-dd-muted">
        No club contacts are published yet.
      </p>
    );

  return (
    <ul className="m-0 mt-5 grid list-none gap-3 p-0" aria-labelledby="contact-clubs-title">
      {clubs.map(({ club, phone }) => (
        <li
          key={club.id}
          className="flex flex-col gap-3 rounded-[15px] border border-dd-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            <strong className="block font-display text-xl text-dd-forest">{club.name}</strong>
            {club.publicProfile && (
              <span className="text-sm text-dd-muted">{club.publicProfile.address}</span>
            )}
          </span>
          {phone ? (
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dd-forest px-5 font-medium text-white no-underline"
              href={whatsappLink(phone, club.name)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp
            </a>
          ) : (
            <span className="text-sm text-dd-muted">No WhatsApp number yet</span>
          )}
        </li>
      ))}
    </ul>
  );
}
