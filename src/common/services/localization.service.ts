import { Injectable } from '@nestjs/common';

/**
 * Uzbek localization messages
 */
const UZ_MESSAGES = {
  // Success messages
  'success.order_created': 'Buyurtma muvaffaqiyatli yaratildi ✅',
  'success.order_updated': 'Buyurtma muvaffaqiyatli yangilandi ✅',
  'success.order_cancelled': 'Buyurtma bekor qilindi ❌',
  'success.food_created': 'Mahsulot muvaffaqiyatli qo\'shildi ✅',
  'success.food_updated': 'Mahsulot muvaffaqiyatli yangilandi ✅',
  'success.food_deleted': 'Mahsulot o\'chirildi ❌',
  'success.category_created': 'Kategoriya muvaffaqiyatli qo\'shildi ✅',
  'success.category_updated': 'Kategoriya muvaffaqiyatli yangilandi ✅',
  'success.category_deleted': 'Kategoriya o\'chirildi ❌',
  'success.image_uploaded': 'Rasm muvaffaqiyatli yuklandi ✅',
  'success.image_deleted': 'Rasm o\'chirildi ❌',

  // Error messages
  'error.order_not_found': 'Buyurtma topilmadi ❌',
  'error.food_not_found': 'Mahsulot topilmadi ❌',
  'error.category_not_found': 'Kategoriya topilmadi ❌',
  'error.image_not_found': 'Rasm topilmadi ❌',
  'error.invalid_phone': 'Telefon raqami noto\'g\'ri formatda. Iltimos, +998XXXXXXXXX formatida kiriting.',
  'error.invalid_address': 'Manzil kamida 10 ta belgidan iborat bo\'lishi kerak.',
  'error.invalid_quantity': 'Miqdor musbat butun son bo\'lishi kerak.',
  'error.invalid_price': 'Narx musbat son bo\'lishi kerak.',
  'error.invalid_image_type': 'Faqat JPEG, PNG, GIF, WebP formatidagi rasmlar qabul qilinadi.',
  'error.image_too_large': 'Fayl hajmi 5MB dan oshmasligi kerak.',
  'error.firebase_connection': 'Bazaga ulanib bo\'lmadi. Iltimos, keyinroq urinib ko\'ring.',
  'error.unauthorized': 'Ruxsat berilmagan. Iltimos, qayta kirish urinib ko\'ring.',
  'error.forbidden': 'Ruxsat berilmagan. Admin tokeni talab qilinadi.',
  'error.invalid_token': 'Admin tokeni noto\'g\'ri.',
  'error.validation_failed': 'Kiritilgan ma\'lumot noto\'g\'ri. Iltimos, qayta urinib ko\'ring.',
  'error.server_error': 'Tizimda xatolik yuz berdi. Xatolik ID: {errorId}',
  'error.price_mismatch': 'Jami narx hisoblangan narxga mos kelmadi',
  'error.file_required': 'Fayl talab qilinadi',

  // Order status messages
  'order.status.pending': '⏳ Kutilmoqda',
  'order.status.preparing': '👨‍🍳 Tayyorlanmoqda',
  'order.status.ready': '✅ Tayyor',
  'order.status.delivered': '🚚 Yetkazildi',
  'order.status.cancelled': '❌ Bekor qilindi',

  // Bot messages
  'bot.welcome': 'Xush kelibsiz! 👋 FastFood Bagat ga xush kelibsiz!',
  'bot.main_menu': 'Asosiy menyu:',
  'bot.select_category': 'Kategoriyani tanlang:',
  'bot.select_product': 'Mahsulotni tanlang:',
  'bot.enter_quantity': 'Miqdorni kiriting:',
  'bot.enter_address': 'Manzilni kiriting:',
  'bot.enter_phone': 'Telefon raqamini kiriting:',
  'bot.order_summary': 'Buyurtma xulasasi:',
  'bot.confirm_order': 'Buyurtmani tasdiqlaysizmi?',
  'bot.order_confirmed': 'Buyurtma qabul qilindi! ✅',
  'bot.order_cancelled': 'Buyurtma bekor qilindi ❌',
  'bot.help': 'Yordam:',
  'bot.contact': 'Kontakt:',
  'bot.admin_panel': 'Admin paneli:',

  // Buttons
  'button.confirm': '✅ Tasdiqlash',
  'button.cancel': '❌ Bekor qilish',
  'button.back': '⬅️ Orqaga',
  'button.next': '➡️ Keyingi',
  'button.menu': '📋 Menyu',
  'button.orders': '📦 Buyurtmalarim',
  'button.help': '❓ Yordam',
  'button.contact': '📞 Kontakt',
  'button.admin': '⚙️ Admin',

  // Validation messages
  'validation.required': '{field} talab qilinadi',
  'validation.invalid_format': '{field} noto\'g\'ri formatda',
  'validation.min_length': '{field} kamida {min} ta belgidan iborat bo\'lishi kerak',
  'validation.max_length': '{field} {max} ta belgidan ko\'p bo\'lmasligi kerak',
  'validation.min_value': '{field} {min} dan katta bo\'lishi kerak',
  'validation.max_value': '{field} {max} dan kichik bo\'lishi kerak',

  // Notifications
  'notification.order_status_changed': 'Buyurtma holati o\'zgardi: {status}',
  'notification.new_order': 'Yangi buyurtma: {orderId}',
  'notification.order_ready': 'Sizning buyurtmangiz tayyor! 🎉',
  'notification.order_delivered': 'Buyurtma yetkazildi! 🚚',
};

/**
 * Localization Service
 * Provides Uzbek language support for the application
 */
@Injectable()
export class LocalizationService {
  /**
   * Get localized message
   * @param key Message key
   * @param params Optional parameters for message interpolation
   * @returns Localized message
   */
  getMessage(key: string, params?: Record<string, string | number>): string {
    let message = UZ_MESSAGES[key as keyof typeof UZ_MESSAGES] || key;

    // Replace parameters in message
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        message = message.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return message;
  }

  /**
   * Get order status message
   * @param status Order status
   * @returns Localized status message
   */
  getOrderStatusMessage(
    status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
  ): string {
    return this.getMessage(`order.status.${status}`);
  }

  /**
   * Get error message
   * @param errorKey Error key
   * @param params Optional parameters
   * @returns Localized error message
   */
  getErrorMessage(errorKey: string, params?: Record<string, string | number>): string {
    return this.getMessage(`error.${errorKey}`, params);
  }

  /**
   * Get success message
   * @param successKey Success key
   * @param params Optional parameters
   * @returns Localized success message
   */
  getSuccessMessage(successKey: string, params?: Record<string, string | number>): string {
    return this.getMessage(`success.${successKey}`, params);
  }

  /**
   * Get validation message
   * @param validationKey Validation key
   * @param params Optional parameters
   * @returns Localized validation message
   */
  getValidationMessage(validationKey: string, params?: Record<string, string | number>): string {
    return this.getMessage(`validation.${validationKey}`, params);
  }

  /**
   * Get all messages
   * @returns All localized messages
   */
  getAllMessages(): typeof UZ_MESSAGES {
    return UZ_MESSAGES;
  }

  /**
   * Add custom message
   * @param key Message key
   * @param message Message text
   */
  addMessage(key: string, message: string): void {
    UZ_MESSAGES[key as keyof typeof UZ_MESSAGES] = message;
  }

  /**
   * Add multiple custom messages
   * @param messages Messages object
   */
  addMessages(messages: Record<string, string>): void {
    Object.entries(messages).forEach(([key, message]) => {
      this.addMessage(key, message);
    });
  }
}
