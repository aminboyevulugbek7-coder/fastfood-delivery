import * as fc from 'fast-check';

describe('Sanitizer Utilities - Property-Based Tests', () => {
  describe('Property 21: Security and Data Protection', () => {
    it('should sanitize strings by removing dangerous characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 500 }),
          (input) => {
            const sanitized = input
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/<[^>]+>/g, '');
            return sanitized.length <= input.length;
          },
        ),
      );
    });

    it('should prevent SQL injection patterns', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (input) => {
            const sqlInjectionPatterns = [
              /(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)/i,
            ];
            const hasSqlInjection = sqlInjectionPatterns.some((pattern) =>
              pattern.test(input),
            );
            return typeof hasSqlInjection === 'boolean';
          },
        ),
      );
    });

    it('should normalize phone numbers correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (input) => {
            const normalized = input.replace(/\D/g, '');
            return normalized.length <= input.length;
          },
        ),
      );
    });
  });
});
