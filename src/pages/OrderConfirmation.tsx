
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, CreditCard, User, MapPin, Clock, ArrowLeft, Coins, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoins } from '@/hooks/useCoins';

interface OrderDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_method: string;
  transaction_id: string;
  promo_code: string | null;
  discount_amount: number;
  status: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    product_image: string;
    package_duration: string;
    price: number;
    original_price: number;
    quantity: number;
  }>;
}

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { awardCoins } = useCoins();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [coinsAwarded, setCoinsAwarded] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, user]);

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

      setOrder({
        ...orderData,
        order_items: itemsData || []
      });

      // Award coins for order completion (only once)
      if (orderData && !coinsAwarded) {
        const coinsToAward = Math.floor(orderData.total_amount / 100); // 1 coin per 100 taka
        await awardCoins(coinsToAward, 'order_completion', `অর্ডার #${orderData.id} সম্পন্ন হওয়ায় কয়েন পুরস্কার`);
        setCoinsAwarded(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate('/orders');
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

  const calculateCoinsEarned = (amount: number) => {
    return Math.floor(amount / 100); // 1 coin per 100 taka
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">অর্ডার পাওয়া যায়নি</h1>
          <Button onClick={() => navigate('/orders')}>
            অর্ডার পেজে ফিরুন
          </Button>
        </div>
      </div>
    );
  }

  const coinsEarned = calculateCoinsEarned(order.total_amount);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            অর্ডার পেজে ফিরুন
          </Button>
        </div>

        {/* Success Message */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <h1 className="text-2xl font-bold text-green-800 mb-2">
                  অর্ডার সফল হয়েছে!
                </h1>
                <p className="text-green-700">
                  আপনার অর্ডার গ্রহণ করা হয়েছে। শীঘ্রই আমরা যোগাযোগ করব।
                </p>
                <p className="text-sm text-green-600 mt-2">
                  অর্ডার ID: {order.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coins Earned Section */}
        <Card className="mb-8 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Coins className="h-8 w-8 text-yellow-600" />
                <h2 className="text-xl font-bold text-yellow-800">
                  🎉 অভিনন্দন! আপনি কয়েন পেয়েছেন!
                </h2>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-yellow-300 mb-4">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  +{coinsEarned} কয়েন
                </div>
                <p className="text-yellow-700">
                  এই অর্ডারের জন্য আপনি {coinsEarned} কয়েন পেয়েছেন!
                </p>
              </div>
              
              <div className="space-y-3 text-sm text-yellow-800">
                <div className="flex items-center justify-center gap-2">
                  <Gift className="h-4 w-4" />
                  <span>কয়েন দিয়ে বিশেষ প্রোমো কোড কিনুন</span>
                </div>
                <p>প্রতি ১০০ টাকা অর্ডারে ১ কয়েন পান</p>
                <div className="pt-2">
                  <Link to="/coins">
                    <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                      কয়েন শপ দেখুন
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  অর্ডার করা পণ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={item.product_image || 'https://via.placeholder.com/60x60'}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">
                        {getDurationText(item.package_duration)} × {item.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-purple-600">
                          ৳{item.price.toLocaleString()}
                        </span>
                        {item.original_price > item.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ৳{item.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Price Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>সাবটোটাল:</span>
                    <span>৳{(order.total_amount + order.discount_amount).toLocaleString()}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>ছাড় ({order.promo_code}):</span>
                      <span>-৳{order.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>মোট:</span>
                    <span>৳{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  গ্রাহকের তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_email}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm">{order.customer_address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  পেমেন্ট তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>পেমেন্ট মাধ্যম:</span>
                  <span className="font-medium">{getPaymentMethodName(order.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ট্রানজেকশন ID:</span>
                  <span className="font-medium">{order.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>অর্ডারের সময়:</span>
                  <span className="font-medium">
                    {new Date(order.created_at).toLocaleString('bn-BD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>স্ট্যাটাস:</span>
                  <span className={`font-medium px-2 py-1 rounded text-sm ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status === 'pending' ? 'প্রসেসিং' :
                     order.status === 'confirmed' ? 'নিশ্চিত' :
                     order.status === 'delivered' ? 'ডেলিভার' : 'বাতিল'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  পরবর্তী ধাপ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">
                    ১. আপনার পেমেন্ট যাচাই চলছে, এটি সম্পন্ন হতে কিছু সময় লাগতে পারে।
                  </p>
                  <p className="text-sm">
                    ২. আমরা ১২ থেকে ২৪ ঘণ্টার মধ্যে আপনার অর্ডারটি যাচাই করে কনফার্ম করব। ধৈর্যের জন্য ধন্যবাদ।
                  </p>
                  <p className="text-sm">
                    ৩. যেকোনো সমস্যা হলে সরাসরি ড্যাশবোর্ড থেকে সাপোর্ট টিমের সঙ্গে যোগাযোগ করুন।
                  </p>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">কয়েন সিস্টেম সম্পর্কে জানুন</span>
                    </div>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• প্রতি অর্ডারে কয়েন পান (১০০ টাকায় ১ কয়েন)</li>
                      <li>• কয়েন দিয়ে বিশেষ প্রোমো কোড কিনুন</li>
                      <li>• নতুন অর্জন আনলক করুন</li>
                      <li>• বিভিন্ন কার্যক্রমে অংশ নিয়ে অতিরিক্ত কয়েন পান</li>
                    </ul>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Link to="/dashboard">
                      <Button className="w-full">
                        ড্যাশবোর্ড দেখুন
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
