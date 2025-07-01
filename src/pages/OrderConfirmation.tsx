
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowLeft, User, CreditCard, Package, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OrderDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_method: string;
  transaction_id: string;
  promo_code?: string;
  discount_amount: number;
  status: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    product_image: string;
    package_duration: string;
    price: number;
    quantity: number;
  }>;
}

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!user || !orderId) {
      navigate('/');
      return;
    }
    fetchOrderDetails();
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      setOrderDetails({
        ...orderData,
        order_items: itemsData || []
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getDurationText = (duration: string) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
      default: return duration;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'rocket': return 'Rocket';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">অর্ডার পাওয়া যায়নি</h1>
          <Button onClick={() => navigate('/')}>হোমে ফিরুন</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">অর্ডার সফল!</h1>
          <p className="text-gray-600">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।</p>
        </div>

        {/* Order Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                অর্ডার সারসংক্ষেপ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">অর্ডার ID:</span>
                  <span className="font-mono text-sm">{orderDetails.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">অর্ডারের তারিখ:</span>
                  <span>{new Date(orderDetails.created_at).toLocaleDateString('bn-BD')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">স্ট্যাটাস:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    {orderDetails.status === 'pending' ? 'প্রক্রিয়াধীন' : orderDetails.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">অর্ডারকৃত পণ্যসমূহ:</h4>
                <div className="space-y-3">
                  {orderDetails.order_items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.product_image || 'https://via.placeholder.com/50x50'}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.product_name}</h5>
                        <p className="text-xs text-gray-600">
                          {getDurationText(item.package_duration)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">৳{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span>৳{(orderDetails.total_amount + orderDetails.discount_amount).toLocaleString()}</span>
                </div>
                {orderDetails.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ছাড় {orderDetails.promo_code ? `(${orderDetails.promo_code})` : ''}:</span>
                    <span>-৳{orderDetails.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>মোট:</span>
                  <span>৳{orderDetails.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Payment Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  গ্রাহকের তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">নাম</p>
                  <p className="font-medium">{orderDetails.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ইমেইল</p>
                  <p className="font-medium">{orderDetails.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ফোন</p>
                  <p className="font-medium">{orderDetails.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ঠিকানা</p>
                  <p className="font-medium">{orderDetails.customer_address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  পেমেন্ট তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">পেমেন্ট মাধ্যম</p>
                  <p className="font-medium">{getPaymentMethodName(orderDetails.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ট্রানজেকশন ID</p>
                  <p className="font-medium font-mono">{orderDetails.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">পেমেন্ট পরিমাণ</p>
                  <p className="font-bold text-lg">৳{orderDetails.total_amount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button
            onClick={() => navigate('/profile')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Calendar className="mr-2 h-4 w-4" />
            আমার ড্যাশবোর্ড
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            হোমে ফিরুন
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>পরবর্তী পদক্ষেপ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• আমরা ২৪ ঘন্টার মধ্যে আপনার পেমেন্ট যাচাই করব</p>
              <p>• পেমেন্ট যাচাই হওয়ার পর আপনার সাবস্ক্রিপশন সক্রিয় হবে</p>
              <p>• আপনার প্রোফাইল ড্যাশবোর্ডে সাবস্ক্রিপশনের তথ্য দেখতে পাবেন</p>
              <p>• কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
