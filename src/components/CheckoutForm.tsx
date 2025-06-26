
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { Copy, CreditCard, Package, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutFormProps {
  total?: number;
  appliedPromo?: { code: string; discount: number } | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ total: propTotal, appliedPromo }) => {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: user?.email || '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'bkash' as 'bkash' | 'nagad' | 'rocket',
    transactionId: '',
    promoCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Use prop total if provided, otherwise calculate from cart
  const getTotalPrice = () => propTotal || getCartTotal();

  // Load user profile data
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setFormData(prev => ({
          ...prev,
          customerName: data.full_name || '',
          customerPhone: data.phone || '',
          customerAddress: data.address || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handlePromoCode = async () => {
    if (!formData.promoCode) return;

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', formData.promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "অবৈধ প্রোমো কোড",
          description: "এই প্রোমো কোডটি বৈধ নয় বা মেয়াদ শেষ।",
          variant: "destructive",
        });
        return;
      }

      const totalAmount = getTotalPrice();
      
      // Check minimum order amount
      if (data.min_order_amount && totalAmount < data.min_order_amount) {
        toast({
          title: "ন্যূনতম অর্ডার পূরণ হয়নি",
          description: `এই প্রোমো কোডের জন্য ন্যূনতম ৳${data.min_order_amount} অর্ডার করতে হবে।`,
          variant: "destructive",
        });
        return;
      }

      // Check usage limit
      if (data.max_uses && data.used_count >= data.max_uses) {
        toast({
          title: "প্রোমো কোড শেষ",
          description: "এই প্রোমো কোডের ব্যবহার সীমা শেষ।",
          variant: "destructive",
        });
        return;
      }

      // Calculate discount
      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = (totalAmount * data.discount_value) / 100;
      } else {
        discount = data.discount_value;
      }

      setDiscountAmount(discount);
      toast({
        title: "প্রোমো কোড প্রয়োগ হয়েছে",
        description: `৳${discount} ছাড় পাবেন।`,
      });
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রোমো কোড চেক করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "অর্ডার করতে লগইন করুন।",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast({
        title: "খালি কার্ট",
        description: "কার্টে কোন পণ্য নেই।",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const totalAmount = getTotalPrice() - discountAmount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            customer_name: formData.customerName,
            customer_email: formData.customerEmail,
            customer_phone: formData.customerPhone,
            customer_address: formData.customerAddress,
            total_amount: totalAmount,
            payment_method: formData.paymentMethod,
            transaction_id: formData.transactionId,
            promo_code: formData.promoCode || null,
            discount_amount: discountAmount,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items using the cart items structure
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: `Product ${item.productId}`, // We'll need to get actual product name
        package_id: item.packageId,
        package_duration: item.packageId, // Temporary - should map to actual duration
        price: 0, // We'll need to calculate actual price
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update promo code usage if used
      if (formData.promoCode && discountAmount > 0) {
        const { error: rpcError } = await supabase.rpc('increment_promo_usage', {
          promo_code: formData.promoCode.toUpperCase()
        });
        
        if (rpcError) {
          console.error('Error updating promo code usage:', rpcError);
        }
      }

      toast({
        title: "অর্ডার সফল",
        description: "আপনার অর্ডার সফলভাবে প্রেরণ করা হয়েছে।",
      });

      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার তৈরি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "কপি হয়েছে",
      description: "নম্বর কপি হয়েছে।",
    });
  };

  const getPaymentNumber = () => {
    switch (formData.paymentMethod) {
      case 'bkash':
        return settings.bkash_number;
      case 'nagad':
        return settings.nagad_number;
      case 'rocket':
        return settings.rocket_number;
      default:
        return '';
    }
  };

  const finalAmount = getTotalPrice() - discountAmount;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              অর্ডার সারাংশ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.packageId}`} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h4 className="font-medium">Product {item.productId}</h4>
                  <p className="text-sm text-gray-600">Package {item.packageId}</p>
                </div>
                <span className="font-medium">৳{(finalAmount / items.length) * item.quantity}</span>
              </div>
            ))}
            
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>সাবটোটাল:</span>
                <span>৳{getTotalPrice()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>ছাড়:</span>
                  <span>-৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>মোট:</span>
                <span>৳{finalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle>চেকআউট</CardTitle>
            <CardDescription>
              আপনার তথ্য দিয়ে অর্ডার সম্পন্ন করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">পূর্ণ নাম *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerEmail">ইমেইল *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">ফোন নম্বর *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerAddress">ঠিকানা *</Label>
                  <Textarea
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2">
                <Input
                  placeholder="প্রোমো কোড"
                  value={formData.promoCode}
                  onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                />
                <Button type="button" variant="outline" onClick={handlePromoCode}>
                  প্রয়োগ করুন
                </Button>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <Label>পেমেন্ট মেথড *</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value: string) => {
                    // Validate the value before setting
                    if (value === 'bkash' || value === 'nagad' || value === 'rocket') {
                      setFormData({ ...formData, paymentMethod: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                  </SelectContent>
                </Select>

                {getPaymentNumber() && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {formData.paymentMethod.toUpperCase()} নম্বর:
                          </p>
                          <p className="text-lg font-mono">{getPaymentNumber()}</p>
                          <p className="text-sm text-gray-600">
                            এই নম্বরে ৳{finalAmount} টাকা পাঠান
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(getPaymentNumber())}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label htmlFor="transactionId">ট্রানজেকশন আইডি *</Label>
                  <Input
                    id="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="পেমেন্টের ট্রানজেকশন আইডি দিন"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'প্রক্রিয়াকরণ...' : `৳${finalAmount} - অর্ডার সম্পন্ন করুন`}
              </Button>
            </form>

            {/* Live Chat */}
            {settings.live_chat_number && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">সাহায্য প্রয়োজন?</span>
                </div>
                <p className="text-sm text-green-700">
                  WhatsApp-এ যোগাযোগ করুন: 
                  <a 
                    href={`https://wa.me/${settings.live_chat_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline ml-1"
                  >
                    {settings.live_chat_number}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutForm;
