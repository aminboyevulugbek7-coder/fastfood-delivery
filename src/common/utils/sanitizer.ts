/**
 * Input Sanitization Utilities
 * Prevents injection attacks and normalizes user input
 */

/**
 * Sanitize string input
 * - Trim whitespace
 * - Remove HTML/script tags
 * - Escape special characters
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Escape special characters that could be used in injection attacks
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Sanitize phone number
 * - Remove all non-digit characters except +
 * - Normalize format
 * @param phoneNumber Phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhoneNumber(phoneNumber: string): string {
  if (typeof phoneNumber !== 'string') {
    return '';
  }

  // Remove all non-digit characters except +
  let sanitized = phoneNumber.replace(/[^\d+]/g, '');

  // Ensure it starts with + or 998
  if (!sanitized.startsWith('+') && !sanitized.startsWith('998')) {
    sanitized = '+' + sanitized;
  }

  // Normalize to +998 format
  if (sanitized.startsWith('998')) {
    sanitized = '+' + sanitized;
  }

  return sanitized;
}

/**
 * Sanitize address input
 * - Trim whitespace
 * - Remove HTML/script tags
 * - Allow only safe characters
 * @param address Address to sanitize
 * @returns Sanitized address
 */
export function sanitizeAddress(address: string): string {
  if (typeof address !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = address.trim();

  // Remove HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous characters but allow common address characters
  sanitized = sanitized.replace(/[<>{}[\]\\^`|]/g, '');

  return sanitized;
}

/**
 * Sanitize object recursively
 * Applies sanitization to all string properties
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validate and sanitize email
 * @param email Email to validate and sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  const sanitized = email.trim().toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Sanitize URL
 * @param url URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  const sanitized = url.trim();

  // Basic URL validation
  try {
    new URL(sanitized);
    return sanitized;
  } catch {
    return '';
  }
}

/**
 * Sanitize numeric input
 * @param value Value to sanitize
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Sanitized number or 0 if invalid
 */
export function sanitizeNumber(value: any, min: number = 0, max: number = Infinity): number {
  const num = Number(value);

  if (isNaN(num)) {
    return 0;
  }

  if (num < min) {
    return min;
  }

  if (num > max) {
    return max;
  }

  return num;
}

/**
 * Sanitize integer input
 * @param value Value to sanitize
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Sanitized integer or 0 if invalid
 */
export function sanitizeInteger(value: any, min: number = 0, max: number = Infinity): number {
  const num = sanitizeNumber(value, min, max);
  return Math.floor(num);
}
