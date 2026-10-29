'use client';

import { useEffect, useState } from 'react';
import { accountClient, type MyProfile } from '../../account-client';
import { useSessionContext } from '../../session-context';
import { messageForApiError, useAppFeedback } from '../../components/app-feedback';
import { Button, ButtonLink } from '../../components/actions';
import { useStudioPreference } from '../../components/public/public-experience';

export function ProfileView() {
  const session = useSessionContext();
  const feedback = useAppFeedback();
  const studioPreference = useStudioPreference();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'saving' | 'error' | 'stale'>('loading');
  const [message, setMessage] = useState('');

  const load = async () => {
    setState('loading');
    try {
      setProfile(await accountClient.profile());
      setState('ready');
    } catch {
      setState('error');
    }
  };
  useEffect(() => void load(), []);

  if (!profile)
    return (
      <section className="rounded-[22px] border border-dd-line bg-white p-8">
        <h1 className="text-2xl font-bold">
          {state === 'error' ? 'Your profile did not load' : 'Loading profile…'}
        </h1>
        {state === 'error' && (
          <Button className="mt-5" onClick={() => void load()}>
            Try again
          </Button>
        )}
      </section>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-sans">
      <header>
        <h1 className="m-0 font-display text-3xl text-dd-forest sm:text-4xl">My profile</h1>
        <p className="mt-2 text-dd-muted">
          Your display name and the contact details on your account.
        </p>
      </header>
      <form
        className="grid gap-5 rounded-[22px] border border-dd-line bg-white p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (state === 'saving') return;
          const data = new FormData(event.currentTarget);
          setState('saving');
          setMessage('');
          try {
            const updated = await accountClient.updateProfile({
              displayName: String(data.get('displayName')),
              expectedVersion: profile.version,
            });
            setProfile(updated);
            setState('ready');
            feedback.showToast({
              tone: 'success',
              title: 'Profile updated',
              message: 'Your new display name is saved.',
            });
            await session?.refresh();
          } catch (error) {
            const status = (error as { response?: { status?: number } }).response?.status;
            setState(status === 409 ? 'stale' : 'error');
            setMessage(
              status === 409
                ? 'Your profile changed. Reload before trying again.'
                : 'Your profile was not saved.',
            );
            if (status !== 409)
              feedback.showAlert({ tone: 'danger', ...messageForApiError(error) });
          }
        }}
      >
        <label className="grid gap-2 text-sm font-semibold">
          Display name
          <input
            name="displayName"
            defaultValue={profile.displayName}
            minLength={2}
            maxLength={160}
            required
            className="rounded-dd-md border border-dd-line bg-white px-3"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Email
            <input
              value={profile.emailMasked ?? 'Not set'}
              readOnly
              className="rounded-dd-md border border-dd-line bg-dd-surface-muted px-3 text-dd-muted"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            WhatsApp number
            <input
              value={profile.phoneMasked ?? 'Not set'}
              readOnly
              className="rounded-dd-md border border-dd-line bg-dd-surface-muted px-3 text-dd-muted"
            />
          </label>
        </div>
        <p className="text-xs leading-5 text-dd-muted">
          To change your email or phone number, contact your club so the team can verify it.
        </p>
        {message && (
          <p
            role="status"
            className={`rounded-dd-md p-3 text-sm ${state === 'ready' ? 'bg-dd-success-soft text-dd-success' : 'bg-dd-danger-soft text-dd-danger'}`}
          >
            {message}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={state === 'saving'} loadingLabel="Saving…">
            Save profile
          </Button>
          <ButtonLink href="/account/security" variant="secondary">
            Account security
          </ButtonLink>
        </div>
      </form>
      <section className="rounded-[22px] border border-dd-line bg-white p-6">
        <h2 className="m-0 font-display text-xl text-dd-forest">Home club</h2>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          {profile.preferredBranch
            ? `${profile.preferredBranch.name} is your default for the timetable, new packages, checkout and WhatsApp help.`
            : 'Choose the club you visit most.'}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => studioPreference?.openStudioPreference()}
        >
          Change club
        </Button>
      </section>
    </div>
  );
}
