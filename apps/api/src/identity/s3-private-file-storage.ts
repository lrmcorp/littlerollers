import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import type { ReadStream } from 'node:fs';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import type { PrivateFileStorage, StoredPrivateFile } from './private-file-storage';

@Injectable()
export class S3PrivateFileStorage implements PrivateFileStorage, OnModuleInit {
  private readonly client: S3Client;
  readonly bucket: string;

  constructor(
    private readonly config: RuntimeConfigService,
    @Optional() @Inject('S3_CLIENT') customClient?: S3Client,
  ) {
    const objectStorage = this.config.value.privateUploads.objectStorage;
    this.bucket = objectStorage?.bucket || 'dailydose-private';
    this.client =
      customClient ??
      new S3Client({
        endpoint: objectStorage?.endpoint || undefined,
        region: objectStorage?.region || 'us-east-1',
        credentials: {
          accessKeyId: objectStorage?.accessKey || '',
          secretAccessKey: objectStorage?.secretKey || '',
        },
        forcePathStyle: objectStorage?.forcePathStyle ?? true,
        tls: objectStorage?.useSsl ?? false,
      });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error: unknown) {
      const errorName = (error as { name?: string })?.name;
      const httpStatus = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
        ?.httpStatusCode;
      if (
        (errorName === 'NotFound' || httpStatus === 404) &&
        this.config.value.environment !== 'production'
      ) {
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        } catch {
          // Ignore if bucket was created concurrently
        }
      }
    }
  }

  private validateKey(key: string): void {
    if (!key || key.startsWith('/') || key.includes('..') || !/^[a-zA-Z0-9/_.-]+$/u.test(key))
      throw new Error('PRIVATE_FILE_KEY_INVALID');
  }

  async put(input: { key: string; content: Buffer }): Promise<StoredPrivateFile> {
    this.validateKey(input.key);
    const checksum = createHash('sha256').update(input.content).digest('hex');
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.content,
        Metadata: {
          'sha256-checksum': checksum,
        },
      }),
    );
    return { key: input.key, sizeBytes: input.content.byteLength };
  }

  async read(key: string): Promise<ReadStream> {
    this.validateKey(key);
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      if (!response.Body) throw new Error('PRIVATE_FILE_NOT_FOUND');
      // Convert SDK stream to NodeJS Readable stream (ReadStream compatible)
      if (response.Body instanceof Readable) {
        return response.Body as unknown as ReadStream;
      }
      const stream = Readable.from(response.Body.transformToWebStream());
      return stream as unknown as ReadStream;
    } catch (error: unknown) {
      const errorName = (error as { name?: string })?.name;
      const httpStatus = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
        ?.httpStatusCode;
      if (errorName === 'NoSuchKey' || errorName === 'NotFound' || httpStatus === 404) {
        throw new Error('PRIVATE_FILE_NOT_FOUND');
      }
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    this.validateKey(key);
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error: unknown) {
      const errorName = (error as { name?: string })?.name;
      const httpStatus = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
        ?.httpStatusCode;
      if (errorName === 'NoSuchKey' || errorName === 'NotFound' || httpStatus === 404) {
        return false;
      }
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    this.validateKey(key);
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      const errorName = (error as { name?: string })?.name;
      const httpStatus = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
        ?.httpStatusCode;
      if (errorName !== 'NoSuchKey' && errorName !== 'NotFound' && httpStatus !== 404) {
        throw error;
      }
    }
  }

  async inspect(key: string): Promise<{ sizeBytes: number; checksum: string }> {
    this.validateKey(key);
    try {
      const head = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      const sizeBytes = head.ContentLength ?? 0;
      const metadataChecksum = head.Metadata?.['sha256-checksum'];
      if (metadataChecksum) {
        return { sizeBytes, checksum: metadataChecksum };
      }
      // Fallback: calculate checksum by reading object stream
      const stream = await this.read(key);
      const hash = createHash('sha256');
      for await (const chunk of stream) {
        hash.update(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return { sizeBytes, checksum: hash.digest('hex') };
    } catch (error: unknown) {
      const errorName = (error as { name?: string })?.name;
      const httpStatus = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
        ?.httpStatusCode;
      if (errorName === 'NoSuchKey' || errorName === 'NotFound' || httpStatus === 404) {
        throw new Error('PRIVATE_FILE_NOT_FOUND');
      }
      throw error;
    }
  }

  async createAlias(input: {
    sourceKey: string;
    aliasKey: string;
    expectedChecksum: string;
    expectedSizeBytes: number;
  }): Promise<{ key: string; sizeBytes: number; checksum: string; replay: boolean }> {
    this.validateKey(input.sourceKey);
    this.validateKey(input.aliasKey);
    const sourceMetadata = await this.inspect(input.sourceKey);
    if (
      sourceMetadata.checksum !== input.expectedChecksum ||
      sourceMetadata.sizeBytes !== input.expectedSizeBytes
    ) {
      throw new Error('PILOT_MEDIA_SOURCE_MISMATCH');
    }

    let replay = false;
    if (await this.exists(input.aliasKey)) {
      const existingAlias = await this.inspect(input.aliasKey);
      if (
        existingAlias.checksum === input.expectedChecksum &&
        existingAlias.sizeBytes === input.expectedSizeBytes
      ) {
        replay = true;
      }
    }

    if (!replay) {
      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${input.sourceKey}`,
          Key: input.aliasKey,
          MetadataDirective: 'COPY',
        }),
      );
    }

    const aliasMetadata = await this.inspect(input.aliasKey);
    if (
      aliasMetadata.checksum !== input.expectedChecksum ||
      aliasMetadata.sizeBytes !== input.expectedSizeBytes
    ) {
      throw new Error('PILOT_MEDIA_ALIAS_MISMATCH');
    }
    return { key: input.aliasKey, ...aliasMetadata, replay };
  }
}
