import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validator for Uzbek phone numbers
 * Format: +998XXXXXXXXX (11 digits starting with +998)
 */
@ValidatorConstraint({ name: 'isUzbekPhoneNumber', async: false })
export class IsUzbekPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    // Uzbek phone format: +998XXXXXXXXX or 998XXXXXXXXX
    const phoneRegex = /^(\+998|998)\d{9}$/;
    return phoneRegex.test(value);
  }

  defaultMessage(): string {
    return 'Telefon raqami noto\'g\'ri formatda. Iltimos, +998XXXXXXXXX formatida kiriting.';
  }
}

/**
 * Decorator for validating Uzbek phone numbers
 */
export function IsUzbekPhoneNumber(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUzbekPhoneNumberConstraint,
    });
  };
}

/**
 * Validator for delivery addresses
 * Minimum length: 10 characters
 */
@ValidatorConstraint({ name: 'isValidAddress', async: false })
export class IsValidAddressConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    // Address must be at least 10 characters and contain only valid characters
    const addressRegex = /^[a-zA-Z0-9а-яА-ЯёЁ\s,.\-()]{10,}$/;
    return addressRegex.test(value);
  }

  defaultMessage(): string {
    return 'Manzil kamida 10 ta belgidan iborat bo\'lishi kerak.';
  }
}

/**
 * Decorator for validating delivery addresses
 */
export function IsValidAddress(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAddressConstraint,
    });
  };
}

/**
 * Validator for positive quantities
 */
@ValidatorConstraint({ name: 'isPositiveQuantity', async: false })
export class IsPositiveQuantityConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'number') {
      return false;
    }
    return value > 0 && Number.isInteger(value);
  }

  defaultMessage(): string {
    return 'Miqdor musbat butun son bo\'lishi kerak.';
  }
}

/**
 * Decorator for validating positive quantities
 */
export function IsPositiveQuantity(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPositiveQuantityConstraint,
    });
  };
}

/**
 * Validator for file types (MIME types)
 */
@ValidatorConstraint({ name: 'isValidImageMimeType', async: false })
export class IsValidImageMimeTypeConstraint implements ValidatorConstraintInterface {
  private allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return this.allowedMimeTypes.includes(value);
  }

  defaultMessage(): string {
    return 'Faqat JPEG, PNG, GIF, WebP formatidagi rasmlar qabul qilinadi.';
  }
}

/**
 * Decorator for validating image MIME types
 */
export function IsValidImageMimeType(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidImageMimeTypeConstraint,
    });
  };
}

/**
 * Validator for file size (max 5MB)
 */
@ValidatorConstraint({ name: 'isValidFileSize', async: false })
export class IsValidFileSizeConstraint implements ValidatorConstraintInterface {
  private maxSizeBytes = 5 * 1024 * 1024; // 5MB

  validate(value: any): boolean {
    if (typeof value !== 'number') {
      return false;
    }
    return value > 0 && value <= this.maxSizeBytes;
  }

  defaultMessage(): string {
    return 'Fayl hajmi 5MB dan oshmasligi kerak.';
  }
}

/**
 * Decorator for validating file size
 */
export function IsValidFileSize(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidFileSizeConstraint,
    });
  };
}
