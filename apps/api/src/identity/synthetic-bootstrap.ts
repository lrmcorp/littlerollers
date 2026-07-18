import { HttpStatus } from '@nestjs/common';
import { ApiProblem, digest } from './security';

export interface SyntheticBootstrapIdentity {
  subjectHash: string;
}

export function syntheticBootstrapIdentity(
  env: NodeJS.ProcessEnv,
): SyntheticBootstrapIdentity | null {
  if (env.NODE_ENV === 'production' || env.AUTH_SYNTHETIC_ENABLED !== 'true') return null;
  const email = env.SYNTHETIC_BOOTSTRAP_SUPER_OWNER_EMAIL?.trim().toLowerCase();
  if (!email) throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
  return { subjectHash: digest(`google:${email}`) };
}
