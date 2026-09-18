import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Cheap, early multer `fileFilter`: rejects an obviously-non-image upload
 * before its body is even buffered into memory. This is NOT the real
 * security check — the client-supplied mimetype can lie — `validateImage()`
 * below (which decodes the actual file header via sharp) still runs after
 * upload and is what's actually trusted.
 */
export function multerImageFilter(
  _req: unknown,
  file: { mimetype?: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype?.startsWith('image/')) {
    callback(
      new BadRequestException(
        'Only image uploads are allowed (JPEG, PNG, WebP, AVIF, GIF).',
      ),
      false,
    );
    return;
  }
  callback(null, true);
}

const ALLOWED: Record<string, { mime: string; ext: string }> = {
  jpeg: { mime: 'image/jpeg', ext: 'jpg' },
  jpg: { mime: 'image/jpeg', ext: 'jpg' },
  png: { mime: 'image/png', ext: 'png' },
  webp: { mime: 'image/webp', ext: 'webp' },
  avif: { mime: 'image/avif', ext: 'avif' },
  gif: { mime: 'image/gif', ext: 'gif' },
};

export interface ValidatedImage {
  mime: string;
  ext: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Verifies a buffer really is a supported image by decoding its header —
 * the client-supplied Content-Type / filename are never trusted.
 */
export async function validateImage(
  buffer: Buffer,
): Promise<ValidatedImage> {
  if (!buffer || buffer.byteLength === 0) {
    throw new BadRequestException('Empty file');
  }
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new BadRequestException('File exceeds the 8 MB limit');
  }

  let meta: sharp.Metadata;
  try {
    meta = await sharp(buffer, { failOn: 'error' }).metadata();
  } catch {
    throw new BadRequestException('File is not a readable image');
  }

  const format = meta.format ?? '';
  const spec = ALLOWED[format];
  if (!spec) {
    throw new BadRequestException(
      `Unsupported image type "${format || 'unknown'}". Allowed: JPEG, PNG, WebP, AVIF, GIF.`,
    );
  }
  if (!meta.width || !meta.height) {
    throw new BadRequestException('Could not read image dimensions');
  }
  if (meta.width > 8000 || meta.height > 8000) {
    throw new BadRequestException('Image dimensions are too large');
  }

  return {
    mime: spec.mime,
    ext: spec.ext,
    width: meta.width,
    height: meta.height,
    sizeBytes: buffer.byteLength,
  };
}

/** Safe storage key: `<folder>/<random>-<sanitised-name>.<ext>`. */
export function buildStorageKey(
  folder: string,
  originalName: string,
  ext: string,
  random: string,
): string {
  const base = originalName
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60) || 'image';
  const safeFolder = folder
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'general';
  return `${safeFolder}/${random}-${base}.${ext}`;
}
