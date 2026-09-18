import { env } from '@/lib/env';

export type SubmitContactInput = {
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; error: string };

/** Submits the "Get in touch" contact form. Never throws. */
export async function submitContactMessage(
  payload: SubmitContactInput,
): Promise<SubmitContactResult> {
  if (!env.apiUrl) {
    return { ok: false, error: 'The site is not connected to the server right now.' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${env.apiUrl}/public/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        fullName: payload.fullName,
        email: payload.email,
        message: payload.message,
        ...(payload.phone ? { phone: payload.phone } : {}),
        ...(payload.subject ? { subject: payload.subject } : {}),
      }),
      signal: controller.signal,
    });

    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;

    if (!res.ok) {
      const message =
        body && typeof body.message === 'string'
          ? body.message
          : Array.isArray(body?.message)
            ? String(body?.message[0])
            : res.status === 429
              ? 'You have sent a few messages recently. Please try again later.'
              : 'We could not send your message. Please try again.';
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'We could not reach the server. Please try again in a moment.',
    };
  } finally {
    clearTimeout(timer);
  }
}
