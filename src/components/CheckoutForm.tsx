
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import PromoCodeInput from './PromoCodeInput';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Phone, 
  Wallet,
  ShoppingCart,
  User,
  MapPin,
  Mail
} from 'lucide-react';

const CheckoutForm = () => {
  const { items, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const { products } = useProducts();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');

  const subtotal = getCartTotal();
  const finalTotal = Math.max(0, subtotal - promoDiscount);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCustomerInfo({
          name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } else {
        setCustomerInfo(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handlePromoApplied = (code: string, discountAmount: number) => {
    console.log('Promo applied in checkout:', { code, discountAmount });
    setAppliedPromoCode(code);
    setPromoDiscount(discountAmount);
  };

  const handlePromoRemoved = () => {
    console.log('Promo removed in checkout');
    setAppliedPromoCode('');
    setPromoDiscount(0);
  };

  // Calculate primary product information for the order
  const getPrimaryProductInfo = () => {
    if (items.length === 0) return null;

    // Get the first item as primary product
    const primaryItem = items[0];
    const product = products.find(p => p.id === primaryItem.productId);
    const pkg = product?.packages.find(p => p.id === primaryItem.packageId);

    if (!product || !pkg) return null;

    // Convert duration to days
    const getDurationInDays = (duration: string) => {
      switch (duration) {
        case '1month': return 30;
        case '3month': return 90;
        case '6month': return 180;
        case 'lifetime': return null; // null for lifetime
        default: return null;
      }
    };

    return {
      product_name: product.name,
      product_price: pkg.price,
      product_quantity: primaryItem.quantity,
      duration_days: getDurationInDays(pkg.duration)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "অর্ডার করতে প্রথমে লগইন করুন।",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "কার্ট খালি",
        description: "অর্ডার করতে কার্টে পণ্য যোগ করুন।",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "সব তথ্য পূরণ করুন।",
        variant: "destructive",
      });
      return;
    }

    if (!transactionId.trim()) {
      toast({
        title: "ট্রানজেকশন ID প্রয়োজন",
        description: "পেমেন্টের ট্রানজেকশন ID দিন।",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get primary product information
      const primaryProductInfo = getPrimaryProductInfo();

      // Create order with primary product information
      const orderData = {
        user_id: user.id,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        promo_code: appliedPromoCode || null,
        discount_amount: promoDiscount,
        status: 'pending',
        // Add primary product information
        ...(primaryProductInfo && {
          product_name: primaryProductInfo.product_name,
          product_price: primaryProductInfo.product_price,
          product_quantity: primaryProductInfo.product_quantity,
          duration_days: primaryProductInfo.duration_days
        })
      };

      console.log('Creating order with data:', orderData);

      const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with product details
      const orderItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        const pkg = product?.packages.find(p => p.id === item.packageId);
        
        return {
          order_id: createdOrder.id,
          product_id: item.productId,
          product_name: product?.name || 'Unknown Product',
          product_image: product?.image || '',
          package_id: item.packageId,
          package_duration: pkg?.duration || 'unknown',
          price: pkg?.price || 0,
          original_price: pkg?.originalPrice || pkg?.price || 0,
          discount_percentage: pkg?.discount || 0,
          quantity: item.quantity
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Increment promo code usage if applied
      if (appliedPromoCode) {
        await supabase.rpc('increment_promo_usage', {
          promo_code: appliedPromoCode
        });
      }

      toast({
        title: "অর্ডার সফল!",
        description: "আপনার অর্ডারটি গ্রহণ করা হয়েছে।",
      });

      // Clear cart and redirect to order confirmation
      clearCart();
      navigate(`/order-confirmation/${createdOrder.id}`);

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "অর্ডার ত্রুটি",
        description: "অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentNumber = () => {
    switch (paymentMethod) {
      case 'bkash': return settings.bkash_number;
      case 'nagad': return settings.nagad_number;
      case 'rocket': return settings.rocket_number;
      default: return '';
    }
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'rocket': return 'Rocket';
      default: return '';
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">কার্ট খালি</h3>
            <p className="text-gray-600">কোন পণ্য নেই। প্রথমে পণ্য যোগ করুন।</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                অর্ডার সামারি
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                const pkg = product?.packages.find(p => p.id === item.packageId);
                
                if (!product || !pkg) {
                  return null;
                }

                const getDurationText = (duration: string) => {
                  switch (duration) {
                    case '1month': return '১ মাস';
                    case '3month': return '৩ মাস';
                    case '6month': return '৬ মাস';
                    case 'lifetime': return 'লাইফটাইম';
                    default: return duration;
                  }
                };

                return (
                  <div key={`${item.productId}-${item.packageId}`} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image || 'https://via.placeholder.com/60x60'}
                        alt={product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-medium text-sm sm:text-base">{product.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {getDurationText(pkg.duration)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm sm:text-base">৳{(pkg.price * item.quantity).toLocaleString()}</p>
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <p className="text-xs text-gray-500 line-through">৳{(pkg.originalPrice * item.quantity).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>প্রোমো ছাড়:</span>
                    <span>-৳{promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>মোট:</span>
                  <span>৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promo Code */}
          <PromoCodeInput
            orderAmount={subtotal}
            onPromoApplied={handlePromoApplied}
            onPromoRemoved={handlePromoRemoved}
            appliedPromo={appliedPromoCode ? {code: appliedPromoCode, discount: promoDiscount} : null}
          />
        </div>

        {/* Checkout Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  গ্রাহকের তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">পূর্ণ নাম *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    ইমেইল *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    ফোন নম্বর *
                  </Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    ঠিকানা *
                  </Label>
                  <Textarea
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  পেমেন্ট মাধ্যম
                </CardTitle>
                <CardDescription>
                  {getPaymentNumber() ? (
                    <span className="font-medium text-primary">
                      {getPaymentMethodName()} নম্বর: {getPaymentNumber()}
                    </span>
                  ) : (
                    'পেমেন্ট মাধ্যম নির্বাচন করুন'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bkash" id="bkash" />
                    <Label htmlFor="bkash" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-pink-600" />
                      bKash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nagad" id="nagad" />
                    <Label htmlFor="nagad" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-orange-600" />
                      Nagad
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rocket" id="rocket" />
                    <Label htmlFor="rocket" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      Rocket
                    </Label>
                  </div>
                </RadioGroup>

                <div>
                  <Label htmlFor="transactionId">ট্রানজেকশন ID *</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="পেমেন্টের ট্রানজেকশন ID"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    {getPaymentNumber()} নম্বরে ৳{finalTotal.toLocaleString()} টাকা পাঠানোর পর ট্রানজেকশন ID দিন।
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'অর্ডার করা হচ্ছে...' : `৳${finalTotal.toLocaleString()} - অর্ডার করুন`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
