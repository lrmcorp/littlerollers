import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { ApiProblem } from '../identity/security';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class PublicMediaService {
  private readonly logger = new Logger(PublicMediaService.name);
  private readonly storageDir: string;
  private readonly s3Client?: S3Client;
  private readonly s3Bucket?: string;

  constructor() {
    this.storageDir =
      process.env.PUBLIC_UPLOAD_ROOT?.trim() ||
      resolve(process.cwd(), '.local-data', 'public-uploads');
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }

    const endpoint = process.env.OBJECT_STORAGE_ENDPOINT?.trim();
    const accessKey = process.env.OBJECT_STORAGE_ACCESS_KEY?.trim();
    const secretKey = process.env.OBJECT_STORAGE_SECRET_KEY?.trim();
    const bucket = process.env.OBJECT_STORAGE_BUCKET?.trim() || 'dailydose-testing';
    const forcePathStyle = process.env.OBJECT_STORAGE_FORCE_PATH_STYLE !== 'false';
    const useSsl = process.env.OBJECT_STORAGE_USE_SSL === 'true';

    if (endpoint && accessKey && secretKey) {
      this.s3Bucket = bucket;
      this.s3Client = new S3Client({
        endpoint,
        region: 'us-east-1',
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        forcePathStyle,
        tls: useSsl,
      });
    }
  }

  async savePublicImage(input: {
    filename: string;
    mimeType: string;
    contentBase64: string;
  }): Promise<{ url: string; key: string; filename: string; sizeBytes: number; mimeType: string }> {
    const mimeType = input.mimeType?.toLowerCase().trim();
    const extension = ALLOWED_MIME_TYPES[mimeType];

    if (!extension) {
      throw new ApiProblem(
        'INVALID_MEDIA_TYPE',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!input.contentBase64) {
      throw new ApiProblem(
        'EMPTY_FILE_CONTENT',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // Strip optional data URI prefix if present (e.g. data:image/png;base64,...)
    const base64Data = input.contentBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0) {
      throw new ApiProblem(
        'INVALID_FILE_CONTENT',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new ApiProblem(
        'FILE_TOO_LARGE',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    // Generate safe unique filename
    const randomHex = randomBytes(8).toString('hex');
    const safeFilename = `media-${Date.now()}-${randomHex}${extension}`;
    const filePath = resolve(this.storageDir, safeFilename);

    writeFileSync(filePath, buffer);

    if (this.s3Client && this.s3Bucket) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.s3Bucket,
            Key: safeFilename,
            Body: buffer,
            ContentType: mimeType,
          }),
        );
      } catch (error) {
        this.logger.warn(`Failed to upload media to MinIO bucket (${this.s3Bucket}): ${error}`);
      }
    }

    return {
      url: `/api/v1/public-media/${safeFilename}`,
      key: safeFilename,
      filename: safeFilename,
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  async getPublicImage(filename: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const decoded = decodeURIComponent(filename);
    if (!decoded || decoded.includes('..') || decoded.startsWith('/') || !/^[a-zA-Z0-9/_.\s%()=+;,~-]+$/u.test(decoded)) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const safeFilename = decoded;

    const filePath = resolve(this.storageDir, safeFilename);
    if (existsSync(filePath)) {
      const ext = extname(safeFilename).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';

      const buffer = readFileSync(filePath);
      return { buffer, mimeType };
    }

    if (this.s3Client && this.s3Bucket) {
      try {
        const result = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.s3Bucket,
            Key: safeFilename,
          }),
        );
        if (result.Body) {
          const bytes = await result.Body.transformToByteArray();
          const buffer = Buffer.from(bytes);
          writeFileSync(filePath, buffer);
          const mimeType = result.ContentType || 'image/jpeg';
          return { buffer, mimeType };
        }
      } catch {
        // Fall through to 404
      }
    }

    throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  async listMedia(limit = 100): Promise<string[]> {
    const items: Array<{ key: string; time: number }> = [];

    if (this.s3Client && this.s3Bucket) {
      try {
        const result = await this.s3Client.send(
          new ListObjectsV2Command({
            Bucket: this.s3Bucket,
            MaxKeys: 1000,
          }),
        );
        if (result.Contents) {
          for (const item of result.Contents) {
            if (item.Key) {
              items.push({
                key: item.Key,
                time: item.LastModified?.getTime() ?? 0,
              });
            }
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to list objects from MinIO bucket (${this.s3Bucket}): ${error}`);
      }
    }

    try {
      if (existsSync(this.storageDir)) {
        const localFiles = readdirSync(this.storageDir);
        for (const file of localFiles) {
          if (!file.startsWith('.')) {
            try {
              const time = statSync(resolve(this.storageDir, file)).mtimeMs;
              items.push({ key: file, time });
            } catch {
              items.push({ key: file, time: 0 });
            }
          }
        }
      }
    } catch {
      // Ignore directory read error
    }

    // Sort newest first
    items.sort((a, b) => b.time - a.time);

    // Distinct keys
    const uniqueKeys = new Set<string>();
    for (const item of items) {
      uniqueKeys.add(item.key);
      if (uniqueKeys.size >= limit) break;
    }

    return Array.from(uniqueKeys);
  }
}
