'use client';

import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppFeedback } from '../../components/app-feedback';
import { Button, IconButton } from '../../components/actions';
import { browserIdentityClient, type IdentityClient } from '../../identity-client';
import { Skeleton } from '../../ui';
import { useSessionContext } from '../../session-context';
import { useTrackedRouter } from '../../components/app-loading';

type Status = Awaited<ReturnType<IdentityClient['securityStatus']>> & {
  passwordChangeRequired?: boolean;
};

export function SecurityView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const feedback = useAppFeedback();
  const sessionContext = useSessionContext();
  const [redirectTo, setRedirectTo] = useState('');
  const [status, setStatus] = useState<Status>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [nextPassword, setNextPassword] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setStatus(await client.securityStatus());
      setError('');
    } catch {
      setError('Your account security status did not load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void load(), []);

  if (loading) return <Skeleton label="Loading account security" />;

  const requirements = [
    { label: 'At least 8 characters', met: nextPassword.length >= 8 },
    {
      label: 'Upper and lower case',
      met: /[a-z]/.test(nextPassword) && /[A-Z]/.test(nextPassword),
    },
    { label: 'A number', met: /\d/.test(nextPassword) },
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-6" aria-labelledby="security-title">
      {redirectTo && <PasswordChangeRedirect target={redirectTo} />}
      <header>
        <h1 id="security-title" className="m-0 font-display text-3xl text-dd-forest sm:text-4xl">
          Account security
        </h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Change your password and sign out other devices.
        </p>
      </header>

      {status?.passwordChangeRequired && (
        <section className="rounded-[22px] border border-dd-warning/30 bg-dd-warning-soft p-5 text-sm text-dd-warning">
          <strong>Please change your starting password.</strong>
          <p className="mt-1">
            Once your new password is saved, the rest of your account opens up.
          </p>
        </section>
      )}

      {error && (
        <section className="rounded-[22px] border border-dd-danger/20 bg-white p-5">
          <strong>{error}</strong>
          <Button type="button" className="mt-4" onClick={() => void load()}>
            Try again
          </Button>
        </section>
      )}

      <section className="rounded-[22px] border border-dd-line bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-dd-lg bg-dd-success-soft text-dd-success">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="m-0 font-display text-xl text-dd-forest">Password</h2>
            <p className="mt-1 text-sm font-semibold text-dd-ink">
              {status?.passwordEnabled ? 'Password set' : 'No password yet'}
            </p>
            <p className="mt-1 text-sm text-dd-muted">
              {status?.passwordEnabled
                ? 'You can change it at any time.'
                : 'Set a password to protect this account.'}
            </p>
          </div>
        </div>
      </section>

      {status?.passwordEnabled && (
        <form
          className="rounded-[22px] border border-dd-line bg-white p-5 sm:p-6"
          aria-label="Change password"
          onSubmit={async (event) => {
            event.preventDefault();
            if (saving) return;
            const form = event.currentTarget;
            const data = new FormData(form);
            setSaving(true);
            setError('');
            try {
              await client.changePassword(String(data.get('current')), String(data.get('next')));
              form.reset();
              setNextPassword('');
              feedback.showToast({
                tone: 'success',
                title: 'Password changed',
                message: 'Other devices were signed out to keep your account safe.',
              });
              await load();
              const refreshed = await sessionContext?.refresh({ quiet: true });
              if (refreshed && !refreshed.passwordChangeRequired)
                setRedirectTo(refreshed.roles.includes('CUSTOMER') ? '/account' : '/workspace');
            } catch {
              setError(
                'Your current password is not right, or the new one does not meet the rules.',
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-dd-forest" />
            <h2 className="m-0 font-display text-xl text-dd-forest">Change password</h2>
          </div>
          <div className="mt-5 grid gap-5">
            <PasswordField
              name="current"
              label="Current password"
              shown={showCurrent}
              onToggle={() => setShowCurrent((value) => !value)}
              autoComplete="current-password"
            />
            <PasswordField
              name="next"
              label="New password"
              shown={showNext}
              onToggle={() => setShowNext((value) => !value)}
              autoComplete="new-password"
              value={nextPassword}
              onChange={setNextPassword}
            />
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {requirements.map((item) => (
              <li
                key={item.label}
                className={`rounded-dd-md px-3 py-2 text-xs font-semibold ${
                  item.met
                    ? 'bg-dd-success-soft text-dd-success'
                    : 'bg-dd-surface-muted text-dd-muted'
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>
          {error && (
            <p className="mt-4 rounded-dd-md bg-dd-danger-soft p-3 text-sm text-dd-danger">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={saving || requirements.some((item) => !item.met)}
            loading={saving}
            loadingLabel="Saving…"
            className="mt-5"
          >
            Save password
          </Button>
        </form>
      )}
    </main>
  );
}

function PasswordChangeRedirect({ target }: { target: string }) {
  const router = useTrackedRouter();
  useEffect(() => router.replace(target), [router, target]);
  return null;
}

function PasswordField({
  name,
  label,
  shown,
  onToggle,
  autoComplete,
  value,
  onChange,
}: {
  name: string;
  label: string;
  shown: boolean;
  onToggle(): void;
  autoComplete: string;
  value?: string;
  onChange?(value: string): void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <span className="relative">
        <input
          name={name}
          type={shown ? 'text' : 'password'}
          minLength={8}
          maxLength={128}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className="w-full rounded-dd-md border border-dd-line bg-white px-3 pr-12"
        />
        <IconButton
          label={`${shown ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          variant="ghost"
          onClick={onToggle}
          className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-dd-muted"
        >
          {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </IconButton>
      </span>
    </label>
  );
}
