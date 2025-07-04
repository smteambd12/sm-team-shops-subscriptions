
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
  ExternalLink
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
  const [subscriptions, setSubscriptions] = useState<{[key: string]: UserSubscription[]}>({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [subscriptionLink, setSubscriptionLink] = useState('');
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(ordersData || []);

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
        description: "অর্ডার স্ট্যাটাস আপডেট হয়েছে।",
      });

      fetchOrders();
      setSelectedOrder(null);
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
      pending: { label: 'অপেক্ষমান', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'নিশ্চিত', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      processing: { label: 'প্রক্রিয়াধীন', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      shipped: { label: 'পাঠানো হয়েছে', color: 'bg-purple-100 text-purple-800', icon: Package },
      delivered: { label: 'ডেলিভার হয়েছে', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'বাতিল', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`flex items-center gap-2 px-3 py-1 ${config.color} font-semibold`}>
        <Icon size={14} />
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
    // Navigate to user subscriptions page
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
          <p className="text-gray-600">সকল অর্ডার দেখুন এবং পরিচালনা করুন</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
          <RefreshCw size={16} />
          রিফ্রেশ
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">কোন অর্ডার নেই</h3>
            <p className="text-gray-600">এখনো কোন অর্ডার পাওয়া যায়নি।</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-gray-900">অর্ডার #</span>
                        <span className="font-mono text-blue-600">{order.id.slice(0, 8)}</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                        <DollarSign className="h-5 w-5" />
                        ৳{order.total_amount.toLocaleString('bn-BD')}
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
                          পরিচালনা
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>অর্ডার পরিচালনা #{order.id.slice(0, 8)}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Order Status Update */}
                          <div className="grid grid-cols-2 gap-4">
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
                              />
                            </div>
                          </div>

                          {/* Subscription Details */}
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-4">সাবস্ক্রিপশন তথ্য</h4>
                            <div className="grid grid-cols-3 gap-4">
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
                          <div className="flex gap-4 pt-4 border-t">
                            <Button
                              onClick={() => updateOrderStatus(order.id, statusUpdate || order.status, adminMessage)}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              স্ট্যাটাস আপডেট
                            </Button>
                            
                            <Button
                              onClick={() => updateSubscriptionDetails(order.id)}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              সাবস্ক্রিপশন আপডেট
                            </Button>
                            
                            <Button
                              onClick={() => navigateToUserSubscriptions(order.user_id)}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <ArrowRight className="h-4 w-4" />
                              ইউজার সাবস্ক্রিপশন
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Admin Message Alert */}
                {order.admin_message && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>অ্যাডমিন বার্তা:</strong> {order.admin_message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Subscription Access Section */}
                {subscriptions[order.id] && subscriptions[order.id].length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <h4 className="font-bold text-lg text-green-800 mb-3 flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      সাবস্ক্রিপশন অ্যাক্সেস
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {subscriptions[order.id].map((sub, index) => (
                        <div key={index} className="flex gap-2">
                          {sub.subscription_file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(sub.subscription_file_url, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              {sub.file_name || 'ফাইল'}
                            </Button>
                          )}
                          {sub.subscription_link && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(sub.subscription_link, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              সাবস্ক্রিপশন লিংক
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Details Section */}
                <div className="bg-gray-50 rounded-lg p-5 border">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                    <Package className="h-5 w-5 text-blue-600" />
                    অর্ডার করা প্রোডাক্ট সমূহ
                  </h4>
                  
                  <div className="space-y-4">
                    {order.order_items.map((item, index) => (
                      <div key={item.id} className="bg-white rounded-lg p-4 border shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h5 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                #{index + 1}
                              </span>
                              {item.product_name}
                            </h5>
                            
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700">
                                <Clock className="h-3 w-3" />
                                {getDurationLabel(item.package_duration)}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700">
                                <Package className="h-3 w-3" />
                                পরিমাণ: {item.quantity}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              {item.original_price && item.original_price > item.price && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 line-through">
                                    ৳{item.original_price.toLocaleString('bn-BD')}
                                  </span>
                                  {item.discount_percentage && item.discount_percentage > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {item.discount_percentage}% ছাড়
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <div className="text-xl font-bold text-green-600 flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ৳{item.price.toLocaleString('bn-BD')}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded text-sm">
                          <div className="text-center">
                            <div className="font-medium text-gray-600 mb-1">প্রোডাক্ট ID</div>
                            <div className="font-mono text-xs bg-white px-2 py-1 rounded">
                              {item.product_id}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-600 mb-1">সময়কাল</div>
                            <div className="font-semibold text-purple-600">
                              {getDurationLabel(item.package_duration)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-600 mb-1">একক মূল্য</div>
                            <div className="font-semibold text-green-600">
                              ৳{item.price.toLocaleString('bn-BD')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-600 mb-1">মোট মূল্য</div>
                            <div className="font-bold text-green-700">
                              ৳{(item.price * item.quantity).toLocaleString('bn-BD')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer & Payment Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
                      <User className="h-5 w-5 text-blue-600" />
                      গ্রাহকের তথ্য
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">নাম:</span>
                        <span className="font-semibold">{order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">ইমেইল:</span>
                        <span className="font-semibold">{order.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">ফোন:</span>
                        <span className="font-semibold">{order.customer_phone}</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <span className="text-sm font-medium">ঠিকানা:</span>
                          <span className="ml-2 font-semibold">{order.customer_address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      পেমেন্ট তথ্য
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">পেমেন্ট মাধ্যম:</span>
                        <span className="font-semibold">{getPaymentMethodLabel(order.payment_method)}</span>
                      </div>
                      {order.transaction_id && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">ট্রানজেকশন ID:</span>
                          <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                            {order.transaction_id}
                          </span>
                        </div>
                      )}
                      {order.promo_code && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">প্রোমো কোড:</span>
                          <span className="font-semibold text-green-700">{order.promo_code}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">মোট পরিমাণ:</span>
                        <span className="text-lg font-bold text-green-700">
                          ৳{order.total_amount.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
