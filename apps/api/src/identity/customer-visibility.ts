import type { SessionPrincipal } from './identity.service';

/**
 * Pelanggan boleh dicari staf mana pun (pelanggan memesan di cabang mana saja), tetapi data kontak dan data
 * pribadi pelanggan yang tidak berkaitan dengan cabang staf disamarkan. "Berkaitan" berarti: cabang pilihannya
 * cabang staf, atau pernah memesan/membeli di cabang itu, atau belum terkait cabang mana pun.
 */

export const maskContactEmail = (value: string | null | undefined) => {
  if (!value) return null;
  const [local, domain] = value.split('@');
  if (!local || !domain) return '***';
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
};

export const maskContactPhone = (value: string | null | undefined) => {
  if (!value) return null;
  return `${value.slice(0, Math.min(5, value.length))}${'*'.repeat(Math.max(2, value.length - 8))}${value.slice(-3)}`;
};

type ProfileLike = Record<string, unknown> & { id?: string; userId?: string; fullName?: string | null };

/** Profil tanpa data pribadi: yang tersisa hanya identitas tampilan. */
export const maskCustomerProfile = (profile: ProfileLike | null | undefined) =>
  profile
    ? {
        ...profile,
        gender: null,
        birthDate: null,
        ktpUrl: null,
        selfieUrl: null,
        nik: null,
        address: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        notes: null,
      }
    : null;

/** `'ALL'` untuk staf lintas cabang; selain itu daftar cabang yang menjadi cakupan staf. */
export const staffBranchScope = (principal: SessionPrincipal): 'ALL' | string[] =>
  principal.capabilities.includes('branch:all') ? 'ALL' : principal.branchIds;
