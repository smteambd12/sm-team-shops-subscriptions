import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, RefreshCw, MessageSquare, Download, ExternalLink, FileText, Calendar, ShoppingCart, DollarSign, User, MapPin, CreditCard, Tag, Eye } from 'lucide-react';
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
  // Consolidated fields from orders table
  product_name?: string;
  product_price?: number;
  product_quantity?: number;
  duration_days?: number;
  // New text fields with concatenated values
  product_price_text?: string;
  product_quantity_text?: string;
  duration_days_text?: string;
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
  const isMobile = useIsMobile();

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
      pending: { label: 'অপেক্ষমান', variant: 'secondary' as const, icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      confirmed: { label: 'নিশ্চিত', variant: 'default' as const, icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
      processing: { label: 'প্রক্রিয়াধীন', variant: 'default' as const, icon: RefreshCw, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      shipped: { label: 'পাঠানো হয়েছে', variant: 'default' as const, icon: Package, color: 'bg-purple-100 text-purple-800 border-purple-200' },
      delivered: { label: 'ডেলিভার হয়েছে', variant: 'default' as const, icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
      cancelled: { label: 'বাতিল', variant: 'destructive' as const, icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`flex items-center gap-1 px-2 py-1 ${config.color} font-semibold ${isMobile ? 'text-xs' : ''}`}>
        <Icon size={isMobile ? 12 : 14} />
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

  const handleFileDownload = (url: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'subscription-file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDurationDays = (days: number) => {
    if (days >= 36500) return 'লাইফটাইম';
    if (days >= 365) return `${Math.floor(days / 365)} বছর`;
    if (days >= 30) return `${Math.floor(days / 30)} মাস`;
    return `${days} দিন`;
  };

  if (loading) {
    return (
      <div className={`container mx-auto px-2 sm:px-4 py-4 sm:py-8 ${isMobile ? 'max-w-full' : 'max-w-6xl'}`}>
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-5 bg-gray-200 rounded w-32"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-2 sm:px-4 py-3 sm:py-8 ${isMobile ? 'max-w-full' : 'max-w-6xl'}`}>
      {/* Header Section */}
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} mb-3 sm:mb-8 gap-2 sm:gap-4`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-2 sm:gap-4`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-gray-50 w-fit"
          >
            <ArrowLeft size={16} />
            হোমে ফিরুন
          </Button>
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold text-gray-900`}>আমার অর্ডার সমূহ</h1>
            <p className={`text-gray-600 mt-1 ${isMobile ? 'text-xs' : ''}`}>আপনার সকল অর্ডার এবং সাবস্ক্রিপশনের সম্পূর্ণ বিবরণ</p>
          </div>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 w-fit"
        >
          <RefreshCw size={16} />
          রিফ্রেশ
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-8 sm:py-16">
          <CardContent>
            <div className="flex flex-col items-center">
              <Package className={`mx-auto ${isMobile ? 'h-12 w-12' : 'h-20 w-20'} text-gray-400 mb-4 sm:mb-6`} />
              <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold mb-2 sm:mb-3 text-gray-900`}>কোন অর্ডার নেই</h3>
              <p className={`text-gray-600 mb-4 sm:mb-6 max-w-md ${isMobile ? 'text-sm px-4' : ''}`}>
                আপনার এখনো কোন অর্ডার নেই। আমাদের দুর্দান্ত প্রোডাক্ট কালেকশন দেখুন এবং আজই কেনাকাটা শুরু করুন।
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2"
              >
                কেনাকাটা শুরু করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`space-y-${isMobile ? '3' : '8'}`}>
          {orders.map((order) => {
            // Use consolidated data from orders table as primary source, with fallback to order_items
            const displayProductName = order.product_name || 
              (order.order_items && order.order_items.length > 0 ? 
                order.order_items.map(item => item.product_name).join(' + ') : 
                'N/A');
                
            const displayQuantity = order.product_quantity || 
              (order.order_items && order.order_items.length > 0 ? 
                order.order_items.reduce((sum, item) => sum + item.quantity, 0) : 
                0);
                
            const displayDuration = order.duration_days ? formatDurationDays(order.duration_days) : 'N/A';
            
            // Use concatenated text fields for detailed display when available
            const displayQuantityText = order.product_quantity_text || displayQuantity.toString();
            const displayDurationText = order.duration_days_text || displayDuration;
            const displayPriceText = order.product_price_text || 
              (order.product_price ? order.product_price.toLocaleString('bn-BD') : 'N/A');

            return (
              <Card key={order.id} className={`border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300 ${isMobile ? 'mx-1' : ''}`}>
                {/* Mobile Compact Header */}
                {isMobile ? (
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm flex items-center gap-2 mb-1">
                          <div className="p-1 bg-blue-100 rounded">
                            <ShoppingCart className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="text-gray-900 truncate">অর্ডার #{order.id.slice(0, 6)}</span>
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString('bn-BD')}
                        </CardDescription>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(order.status)}
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ৳{order.total_amount.toLocaleString('bn-BD')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                ) : (
                  // Desktop header
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-2xl flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-gray-900">অর্ডার #</span>
                            <span className="font-mono text-blue-600">{order.id.slice(0, 8)}</span>
                          </div>
                        </CardTitle>
                        <CardDescription className="text-base flex items-center gap-2 text-gray-600">
                          <Calendar className="h-5 w-5" />
                          অর্ডারের তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD', {
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
                          <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
                            <DollarSign className="h-6 w-6" />
                            ৳{order.total_amount.toLocaleString('bn-BD')}
                          </div>
                          <div className="text-sm text-gray-500">মোট পরিমাণ</div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-50">
                              <MessageSquare className="h-4 w-4" />
                              চ্যাট
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                অর্ডার কমিউনিকেশন #{order.id.slice(0, 8)}
                              </DialogTitle>
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
                )}

                <CardContent className={`${isMobile ? 'p-3' : 'p-6'} space-y-${isMobile ? '3' : '6'}`}>
                  {/* Admin Message Alert */}
                  {order.admin_message && (
                    <Alert className={`border-blue-200 bg-blue-50 ${isMobile ? 'p-2' : ''}`}>
                      <MessageSquare className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
                      <AlertDescription className={`text-blue-800 ${isMobile ? 'text-xs' : ''}`}>
                        <strong className="font-semibold">অ্যাডমিন বার্তা:</strong> {order.admin_message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Mobile Compact Layout */}
                  {isMobile ? (
                    <div className="space-y-3">
                      {/* Subscription Access - Compact */}
                      {subscriptions[order.id] && subscriptions[order.id].length > 0 && (
                        <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            সাবস্ক্রিপশন ({subscriptions[order.id].length}টি)
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {subscriptions[order.id].map((sub, index) => (
                              <div key={index} className="flex gap-1">
                                {sub.subscription_file_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFileDownload(sub.subscription_file_url!, sub.file_name)}
                                    className="text-xs px-2 py-1 h-6 bg-white hover:bg-green-50 border-green-300"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    ফাইল
                                  </Button>
                                )}
                                {sub.subscription_link && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(sub.subscription_link, '_blank')}
                                    className="text-xs px-2 py-1 h-6 bg-white hover:bg-green-50 border-green-300"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    লিংক
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product Details - Compact */}
                      <div className="bg-gray-50 rounded-lg p-2 border">
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1 text-gray-800">
                          <Package className="h-3 w-3" />
                          পণ্যের বিবরণ
                        </h4>
                        
                        <div className="bg-white rounded p-2 border">
                          <div className="text-xs font-medium text-gray-900 mb-2 line-clamp-2">
                            {displayProductName}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-1 bg-blue-50 rounded">
                              <div className="text-gray-600">পরিমাণ</div>
                              <div className="font-semibold text-blue-700">{displayQuantity}টি</div>
                            </div>
                            <div className="text-center p-1 bg-purple-50 rounded">
                              <div className="text-gray-600">মেয়াদ</div>
                              <div className="font-semibold text-purple-700">{displayDuration}</div>
                            </div>
                            <div className="text-center p-1 bg-green-50 rounded">
                              <div className="text-gray-600">মূল্য</div>
                              <div className="font-semibold text-green-700">৳{displayPriceText}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer & Payment Info - Compact */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded p-2 border">
                          <h5 className="text-xs font-semibold mb-1 flex items-center gap-1 text-gray-800">
                            <User className="h-3 w-3" />
                            গ্রাহক
                          </h5>
                          <div className="space-y-1 text-xs">
                            <div className="truncate">{order.customer_name}</div>
                            <div className="truncate text-gray-600">{order.customer_phone}</div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded p-2 border">
                          <h5 className="text-xs font-semibold mb-1 flex items-center gap-1 text-gray-800">
                            <CreditCard className="h-3 w-3" />
                            পেমেন্ট
                          </h5>
                          <div className="space-y-1 text-xs">
                            <div>{getPaymentMethodLabel(order.payment_method)}</div>
                            <div className="font-semibold text-green-700">৳{order.total_amount.toLocaleString('bn-BD')}</div>
                          </div>
                        </div>
                      </div>

                      {/* Chat Button - Mobile */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 hover:bg-blue-50">
                            <MessageSquare className="h-4 w-4" />
                            অর্ডার চ্যাট
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-sm">
                              <MessageSquare className="h-4 w-4" />
                              অর্ডার কমিউনিকেশন #{order.id.slice(0, 8)}
                            </DialogTitle>
                          </DialogHeader>
                          <OrderCommunications 
                            orderId={order.id} 
                            orderNumber={order.id.slice(0, 8)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div>
                      {/* Subscription Access Section */}
                      {subscriptions[order.id] && subscriptions[order.id].length > 0 && (
                        <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                          <h4 className="font-bold text-lg mb-4 flex items-center gap-3 text-green-800">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Download className="h-5 w-5 text-green-600" />
                            </div>
                            সাবস্ক্রিপশন অ্যাক্সেস
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {subscriptions[order.id].map((sub, index) => (
                              <div key={index} className="flex flex-wrap gap-2">
                                {sub.subscription_file_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFileDownload(sub.subscription_file_url!, sub.file_name)}
                                    className="flex items-center gap-2 bg-white hover:bg-green-50 border-green-300 text-sm"
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
                                    className="flex items-center gap-2 bg-white hover:bg-green-50 border-green-300 text-sm"
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

                      {/* Enhanced Product Details Section */}
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
                        <h4 className="font-bold text-xl mb-6 flex items-center gap-3 text-gray-800">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          অর্ডার করা প্রোডাক্ট সমূহ
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-5 border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4 gap-3">
                              <div className="flex-1">
                                <h5 className="font-bold text-xl text-gray-900 mb-2 flex items-center gap-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                    পণ্য
                                  </span>
                                  <span>{displayProductName}</span>
                                </h5>
                                
                                {/* Package and Quantity Info */}
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
                                    <Clock className="h-4 w-4" />
                                    {displayDuration}
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 border-orange-200">
                                    <Package className="h-4 w-4" />
                                    পরিমাণ: {displayQuantity}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Price Section */}
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                                  <DollarSign className="h-5 w-5" />
                                  ৳{displayPriceText}
                                </div>
                                <div className="text-sm text-gray-500">মূল্য</div>
                              </div>
                            </div>
                            
                            {/* Detailed Item Information Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-600 mb-1">অর্ডার ID</div>
                                <div className="font-mono text-xs bg-white px-2 py-1 rounded border">
                                  {order.id.slice(0, 8)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-600 mb-1">সময়কাল</div>
                                <div className="font-semibold text-purple-600">
                                  {displayDuration}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-600 mb-1">পরিমাণ</div>
                                <div className="font-semibold text-green-600">
                                  {displayQuantity} টি
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-600 mb-1">মোট মূল্য</div>
                                <div className="font-bold text-green-700 text-lg">
                                  ৳{displayPriceText}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Order Financial Summary */}
                        <div className="mt-6 p-5 bg-white rounded-lg border-2 border-dashed border-gray-300">
                          <h5 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            অর্ডার সামারি
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">মোট আইটেম</div>
                              <div className="text-xl font-bold text-blue-600">
                                {displayQuantity}
                              </div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">সাবটোটাল</div>
                              <div className="text-xl font-semibold">
                                ৳{(order.total_amount + (order.discount_amount || 0)).toLocaleString('bn-BD')}
                              </div>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">ছাড়</div>
                                <div className="text-xl font-semibold text-red-600">
                                  -৳{order.discount_amount.toLocaleString('bn-BD')}
                                </div>
                              </div>
                            )}
                            <div className="text-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                              <div className="text-sm text-gray-600 mb-1">সর্বমোট</div>
                              <div className="text-2xl font-bold text-green-700">
                                ৳{order.total_amount.toLocaleString('bn-BD')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer & Payment Information */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                          <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                            <User className="h-5 w-5 text-blue-600" />
                            গ্রাহকের তথ্য
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="text-sm font-medium text-gray-600">নাম:</span>
                                <span className="ml-2 font-semibold">{order.customer_name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="text-sm font-medium text-gray-600">ইমেইল:</span>
                                <span className="ml-2 font-semibold">{order.customer_email}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="text-sm font-medium text-gray-600">ফোন:</span>
                                <span className="ml-2 font-semibold">{order.customer_phone}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <div>
                                <span className="text-sm font-medium text-gray-600">ঠিকানা:</span>
                                <span className="ml-2 font-semibold">{order.customer_address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Payment Information */}
                        <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                          <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            পেমেন্ট তথ্য
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <CreditCard className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="text-sm font-medium text-gray-600">পেমেন্ট মাধ্যম:</span>
                                <span className="ml-2 font-semibold">{getPaymentMethodLabel(order.payment_method)}</span>
                              </div>
                            </div>
                            {order.transaction_id && (
                              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <div>
                                  <span className="text-sm font-medium text-gray-600">ট্রানজেকশন ID:</span>
                                  <span className="ml-2 font-mono text-sm bg-white px-2 py-1 rounded border">
                                    {order.transaction_id}
                                  </span>
                                </div>
                              </div>
                            )}
                            {order.promo_code && (
                              <div className="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-200">
                                <Tag className="h-4 w-4 text-green-600" />
                                <div>
                                  <span className="text-sm font-medium text-gray-600">প্রোমো কোড:</span>
                                  <span className="ml-2 font-semibold text-green-700">{order.promo_code}</span>
                                </div>
                              </div>
                            )}
                            {order.discount_amount > 0 && (
                              <div className="flex items-center gap-3 p-2 bg-red-50 rounded border border-red-200">
                                <DollarSign className="h-4 w-4 text-red-600" />
                                <div>
                                  <span className="text-sm font-medium text-gray-600">মোট ছাড়:</span>
                                  <span className="ml-2 font-bold text-red-600">
                                    ৳{order.discount_amount.toLocaleString('bn-BD')}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded border-2 border-green-200">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <div>
                                <span className="text-sm font-medium text-gray-600">পেমেন্ট পরিমাণ:</span>
                                <span className="ml-2 text-xl font-bold text-green-700">
                                  ৳{order.total_amount.toLocaleString('bn-BD')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
