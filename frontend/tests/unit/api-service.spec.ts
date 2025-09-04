import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validatePayload } from '@lib/schemas';

describe('API Service Validation', () => {
  const messageSchema = z.object({ message: z.string() });

  describe('validatePayload', () => {
    it('success: validator accepts correct payload ({message:"ok"})', () => {
      const validPayload = { message: "ok" };
      
      const result = validatePayload(messageSchema, validPayload, 'test payload');
      
      expect(result).toEqual({ message: "ok" });
      expect(result.message).toBe("ok");
    });

    it('failure: validator throws error on wrong shape ({msg:"ok"})', () => {
      const invalidPayload = { msg: "ok" }; // Wrong key name
      
      expect(() => {
        validatePayload(messageSchema, invalidPayload, 'test payload');
      }).toThrowError(/test payload validation failed/i);
    });

    it('throws on missing required field', () => {
      const emptyPayload = {};
      
      expect(() => {
        validatePayload(messageSchema, emptyPayload, 'empty payload');
      }).toThrowError(/empty payload validation failed/i);
    });

    it('validates complex nested payload', () => {
      const userSchema = z.object({
        user: z.object({
          id: z.number(),
          name: z.string(),
        }),
        token: z.string(),
      });

      const validUser = {
        user: { id: 1, name: "John" },
        token: "abc123"
      };

      const result = validatePayload(userSchema, validUser, 'user payload');
      
      expect(result.user.id).toBe(1);
      expect(result.user.name).toBe("John");
      expect(result.token).toBe("abc123");
    });
  });
});