
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import OrderStatsCards from './orders/OrderStatsCards';
import OrderFilters from './orders/OrderFilters';
import OrdersList from './orders/OrdersList';
import { 
  getStatusBadge, 
  getDurationLabel, 
  getPaymentMethodLabel, 
  formatDate, 
  formatCurrency 
} from './orders/utils';

interface OrderItem {
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

interface Product {
  id: string;
  name: string;
  description: string;
  features: string[];
  category: string;
  image: string;
}

interface Order {
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
  order_items: OrderItem[];
}

interface UserSubscription {
  id: string;
  subscription_file_url?: string;
  subscription_link?: string;
  file_name?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<{[key: string]: Product}>({});
  const [subscriptions, setSubscriptions] = useState<{[key: string]: UserSubscription[]}>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
    calculateStats();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const calculateStats = () => {
    const filtered = getFilteredOrdersForStats();
    const stats = {
      totalOrders: filtered.length,
      pendingOrders: filtered.filter(o => o.status === 'pending').length,
      confirmedOrders: filtered.filter(o => o.status === 'confirmed').length,
      totalRevenue: filtered.reduce((sum, o) => sum + o.total_amount, 0)
    };
    setOrderStats(stats);
  };

  const getFilteredOrdersForStats = () => {
    const now = new Date();
    let filtered = orders;

    if (dateFilter === 'today') {
      filtered = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = orders.filter(order => new Date(order.created_at) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = orders.filter(order => new Date(order.created_at) >= monthAgo);
    }

    return filtered;
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_items.some(item => 
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.created_at) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.created_at) >= monthAgo);
    }

    setFilteredOrders(filtered);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with enhanced order items including product details
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched orders with enhanced data:', ordersData);
      setOrders(ordersData || []);

      // Fetch product details for all products in orders
      const productIds = [...new Set(ordersData?.flatMap(order => 
        order.order_items.map(item => item.product_id)
      ) || [])];

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        const productsMap: {[key: string]: Product} = {};
        productsData?.forEach(product => {
          productsMap[product.id] = product;
        });
        setProducts(productsMap);
      }

      // Fetch subscription details for each order
      const subscriptionData: {[key: string]: UserSubscription[]} = {};
      for (const order of ordersData || []) {
        const { data: subs } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('order_id', order.id);
        
        if (subs && subs.length > 0) {
          subscriptionData[order.id] = subs;
        }
      }
      setSubscriptions(subscriptionData);
      
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    fetchOrders();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded mb-4 p-6"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">অর্ডার পরিচালনা</h2>
          <p className="text-gray-600 mt-1">সকল অর্ডার দেখুন এবং পরিচালনা করুন</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
          <RefreshCw size={16} />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stats Cards */}
      <OrderStatsCards stats={orderStats} formatCurrency={formatCurrency} />

      {/* Advanced Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Orders List */}
      <OrdersList
        orders={filteredOrders}
        subscriptions={subscriptions}
        products={products}
        getStatusBadge={getStatusBadge}
        getDurationLabel={getDurationLabel}
        getPaymentMethodLabel={getPaymentMethodLabel}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        onOrderUpdate={handleOrderUpdate}
      />
    </div>
  );
};

export default OrdersManagement;
