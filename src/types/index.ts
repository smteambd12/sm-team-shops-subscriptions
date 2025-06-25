
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

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_method: string;
  transaction_id?: string;
  promo_code?: string;
  discount_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  package_id: string;
  package_duration: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface PaymentMethod {
  name: 'bkash' | 'nagad' | 'rocket';
  displayName: string;
  number: string;
  icon: string;
}
