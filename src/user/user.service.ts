import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  async createUser(data: any): Promise<any> {
    try {
      const user = await this.userRepository.create(data);
      this.logger.log(`User created: ${user.telegramId}`, 'UserService');
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create user: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'UserService',
      );
      throw error;
    }
  }

  async getUser(telegramId: string): Promise<any> {
    try {
      const user = await this.userRepository.read(telegramId);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get user: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'UserService',
      );
      throw error;
    }
  }

  async updateUser(telegramId: string, data: any): Promise<void> {
    try {
      await this.userRepository.update(telegramId, data);
      this.logger.log(`User updated: ${telegramId}`, 'UserService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update user: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'UserService',
      );
      throw error;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const users = await this.userRepository.list();
      return users;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get all users: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'UserService',
      );
      throw error;
    }
  }
}
