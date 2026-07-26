import { HttpStatus, Injectable } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
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
  storePrivateObject(objectKey: string, bytes: Buffer): Promise<void>;
  readPrivateObject(objectKey: string): Promise<Buffer>;
  authorizePrivateDownload(objectKey: string): { url: string; expiresAt: string };
}
export interface MalwareScanProvider {
  scanPrivateObject(objectKey: string): 'CLEAN' | 'REJECTED';
}

@Injectable()
export class ConfigGatedObjectStorageProvider implements ObjectStorageProvider {
  private localDirectory(): string {
    if (process.env.NODE_ENV === 'production')
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    return resolve(process.cwd(), '.local-data', 'private-uploads');
  }
  issuePrivateUpload() {
    if (process.env.NODE_ENV === 'production') requireSyntheticProofProvider();
    const objectKey = opaqueToken();
    return { objectKey, uploadReference: digest(objectKey) };
  }
  async storePrivateObject(objectKey: string, bytes: Buffer) {
    const directory = this.localDirectory();
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await writeFile(resolve(directory, digest(objectKey)), bytes, { mode: 0o600 });
  }
  async readPrivateObject(objectKey: string) {
    return readFile(resolve(this.localDirectory(), digest(objectKey)));
  }
  authorizePrivateDownload(objectKey: string) {
    const ttl = syntheticConfigSeconds('PAYMENT_PROOF_TTL_SECONDS', 900);
    return {
      url: `/synthetic-private-proof/${digest(`${objectKey}:${opaqueToken()}`)}`,
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    };
  }
}

@Injectable()
export class ConfigGatedMalwareScanProvider implements MalwareScanProvider {
  scanPrivateObject(_objectKey: string): 'CLEAN' | 'REJECTED' {
    if (process.env.NODE_ENV === 'production') requireSyntheticProofProvider();
    if (process.env.PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT === 'TIMEOUT')
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    return process.env.PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT === 'UNSAFE' ? 'REJECTED' : 'CLEAN';
  }
}
