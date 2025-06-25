
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { paymentMethods } from '@/data/products';

interface CheckoutFormProps {
  total: number;
  appliedPromo: { code: string; discount: number } | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ total, appliedPromo }) => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>(paymentMethods[0].name);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPaymentMethod = paymentMethods.find(p => p.name === selectedPayment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('প্রথমে লগইন করুন!');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !transactionId) {
      toast.error('সকল তথ্য পূরণ করুন!');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          total_amount: total,
          payment_method: selectedPaymentMethod?.displayName || selectedPayment,
          transaction_id: transactionId,
          promo_code: appliedPromo?.code || null,
          discount_amount: appliedPromo?.discount || 0,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => {
        const product = JSON.parse(localStorage.getItem('products') || '[]').find((p: any) => p.id === item.productId);
        const pkg = product?.packages.find((p: any) => p.id === item.packageId);
        
        return {
          order_id: order.id,
          product_id: item.productId,
          product_name: product?.name || 'Unknown Product',
          package_id: item.packageId,
          package_duration: pkg?.duration || 'unknown',
          price: pkg?.price || 0,
          quantity: item.quantity
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success(`অর্ডার সফল হয়েছে! অর্ডার নম্বর: ${order.id.slice(0, 8)}`);
      clearCart();
      navigate('/orders');

    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error('অর্ডার তৈরিতে সমস্যা হয়েছে!');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('কপি হয়েছে!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>চেকআউট তথ্য</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">গ্রাহকের তথ্য</h3>
            
            <div>
              <Label htmlFor="name">নাম *</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">ইমেইল *</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="আপনার ইমেইল লিখুন"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">ফোন নম্বর *</Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="আপনার ফোন নম্বর লিখুন"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">ঠিকানা *</Label>
              <Input
                id="address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="font-semibold">পেমেন্ট মেথড</h3>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              <div className="grid grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.name} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value={method.name} id={method.name} />
                    <Label htmlFor={method.name} className="flex flex-col items-center cursor-pointer">
                      <span className="text-2xl mb-1">{method.icon}</span>
                      <span className="text-sm">{method.displayName}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Payment Details */}
          {selectedPaymentMethod && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">{selectedPaymentMethod.displayName} এ পেমেন্ট করুন:</h4>
              <div className="flex items-center justify-between">
                <span>নম্বর: {selectedPaymentMethod.number}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedPaymentMethod.number)}
                >
                  কপি করুন
                </Button>
              </div>
              <div className="text-lg font-bold text-purple-600">
                পরিমাণ: ৳{total.toLocaleString()}
              </div>
            </div>
          )}

          {/* Transaction ID */}
          <div>
            <Label htmlFor="transactionId">ট্রানজেক্শন আইডি *</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="পেমেন্ট করার পর ট্রানজেক্শন আইডি লিখুন"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'অর্ডার তৈরি হচ্ছে...' : 'অর্ডার সম্পন্ন করুন'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
