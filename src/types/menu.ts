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
