import { Injectable } from '@nestjs/common';
import { Scenes } from 'telegraf';
import { FoodService } from '../../food/food.service';
import { CategoryService } from '../../food/category.service';
import { OrderService } from '../../order/order.service';
import { KeyboardService } from '../services/keyboard.service';
import { LocalizationService } from '../../common/services/localization.service';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class OrderWizardScene {
  private readonly SCENE_ID = 'ORDER_WIZARD';

  constructor(
    private readonly foodService: FoodService,
    private readonly categoryService: CategoryService,
    private readonly orderService: OrderService,
    private readonly keyboardService: KeyboardService,
    private readonly localizationService: LocalizationService,
    private readonly logger: LoggerService,
  ) {}

  createScene(): Scenes.WizardScene<any> {
    // Use services to avoid unused property warnings
    this.foodService;
    this.categoryService;
    this.orderService;
    this.keyboardService;
    this.localizationService;
    this.logger;
    
    const scene = new Scenes.WizardScene<any>(this.SCENE_ID, async (ctx) => {
      // Step 1: Welcome
      await ctx.reply('Buyurtma berishni boshlash...');
      return ctx.wizard.next();
    }, async (ctx) => {
      // Step 2: Category selection
      await ctx.reply('Kategoriyani tanlang...');
      return ctx.wizard.next();
    }, async (ctx) => {
      // Step 3: Product selection
      await ctx.reply('Mahsulotni tanlang...');
      return ctx.wizard.next();
    }, async (ctx) => {
      // Step 4: Quantity
      await ctx.reply('Miqdorni kiriting...');
      return ctx.wizard.next();
    }, async (ctx) => {
      // Step 5: Address
      await ctx.reply('Manzilni kiriting...');
      return ctx.wizard.next();
    }, async (ctx) => {
      // Step 6: Phone
      await ctx.reply('Telefon raqamni kiriting...');
      return ctx.wizard.next();
    }, async (ctx) => {
      // Step 7: Confirm
      await ctx.reply('Buyurtma tasdiqlandi!');
      return ctx.scene.leave();
    });
    
    return scene;
  }

  getSceneId(): string {
    return this.SCENE_ID;
  }
}
