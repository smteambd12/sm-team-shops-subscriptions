
export interface EnhancedOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_category?: string;
  product_description?: string;
  package_id: string;
  package_duration: string;
  package_features?: string[];
  price: number;
  original_price?: number;
  discount_percentage?: number;
  quantity: number;
  product_image?: string;
}

export interface EnhancedOrder {
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
  status: string;
  admin_message?: string;
  created_at: string;
  updated_at?: string;
  // New fields from migration
  product_name?: string;
  product_price?: number;
  product_quantity?: number;
  duration_days?: number;
  // Enhanced order items
  order_items: EnhancedOrderItem[];
}

export interface UserSubscription {
  id: string;
  subscription_file_url?: string;
  subscription_link?: string;
  file_name?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
}
