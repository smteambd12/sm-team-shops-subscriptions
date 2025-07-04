
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, RefreshCw, MessageSquare, Download, ExternalLink, FileText, Calendar, ShoppingCart, DollarSign } from 'lucide-react';
import OrderCommunications from '@/components/OrderCommunications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<{[key: string]: UserSubscription[]}>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders for user:', user?.id);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
        throw ordersError;
      }

      console.log('Orders fetched:', ordersData);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'অপেক্ষমান', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'নিশ্চিত', variant: 'default' as const, icon: CheckCircle },
      processing: { label: 'প্রক্রিয়াধীন', variant: 'default' as const, icon: RefreshCw },
      shipped: { label: 'পাঠানো হয়েছে', variant: 'default' as const, icon: Package },
      delivered: { label: 'ডেলিভার হয়েছে', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'বাতিল', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
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

  const handleFileDownload = (url: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'subscription-file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          হোমে ফিরুন
        </Button>
        <h1 className="text-3xl font-bold">আমার অর্ডার</h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">কোন অর্ডার নেই</h3>
            <p className="text-gray-600 mb-4">আপনার এখনো কোন অর্ডার নেই।</p>
            <Button onClick={() => navigate('/')}>
              কেনাকাটা শুরু করুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      অর্ডার #{order.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(order.created_at).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xl font-bold text-green-600 flex items-center gap-1">
                        <DollarSign className="h-5 w-5" />
                        ৳{order.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          চ্যাট
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>অর্ডার কমিউনিকেশন</DialogTitle>
                        </DialogHeader>
                        <OrderCommunications 
                          orderId={order.id} 
                          orderNumber={order.id.slice(0, 8)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Admin Message */}
                {order.admin_message && (
                  <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      <strong>অ্যাডমিন মেসেজ:</strong> {order.admin_message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Subscription Files/Links */}
                {subscriptions[order.id] && subscriptions[order.id].length > 0 && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      সাবস্ক্রিপশন অ্যাক্সেস
                    </h4>
                    <div className="space-y-2">
                      {subscriptions[order.id].map((sub, index) => (
                        <div key={index} className="flex gap-2">
                          {sub.subscription_file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileDownload(sub.subscription_file_url!, sub.file_name)}
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              {sub.file_name || 'ফাইল ডাউনলোড'}
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

                {/* Product Details Section - Enhanced */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-800">
                    <Package className="h-5 w-5" />
                    অর্ডার করা প্রোডাক্ট সমূহ
                  </h4>
                  <div className="grid gap-4">
                    {order.order_items.map((item, index) => (
                      <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h5 className="font-bold text-lg text-gray-800 mb-1">{item.product_name}</h5>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getDurationLabel(item.package_duration)}
                              </Badge>
                              <Badge variant="outline">
                                পরিমাণ: {item.quantity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              {item.original_price && item.original_price > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ৳{item.original_price.toLocaleString()}
                                </span>
                              )}
                              <span className="text-lg font-bold text-green-600">
                                ৳{item.price.toLocaleString()}
                              </span>
                              {item.discount_percentage && item.discount_percentage > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {item.discount_percentage}% ছাড়
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Product Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">প্রোডাক্ট ID:</span>
                            <p className="font-mono text-xs">{item.product_id}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">প্যাকেজ সময়কাল:</span>
                            <p className="font-semibold">{getDurationLabel(item.package_duration)}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">একক মূল্য:</span>
                            <p className="font-semibold text-green-600">৳{item.price.toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">মোট মূল্য:</span>
                            <p className="font-bold text-green-600">৳{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="mt-4 p-3 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">মোট আইটেম:</span>
                        <p className="font-semibold">{order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">সাবটোটাল:</span>
                        <p className="font-semibold">৳{(order.total_amount + (order.discount_amount || 0)).toLocaleString()}</p>
                      </div>
                      {order.discount_amount > 0 && (
                        <div>
                          <span className="text-gray-600">ছাড়:</span>
                          <p className="font-semibold text-red-600">-৳{order.discount_amount.toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">সর্বমোট:</span>
                        <p className="font-bold text-xl text-green-600">৳{order.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">গ্রাহকের তথ্য</h4>
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded">
                      <p><strong>নাম:</strong> {order.customer_name}</p>
                      <p><strong>ইমেইল:</strong> {order.customer_email}</p>
                      <p><strong>ফোন:</strong> {order.customer_phone}</p>
                      <p><strong>ঠিকানা:</strong> {order.customer_address}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">পেমেন্ট তথ্য</h4>
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded">
                      <p><strong>পেমেন্ট মাধ্যম:</strong> {order.payment_method}</p>
                      {order.transaction_id && (
                        <p><strong>ট্রানজেকশন ID:</strong> {order.transaction_id}</p>
                      )}
                      {order.promo_code && (
                        <p><strong>প্রোমো কোড:</strong> {order.promo_code}</p>
                      )}
                      {order.discount_amount > 0 && (
                        <p><strong>ছাড়:</strong> ৳{order.discount_amount.toLocaleString()}</p>
                      )}
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

export default Orders;
