import { Test, TestingModule } from '@nestjs/testing';
import { GlobalExceptionFilter } from './global-exception.filter';
import { LoggerService } from '../../logger/logger.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    const logger = module.get<LoggerService>(LoggerService);
    filter = new GlobalExceptionFilter(logger);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/api/test',
      method: 'GET',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('BadRequestException', () => {
    it('should handle BadRequestException with HTTP 400', () => {
      const exception = new BadRequestException('Invalid input');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.errorId).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('NotFoundException', () => {
    it('should handle NotFoundException with HTTP 404', () => {
      const exception = new NotFoundException('Resource not found');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalled();

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.message).toContain('topilmadi');
    });
  });

  describe('UnauthorizedException', () => {
    it('should handle UnauthorizedException with HTTP 401', () => {
      const exception = new UnauthorizedException('Unauthorized');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalled();

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('ForbiddenException', () => {
    it('should handle ForbiddenException with HTTP 403', () => {
      const exception = new ForbiddenException('Forbidden');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalled();

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('Generic Error', () => {
    it('should handle generic Error with HTTP 500', () => {
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalled();

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Error ID generation', () => {
    it('should generate unique error ID for each exception', () => {
      const exception1 = new BadRequestException('Error 1');
      const exception2 = new BadRequestException('Error 2');

      filter.catch(exception1, mockArgumentsHost);
      const errorId1 = mockResponse.json.mock.calls[0][0].errorId;

      mockResponse.json.mockClear();

      filter.catch(exception2, mockArgumentsHost);
      const errorId2 = mockResponse.json.mock.calls[0][0].errorId;

      expect(errorId1).not.toBe(errorId2);
    });
  });

  describe('Response structure', () => {
    it('should include required fields in error response', () => {
      const exception = new BadRequestException('Invalid input');

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('errorId');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('path');
    });
  });
});
