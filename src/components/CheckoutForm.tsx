
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutFormProps {
  total: number;
  appliedPromo?: { code: string; discount: number } | null;
}

const CheckoutForm = ({ total, appliedPromo }: CheckoutFormProps) => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentNumbers, setPaymentNumbers] = useState({
    bkash_number: '01XXXXXXXXX',
    nagad_number: '01XXXXXXXXX',
    rocket_number: '01XXXXXXXXX'
  });

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    paymentMethod: 'bkash',
    transactionId: '',
    note: ''
  });

  useEffect(() => {
    fetchPaymentNumbers();
  }, []);

  const fetchPaymentNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['bkash_number', 'nagad_number', 'rocket_number']);

      if (error) throw error;

      const settings = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value || '01XXXXXXXXX';
        return acc;
      }, {} as any);

      setPaymentNumbers(settings);
    } catch (error) {
      console.error('Error fetching payment numbers:', error);
    }
  };

  const paymentMethods = [
    {
      id: 'bkash',
      name: 'bKash',
      icon: <Smartphone className="w-5 h-5" />,
      number: paymentNumbers.bkash_number,
      color: 'text-pink-600'
    },
    {
      id: 'nagad',
      name: 'Nagad',
      icon: <Wallet className="w-5 h-5" />,
      number: paymentNumbers.nagad_number,
      color: 'text-orange-600'
    },
    {
      id: 'rocket',
      name: 'Rocket',
      icon: <CreditCard className="w-5 h-5" />,
      number: paymentNumbers.rocket_number,
      color: 'text-purple-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // প্রথমে অর্ডার তৈরি করুন
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_address: formData.address,
          total_amount: total,
          payment_method: formData.paymentMethod,
          transaction_id: formData.transactionId,
          promo_code: appliedPromo?.code,
          discount_amount: appliedPromo?.discount || 0,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // অর্ডার আইটেম যোগ করুন
      const orderItems = items.map(item => {
        return {
          order_id: order.id,
          product_id: item.productId,
          product_name: item.productId,
          package_id: item.packageId,
          package_duration: item.packageId,
          price: 0,
          quantity: item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "অর্ডার সফল!",
        description: "আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।",
      });

      clearCart();
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(method => method.id === formData.paymentMethod);

  return (
    <Card>
      <CardHeader>
        <CardTitle>চেকআউট তথ্য</CardTitle>
        <CardDescription>
          আপনার অর্ডার সম্পূর্ণ করতে নিচের তথ্যগুলো পূরণ করুন
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ব্যক্তিগত তথ্য</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">পূর্ণ নাম *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="আপনার পূর্ণ নাম"
                />
              </div>
              <div>
                <Label htmlFor="phone">ফোন নম্বর *</Label>
                <Input
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">ইমেইল *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="address">ঠিকানা *</Label>
              <Textarea
                id="address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                rows={3}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">পেমেন্ট পদ্ধতি</h3>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            >
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                    <div className={method.color}>
                      {method.icon}
                    </div>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.number}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Payment Instructions */}
          {selectedPaymentMethod && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                {selectedPaymentMethod.name} পেমেন্ট নির্দেশনা:
              </h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>১. {selectedPaymentMethod.number} নম্বরে ৳{total} টাকা পাঠান</li>
                <li>২. ট্রানজেকশন আইডি নিচের বক্সে লিখুন</li>
                <li>৩. অর্ডার সাবমিট করুন</li>
              </ol>
            </div>
          )}

          {/* Transaction ID */}
          <div>
            <Label htmlFor="transactionId">ট্রানজেকশন আইডি *</Label>
            <Input
              id="transactionId"
              required
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              placeholder="পেমেন্টের ট্রানজেকশন আইডি লিখুন"
            />
          </div>

          {/* Additional Note */}
          <div>
            <Label htmlFor="note">অতিরিক্ত নোট (ঐচ্ছিক)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন"
              rows={3}
            />
          </div>

          {/* Order Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>মোট পরিশোধ:</span>
              <span className="text-green-600">৳{total}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
