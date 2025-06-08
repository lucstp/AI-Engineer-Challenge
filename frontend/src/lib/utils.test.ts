import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500');
      expect(result).toBe('px-4 py-2 bg-blue-500');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('handles undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class');
      expect(result).toBe('base-class other-class');
    });

    it('merges conflicting Tailwind classes correctly', () => {
      const result = cn('px-4 px-6', 'py-2 py-4');
      // Should keep only the last conflicting classes, removing earlier ones
      expect(result).toBe('px-6 py-4');
    });
  });
});
