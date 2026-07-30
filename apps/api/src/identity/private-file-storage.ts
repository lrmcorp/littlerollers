import { Injectable, OnModuleInit } from '@nestjs/common';
import { createReadStream, type ReadStream } from 'node:fs';
import { access, link, mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { constants } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { RuntimeConfigService } from '../configuration/runtime-config.service';

export const PRIVATE_FILE_STORAGE = Symbol('PRIVATE_FILE_STORAGE');

export interface StoredPrivateFile {
  key: string;
  sizeBytes: number;
}

export interface PrivateFileStorage {
  put(input: { key: string; content: Buffer }): Promise<StoredPrivateFile>;
  read(key: string): Promise<ReadStream>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}

export function resolvePrivateUploadRoot(
  configuredRoot: string,
  workingDirectory = process.cwd(),
): string {
  if (isAbsolute(configuredRoot)) return resolve(configuredRoot);
  const repositoryRoot = workingDirectory.endsWith(`${sep}apps${sep}api`)
    ? resolve(workingDirectory, '..', '..')
    : workingDirectory;
  return resolve(repositoryRoot, configuredRoot);
}

@Injectable()
export class LocalPrivateFileStorage implements PrivateFileStorage, OnModuleInit {
  readonly root: string;

  constructor(private readonly config: RuntimeConfigService) {
    this.root = resolvePrivateUploadRoot(this.config.value.privateUploads.root);
  }

  async onModuleInit(): Promise<void> {
    const segments = this.root.split(sep).map((part) => part.toLowerCase());
    if (segments.includes('public')) throw new Error('PRIVATE_UPLOAD_ROOT_MUST_NOT_BE_PUBLIC');
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    await access(this.root, constants.R_OK | constants.W_OK);
  }

  private pathFor(key: string): string {
    if (!key || isAbsolute(key) || key.includes('..') || !/^[a-zA-Z0-9/_-]+$/u.test(key))
      throw new Error('PRIVATE_FILE_KEY_INVALID');
    const target = resolve(this.root, key);
    const scoped = relative(this.root, target);
    if (!scoped || scoped.startsWith(`..${sep}`) || isAbsolute(scoped))
      throw new Error('PRIVATE_FILE_KEY_INVALID');
    return target;
  }

  async put(input: { key: string; content: Buffer }): Promise<StoredPrivateFile> {
    const target = this.pathFor(input.key);
    await mkdir(dirname(target), { recursive: true, mode: 0o700 });
    const temporary = `${target}.upload-${randomUUID()}`;
    try {
      await writeFile(temporary, input.content, { flag: 'wx', mode: 0o600 });
      await link(temporary, target);
      await unlink(temporary);
    } catch (error) {
      await unlink(temporary).catch(() => undefined);
      throw error;
    }
    return { key: input.key, sizeBytes: input.content.byteLength };
  }

  async read(key: string): Promise<ReadStream> {
    const target = this.pathFor(key);
    const metadata = await stat(target);
    if (!metadata.isFile()) throw new Error('PRIVATE_FILE_NOT_FOUND');
    return createReadStream(target);
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await stat(this.pathFor(key))).isFile();
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    await unlink(this.pathFor(key)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}
