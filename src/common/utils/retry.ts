import { LoggerService } from '../../logger/logger.service';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 5,
  initialDelayMs: 100,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Retry mechanism with exponential backoff
 * Automatically retries failed operations with increasing delays
 * @param fn Function to retry
 * @param config Retry configuration
 * @param logger Logger service for logging retry attempts
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config?: RetryConfig,
  logger?: LoggerService,
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < finalConfig.maxRetries) {
        const delayMs = Math.min(
          finalConfig.initialDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt),
          finalConfig.maxDelayMs,
        );

        if (logger) {
          logger.warn(
            `Retry attempt ${attempt + 1}/${finalConfig.maxRetries} after ${delayMs}ms. Error: ${lastError.message}`,
            'RetryMechanism',
          );
        }

        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Delay execution for specified milliseconds
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with custom backoff strategy
 * @param fn Function to retry
 * @param shouldRetry Function to determine if error should trigger retry
 * @param config Retry configuration
 * @param logger Logger service
 * @returns Result of the function
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  config?: RetryConfig,
  logger?: LoggerService,
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < finalConfig.maxRetries && shouldRetry(lastError, attempt)) {
        const delayMs = Math.min(
          finalConfig.initialDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt),
          finalConfig.maxDelayMs,
        );

        if (logger) {
          logger.warn(
            `Conditional retry attempt ${attempt + 1}/${finalConfig.maxRetries} after ${delayMs}ms. Error: ${lastError.message}`,
            'RetryMechanism',
          );
        }

        await delay(delayMs);
      } else {
        throw lastError;
      }
    }
  }

  throw lastError;
}

/**
 * Retry only on specific error types
 * @param fn Function to retry
 * @param retryableErrors Array of error types to retry on
 * @param config Retry configuration
 * @param logger Logger service
 * @returns Result of the function
 */
export async function retryOnError<T>(
  fn: () => Promise<T>,
  retryableErrors: (new (...args: any[]) => Error)[],
  config?: RetryConfig,
  logger?: LoggerService,
): Promise<T> {
  return retryWithCondition(
    fn,
    (error) => retryableErrors.some((ErrorType) => error instanceof ErrorType),
    config,
    logger,
  );
}
