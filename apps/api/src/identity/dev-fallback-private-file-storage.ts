import type { ReadStream } from 'node:fs';
import type { PrivateFileStorage, StoredPrivateFile } from './private-file-storage';

export class DevFallbackPrivateFileStorage implements PrivateFileStorage {
  constructor(
    private readonly primary: PrivateFileStorage,
    private readonly fallback: PrivateFileStorage,
  ) {}

  async put(input: { key: string; content: Buffer }): Promise<StoredPrivateFile> {
    try {
      return await this.primary.put(input);
    } catch {
      return await this.fallback.put(input);
    }
  }

  async read(key: string): Promise<ReadStream> {
    try {
      if (await this.primary.exists(key)) {
        return await this.primary.read(key);
      }
    } catch {
      // Primary failed or unreachable, fall back to local storage
    }
    return this.fallback.read(key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (await this.primary.exists(key)) {
        return true;
      }
    } catch {
      // Primary failed or unreachable, fall back to local storage
    }
    return this.fallback.exists(key);
  }

  async delete(key: string): Promise<void> {
    try {
      await this.primary.delete(key);
    } catch {
      // ignore primary delete failure
    }
    await this.fallback.delete(key);
  }

  async inspect(key: string): Promise<{ sizeBytes: number; checksum: string }> {
    try {
      if (await this.primary.exists(key)) {
        return await this.primary.inspect(key);
      }
    } catch {
      // Primary failed or unreachable, fall back to local storage
    }
    return this.fallback.inspect(key);
  }

  async createAlias(input: {
    sourceKey: string;
    aliasKey: string;
    expectedChecksum: string;
    expectedSizeBytes: number;
  }): Promise<{ key: string; sizeBytes: number; checksum: string; replay: boolean }> {
    try {
      return await this.primary.createAlias(input);
    } catch {
      return await this.fallback.createAlias(input);
    }
  }
}
