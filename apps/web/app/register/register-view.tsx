'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type RefObject,
} from 'react';
import { AuthPageShell } from '../components/auth/auth-page-shell';
import { Button } from '../components/actions';
import { FieldError, FormField, TextInput, controlClassName } from '../components/forms';
import { Feedback } from '../ui';
import { verificationClient } from '../identity-verification-client';
import { useSessionContext } from '../session-context';
import {
  type RegisterErrors,
  type RegisterFieldName,
  type RegisterValues,
  registrationRequestErrorMessage,
  validateRegisterField,
  validateRegistration,
} from './register-validation';

const fieldOrder: RegisterFieldName[] = [
  'displayName',
  'phone',
  'email',
  'password',
  'confirmation',
  'selfie',
  'ktp',
  'consent',
];

function errorId(name: RegisterFieldName) {
  return `register-${name}-error`;
}

function PasswordField({
  id,
  label,
  name,
  placeholder,
  error,
  disabled,
  onBlur,
  onChange,
}: {
  id: string;
  label: string;
  name: 'password' | 'confirmation';
  placeholder: string;
  error?: string;
  disabled: boolean;
  onBlur(event: FocusEvent<HTMLInputElement>): void;
  onChange(event: ChangeEvent<HTMLInputElement>): void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <FormField
      label={label}
      htmlFor={id}
      required
      error={error ? <span id={errorId(name)}>{error}</span> : undefined}
    >
      <span className="auth-input-action">
        <input
          className={controlClassName}
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          placeholder={placeholder}
          required
          disabled={disabled}
          aria-label={label}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId(name) : undefined}
          onBlur={onBlur}
          onChange={onChange}
        />
        <button
          type="button"
          className="auth-visibility-toggle"
          aria-label={`${visible ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5.3 9 5.3a15.7 15.7 0 0 1-2.1 2.6M6.6 6.6C4.4 8 3 10.1 3 10.1S6.5 16 12 16c1 0 2-.2 2.8-.5" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </span>
    </FormField>
  );
}

function UploadPreview({ file, kind }: { file: File | null; kind: 'selfie' | 'ktp' }) {
  const [previewUrl, setPreviewUrl] = useState('');
  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl || !file) return null;
  return (
    <figure className={`auth-upload-preview auth-upload-preview--${kind}`}>
      {/* Blob URLs are created locally and are never sent before submission. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt={`Pratinjau ${kind === 'selfie' ? 'foto selfie' : 'foto KTP'}`} />
      <figcaption>
        <strong>{file.name}</strong>
        <span>
          {(file.size / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB
        </span>
      </figcaption>
    </figure>
  );
}

function UploadField({
  id,
  name,
  label,
  hint,
  capture,
  file,
  inputRef,
  error,
  disabled,
  onChange,
  onRemove,
}: {
  id: string;
  name: 'selfie' | 'ktp';
  label: string;
  hint: string;
  capture: 'user' | 'environment';
  file: File | null;
  inputRef: RefObject<HTMLInputElement | null>;
  error?: string;
  disabled: boolean;
  onChange(file: File | null): void;
  onRemove(): void;
}) {
  const hintId = `${id}-hint`;
  const describedBy = [hintId, error ? errorId(name) : ''].filter(Boolean).join(' ');
  return (
    <FormField
      label={label}
      htmlFor={id}
      required
      className="auth-upload-field"
      error={error ? <span id={errorId(name)}>{error}</span> : undefined}
    >
      <input
        ref={inputRef}
        className="auth-upload-input"
        id={id}
        aria-label={label}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={capture}
        required
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.files?.[0] ?? null)}
      />
      <div className="auth-upload-actions">
        <label className="auth-upload-picker" htmlFor={id}>
          {file ? 'Ganti foto' : 'Pilih foto'}
        </label>
        {file && (
          <button type="button" disabled={disabled} onClick={onRemove}>
            Hapus
          </button>
        )}
      </div>
      <p id={hintId} className="text-xs leading-5 text-dd-muted">
        {hint}
      </p>
      <UploadPreview file={file} kind={name} />
    </FormField>
  );
}

function formValues(form: HTMLFormElement, selfie: File | null, ktp: File | null): RegisterValues {
  const data = new FormData(form);
  return {
    displayName: String(data.get('displayName') ?? ''),
    phone: String(data.get('phone') ?? ''),
    email: String(data.get('email') ?? ''),
    password: String(data.get('password') ?? ''),
    confirmation: String(data.get('confirmation') ?? ''),
    selfie,
    ktp,
    consent: data.get('consent') === 'true',
  };
}

export function RegisterView() {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [selfie, setSelfie] = useState<File | null>(null);
  const [ktp, setKtp] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const session = useSessionContext();
  const loading = state === 'loading';

  const clearRequestError = () => {
    if (state === 'error') setState('idle');
    if (message) setMessage('');
  };

  const validateOne = (name: RegisterFieldName, form = formRef.current) => {
    if (!form) return;
    const error = validateRegisterField(name, formValues(form, selfie, ktp));
    setErrors((current) => {
      const next = { ...current };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const handleTextBlur = (name: RegisterFieldName) => () => validateOne(name);
  const handleTextChange = (name: RegisterFieldName) => () => {
    clearRequestError();
    if (errors[name]) validateOne(name);
    if (name === 'password' && errors.confirmation) validateOne('confirmation');
  };

  const handleUpload = (name: 'selfie' | 'ktp', file: File | null) => {
    clearRequestError();
    if (name === 'selfie') setSelfie(file);
    else setKtp(file);
    const form = formRef.current;
    if (!form) return;
    const values = formValues(form, name === 'selfie' ? file : selfie, name === 'ktp' ? file : ktp);
    const error = validateRegisterField(name, values);
    setErrors((current) => {
      const next = { ...current };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const removeUpload = (name: 'selfie' | 'ktp') => {
    const input = name === 'selfie' ? selfieInputRef.current : ktpInputRef.current;
    if (input) input.value = '';
    handleUpload(name, null);
  };

  return (
    <AuthPageShell
      eyebrow="Registrasi customer"
      title="Buat akun Daily Dose"
      description="Akun langsung aktif. Selfie dan foto KTP akan diperiksa secara privat oleh tim kami sebelum pembelian dan booking tersedia."
      compactMobileVisual
      visualSrc="/images/public/landing/register-illustration.webp"
      loginLabel="Masuk"
    >
      <form
        ref={formRef}
        aria-label="Registrasi customer"
        method="post"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          clearRequestError();
          const values = formValues(event.currentTarget, selfie, ktp);
          const nextErrors = validateRegistration(values);
          setErrors(nextErrors);
          const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
          if (firstInvalid) {
            const field = event.currentTarget.elements.namedItem(firstInvalid);
            if (field instanceof HTMLElement) field.focus();
            return;
          }

          setState('loading');
          try {
            await verificationClient.register({
              displayName: values.displayName.trim(),
              phone: values.phone.trim(),
              email: values.email.trim(),
              password: values.password,
              consent: values.consent,
              selfie: values.selfie!,
              ktp: values.ktp!,
            });
            const completed = await session?.completeSignIn('/account/verification');
            if (!completed) throw new Error('session');
          } catch (error) {
            const status = (error as { response?: { status?: number } }).response?.status;
            setMessage(registrationRequestErrorMessage(status));
            setState('error');
          }
        }}
      >
        <TextInput
          id="register-display-name"
          label="Nama lengkap"
          name="displayName"
          autoComplete="name"
          maxLength={160}
          placeholder="Contoh: Nadia Putri"
          required
          disabled={loading}
          error={
            errors.displayName ? (
              <span id={errorId('displayName')}>{errors.displayName}</span>
            ) : undefined
          }
          aria-describedby={errors.displayName ? errorId('displayName') : undefined}
          onBlur={handleTextBlur('displayName')}
          onChange={handleTextChange('displayName')}
        />
        <TextInput
          id="register-phone"
          label="Nomor WhatsApp"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0812 3456 7890"
          required
          disabled={loading}
          error={errors.phone ? <span id={errorId('phone')}>{errors.phone}</span> : undefined}
          aria-describedby={errors.phone ? errorId('phone') : undefined}
          onBlur={handleTextBlur('phone')}
          onChange={handleTextChange('phone')}
        />
        <TextInput
          id="register-email"
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          placeholder="nama@email.com"
          required
          disabled={loading}
          error={errors.email ? <span id={errorId('email')}>{errors.email}</span> : undefined}
          aria-describedby={errors.email ? errorId('email') : undefined}
          onBlur={handleTextBlur('email')}
          onChange={handleTextChange('email')}
        />
        <PasswordField
          id="register-password"
          label="Password"
          name="password"
          placeholder="Minimal 8 karakter"
          error={errors.password}
          disabled={loading}
          onBlur={handleTextBlur('password')}
          onChange={handleTextChange('password')}
        />
        <PasswordField
          id="register-confirmation"
          label="Ulangi password"
          name="confirmation"
          placeholder="Masukkan ulang password"
          error={errors.confirmation}
          disabled={loading}
          onBlur={handleTextBlur('confirmation')}
          onChange={handleTextChange('confirmation')}
        />
        <UploadField
          id="register-selfie"
          name="selfie"
          label="Foto selfie"
          hint="Wajah terlihat jelas · JPG, PNG, atau WebP · maksimal 8 MB."
          capture="user"
          file={selfie}
          inputRef={selfieInputRef}
          error={errors.selfie}
          disabled={loading}
          onChange={(file) => handleUpload('selfie', file)}
          onRemove={() => removeUpload('selfie')}
        />
        <UploadField
          id="register-ktp"
          name="ktp"
          label="Foto KTP bagian depan"
          hint="Seluruh sisi KTP terlihat jelas · JPG, PNG, atau WebP · maksimal 8 MB."
          capture="environment"
          file={ktp}
          inputRef={ktpInputRef}
          error={errors.ktp}
          disabled={loading}
          onChange={(file) => handleUpload('ktp', file)}
          onRemove={() => removeUpload('ktp')}
        />
        <div id="register-privacy-notice" className="auth-privacy-notice" role="note">
          Selfie dan foto KTP hanya digunakan untuk verifikasi identitas, disimpan secara privat,
          dan hanya dapat diakses oleh tim yang berwenang.
        </div>
        <div>
          <label className="auth-consent" htmlFor="register-consent">
            <input
              className="size-5 accent-dd-forest"
              id="register-consent"
              name="consent"
              type="checkbox"
              value="true"
              required
              disabled={loading}
              aria-invalid={Boolean(errors.consent) || undefined}
              aria-describedby={[
                'register-privacy-notice',
                errors.consent ? errorId('consent') : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onBlur={() => validateOne('consent')}
              onChange={() => {
                clearRequestError();
                if (errors.consent) validateOne('consent');
              }}
            />
            <span>Saya menyetujui pemrosesan selfie dan KTP untuk verifikasi identitas.</span>
          </label>
          {errors.consent && <FieldError id={errorId('consent')}>{errors.consent}</FieldError>}
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading} loadingLabel="Membuat akun…">
          Daftar dan masuk
        </Button>
        {state === 'error' && <Feedback kind="error">{message}</Feedback>}
      </form>
    </AuthPageShell>
  );
}
