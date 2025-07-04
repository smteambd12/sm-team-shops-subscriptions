
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  ShoppingCart, 
  Eye, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  User,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  CreditCard,
  Tag,
  RefreshCw,
  ArrowRight,
  Download,
  ExternalLink,
  Phone,
  Mail,
  Home,
  Search,
  Filter,
  Info,
  Plus,
  Trash2,
  Star,
  Layers,
  Settings
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  package_id: string;
  package_duration: string;
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [subscriptionLink, setSubscriptionLink] = useState('');
  const [fileName, setFileName] = useState('');
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
      
      // Fetch orders with items
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

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

  const updateOrderStatus = async (orderId: string, newStatus: string, message?: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          admin_message: message || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // If status is confirmed, create subscriptions
      if (newStatus === 'confirmed') {
        await createSubscriptions(orderId);
      }

      toast({
        title: "সফল",
        description: `অর্ডার স্ট্যাটাস ${getStatusLabel(newStatus)} এ আপডেট হয়েছে।`,
      });

      fetchOrders();
      setSelectedOrder(null);
      setStatusUpdate('');
      setAdminMessage('');
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const createSubscriptions = async (orderId: string) => {
    try {
      const { error } = await supabase.rpc('create_subscription_from_order', {
        order_uuid: orderId
      });

      if (error) throw error;

      console.log('Subscriptions created successfully for order:', orderId);
      toast({
        title: "সফল",
        description: "ইউজার সাবস্ক্রিপশন তৈরি হয়েছে।",
      });
    } catch (error: any) {
      console.error('Error creating subscriptions:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন তৈরি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const updateSubscriptionDetails = async (orderId: string) => {
    try {
      const { error } = await supabase.rpc('update_subscription_details', {
        p_order_id: orderId,
        p_file_url: fileUrl || null,
        p_link: subscriptionLink || null,
        p_file_name: fileName || null
      });

      if (error) throw error;

      toast({
        title: "সফল",
        description: "সাবস্ক্রিপশন তথ্য আপডেট হয়েছে।",
      });

      fetchOrders();
      setFileUrl('');
      setSubscriptionLink('');
      setFileName('');
    } catch (error: any) {
      console.error('Error updating subscription details:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'অপেক্ষমান', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      confirmed: { label: 'নিশ্চিত', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      processing: { label: 'প্রক্রিয়াধীন', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: RefreshCw },
      shipped: { label: 'পাঠানো হয়েছে', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Package },
      delivered: { label: 'ডেলিভার হয়েছে', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      cancelled: { label: 'বাতিল', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`flex items-center gap-1 px-3 py-1 ${config.color} font-semibold text-sm border`}>
        <Icon size={14} />
        {config.label}
      </Badge>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'অপেক্ষমান',
      confirmed: 'নিশ্চিত',
      processing: 'প্রক্রিয়াধীন',
      shipped: 'পাঠানো হয়েছে',
      delivered: 'ডেলিভার হয়েছে',
      cancelled: 'বাতিল'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getDurationLabel = (duration: string) => {
    const labels = {
      '1month': '১ মাস',
      '3month': '৩ মাস', 
      '6month': '৬ মাস',
      'lifetime': 'লাইফটাইম'
    };
    return labels[duration as keyof typeof labels] || duration;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      'bkash': 'বিকাশ',
      'nagad': 'নগদ',
      'rocket': 'রকেট',
      'card': 'কার্ড',
      'bank': 'ব্যাংক ট্রান্সফার'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      'web': 'ওয়েব অ্যাপ্লিকেশন',
      'mobile': 'মোবাইল অ্যাপ',
      'tutorial': 'টিউটোরিয়াল'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const navigateToUserSubscriptions = (userId: string) => {
    window.open(`/dashboard?userId=${userId}&tab=subscriptions`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('bn-BD')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 mb-4">
              <div className="h-40 bg-gray-200 rounded"></div>
            </Card>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">মোট অর্ডার</p>
                <p className="text-3xl font-bold">{orderStats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">অপেক্ষমান</p>
                <p className="text-3xl font-bold">{orderStats.pendingOrders}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">নিশ্চিত</p>
                <p className="text-3xl font-bold">{orderStats.confirmedOrders}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">মোট আয়</p>
                <p className="text-3xl font-bold">{formatCurrency(orderStats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            উন্নত ফিল্টার ও সার্চ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">সার্চ করুন</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="নাম, ইমেইল, ফোন, প্রোডাক্ট..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">স্ট্যাটাস ফিল্টার</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সমস্ত স্ট্যাটাস</SelectItem>
                  <SelectItem value="pending">অপেক্ষমান</SelectItem>
                  <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                  <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                  <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                  <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                  <SelectItem value="cancelled">বাতিল</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-filter">তারিখ ফিল্টার</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল তারিখ</SelectItem>
                  <SelectItem value="today">আজকের</SelectItem>
                  <SelectItem value="week">গত ৭ দিন</SelectItem>
                  <SelectItem value="month">গত ৩০ দিন</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
                variant="outline"
                className="w-full"
              >
                ফিল্টার রিসেট
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
              {orders.length === 0 ? 'কোন অর্ডার নেই' : 'কোন অর্ডার খুঁজে পাওয়া যায়নি'}
            </h3>
            <p className="text-gray-600">
              {orders.length === 0 
                ? 'এখনো কোন অর্ডার পাওয়া যায়নি।' 
                : 'আপনার সার্চ বা ফিল্টার অনুযায়ী কোন অর্ডার পাওয়া যায়নি।'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredOrders.length} টি অর্ডার পাওয়া গেছে
            </p>
          </div>
          
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-600" />
                          অর্ডার #{order.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {formatDate(order.created_at)}
                          {order.updated_at && (
                            <span className="ml-3 text-green-600">
                              (আপডেট: {formatDate(order.updated_at)})
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <Badge variant="outline" className="text-sm font-bold text-green-700 border-green-300">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(order.total_amount)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} আইটেম
                        </Badge>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusUpdate(order.status);
                            setAdminMessage(order.admin_message || '');
                          }}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          <Settings className="h-4 w-4" />
                          পরিচালনা করুন
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-xl">
                            <Package className="h-6 w-6 text-blue-600" />
                            অর্ডার বিস্তারিত পরিচালনা #{order.id.slice(0, 8)}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-8">
                          {/* Quick Action Buttons */}
                          <div className="flex flex-wrap gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <Button
                              onClick={() => updateOrderStatus(order.id, 'confirmed', adminMessage)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                              disabled={order.status === 'confirmed'}
                            >
                              <CheckCircle className="h-4 w-4" />
                              {order.status === 'confirmed' ? 'ইতিমধ্যে কনফার্ম' : 'অর্ডার কনফার্ম করুন'}
                            </Button>
                            
                            <Button
                              onClick={() => navigateToUserSubscriptions(order.user_id)}
                              variant="outline"
                              className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <ArrowRight className="h-4 w-4" />
                              ইউজার সাবস্ক্রিপশন দেখুন
                            </Button>

                            <Button
                              onClick={() => updateOrderStatus(order.id, 'processing', adminMessage)}
                              variant="outline"
                              className="flex items-center gap-2"
                              disabled={order.status === 'processing' || order.status === 'delivered'}
                            >
                              <RefreshCw className="h-4 w-4" />
                              প্রক্রিয়াধীন করুন
                            </Button>
                          </div>

                          {/* Order Summary Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="bg-blue-50 border-blue-200">
                              <CardContent className="p-4 text-center">
                                <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                                <div className="text-sm text-blue-600 font-medium">অর্ডার তারিখ</div>
                                <div className="text-lg font-bold text-blue-800">
                                  {new Date(order.created_at).toLocaleDateString('bn-BD')}
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-green-50 border-green-200">
                              <CardContent className="p-4 text-center">
                                <Package className="h-8 w-8 mx-auto text-green-600 mb-2" />
                                <div className="text-sm text-green-600 font-medium">মোট আইটেম</div>
                                <div className="text-lg font-bold text-green-800">
                                  {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-purple-50 border-purple-200">
                              <CardContent className="p-4 text-center">
                                <DollarSign className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                                <div className="text-sm text-purple-600 font-medium">মোট পরিমাণ</div>
                                <div className="text-lg font-bold text-purple-800">
                                  {formatCurrency(order.total_amount)}
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-orange-50 border-orange-200">
                              <CardContent className="p-4 text-center">
                                <Tag className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                                <div className="text-sm text-orange-600 font-medium">স্ট্যাটাস</div>
                                <div className="text-lg font-bold text-orange-800">
                                  {getStatusLabel(order.status)}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Detailed Product Information */}
                          <div className="space-y-6">
                            <h4 className="font-bold text-xl flex items-center gap-2 text-gray-800">
                              <Layers className="h-6 w-6 text-blue-600" />
                              বিস্তারিত প্রোডাক্ট তথ্য
                            </h4>
                            <div className="grid gap-6">
                              {order.order_items.map((item, index) => {
                                const product = products[item.product_id];
                                return (
                                  <Card key={item.id} className="border-l-4 border-l-green-500 bg-gradient-to-r from-white to-gray-50">
                                    <CardContent className="p-6">
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Product Details */}
                                        <div className="space-y-4">
                                          <div className="flex items-start gap-4">
                                            <img
                                              src={product?.image || item.product_image || 'https://via.placeholder.com/80x80'}
                                              alt={item.product_name}
                                              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                            />
                                            <div className="flex-1">
                                              <h5 className="font-bold text-xl text-blue-800 mb-1">{item.product_name}</h5>
                                              <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                  {getCategoryLabel(product?.category || 'web')}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs text-purple-700 border-purple-300">
                                                  প্রোডাক্ট ID: {item.product_id.slice(0, 8)}
                                                </Badge>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {product?.description && (
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                              <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                                <Info className="h-4 w-4" />
                                                প্রোডাক্ট বিবরণ:
                                              </p>
                                              <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                                            </div>
                                          )}

                                          {product?.features && product.features.length > 0 && (
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                              <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-1">
                                                <Star className="h-4 w-4" />
                                                বৈশিষ্ট্যসমূহ:
                                              </p>
                                              <ul className="space-y-2">
                                                {product.features.map((feature, idx) => (
                                                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    {feature}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>

                                        {/* Package & Pricing Info */}
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <Card className="bg-purple-50 border-purple-200">
                                              <CardContent className="p-4 text-center">
                                                <Clock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                                                <p className="text-sm text-purple-600 font-medium">প্যাকেজ মেয়াদ</p>
                                                <p className="text-lg font-bold text-purple-800">
                                                  {getDurationLabel(item.package_duration)}
                                                </p>
                                              </CardContent>
                                            </Card>

                                            <Card className="bg-orange-50 border-orange-200">
                                              <CardContent className="p-4 text-center">
                                                <Package className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                                                <p className="text-sm text-orange-600 font-medium">পরিমাণ</p>
                                                <p className="text-lg font-bold text-orange-800">{item.quantity}</p>
                                              </CardContent>
                                            </Card>
                                          </div>

                                          <Card className="bg-green-50 border-green-200">
                                            <CardContent className="p-4">
                                              <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                                  <DollarSign className="h-4 w-4" />
                                                  মূল্য তথ্য:
                                                </span>
                                              </div>
                                              <div className="space-y-2">
                                                {item.original_price && item.original_price > item.price && (
                                                  <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">মূল মূল্য:</span>
                                                    <span className="line-through text-gray-500">
                                                      {formatCurrency(item.original_price)}
                                                    </span>
                                                  </div>
                                                )}
                                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                                  <span className="text-green-800">বর্তমান মূল্য:</span>
                                                  <span className="text-green-800">{formatCurrency(item.price)}</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-bold text-blue-800 border-t pt-2">
                                                  <span>মোট মূল্য:</span>
                                                  <span>{formatCurrency(item.price * item.quantity)}</span>
                                                </div>
                                                {item.discount_percentage && item.discount_percentage > 0 && (
                                                  <div className="text-center pt-2">
                                                    <Badge variant="destructive" className="text-sm">
                                                      {item.discount_percentage}% ছাড়
                                                    </Badge>
                                                  </div>
                                                )}
                                              </div>
                                            </Card>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>

                          {/* Customer & Payment Information */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Customer Information */}
                            <Card className="border-l-4 border-l-blue-500">
                              <CardHeader className="bg-blue-50">
                                <CardTitle className="flex items-center gap-2 text-blue-800">
                                  <User className="h-5 w-5" />
                                  গ্রাহকের বিস্তারিত তথ্য
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <span className="text-sm text-gray-600">নাম:</span>
                                      <p className="font-semibold text-gray-800">{order.customer_name}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <span className="text-sm text-gray-600">ইমেইল:</span>
                                      <p className="font-semibold text-gray-800">{order.customer_email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <span className="text-sm text-gray-600">ফোন:</span>
                                      <p className="font-semibold text-gray-800">{order.customer_phone}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                                    <div>
                                      <span className="text-sm text-gray-600">ঠিকানা:</span>
                                      <p className="font-semibold text-gray-800">{order.customer_address}</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Payment Information */}
                            <Card className="border-l-4 border-l-green-500">
                              <CardHeader className="bg-green-50">
                                <CardTitle className="flex items-center gap-2 text-green-800">
                                  <CreditCard className="h-5 w-5" />
                                  পেমেন্ট বিস্তারিত তথ্য
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">পেমেন্ট মাধ্যম:</span>
                                    <Badge variant="outline" className="font-semibold">
                                      {getPaymentMethodLabel(order.payment_method)}
                                    </Badge>
                                  </div>
                                  {order.transaction_id && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                      <span className="text-gray-600">ট্রানজেকশন ID:</span>
                                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                                        {order.transaction_id}
                                      </span>
                                    </div>
                                  )}
                                  {order.promo_code && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                      <span className="text-gray-600">প্রোমো কোড:</span>
                                      <Badge variant="outline" className="text-purple-700 border-purple-300">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {order.promo_code}
                                      </Badge>
                                    </div>
                                  )}
                                  {order.discount_amount > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                                      <span className="text-green-700 font-medium">ছাড়:</span>
                                      <span className="text-green-700 font-bold">
                                        {formatCurrency(order.discount_amount)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg border-2 border-green-300">
                                    <span className="text-green-800 font-bold text-lg">সর্বমোট:</span>
                                    <span className="text-green-800 font-bold text-xl">
                                      {formatCurrency(order.total_amount)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Order Management Section */}
                          <Card className="border-2 border-blue-200">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                              <CardTitle className="flex items-center gap-2 text-blue-800">
                                <Settings className="h-5 w-5" />
                                অর্ডার স্ট্যাটাস ও ম্যানেজমেন্ট
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <Label htmlFor="status" className="text-base font-semibold">অর্ডার স্ট্যাটাস</Label>
                                  <Select 
                                    value={statusUpdate || order.status} 
                                    onValueChange={setStatusUpdate}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">অপেক্ষমান</SelectItem>
                                      <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                                      <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                                      <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                                      <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                                      <SelectItem value="cancelled">বাতিল</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="message" className="text-base font-semibold">অ্যাডমিন বার্তা</Label>
                                  <Textarea
                                    id="message"
                                    placeholder="গ্রাহকের জন্য বার্তা লিখুন..."
                                    value={adminMessage}
                                    onChange={(e) => setAdminMessage(e.target.value)}
                                    rows={4}
                                    className="mt-2"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Subscription Management Section */}
                          <Card className="border-2 border-purple-200">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                              <CardTitle className="flex items-center gap-2 text-purple-800">
                                <FileText className="h-5 w-5" />
                                সাবস্ক্রিপশন ফাইল ও লিংক ম্যানেজমেন্ট
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="fileUrl" className="font-semibold">ফাইল URL</Label>
                                  <Input
                                    id="fileUrl"
                                    placeholder="https://example.com/file.zip"
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    className="mt-2"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="subscriptionLink" className="font-semibold">সাবস্ক্রিপশন লিংক</Label>
                                  <Input
                                    id="subscriptionLink"
                                    placeholder="https://app.example.com/login"
                                    value={subscriptionLink}
                                    onChange={(e) => setSubscriptionLink(e.target.value)}
                                    className="mt-2"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="fileName" className="font-semibold">ফাইলের নাম</Label>
                                  <Input
                                    id="fileName"
                                    placeholder="app-files.zip"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    className="mt-2"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-200">
                            <Button
                              onClick={() => updateOrderStatus(order.id, statusUpdate || order.status, adminMessage)}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3"
                              size="lg"
                            >
                              <CheckCircle className="h-5 w-5" />
                              স্ট্যাটাস আপডেট করুন
                            </Button>
                            
                            <Button
                              onClick={() => updateSubscriptionDetails(order.id)}
                              variant="outline"
                              className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-3"
                              size="lg"
                            >
                              <FileText className="h-5 w-5" />
                              সাবস্ক্রিপশন আপডেট করুন
                            </Button>

                            <Button
                              onClick={() => createSubscriptions(order.id)}
                              variant="outline"
                              className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 px-6 py-3"
                              size="lg"
                            >
                              <Plus className="h-5 w-5" />
                              সাবস্ক্রিপশন তৈরি করুন
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                        <User className="h-4 w-4" />
                        গ্রাহক তথ্য
                      </h4>
                      <div className="space-y-2 text-sm bg-blue-50 p-4 rounded-lg">
                        <p><strong>নাম:</strong> {order.customer_name}</p>
                        <p><strong>ইমেইল:</strong> {order.customer_email}</p>
                        <p><strong>ফোন:</strong> {order.customer_phone}</p>
                        <p><strong>পেমেন্ট:</strong> {getPaymentMethodLabel(order.payment_method)}</p>
                      </div>
                    </div>

                    {/* Products Summary */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-800">
                        <Package className="h-4 w-4" />
                        প্রোডাক্ট সামারি
                      </h4>
                      <div className="space-y-3">
                        {order.order_items.map((item, index) => (
                          <div key={item.id} className="text-sm p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="font-semibold text-green-800 mb-1">{item.product_name}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                {getDurationLabel(item.package_duration)} × {item.quantity}
                              </span>
                              <span className="font-bold text-green-700">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status & Subscription Info */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-800">
                        <FileText className="h-4 w-4" />
                        স্ট্যাটাস ও সাবস্ক্রিপশন
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-purple-600 mb-1">বর্তমান স্ট্যাটাস:</p>
                          <div className="flex justify-center">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        
                        {subscriptions[order.id] && subscriptions[order.id].length > 0 && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 font-medium mb-2">
                              সাবস্ক্রিপশন তৈরি হয়েছে: {subscriptions[order.id].length}টি
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {subscriptions[order.id].map((sub, index) => (
                                <div key={index} className="flex gap-1">
                                  {sub.subscription_file_url && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(sub.subscription_file_url, '_blank')}
                                      className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                                    >
                                      <Download className="h-3 w-3" />
                                      ফাইল
                                    </Button>
                                  )}
                                  {sub.subscription_link && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(sub.subscription_link, '_blank')}
                                      className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      লিংক
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">মোট পরিমাণ:</p>
                          <p className="text-xl font-bold text-gray-800">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Message */}
                  {order.admin_message && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <MessageSquare className="h-4 w-4 inline mr-2" />
                        <strong>অ্যাডমিন বার্তা:</strong> {order.admin_message}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
