export type Category = 
  | 'အားလုံး'
  | 'မုန့်ဟင်းခါး'
  | 'ဟင်း'
  | 'သုပ်'
  | 'ကြော်'
  | 'အချိုပွဲ'
  | 'သောက်စရာ';

export interface MenuItem {
  id: string;
  name: string;
  englishName: string;
  category: Category;
  price: number; // in Kyats
  emoji: string;
  imageUrl?: string; // Admin uploaded food image
  description: string;
  badge?: string;
  isPopular?: boolean;
  spicyLevel?: 0 | 1 | 2 | 3;
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  emoji?: string;
  imageUrl?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  emoji?: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  orderType: 'delivery' | 'pickup';
  address?: string;
  note?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  orderNumber?: string;
}
