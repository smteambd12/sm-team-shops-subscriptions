
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  CheckCircle, 
  RefreshCw, 
  ArrowRight, 
  Calendar,
  DollarSign,
  Tag,
  Layers,
  Settings,
  FileText,
  Plus,
  Info,
  Star,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import OrderItemsDetails from './OrderItemsDetails';

interface OrderManagementDialogProps {
  order: any;
  subscriptions: any;
  products: any;
  onOrderUpdate: (orderId: string) => void;
}

const OrderManagementDialog: React.FC<OrderManagementDialogProps> = ({
  order,
  subscriptions,
  products,
  onOrderUpdate
}) => {
  const [statusUpdate, setStatusUpdate] = useState(order.status);
  const [adminMessage, setAdminMessage] = useState(order.admin_message || '');
  const [fileUrl, setFileUrl] = useState('');
  const [subscriptionLink, setSubscriptionLink] = useState('');
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('bn-BD')}`;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'অপেক্ষমান',
      confirmed: 'নিশ্চিত',
      processing: 'প্রক্রিয়াধীন',
      shipped: 'পাঠানো হয়েছে',
      delivered: 'ডেলিভার হয়েছে',
      cancelled: 'বাতিল'
    };
    return labels[status as keyof typeof labels] || status;
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

  const getCategoryLabel = (category: string) => {
    const categories = {
      'web': 'ওয়েব অ্যাপ্লিকেশন',
      'mobile': 'মোবাইল অ্যাপ',
      'tutorial': 'টিউটোরিয়াল'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, message?: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          admin_message: message || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      if (newStatus === 'confirmed') {
        await createSubscriptions(orderId);
      }

      toast({
        title: "সফল",
        description: `অর্ডার স্ট্যাটাস ${getStatusLabel(newStatus)} এ আপডেট হয়েছে।`,
      });

      onOrderUpdate(orderId);
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const createSubscriptions = async (orderId: string) => {
    try {
      const { error } = await supabase.rpc('create_subscription_from_order', {
        order_uuid: orderId
      });

      if (error) throw error;

      toast({
        title: "সফল",
        description: "ইউজার সাবস্ক্রিপশন তৈরি হয়েছে।",
      });
    } catch (error: any) {
      console.error('Error creating subscriptions:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন তৈরি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const updateSubscriptionDetails = async (orderId: string) => {
    try {
      const { error } = await supabase.rpc('update_subscription_details', {
        p_order_id: orderId,
        p_file_url: fileUrl || null,
        p_link: subscriptionLink || null,
        p_file_name: fileName || null
      });

      if (error) throw error;

      toast({
        title: "সফল",
        description: "সাবস্ক্রিপশন তথ্য আপডেট হয়েছে।",
      });

      onOrderUpdate(orderId);
      setFileUrl('');
      setSubscriptionLink('');
      setFileName('');
    } catch (error: any) {
      console.error('Error updating subscription details:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const navigateToUserSubscriptions = (userId: string) => {
    window.open(`/dashboard?userId=${userId}&tab=subscriptions`, '_blank');
  };

  return (
    <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Package className="h-6 w-6 text-blue-600" />
          অর্ডার বিস্তারিত পরিচালনা #{order.id.slice(0, 8)}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-8">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <Button
            onClick={() => updateOrderStatus(order.id, 'confirmed', adminMessage)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={order.status === 'confirmed'}
          >
            <CheckCircle className="h-4 w-4" />
            {order.status === 'confirmed' ? 'ইতিমধ্যে কনফার্ম' : 'অর্ডার কনফার্ম করুন'}
          </Button>
          
          <Button
            onClick={() => navigateToUserSubscriptions(order.user_id)}
            variant="outline"
            className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <ArrowRight className="h-4 w-4" />
            ইউজার সাবস্ক্রিপশন দেখুন
          </Button>

          <Button
            onClick={() => updateOrderStatus(order.id, 'processing', adminMessage)}
            variant="outline"
            className="flex items-center gap-2"
            disabled={order.status === 'processing' || order.status === 'delivered'}
          >
            <RefreshCw className="h-4 w-4" />
            প্রক্রিয়াধীন করুন
          </Button>
        </div>

        {/* Order Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-sm text-blue-600 font-medium">অর্ডার তারিখ</div>
              <div className="text-lg font-bold text-blue-800">
                {new Date(order.created_at).toLocaleDateString('bn-BD')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-sm text-green-600 font-medium">মোট আইটেম</div>
              <div className="text-lg font-bold text-green-800">
                {order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-sm text-purple-600 font-medium">মোট পরিমাণ</div>
              <div className="text-lg font-bold text-purple-800">
                {formatCurrency(order.total_amount)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <Tag className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-sm text-orange-600 font-medium">স্ট্যাটাস</div>
              <div className="text-lg font-bold text-orange-800">
                {getStatusLabel(order.status)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer & Payment Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="h-5 w-5" />
                গ্রাহকের বিস্তারিত তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-600">নাম:</span>
                    <p className="font-semibold text-gray-800">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-600">ইমেইল:</span>
                    <p className="font-semibold text-gray-800">{order.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-600">ফোন:</span>
                    <p className="font-semibold text-gray-800">{order.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <span className="text-sm text-gray-600">ঠিকানা:</span>
                    <p className="font-semibold text-gray-800">{order.customer_address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CreditCard className="h-5 w-5" />
                পেমেন্ট বিস্তারিত তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">পেমেন্ট মাধ্যম:</span>
                  <Badge variant="outline" className="font-semibold">
                    {getPaymentMethodLabel(order.payment_method)}
                  </Badge>
                </div>
                {order.transaction_id && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">ট্রানজেকশন ID:</span>
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                      {order.transaction_id}
                    </span>
                  </div>
                )}
                {order.promo_code && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">প্রোমো কোড:</span>
                    <Badge variant="outline" className="text-purple-700 border-purple-300">
                      <Tag className="h-3 w-3 mr-1" />
                      {order.promo_code}
                    </Badge>
                  </div>
                )}
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                    <span className="text-green-700 font-medium">ছাড়:</span>
                    <span className="text-green-700 font-bold">
                      {formatCurrency(order.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg border-2 border-green-300">
                  <span className="text-green-800 font-bold text-lg">সর্বমোট:</span>
                  <span className="text-green-800 font-bold text-xl">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items Details */}
        <OrderItemsDetails
          items={order.order_items}
          getDurationLabel={getDurationLabel}
          getCategoryLabel={getCategoryLabel}
          formatCurrency={formatCurrency}
        />

        {/* Order Management Section */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Settings className="h-5 w-5" />
              অর্ডার স্ট্যাটাস ও ম্যানেজমেন্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="status" className="text-base font-semibold">অর্ডার স্ট্যাটাস</Label>
                <Select 
                  value={statusUpdate || order.status} 
                  onValueChange={setStatusUpdate}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">অপেক্ষমান</SelectItem>
                    <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                    <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                    <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                    <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                    <SelectItem value="cancelled">বাতিল</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message" className="text-base font-semibold">অ্যাডমিন বার্তা</Label>
                <Textarea
                  id="message"
                  placeholder="গ্রাহকের জন্য বার্তা লিখুন..."
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management Section */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <FileText className="h-5 w-5" />
              সাবস্ক্রিপশন ফাইল ও লিংক ম্যানেজমেন্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fileUrl" className="font-semibold">ফাইল URL</Label>
                <Input
                  id="fileUrl"
                  placeholder="https://example.com/file.zip"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="subscriptionLink" className="font-semibold">সাবস্ক্রিপশন লিংক</Label>
                <Input
                  id="subscriptionLink"
                  placeholder="https://app.example.com/login"
                  value={subscriptionLink}
                  onChange={(e) => setSubscriptionLink(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="fileName" className="font-semibold">ফাইলের নাম</Label>
                <Input
                  id="fileName"
                  placeholder="app-files.zip"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-200">
          <Button
            onClick={() => updateOrderStatus(order.id, statusUpdate || order.status, adminMessage)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3"
            size="lg"
          >
            <CheckCircle className="h-5 w-5" />
            স্ট্যাটাস আপডেট করুন
          </Button>
          
          <Button
            onClick={() => updateSubscriptionDetails(order.id)}
            variant="outline"
            className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-3"
            size="lg"
          >
            <FileText className="h-5 w-5" />
            সাবস্ক্রিপশন আপডেট করুন
          </Button>

          <Button
            onClick={() => createSubscriptions(order.id)}
            variant="outline"
            className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 px-6 py-3"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            সাবস্ক্রিপশন তৈরি করুন
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default OrderManagementDialog;
