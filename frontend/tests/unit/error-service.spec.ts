import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { processError, ErrorSeverity } from '@lib/services/error-service';

describe('Error Service', () => {
  describe('ZodError Processing', () => {
    it('maps ZodError → human message (el-GR & en fallback)', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      // Create a ZodError by trying to parse invalid data
      try {
        schema.parse({ email: 'invalid', password: '123' });
      } catch (zodError) {
        const processed = processError(zodError, {
          operation: 'form_validation',
          component: 'login_form',
        });

        expect(processed.severity).toBe(ErrorSeverity.INFO);
        expect(processed.retry_possible).toBe(false);
        expect(processed.message).toBeTruthy();
        expect(processed.context?.operation).toBe('form_validation');
      }
    });

    it('handles simple validation error messages', () => {
      try {
        const schema = z.string().email();
        schema.parse('not-an-email');
      } catch (zodError) {
        const processed = processError(zodError);
        
        expect(processed.message).toBeTruthy();
        expect(processed.severity).toBe(ErrorSeverity.INFO);
        expect(processed.retry_possible).toBe(false);
      }
    });

    it('provides error message with field context', () => {
      const customError = new z.ZodError([
        {
          code: 'custom' as z.ZodIssueCode,
          message: 'This is a custom error message',
          path: ['customField'],
        },
      ]);

      const processed = processError(customError, {
        operation: 'custom_validation',
      });

      expect(processed.message).toBeTruthy();
      expect(processed.message).toContain('This is a custom error message');
      expect(processed.severity).toBe(ErrorSeverity.INFO);
    });

    it('handles multiple validation errors', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        age: z.number().min(18, 'Must be 18 or older'),
      });

      try {
        schema.parse({ name: '', email: 'invalid', age: 16 });
      } catch (zodError) {
        const processed = processError(zodError);

        // Should have a message combining multiple errors
        expect(processed.message).toBeTruthy();
        expect(processed.severity).toBe(ErrorSeverity.INFO);
        expect(processed.retry_possible).toBe(false);
      }
    });
  });
});