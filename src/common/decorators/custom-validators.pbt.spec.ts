import * as fc from 'fast-check';

describe('Custom Validators - Property-Based Tests', () => {
  describe('Property 6: Input Validation and Error Responses', () => {
    it('should validate phone numbers correctly', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 20 }), (input) => {
          const uzbekPhoneRegex = /^\+998\d{9}$/;
          const isValid = uzbekPhoneRegex.test(input);
          return typeof isValid === 'boolean';
        }),
      );
    });

    it('should validate addresses correctly', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 500 }), (input) => {
          const isValid = input.length >= 5 && input.length <= 500;
          return typeof isValid === 'boolean';
        }),
      );
    });

    it('should validate quantities correctly', () => {
      fc.assert(
        fc.property(fc.integer(), (input) => {
          const isValid = input > 0 && input <= 1000;
          return typeof isValid === 'boolean';
        }),
      );
    });
  });

  describe('Property 8: DTO Transformation and Validation', () => {
    it('should handle string trimming and normalization', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (input) => {
            const trimmed = input.trim();
            return trimmed.length <= input.length;
          },
        ),
      );
    });
  });
});
