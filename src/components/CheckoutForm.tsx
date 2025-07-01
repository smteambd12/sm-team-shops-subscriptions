
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { usePromoCode } from '@/hooks/usePromoCode';
import PromoCodeInput from './PromoCodeInput';
import { 
  CreditCard, 
  Phone, 
  Wallet,
  ShoppingCart,
  User,
  MapPin,
  Mail,
  MessageSquare
} from 'lucide-react';

const CheckoutForm = () => {
  const { items, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const { appliedPromo, incrementPromoUsage } = usePromoCode();

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
    setAppliedPromoCode(code);
    setPromoDiscount(discountAmount);
  };

  const handlePromoRemoved = () => {
    setAppliedPromoCode('');
    setPromoDiscount(0);
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

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
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
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items - Note: This will need to be updated based on your cart item structure
      // Since the cart context uses productId/packageId, we'll need to fetch product details
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: 'Product Name', // You'll need to fetch this from products
        product_image: '', // You'll need to fetch this from products
        package_id: item.packageId,
        package_duration: 'duration', // You'll need to fetch this from packages
        price: 0, // You'll need to calculate this
        original_price: 0, // You'll need to fetch this
        discount_percentage: 0,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Increment promo code usage if applied
      if (appliedPromoCode) {
        await incrementPromoUsage(appliedPromoCode);
      }

      toast({
        title: "অর্ডার সফল!",
        description: "আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই আমরা যোগাযোগ করব।",
      });

      // Clear cart and form
      clearCart();
      setCustomerInfo({ name: '', email: '', phone: '', address: '' });
      setTransactionId('');
      setAppliedPromoCode('');
      setPromoDiscount(0);

    } catch (error) {
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
              {items.map((item) => (
                <div key={`${item.productId}-${item.packageId}`} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Product {item.productId}</h4>
                    <p className="text-sm text-gray-600">
                      Package {item.packageId} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">৳0</p>
                  </div>
                </div>
              ))}
              
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
