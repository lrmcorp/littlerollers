import { HttpStatus, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { ApiProblem } from '../identity/security';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class PublicMediaService {
  private readonly storageDir: string;

  constructor() {
    this.storageDir =
      process.env.PUBLIC_UPLOAD_ROOT?.trim() ||
      resolve(process.cwd(), '.local-data', 'public-uploads');
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async savePublicImage(input: {
    filename: string;
    mimeType: string;
    contentBase64: string;
  }): Promise<{ url: string; filename: string; sizeBytes: number; mimeType: string }> {
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
    const safeFilename = `banner-${Date.now()}-${randomHex}${extension}`;
    const filePath = resolve(this.storageDir, safeFilename);

    writeFileSync(filePath, buffer);

    return {
      url: `/api/v1/public-media/${safeFilename}`,
      filename: safeFilename,
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  getPublicImage(filename: string): { buffer: Buffer; mimeType: string } {
    // Sanitize filename to prevent path traversal
    const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
    if (!safeFilename || safeFilename !== filename) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const filePath = resolve(this.storageDir, safeFilename);
    if (!existsSync(filePath)) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const ext = extname(safeFilename).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';

    const buffer = readFileSync(filePath);
    return { buffer, mimeType };
  }
}
