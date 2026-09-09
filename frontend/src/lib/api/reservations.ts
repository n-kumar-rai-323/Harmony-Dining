import { env } from '@/lib/env';

/**
 * Browser-side reservation helpers.
 *
 * Unlike the other files in this folder these run in the client (the
 * reservation form is interactive), so they use a plain `fetch` rather than
 * the server `apiGet` wrapper. Both helpers are total: they never throw, and
 * they degrade to a "not connected" result when the API is unreachable so
 * the form keeps working as a request-by-hand flow.
 */

export type AvailabilitySlot = {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
  available: boolean;
};

export type Availability = {
  date: string;
  open: boolean;
  closedReason?: string;
  maxGuestsPerReservation: number;
  slots: AvailabilitySlot[];
};

export type ReservationRequest = {
  fullName: string;
  phone: string;
  email?: string | null;
  date: string;
  time: string;
  guests: number;
  note?: string | null;
};

export type ReservationResult =
  | {
      ok: true;
      connected: true;
      reference: string;
      status: string;
      date: string;
      time: string;
      guests: number;
    }
  | { ok: true; connected: false }
  | { ok: false; connected: true; error: string };

function apiConfigured(): boolean {
  return env.apiUrl.length > 0;
}

function url(path: string): string {
  return `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Slot availability for a single date. `null` means "could not check". */
export async function fetchAvailability(
  date: string,
): Promise<Availability | null> {
  if (!apiConfigured()) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(
      url(`/public/reservations/availability?date=${encodeURIComponent(date)}`),
      {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as Availability;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Submits a reservation request. Never throws. */
export async function submitReservation(
  payload: ReservationRequest,
): Promise<ReservationResult> {
  if (!apiConfigured()) return { ok: true, connected: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url('/public/reservations'), {
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
            : 'We could not submit your request. Please try again or call us.';
      return { ok: false, connected: true, error: message };
    }

    return {
      ok: true,
      connected: true,
      reference: String(body?.reference ?? ''),
      status: String(body?.status ?? 'PENDING'),
      date: String(body?.date ?? payload.date),
      time: String(body?.time ?? payload.time),
      guests: Number(body?.guests ?? payload.guests),
    };
  } catch {
    // Network/timeout — let the caller fall back to the manual flow.
    return { ok: true, connected: false };
  } finally {
    clearTimeout(timer);
  }
}
