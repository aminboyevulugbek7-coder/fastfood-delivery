import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  protected basePath = 'users';

  constructor(firebaseService: FirebaseService) {
    super(firebaseService);
  }

  /**
   * Create a new user with Telegram ID as the primary key
   * @param data User data
   * @returns Created user
   */
  override async create(data: Partial<User>): Promise<User> {
    const user = {
      ...data,
      createdAt: Date.now(),
      lastActive: Date.now(),
    } as User;

    await this.firebaseService.create(
      `${this.basePath}/${data.telegramId}`,
      user,
    );
    return user;
  }

  /**
   * Read user by Telegram ID
   * @param telegramId User's Telegram ID
   * @returns User data or null
   */
  override async read(telegramId: string): Promise<User | null> {
    const data = await this.firebaseService.read(
      `${this.basePath}/${telegramId}`,
    );
    return data || null;
  }

  /**
   * Update user by Telegram ID
   * @param telegramId User's Telegram ID
   * @param data Partial user data
   */
  override async update(telegramId: string, data: Partial<User>): Promise<void> {
    await this.firebaseService.update(`${this.basePath}/${telegramId}`, {
      ...data,
      lastActive: Date.now(),
    });
  }

  /**
   * Check if user exists by Telegram ID
   * @param telegramId User's Telegram ID
   * @returns True if user exists
   */
  override async exists(telegramId: string): Promise<boolean> {
    const user = await this.read(telegramId);
    return user !== null;
  }
}
