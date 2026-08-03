import { Injectable, OnModuleInit } from '@nestjs/common';
import { createReadStream, type ReadStream } from 'node:fs';
import { access, copyFile, link, mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { constants } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
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
  inspect(key: string): Promise<{ sizeBytes: number; checksum: string }>;
  createAlias(input: {
    sourceKey: string;
    aliasKey: string;
    expectedChecksum: string;
    expectedSizeBytes: number;
  }): Promise<{ key: string; sizeBytes: number; checksum: string; replay: boolean }>;
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

export function privateFilePath(root: string, key: string): string {
  if (!key || isAbsolute(key) || key.includes('..') || !/^[a-zA-Z0-9/_.-]+$/u.test(key))
    throw new Error('PRIVATE_FILE_KEY_INVALID');
  const target = resolve(root, key);
  const scoped = relative(root, target);
  if (!scoped || scoped.startsWith(`..${sep}`) || isAbsolute(scoped))
    throw new Error('PRIVATE_FILE_KEY_INVALID');
  return target;
}

export async function inspectPrivateFile(root: string, key: string) {
  const target = privateFilePath(root, key);
  const metadata = await stat(target);
  if (!metadata.isFile()) throw new Error('PRIVATE_FILE_NOT_FOUND');
  const hash = createHash('sha256');
  const stream = createReadStream(target);
  for await (const chunk of stream) hash.update(chunk);
  return { sizeBytes: metadata.size, checksum: hash.digest('hex') };
}

export async function createPrivateFileAlias(
  root: string,
  input: {
    sourceKey: string;
    aliasKey: string;
    expectedChecksum: string;
    expectedSizeBytes: number;
  },
) {
  const source = privateFilePath(root, input.sourceKey);
  const target = privateFilePath(root, input.aliasKey);
  const sourceMetadata = await inspectPrivateFile(root, input.sourceKey);
  if (
    sourceMetadata.checksum !== input.expectedChecksum ||
    sourceMetadata.sizeBytes !== input.expectedSizeBytes
  )
    throw new Error('PILOT_MEDIA_SOURCE_MISMATCH');
  await mkdir(dirname(target), { recursive: true, mode: 0o700 });
  let replay = false;
  try {
    await link(source, target);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EEXIST') replay = true;
    else if (code === 'EXDEV') {
      const temporary = `${target}.alias-${randomUUID()}`;
      try {
        await copyFile(source, temporary, constants.COPYFILE_EXCL);
        await link(temporary, target);
        await unlink(temporary);
      } catch (copyError) {
        await unlink(temporary).catch(() => undefined);
        if ((copyError as NodeJS.ErrnoException).code === 'EEXIST') replay = true;
        else throw copyError;
      }
    } else throw error;
  }
  const aliasMetadata = await inspectPrivateFile(root, input.aliasKey);
  if (
    aliasMetadata.checksum !== input.expectedChecksum ||
    aliasMetadata.sizeBytes !== input.expectedSizeBytes
  )
    throw new Error('PILOT_MEDIA_ALIAS_MISMATCH');
  return { key: input.aliasKey, ...aliasMetadata, replay };
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
    return privateFilePath(this.root, key);
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

  async inspect(key: string) {
    return inspectPrivateFile(this.root, key);
  }

  async createAlias(input: {
    sourceKey: string;
    aliasKey: string;
    expectedChecksum: string;
    expectedSizeBytes: number;
  }) {
    return createPrivateFileAlias(this.root, input);
  }
}
