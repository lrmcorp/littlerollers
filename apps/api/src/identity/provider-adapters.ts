import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { configurationRequired, digest, safeEqual } from './security';

export interface VerifiedIdentity {
  provider: 'GOOGLE' | 'WHATSAPP_PHONE';
  subjectHash: string;
  emailHash?: string;
}

export interface GoogleIdentityProvider {
  verify(idToken: string, nonce: string): Promise<VerifiedIdentity>;
}

export interface OtpProvider {
  send(phoneE164: string): Promise<{ proofHash: string }>;
}

export interface SyntheticProofProvider {
  proofHash(kind: 'RECOVERY', subjectHash: string): string;
  verify(kind: 'RECOVERY', subjectHash: string, proof: string): boolean;
}

const syntheticEnabled = (): boolean =>
  process.env.NODE_ENV !== 'production' && process.env.AUTH_SYNTHETIC_ENABLED === 'true';

@Injectable()
export class ConfigGatedGoogleProvider implements GoogleIdentityProvider {
  async verify(idToken: string, nonce: string): Promise<VerifiedIdentity> {
    if (!idToken || !nonce) configurationRequired();
    if (syntheticEnabled()) {
      const email = idToken.trim().toLowerCase();
      return {
        provider: 'GOOGLE',
        subjectHash: digest(`google:${email}`),
        emailHash: digest(`email:${email}`),
      };
    }
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) configurationRequired();
    const ticket = await new OAuth2Client(clientId).verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (
      !payload?.sub ||
      !payload.email ||
      payload.email_verified !== true ||
      payload.nonce !== nonce
    )
      configurationRequired();
    const subject = payload!.sub!;
    const email = payload!.email!.trim().toLowerCase();
    return {
      provider: 'GOOGLE',
      subjectHash: digest(`google:${subject}`),
      emailHash: digest(`email:${email}`),
    };
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
  proofHash(kind: 'RECOVERY', subjectHash: string): string {
    const proof = process.env.AUTH_SYNTHETIC_RECOVERY_PROOF;
    if (!syntheticEnabled() || !proof) configurationRequired();
    return digest(`${kind}:${subjectHash}:${proof}`);
  }

  verify(kind: 'RECOVERY', subjectHash: string, proof: string): boolean {
    return safeEqual(this.proofHash(kind, subjectHash), digest(`${kind}:${subjectHash}:${proof}`));
  }
}
