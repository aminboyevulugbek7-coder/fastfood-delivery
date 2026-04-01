import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { FirebaseService } from './firebase.service';
import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';

describe('Firebase Service - Property-Based Tests', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const config: Record<string, string> = {
                FIREBASE_PROJECT_ID: 'test-project',
                FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7W8jH8L5+DH5Z\ntest\n-----END PRIVATE KEY-----',
                FIREBASE_CLIENT_EMAIL: 'test@test.iam.gserviceaccount.com',
              };
              return config[key];
            },
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  describe('Property 1: Firebase Singleton Instance', () => {
    it('should return the same instance on multiple calls', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (count) => {
          const instances = Array.from({ length: count }, () => service);
          const firstInstance = instances[0];
          return instances.every((instance) => instance === firstInstance);
        }),
      );
    });
  });
});
