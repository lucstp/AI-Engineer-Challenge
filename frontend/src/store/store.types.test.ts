import { describe, expect, it } from 'vitest';

import { isKeyFormatValid } from './store.types';

describe('isKeyFormatValid', () => {
  it('accepts a valid all-lowercase key', () => {
    const key = 'sk-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(isKeyFormatValid(key)).toBe(true);
  });

  it('accepts a valid all-uppercase key', () => {
    const key = 'sk-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKL';
    expect(isKeyFormatValid(key)).toBe(true);
  });

  it('accepts a valid mixed-case/digit key', () => {
    const key = 'sk-aA1bB2cC3dD4eE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pQr';
    expect(isKeyFormatValid(key)).toBe(true);
  });

  it('accepts a valid key with underscores and dashes', () => {
    const key = 'sk-abcdeFGHIJklmn_OPQrstuvwx-yz1234567890ABCDEFGHIJ';
    expect(isKeyFormatValid(key)).toBe(true);
  });

  it('rejects a key with wrong prefix', () => {
    const key = 'xx-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(isKeyFormatValid(key)).toBe(false);
  });

  it('rejects a key with invalid characters', () => {
    const key = 'sk-abc$%^defghijklmnopqrstuvwxyz1234567890ABCDEF';
    expect(isKeyFormatValid(key)).toBe(false);
  });

  it('rejects a key with wrong length (too short)', () => {
    const key = 'sk-shortkey123';
    expect(isKeyFormatValid(key)).toBe(false);
  });

  it('rejects a key with wrong length (too long)', () => {
    const key = 'sk-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 49 a's
    expect(isKeyFormatValid(key)).toBe(false);
  });

  it('validates keys efficiently (performance test)', () => {
    const validKey = 'sk-aA1bB2cC3dD4eE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pQr';
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      isKeyFormatValid(validKey);
    }

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(50); // Should be very fast for pure function
  });

  it('returns consistent results for same input', () => {
    const validKey = 'sk-aA1bB2cC3dD4eE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pQr';
    const invalidKey = 'sk-short';

    // Multiple calls should return same result
    expect(isKeyFormatValid(validKey)).toBe(true);
    expect(isKeyFormatValid(validKey)).toBe(true);
    expect(isKeyFormatValid(invalidKey)).toBe(false);
    expect(isKeyFormatValid(invalidKey)).toBe(false);
  });
});
