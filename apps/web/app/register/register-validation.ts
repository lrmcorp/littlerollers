export const MAX_IDENTITY_FILE_BYTES = 8_000_000;
export const IDENTITY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type RegisterFieldName =
  'displayName' | 'phone' | 'email' | 'password' | 'confirmation' | 'selfie' | 'ktp' | 'consent';

export type RegisterValues = {
  displayName: string;
  phone: string;
  email: string;
  password: string;
  confirmation: string;
  selfie: File | null;
  ktp: File | null;
  consent: boolean;
};

export type RegisterErrors = Partial<Record<RegisterFieldName, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const e164Pattern = /^\+[1-9]\d{7,14}$/u;

export function normalizeRegistrationPhone(value: string): string {
  const compact = value.trim().replace(/[\s().-]/g, '');
  return compact.startsWith('0') ? `+62${compact.slice(1)}` : compact;
}

function validateIdentityFile(file: File | null, label: string): string | undefined {
  if (!file || file.size === 0) return `Please choose a ${label.toLowerCase()}.`;
  if (!IDENTITY_IMAGE_TYPES.includes(file.type as (typeof IDENTITY_IMAGE_TYPES)[number]))
    return `The ${label.toLowerCase()} must be a JPG, PNG or WebP image.`;
  if (file.size > MAX_IDENTITY_FILE_BYTES) return `The ${label.toLowerCase()} must be 8 MB or smaller.`;
  return undefined;
}

export function validateRegisterField(
  name: RegisterFieldName,
  values: RegisterValues,
): string | undefined {
  switch (name) {
    case 'displayName': {
      const displayName = values.displayName.trim();
      if (!displayName) return 'Please enter your full name.';
      if (displayName.length > 160) return 'Your name can be up to 160 characters.';
      return undefined;
    }
    case 'phone':
      if (!values.phone.trim()) return 'Please enter your WhatsApp number.';
      if (!e164Pattern.test(normalizeRegistrationPhone(values.phone)))
        return 'Enter a valid WhatsApp number, for example 0812 3456 7890.';
      return undefined;
    case 'email':
      if (!values.email.trim()) return 'Please enter your email.';
      if (!emailPattern.test(values.email.trim())) return 'Enter a valid email address.';
      if (values.email.trim().length > 254) return 'Email can be up to 254 characters.';
      return undefined;
    case 'password':
      if (!values.password) return 'Please enter a password.';
      if (values.password.length < 8) return 'Use at least 8 characters.';
      if (values.password.length > 128) return 'Use 128 characters or fewer.';
      return undefined;
    case 'confirmation':
      if (!values.confirmation) return 'Please type the password again.';
      if (values.confirmation !== values.password) return 'The passwords do not match.';
      return undefined;
    case 'selfie':
      return validateIdentityFile(values.selfie, 'Selfie photo');
    case 'ktp':
      return validateIdentityFile(values.ktp, 'KTP photo');
    case 'consent':
      return values.consent ? undefined : 'Please agree to the identity check to continue.';
  }
}

export function validateRegistration(values: RegisterValues): RegisterErrors {
  const fields: RegisterFieldName[] = [
    'displayName',
    'phone',
    'email',
    'password',
    'confirmation',
    'selfie',
    'ktp',
    'consent',
  ];
  return Object.fromEntries(
    fields.flatMap((field) => {
      const error = validateRegisterField(field, values);
      return error ? [[field, error]] : [];
    }),
  );
}

export function registrationRequestErrorMessage(status?: number): string {
  if (status === 409) return 'That email or WhatsApp number already has an account.';
  if (status === 422) return 'Check your details and the photo formats, then try again.';
  return 'We could not create your account. Please try again.';
}
