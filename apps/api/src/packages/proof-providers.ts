import { HttpStatus, Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createConnection } from 'node:net';
import { ApiProblem, digest, opaqueToken, syntheticConfigSeconds } from '../identity/security';
import { PRIVATE_FILE_STORAGE, type PrivateFileStorage } from '../identity/private-file-storage';
import { RuntimeConfigService } from '../configuration/runtime-config.service';

export interface ObjectStorageProvider {
  issuePrivateUpload(): { objectKey: string; uploadReference: string };
  storePrivateObject(objectKey: string, bytes: Buffer): Promise<void>;
  readPrivateObject(objectKey: string): Promise<Buffer>;
  deletePrivateObject(objectKey: string): Promise<void>;
  authorizePrivateDownload(objectKey: string): { url: string; expiresAt: string };
}
export interface MalwareScanProvider {
  scanPrivateObject(objectKey: string): Promise<'CLEAN' | 'REJECTED'>;
}

@Injectable()
export class ConfigGatedObjectStorageProvider implements ObjectStorageProvider {
  constructor(
    @Inject(PRIVATE_FILE_STORAGE) @Optional() private readonly privateFiles?: PrivateFileStorage,
  ) {}

  private storage(): PrivateFileStorage {
    if (!this.privateFiles)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    return this.privateFiles;
  }

  private fallbackDirectory() {
    if (process.env.NODE_ENV === 'production')
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    return resolve(process.cwd(), '.local-data', 'private-uploads');
  }

  issuePrivateUpload() {
    if (process.env.NODE_ENV === 'production' && !this.privateFiles)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    const objectKey = `payment-proofs/${opaqueToken()}`;
    return { objectKey, uploadReference: digest(objectKey) };
  }
  async storePrivateObject(objectKey: string, bytes: Buffer) {
    if (this.privateFiles) {
      await this.storage().put({ key: objectKey, content: bytes });
      return;
    }
    const directory = this.fallbackDirectory();
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await writeFile(resolve(directory, digest(objectKey)), bytes, { mode: 0o600 });
  }
  async readPrivateObject(objectKey: string) {
    if (!this.privateFiles) return readFile(resolve(this.fallbackDirectory(), digest(objectKey)));
    const stream = await this.storage().read(objectKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream)
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return Buffer.concat(chunks);
  }
  async deletePrivateObject(objectKey: string) {
    if (this.privateFiles) {
      await this.storage().delete(objectKey);
      return;
    }
    await unlink(resolve(this.fallbackDirectory(), digest(objectKey))).catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      },
    );
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
export class ConfigGatedMalwareScanProvider implements MalwareScanProvider, OnModuleInit {
  constructor(
    @Inject(PRIVATE_FILE_STORAGE) @Optional() private readonly privateFiles?: PrivateFileStorage,
    @Optional() private readonly config?: RuntimeConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const scanner = this.config?.value.paymentProof;
    if (!scanner || scanner.scanDriver === 'synthetic') return;
    if (!scanner.clamAvHost) throw new Error('PAYMENT_PROOF_SCANNER_CONFIGURATION_REQUIRED');
    await this.assertClamAvReady(scanner.clamAvHost, scanner.clamAvPort, scanner.scanTimeoutMs);
  }

  async scanPrivateObject(objectKey: string): Promise<'CLEAN' | 'REJECTED'> {
    const driver =
      this.config?.value.paymentProof.scanDriver ??
      process.env.PAYMENT_PROOF_SCAN_DRIVER ??
      (process.env.NODE_ENV === 'production' ? 'clamav' : 'synthetic');
    if (driver === 'clamav') return this.scanWithClamAv(objectKey);
    if (process.env.NODE_ENV === 'production')
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    const result =
      this.config?.value.paymentProof.syntheticResult ??
      process.env.PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT ??
      'CLEAN';
    return result === 'REJECTED' || result === 'UNSAFE' ? 'REJECTED' : 'CLEAN';
  }

  private async scanWithClamAv(objectKey: string): Promise<'CLEAN' | 'REJECTED'> {
    if (!this.privateFiles)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    const host =
      this.config?.value.paymentProof.clamAvHost ?? process.env.PAYMENT_PROOF_CLAMAV_HOST?.trim();
    const port =
      this.config?.value.paymentProof.clamAvPort ??
      Number(process.env.PAYMENT_PROOF_CLAMAV_PORT ?? 3310);
    const timeoutMs =
      this.config?.value.paymentProof.scanTimeoutMs ??
      Number(process.env.PAYMENT_PROOF_SCAN_TIMEOUT_MS ?? 15_000);
    if (
      !host ||
      !Number.isInteger(port) ||
      port < 1 ||
      !Number.isInteger(timeoutMs) ||
      timeoutMs < 1
    )
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    const source = await this.privateFiles.read(objectKey);
    const response = await new Promise<string>(async (resolveResponse, rejectResponse) => {
      const socket = createConnection({ host, port });
      const chunks: Buffer[] = [];
      const fail = () =>
        rejectResponse(
          new ApiProblem('PAYMENT_PROOF_SCAN_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE, true),
        );
      socket.setTimeout(timeoutMs, () => socket.destroy());
      socket.once('error', fail);
      socket.once('close', (hadError) => {
        if (hadError) fail();
      });
      socket.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      socket.once('end', () => resolveResponse(Buffer.concat(chunks).toString('utf8')));
      socket.once('connect', async () => {
        try {
          socket.write('zINSTREAM\0');
          for await (const chunk of source) {
            const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            const length = Buffer.allocUnsafe(4);
            length.writeUInt32BE(bytes.length);
            socket.write(length);
            socket.write(bytes);
          }
          socket.write(Buffer.alloc(4));
        } catch {
          socket.destroy();
        }
      });
    });
    if (response.includes('FOUND')) return 'REJECTED';
    if (response.includes('OK')) return 'CLEAN';
    throw new ApiProblem('PAYMENT_PROOF_SCAN_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE, true);
  }

  private async assertClamAvReady(host: string, port: number, timeoutMs: number): Promise<void> {
    await new Promise<void>((resolveReady, rejectReady) => {
      const socket = createConnection({ host, port });
      let settled = false;
      const fail = () => {
        if (settled) return;
        settled = true;
        socket.destroy();
        rejectReady(new Error('PAYMENT_PROOF_SCANNER_UNAVAILABLE'));
      };
      socket.setTimeout(timeoutMs, fail);
      socket.once('error', fail);
      socket.on('data', (chunk) => {
        if (settled) return;
        if (!Buffer.from(chunk).toString('utf8').includes('PONG')) return fail();
        settled = true;
        socket.destroy();
        resolveReady();
      });
      socket.once('connect', () => {
        socket.write('zPING\0');
      });
    });
  }
}
