import { describe, expect, it } from 'vitest';

import { createMockApiError, createMockApiResponse, createMockUser } from './setup';

describe('Test Utilities', () => {
  describe('createMockUser', () => {
    it('generates unique users on each call', () => {
      const user1 = createMockUser();
      const user2 = createMockUser();

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).not.toBe(user2.email);
    });

    it('applies overrides correctly', () => {
      const customUser = createMockUser({
        id: 'custom-id',
        name: 'Custom Name',
        role: 'admin',
      });

      expect(customUser.id).toBe('custom-id');
      expect(customUser.name).toBe('Custom Name');
      expect(customUser.role).toBe('admin');
      expect(customUser.email).toMatch(/^test-\w+@example\.com$/);
    });

    it('maintains default values when no overrides provided', () => {
      const user = createMockUser();

      expect(user.name).toBe('Test User');
      expect(user.role).toBe('user');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createMockApiResponse', () => {
    it('creates successful API response', () => {
      const data = { id: 1, name: 'Test' };
      const response = createMockApiResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success');
    });
  });

  describe('createMockApiError', () => {
    it('creates error API response', () => {
      const errorMessage = 'Something went wrong';
      const response = createMockApiError(errorMessage);

      expect(response.success).toBe(false);
      expect(response.error).toBe(errorMessage);
      expect(response.data).toBeNull();
    });
  });
});
