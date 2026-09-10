import { env } from '@/lib/env';
import { AdminApiError } from '../api';

export type Media = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  mimeType?: string;
  originalFilename?: string;
  folder?: string | null;
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES =
  'image/jpeg,image/png,image/webp,image/avif,image/gif';

type UploadMeta = {
  folder?: string;
  altText?: string;
  title?: string;
  caption?: string;
};

/** Uploads one image file (multipart) and returns the created Media row. */
export async function uploadMedia(
  file: File,
  meta: UploadMeta = {},
): Promise<Media> {
  if (!env.apiUrl) {
    throw new AdminApiError(0, ['API URL is not configured.']);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AdminApiError(0, ['Image must be 8 MB or smaller.']);
  }

  const form = new FormData();
  form.append('file', file);
  for (const [k, v] of Object.entries(meta)) {
    if (v) form.append(k, v);
  }

  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}/admin/media`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
  } catch {
    throw new AdminApiError(0, ['Could not reach the API.']);
  }

  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const m =
      body && typeof body === 'object' && 'message' in body
        ? (body as { message: unknown }).message
        : null;
    throw new AdminApiError(
      res.status,
      Array.isArray(m) ? m.map(String) : [typeof m === 'string' ? m : 'Upload failed'],
    );
  }
  return body as Media;
}
