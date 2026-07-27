import { createHash } from 'node:crypto';
import { HttpStatus } from '@nestjs/common';
import { ApiProblem } from './security';

export interface IdentityDocumentUpload {
  originalName: string;
  claimedMimeType: string;
  buffer: Buffer;
}

export interface ValidatedIdentityDocumentUpload extends IdentityDocumentUpload {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  checksum: string;
  width: number;
  height: number;
}

const JPEG = Buffer.from([0xff, 0xd8, 0xff]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (!buffer.subarray(0, PNG.length).equals(PNG)) return null;
  let offset = PNG.length;
  let dimensions: { width: number; height: number } | null = null;
  let hasImageData = false;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > buffer.length) return null;
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const typeAndData = buffer.subarray(offset + 4, offset + 8 + length);
    if (crc32(typeAndData) !== buffer.readUInt32BE(offset + 8 + length)) return null;
    if (type === 'IHDR') {
      if (offset !== PNG.length || length !== 13) return null;
      dimensions = {
        width: buffer.readUInt32BE(offset + 8),
        height: buffer.readUInt32BE(offset + 12),
      };
    } else if (type === 'IDAT') {
      if (!dimensions || length === 0) return null;
      hasImageData = true;
    } else if (type === 'IEND') {
      return length === 0 && end === buffer.length && hasImageData ? dimensions : null;
    }
    offset = end;
  }
  return null;
}

function jpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1]!;
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > buffer.length) return null;
    if (
      [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
        marker,
      )
    )
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    offset += 2 + length;
  }
  return null;
}

function webpDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (
    buffer.length < 30 ||
    buffer.toString('ascii', 0, 4) !== 'RIFF' ||
    buffer.toString('ascii', 8, 12) !== 'WEBP'
  )
    return null;
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X')
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  if (chunk === 'VP8 ' && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a)
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  if (chunk === 'VP8L' && buffer[20] === 0x2f) {
    const b1 = buffer[21]!;
    const b2 = buffer[22]!;
    const b3 = buffer[23]!;
    const b4 = buffer[24]!;
    return {
      width: 1 + (b1 | ((b2 & 0x3f) << 8)),
      height: 1 + ((b2 >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10)),
    };
  }
  return null;
}

function detectedImage(buffer: Buffer): {
  mimeType: ValidatedIdentityDocumentUpload['mimeType'];
  dimensions: { width: number; height: number } | null;
} | null {
  const png = pngDimensions(buffer);
  if (png) return { mimeType: 'image/png', dimensions: png };
  if (buffer.subarray(0, JPEG.length).equals(JPEG))
    return { mimeType: 'image/jpeg', dimensions: jpegDimensions(buffer) };
  const webp = webpDimensions(buffer);
  if (webp) return { mimeType: 'image/webp', dimensions: webp };
  return null;
}

export function validateIdentityDocumentUpload(
  upload: IdentityDocumentUpload | undefined,
  maxBytes: number,
): ValidatedIdentityDocumentUpload {
  if (
    !upload ||
    !upload.originalName?.trim() ||
    upload.originalName.length > 160 ||
    /[\u0000-\u001f\u007f]/u.test(upload.originalName) ||
    !upload.buffer?.length ||
    upload.buffer.length > maxBytes
  )
    throw new ApiProblem('UPLOAD_REJECTED', HttpStatus.UNPROCESSABLE_ENTITY);
  const image = detectedImage(upload.buffer);
  if (!image || image.mimeType !== upload.claimedMimeType || !image.dimensions)
    throw new ApiProblem('UPLOAD_REJECTED', HttpStatus.UNPROCESSABLE_ENTITY);
  const { width, height } = image.dimensions;
  if (
    width < 160 ||
    height < 160 ||
    width > 12_000 ||
    height > 12_000 ||
    width * height > 40_000_000
  )
    throw new ApiProblem('UPLOAD_REJECTED', HttpStatus.UNPROCESSABLE_ENTITY);
  return {
    ...upload,
    mimeType: image.mimeType,
    sizeBytes: upload.buffer.length,
    checksum: createHash('sha256').update(upload.buffer).digest('hex'),
    width,
    height,
  };
}
