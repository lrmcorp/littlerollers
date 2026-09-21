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
  if (compact.startsWith('0')) return `+62${compact.slice(1)}`;
  if (compact.startsWith('62')) return `+${compact}`;
  return compact;
}

function validateIdentityFile(file: File | null, label: string): string | undefined {
  if (!file || file.size === 0) return undefined;
  if (!IDENTITY_IMAGE_TYPES.includes(file.type as (typeof IDENTITY_IMAGE_TYPES)[number]))
    return `${label} harus berformat JPG, PNG, atau WebP.`;
  if (file.size > MAX_IDENTITY_FILE_BYTES) return `${label} maksimal berukuran 8 MB.`;
  return undefined;
}

export function validateRegisterField(
  name: RegisterFieldName,
  values: RegisterValues,
): string | undefined {
  switch (name) {
    case 'displayName': {
      const displayName = values.displayName.trim();
      if (!displayName) return 'Nama lengkap wajib diisi.';
      if (displayName.length > 160) return 'Nama lengkap maksimal 160 karakter.';
      return undefined;
    }
    case 'phone':
      if (!values.phone.trim()) return 'Nomor WhatsApp wajib diisi.';
      if (!e164Pattern.test(normalizeRegistrationPhone(values.phone)))
        return 'Masukkan nomor WhatsApp yang valid, misalnya 0812 3456 7890.';
      return undefined;
    case 'email':
      if (!values.email.trim()) return 'Email wajib diisi.';
      if (!emailPattern.test(values.email.trim())) return 'Masukkan alamat email yang valid.';
      if (values.email.trim().length > 254) return 'Email maksimal 254 karakter.';
      return undefined;
    case 'password':
      if (!values.password) return 'Password wajib diisi.';
      if (values.password.length < 8) return 'Password minimal 8 karakter.';
      if (values.password.length > 128) return 'Password maksimal 128 karakter.';
      return undefined;
    case 'confirmation':
      if (!values.confirmation) return 'Ulangi password wajib diisi.';
      if (values.confirmation !== values.password) return 'Konfirmasi password tidak sama.';
      return undefined;
    case 'selfie':
      if (!values.selfie) return undefined;
      return validateIdentityFile(values.selfie, 'Foto selfie');
    case 'ktp':
      if (!values.ktp) return undefined;
      return validateIdentityFile(values.ktp, 'Foto KTP');
    case 'consent':
      return undefined;
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
  ];
  return Object.fromEntries(
    fields.flatMap((field) => {
      const error = validateRegisterField(field, values);
      return error ? [[field, error]] : [];
    }),
  );
}

export function registrationRequestErrorMessage(status?: number): string {
  if (status === 409) return 'Email atau nomor WhatsApp sudah digunakan.';
  if (status === 422) return 'Periksa kembali data dan format foto yang dipilih.';
  return 'Registrasi belum dapat diproses. Coba kembali.';
}
