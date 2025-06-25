
export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'tutorial';
  image: string;
  packages: Package[];
  features: string[];
}

export interface Package {
  id: string;
  duration: '1month' | '3month' | '6month' | 'lifetime';
  price: number;
  originalPrice?: number;
  discount?: number;
}

export interface CartItem {
  productId: string;
  packageId: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'bkash' | 'nagad' | 'rocket';
  transactionId?: string;
  promoCode?: string;
  discount?: number;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  packageId: string;
  quantity: number;
  price: number;
}

export interface PaymentMethod {
  name: 'bkash' | 'nagad' | 'rocket';
  displayName: string;
  number: string;
  icon: string;
}
