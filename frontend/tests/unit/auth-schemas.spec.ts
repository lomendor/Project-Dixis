import { describe, it, expect } from 'vitest';
import {
  validateLoginRequest,
  validateRegistrationRequest,
  validateAuthResponse,
  validateUserProfile,
} from '@/lib/schemas/auth';

/**
 * Authentication Schema Validation Tests
 */

describe('Authentication Schema Validation', () => {
  describe('Login Request Validation', () => {
    it('should validate valid login request', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = validateLoginRequest(validLogin);
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
    });

    it('should reject invalid email', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => validateLoginRequest(invalidLogin)).toThrow('Login validation failed');
    });

    it('should reject empty password', () => {
      const invalidLogin = {
        email: 'test@example.com',
        password: '',
      };

      expect(() => validateLoginRequest(invalidLogin)).toThrow('Password is required');
    });
  });

  describe('Registration Request Validation', () => {
    it('should validate valid registration request', () => {
      const validRegistration = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'consumer' as const,
      };

      const result = validateRegistrationRequest(validRegistration);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.role).toBe('consumer');
    });

    it('should reject invalid role', () => {
      const invalidRegistration = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'invalid' as any,
      };

      expect(() => validateRegistrationRequest(invalidRegistration)).toThrow('Registration validation failed');
    });
  });

  describe('Auth Response Validation', () => {
    it('should validate valid auth response', () => {
      const validAuthResponse = {
        message: 'Login successful',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'consumer' as const,
          email_verified_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
        token_type: 'Bearer' as const,
      };

      const result = validateAuthResponse(validAuthResponse);
      expect(result.user.id).toBe(1);
      expect(result.token_type).toBe('Bearer');
    });

    it('should reject invalid token type', () => {
      const invalidAuthResponse = {
        message: 'Login successful',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'consumer',
          email_verified_at: null,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
        token_type: 'Basic',
      };

      expect(() => validateAuthResponse(invalidAuthResponse)).toThrow('Invalid authentication response');
    });
  });

  describe('User Profile Validation', () => {
    it('should validate valid user profile', () => {
      const validProfile = {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'producer' as const,
          email_verified_at: null,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      };

      const result = validateUserProfile(validProfile);
      expect(result.user.role).toBe('producer');
    });

    it('should reject missing user object', () => {
      const invalidProfile = {};

      expect(() => validateUserProfile(invalidProfile)).toThrow('Invalid user profile response');
    });
  });
});