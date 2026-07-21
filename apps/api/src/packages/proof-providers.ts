import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiProblem, digest, opaqueToken, syntheticConfigSeconds } from '../identity/security';

function requireSyntheticProofProvider() {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.AUTH_SYNTHETIC_ENABLED !== 'true' ||
    process.env.PAYMENT_PROOF_SYNTHETIC_ENABLED !== 'true'
  )
    throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
}

export interface ObjectStorageProvider {
  issuePrivateUpload(): { objectKey: string; uploadReference: string };
}
export interface MalwareScanProvider {
  scanPrivateObject(objectKey: string): 'CLEAN' | 'REJECTED';
}

@Injectable()
export class ConfigGatedObjectStorageProvider implements ObjectStorageProvider {
  issuePrivateUpload() {
    requireSyntheticProofProvider();
    syntheticConfigSeconds('PAYMENT_PROOF_TTL_SECONDS', 900);
    const objectKey = opaqueToken();
    return { objectKey, uploadReference: digest(objectKey) };
  }
}

@Injectable()
export class ConfigGatedMalwareScanProvider implements MalwareScanProvider {
  scanPrivateObject(_objectKey: string): 'CLEAN' | 'REJECTED' {
    requireSyntheticProofProvider();
    if (process.env.PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT === 'TIMEOUT')
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    return process.env.PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT === 'UNSAFE' ? 'REJECTED' : 'CLEAN';
  }
}
