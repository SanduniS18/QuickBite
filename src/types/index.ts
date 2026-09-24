export interface MenuItem {
  id: string;
  name: string;
  category: 'Meals' | 'Beverages' | 'Snacks';
  price: number;
  description: string;
  calories: number;
  prepTimeMinutes: number;
  imageUrl: string;
  tags?: string[];
  isVegetarian?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus = 'Placed' | 'Preparing' | 'Ready for pickup' | 'Completed';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  pickupTime: string;
  status: OrderStatus;
  createdAt: string;
  pickupLocation: string;
  paymentMethod: string;
}

export interface UserProfile {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  isGuest: boolean;
}
