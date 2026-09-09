import { env } from '@/lib/env';

/**
 * Browser-side helper for the private-event enquiry form.
 *
 * Total by design: never throws, and reports a "not connected" result when
 * the API is absent or unreachable so the form still works as a
 * submit-by-hand flow. Mirrors src/lib/api/reservations.ts.
 */

export type EventEnquiryRequest = {
  fullName: string;
  phone: string;
  email?: string | null;
  eventType: string;
  preferredDate: string;
  alternativeDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  guests: number;
  requirements?: string | null;
};

export type EnquiryResult =
  | {
      ok: true;
      connected: true;
      reference: string;
      status: string;
      preferredDate: string;
    }
  | { ok: true; connected: false }
  | { ok: false; connected: true; error: string };

function apiConfigured(): boolean {
  return env.apiUrl.length > 0;
}

function url(path: string): string {
  return `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function submitEventEnquiry(
  payload: EventEnquiryRequest,
): Promise<EnquiryResult> {
  if (!apiConfigured()) return { ok: true, connected: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url('/public/enquiries'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = (await res.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!res.ok) {
      const message =
        body && typeof body.message === 'string'
          ? body.message
          : Array.isArray(body?.message)
            ? String(body?.message[0])
            : 'We could not submit your enquiry. Please try again or call us.';
      return { ok: false, connected: true, error: message };
    }

    return {
      ok: true,
      connected: true,
      reference: String(body?.reference ?? ''),
      status: String(body?.status ?? 'NEW'),
      preferredDate: String(body?.preferredDate ?? payload.preferredDate),
    };
  } catch {
    return { ok: true, connected: false };
  } finally {
    clearTimeout(timer);
  }
}
