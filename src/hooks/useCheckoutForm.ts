
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const useCheckoutForm = () => {
  const { items, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const { products } = useProducts();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [transactionId, setTransactionId] = useState('');

  const subtotal = getCartTotal();
  const finalTotal = subtotal; // No promo discounts in checkout

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

  const getPrimaryProductInfo = () => {
    if (items.length === 0) return null;

    const primaryItem = items[0];
    const product = products.find(p => p.id === primaryItem.productId);
    const pkg = product?.packages.find(p => p.id === primaryItem.packageId);

    if (!product || !pkg) return null;

    const getDurationInDays = (duration: string) => {
      switch (duration) {
        case '1month': return 30;
        case '3month': return 90;
        case '6month': return 180;
        case 'lifetime': return null;
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

      const primaryProductInfo = getPrimaryProductInfo();

      const orderData = {
        user_id: user.id,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        discount_amount: 0, // No discounts from checkout
        status: 'pending',
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

      toast({
        title: "অর্ডার সফল!",
        description: "আপনার অর্ডারটি গ্রহণ করা হয়েছে।",
      });

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

  return {
    loading,
    customerInfo,
    setCustomerInfo,
    paymentMethod,
    setPaymentMethod,
    transactionId,
    setTransactionId,
    subtotal,
    finalTotal,
    getPaymentNumber,
    getPaymentMethodName,
    handleSubmit,
    items,
    products
  };
};
