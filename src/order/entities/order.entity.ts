/**
 * Order Item - represents a single item in an order
 */
export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/**
 * Order Entity - represents a customer order
 */
export interface Order {
  id: string;
  telegramId: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: number;
  updatedAt: number;
  estimatedDeliveryTime: number;
}
