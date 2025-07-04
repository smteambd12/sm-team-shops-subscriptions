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
  Info
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
  order_items: OrderItem[];
}

interface UserSubscription {
  subscription_file_url?: string;
  subscription_link?: string;
  file_name?: string;
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
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
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
          .select('subscription_file_url, subscription_link, file_name')
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
          admin_message: message || null
        })
        .eq('id', orderId);

      if (error) throw error;

      // If status is confirmed, create subscriptions
      if (newStatus === 'confirmed') {
        await createSubscriptions(orderId);
      }

      toast({
        title: "সফল",
        description: "অর্ডার স্ট্যাটাস আপডেট হয়েছে এবং ইউজার সাবস্ক্রিপশন তৈরি হয়েছে।",
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
      <Badge className={`flex items-center gap-1 px-2 py-1 ${config.color} font-semibold text-xs border`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
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

  const navigateToUserSubscriptions = (userId: string) => {
    window.open(`/dashboard?userId=${userId}&tab=subscriptions`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 mb-4">
              <div className="h-32 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">অর্ডার পরিচালনা</h2>
          <p className="text-gray-600">সকল অর্ডার দেখুন এবং পরিচালনা করুন ({filteredOrders.length} টি অর্ডার)</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
          <RefreshCw size={16} />
          রিফ্রেশ
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ফিল্টার ও সার্চ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">সার্চ করুন</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="নাম, ইমেইল, ফোন, অর্ডার ID, ট্রানজেকশন ID দিয়ে সার্চ করুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">স্ট্যাটাস ফিল্টার</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
                  <SelectItem value="pending">অপেক্ষমান</SelectItem>
                  <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                  <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                  <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                  <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                  <SelectItem value="cancelled">বাতিল</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
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
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-lg">অর্ডার #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription className="text-sm">
                        {new Date(order.created_at).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <Badge variant="outline" className="text-xs">
                        ৳{order.total_amount.toLocaleString('bn-BD')}
                      </Badge>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        পরিচালনা করুন
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          অর্ডার পরিচালনা #{order.id.slice(0, 8)}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-4 p-4 bg-blue-50 rounded-lg">
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
                            className="flex items-center gap-2"
                          >
                            <ArrowRight className="h-4 w-4" />
                            ইউজার সাবস্ক্রিপশন দেখুন
                          </Button>
                        </div>

                        {/* Order Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">অর্ডার তারিখ</div>
                            <div className="font-semibold">
                              {new Date(order.created_at).toLocaleDateString('bn-BD')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">মোট আইটেম</div>
                            <div className="font-semibold">
                              {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">মোট পরিমাণ</div>
                            <div className="font-semibold text-green-600">
                              ৳{order.total_amount.toLocaleString('bn-BD')}
                            </div>
                          </div>
                        </div>

                        {/* Detailed Product Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            বিস্তারিত প্রোডাক্ট তথ্য
                          </h4>
                          {order.order_items.map((item, index) => {
                            const product = products[item.product_id];
                            return (
                              <Card key={item.id} className="p-4 border-l-4 border-l-blue-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={product?.image || item.product_image || 'https://via.placeholder.com/60x60'}
                                        alt={item.product_name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                      />
                                      <div>
                                        <h5 className="font-bold text-lg text-blue-800">{item.product_name}</h5>
                                        <p className="text-sm text-gray-600">ক্যাটেগরি: {product?.category || 'অজানা'}</p>
                                      </div>
                                    </div>
                                    
                                    {product?.description && (
                                      <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800 mb-1">প্রোডাক্ট বিবরণ:</p>
                                        <p className="text-sm text-gray-700">{product.description}</p>
                                      </div>
                                    )}

                                    {product?.features && product.features.length > 0 && (
                                      <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm font-medium text-green-800 mb-2">বৈশিষ্ট্যসমূহ:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {product.features.map((feature, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">{feature}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-purple-50 rounded-lg text-center">
                                        <p className="text-sm text-purple-600 font-medium">প্যাকেজ মেয়াদ</p>
                                        <p className="text-lg font-bold text-purple-800">
                                          {getDurationLabel(item.package_duration)}
                                        </p>
                                      </div>
                                      <div className="p-3 bg-orange-50 rounded-lg text-center">
                                        <p className="text-sm text-orange-600 font-medium">পরিমাণ</p>
                                        <p className="text-lg font-bold text-orange-800">{item.quantity}</p>
                                      </div>
                                    </div>

                                    <div className="p-3 bg-green-50 rounded-lg">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-green-600">মূল্য তথ্য:</span>
                                      </div>
                                      <div className="space-y-1">
                                        {item.original_price && item.original_price > item.price && (
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">মূল মূল্য:</span>
                                            <span className="line-through text-gray-500">৳{item.original_price.toLocaleString('bn-BD')}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold">
                                          <span className="text-green-800">বর্তমান মূল্য:</span>
                                          <span className="text-green-800">৳{item.price.toLocaleString('bn-BD')}</span>
                                        </div>
                                        {item.discount_percentage && item.discount_percentage > 0 && (
                                          <div className="text-center">
                                            <Badge variant="destructive" className="text-xs">
                                              {item.discount_percentage}% ছাড়
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>

                        {/* Customer & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Customer Information */}
                          <Card className="p-4">
                            <h5 className="font-semibold mb-3 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              গ্রাহকের তথ্য
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-blue-600" />
                                <span className="font-medium">{order.customer_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-blue-600" />
                                <span>{order.customer_email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-blue-600" />
                                <span>{order.customer_phone}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3 w-3 text-blue-600 mt-0.5" />
                                <span>{order.customer_address}</span>
                              </div>
                            </div>
                          </Card>

                          {/* Payment Information */}
                          <Card className="p-4">
                            <h5 className="font-semibold mb-3 flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              পেমেন্ট তথ্য
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>পেমেন্ট মাধ্যম:</span>
                                <span className="font-medium">{getPaymentMethodLabel(order.payment_method)}</span>
                              </div>
                              {order.transaction_id && (
                                <div className="flex justify-between">
                                  <span>ট্রানজেকশন ID:</span>
                                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{order.transaction_id}</span>
                                </div>
                              )}
                              {order.promo_code && (
                                <div className="flex justify-between">
                                  <span>প্রোমো কোড:</span>
                                  <Badge variant="outline" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {order.promo_code}
                                  </Badge>
                                </div>
                              )}
                              {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>ছাড়:</span>
                                  <span>৳{order.discount_amount.toLocaleString('bn-BD')}</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        </div>

                        {/* Order Status Update & Subscription Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="status">অর্ডার স্ট্যাটাস</Label>
                            <Select 
                              value={statusUpdate || order.status} 
                              onValueChange={setStatusUpdate}
                            >
                              <SelectTrigger>
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
                            <Label htmlFor="message">অ্যাডমিন বার্তা</Label>
                            <Textarea
                              id="message"
                              placeholder="ঐচ্ছিক বার্তা..."
                              value={adminMessage}
                              onChange={(e) => setAdminMessage(e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Subscription Details */}
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            সাবস্ক্রিপশন তথ্য
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="fileUrl">ফাইল URL</Label>
                              <Input
                                id="fileUrl"
                                placeholder="https://..."
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="subscriptionLink">সাবস্ক্রিপশন লিংক</Label>
                              <Input
                                id="subscriptionLink"
                                placeholder="https://..."
                                value={subscriptionLink}
                                onChange={(e) => setSubscriptionLink(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="fileName">ফাইলের নাম</Label>
                              <Input
                                id="fileName"
                                placeholder="file.zip"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 pt-4 border-t">
                          <Button
                            onClick={() => updateOrderStatus(order.id, statusUpdate || order.status, adminMessage)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            স্ট্যাটাস আপডেট করুন
                          </Button>
                          
                          <Button
                            onClick={() => updateSubscriptionDetails(order.id)}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            সাবস্ক্রিপশন আপডেট করুন
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
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      গ্রাহক তথ্য
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>নাম:</strong> {order.customer_name}</p>
                      <p><strong>ইমেইল:</strong> {order.customer_email}</p>
                      <p><strong>ফোন:</strong> {order.customer_phone}</p>
                    </div>
                  </div>

                  {/* Products Summary */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      প্রোডাক্ট সামারি
                    </h4>
                    <div className="space-y-2">
                      {order.order_items.map((item, index) => (
                        <div key={item.id} className="text-sm p-2 bg-gray-50 rounded">
                          <p className="font-medium text-blue-800">{item.product_name}</p>
                          <p className="text-gray-600">
                            {getDurationLabel(item.package_duration)} × {item.quantity} = ৳{(item.price * item.quantity).toLocaleString('bn-BD')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      পেমেন্ট তথ্য
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>মাধ্যম:</strong> {getPaymentMethodLabel(order.payment_method)}</p>
                      {order.transaction_id && (
                        <p><strong>ট্রান্স ID:</strong> <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{order.transaction_id}</span></p>
                      )}
                      <p className="text-lg font-bold text-green-600">
                        মোট: ৳{order.total_amount.toLocaleString('bn-BD')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Message */}
                {order.admin_message && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <MessageSquare className="h-4 w-4 inline mr-1" />
                      <strong>অ্যাডমিন বার্তা:</strong> {order.admin_message}
                    </p>
                  </div>
                )}

                {/* Existing Subscriptions */}
                {subscriptions[order.id] && subscriptions[order.id].length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                      সাবস্ক্রিপশন তৈরি হয়েছে:
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
