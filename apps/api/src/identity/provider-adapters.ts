import { HttpStatus, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ApiProblem, configurationRequired, digest, safeEqual } from './security';

export interface VerifiedIdentity {
  provider: 'GOOGLE' | 'WHATSAPP_PHONE';
  subjectHash: string;
  emailHash?: string;
  email?: string;
  displayName?: string;
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

const isJwt = (token: string): boolean => {
  const parts = token.trim().split('.');
  return parts.length === 3 && (parts[0]?.startsWith('eyJ') ?? false);
};

@Injectable()
export class ConfigGatedGoogleProvider implements GoogleIdentityProvider {
  async verify(idToken: string, nonce: string): Promise<VerifiedIdentity> {
    if (!idToken || !nonce) return configurationRequired();
    const token = idToken.trim();

    if (isJwt(token)) {
      const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
      if (!clientId) return configurationRequired();
      try {
        const ticket = await new OAuth2Client(clientId).verifyIdToken({
          idToken: token,
          audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload?.sub || !payload.email || payload.email_verified !== true) {
          throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
        }
        if (payload.nonce && nonce && payload.nonce !== nonce) {
          throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
        }
        const subject = payload.sub;
        const email = payload.email.trim().toLowerCase();
        const displayName = payload.name?.trim() || email.split('@')[0];
        return {
          provider: 'GOOGLE',
          subjectHash: digest(`google:${subject}`),
          emailHash: digest(`email:${email}`),
          email,
          displayName,
        };
      } catch (error) {
        if (error instanceof ApiProblem) throw error;
        throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
      }
    }

    if (syntheticEnabled()) {
      const email = token.toLowerCase();
      return {
        provider: 'GOOGLE',
        subjectHash: digest(`google:${email}`),
        emailHash: digest(`email:${email}`),
        email,
        displayName: email.split('@')[0],
      };
    }

    return configurationRequired();
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
