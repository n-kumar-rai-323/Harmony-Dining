import { describe, expect, it } from 'vitest';

import { formatPrice } from './menu';

describe('formatPrice', () => {
  it('shows a single price', () => {
    expect(formatPrice({ price: 280, variants: [] })).toBe('Rs 280');
  });

  it('shows a range for multiple variants, low to high', () => {
    expect(
      formatPrice({
        price: null,
        variants: [
          { label: 'Full', price: 280 },
          { label: 'Half', price: 150 },
        ],
      }),
    ).toBe('Rs 150–280');
  });

  it('shows one variant price without a range', () => {
    expect(
      formatPrice({
        price: null,
        variants: [{ label: 'Only', price: 199 }],
      }),
    ).toBe('Rs 199');
  });

  it('falls back to a dash when nothing is priced', () => {
    expect(formatPrice({ price: null, variants: [] })).toBe('—');
  });
});
