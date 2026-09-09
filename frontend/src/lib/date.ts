/**
 * Today's date as a `YYYY-MM-DD` string in the visitor's local
 * timezone. Matches the value format of an `<input type="date">`
 * so it can be compared directly and used as a `min` attribute.
 */
export function getTodayLocalDate(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, '0');

  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * True when `value` (a `YYYY-MM-DD` string) is today or later in
 * the visitor's local timezone.
 */
export function isNotInPast(value: string | undefined | null): boolean {
  if (!value) {
    return false;
  }

  return value >= getTodayLocalDate();
}

/**
 * Format an ISO `YYYY-MM-DD` date as e.g. "22 November 2025".
 * Falls back to the raw string if it cannot be parsed.
 */
export function formatLongDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}
