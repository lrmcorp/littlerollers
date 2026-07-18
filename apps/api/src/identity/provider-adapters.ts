import { Injectable } from '@nestjs/common';
import { configurationRequired, digest } from './security';

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
