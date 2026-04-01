/**
 * User Preferences
 */
export interface UserPreferences {
  language: 'uz' | 'ru' | 'en';
  notifications: boolean;
}

/**
 * User Entity - represents a Telegram user
 */
export interface User {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt: number;
  lastActive: number;
  orderHistory: string[];
  preferences: UserPreferences;
}
