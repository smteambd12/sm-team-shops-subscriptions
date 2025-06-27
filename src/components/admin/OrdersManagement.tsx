import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  RefreshCw,
  MessageSquare,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  package_duration: string;
  price: number;
  quantity: number;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
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

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          admin_message: adminMessage || null
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Record status change in history
      await supabase
        .from('order_status_history')
        .insert([{
          order_id: selectedOrder.id,
          old_status: selectedOrder.status,
          new_status: newStatus,
          admin_message: adminMessage || null
        }]);

      // If status is confirmed, create user subscriptions
      if (newStatus === 'confirmed' && selectedOrder.status !== 'confirmed') {
        try {
          const { error: subscriptionError } = await supabase.rpc('create_subscription_from_order', {
            order_uuid: selectedOrder.id
          });

          if (subscriptionError) {
            console.error('Error creating subscriptions:', subscriptionError);
            toast({
              title: "সতর্কতা",
              description: "অর্ডার নিশ্চিত হয়েছে কিন্তু সাবস্ক্রিপশন তৈরিতে সমস্যা হয়েছে।",
              variant: "destructive",
            });
          } else {
            toast({
              title: "সফল",
              description: "অর্ডার নিশ্চিত হয়েছে এবং সাবস্ক্রিপশন তৈরি হয়েছে।",
            });
          }
        } catch (error) {
          console.error('Error in subscription creation:', error);
        }
      } else {
        toast({
          title: "সফল",
          description: "অর্ডার স্ট্যাটাস আপডেট হয়েছে।",
        });
      }

      setShowStatusDialog(false);
      setSelectedOrder(null);
      setNewStatus('');
      setAdminMessage('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "ত্রুটি",
        description: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'অপেক্ষমান', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'নিশ্চিত', variant: 'default' as const, icon: CheckCircle },
      processing: { label: 'প্রক্রিয়াধীন', variant: 'default' as const, icon: RefreshCw },
      shipped: { label: 'পাঠানো হয়েছে', variant: 'default' as const, icon: Package },
      delivered: { label: 'ডেলিভার হয়েছে', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'বাতিল', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminMessage(order.admin_message || '');
    setShowStatusDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">অর্ডার পরিচালনা</h2>
        <p className="text-gray-600">সব অর্ডার দেখুন এবং স্ট্যাটাস আপডেট করুন।</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    অর্ডার #{order.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    {order.customer_name} • {order.customer_phone}
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-lg font-semibold">
                    ৳{order.total_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold mb-2">গ্রাহকের তথ্য</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>ইমেইল:</strong> {order.customer_email}</p>
                    <p><strong>ঠিকানা:</strong> {order.customer_address}</p>
                    <p><strong>পেমেন্ট:</strong> {order.payment_method}</p>
                    {order.transaction_id && (
                      <p><strong>ট্রানজেকশন ID:</strong> {order.transaction_id}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">অর্ডার সামারি</h4>
                  <div className="space-y-1 text-sm">
                    {order.order_items.map((item) => (
                      <p key={item.id}>
                        {item.product_name} ({item.package_duration}) × {item.quantity} = ৳{item.price.toLocaleString()}
                      </p>
                    ))}
                    {order.discount_amount > 0 && (
                      <p className="text-green-600">ছাড়: -৳{order.discount_amount.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {order.admin_message && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>অ্যাডমিন মেসেজ:</strong> {order.admin_message}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => openStatusDialog(order)}
                  className="flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  স্ট্যাটাস আপডেট
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>অর্ডার স্ট্যাটাস আপডেট</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p><strong>অর্ডার:</strong> #{selectedOrder.id.slice(0, 8)}</p>
                <p><strong>গ্রাহক:</strong> {selectedOrder.customer_name}</p>
                <p><strong>বর্তমান স্ট্যাটাস:</strong> {getStatusBadge(selectedOrder.status)}</p>
              </div>

              <div>
                <Label htmlFor="status">নতুন স্ট্যাটাস</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
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
                <Label htmlFor="message">অ্যাডমিন মেসেজ (ঐচ্ছিক)</Label>
                <Textarea
                  id="message"
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="গ্রাহককে কোন বার্তা দিতে চান?"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                  বাতিল
                </Button>
                <Button onClick={handleStatusUpdate}>
                  আপডেট করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
