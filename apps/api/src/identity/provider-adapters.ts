import { Injectable } from '@nestjs/common';
import { configurationRequired, digest, safeEqual } from './security';

export interface VerifiedIdentity {
  provider: 'GOOGLE' | 'WHATSAPP_PHONE';
  subjectHash: string;
}

export interface GoogleIdentityProvider {
  verify(idToken: string, nonce: string): Promise<VerifiedIdentity>;
}

export interface OtpProvider {
  send(phoneE164: string): Promise<{ proofHash: string }>;
}

export interface SyntheticProofProvider {
  proofHash(kind: 'MFA' | 'RECOVERY', subjectHash: string): string;
  verify(kind: 'MFA' | 'RECOVERY', subjectHash: string, proof: string): boolean;
}

const syntheticEnabled = (): boolean =>
  process.env.NODE_ENV !== 'production' && process.env.AUTH_SYNTHETIC_ENABLED === 'true';

@Injectable()
export class ConfigGatedGoogleProvider implements GoogleIdentityProvider {
  async verify(idToken: string, nonce: string): Promise<VerifiedIdentity> {
    if (!syntheticEnabled() || !idToken || !nonce) configurationRequired();
    return { provider: 'GOOGLE', subjectHash: digest(`google:${idToken}`) };
  }
}

@Injectable()
export class ConfigGatedOtpProvider implements OtpProvider {
  async send(phoneE164: string): Promise<{ proofHash: string }> {
    const code = process.env.AUTH_SYNTHETIC_OTP_CODE;
    if (!syntheticEnabled() || !code) configurationRequired();
    return { proofHash: digest(`${digest(phoneE164)}:${code}`) };
  }
}

@Injectable()
export class ConfigGatedProofProvider implements SyntheticProofProvider {
  proofHash(kind: 'MFA' | 'RECOVERY', subjectHash: string): string {
    const proof =
      kind === 'MFA'
        ? process.env.AUTH_SYNTHETIC_MFA_PROOF
        : process.env.AUTH_SYNTHETIC_RECOVERY_PROOF;
    if (!syntheticEnabled() || !proof) configurationRequired();
    return digest(`${kind}:${subjectHash}:${proof}`);
  }

  verify(kind: 'MFA' | 'RECOVERY', subjectHash: string, proof: string): boolean {
    return safeEqual(this.proofHash(kind, subjectHash), digest(`${kind}:${subjectHash}:${proof}`));
  }
}
