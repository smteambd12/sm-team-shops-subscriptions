
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Eye,
  Upload,
  Link2,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  product_id: string;
}

interface UserSubscription {
  id: string;
  product_name: string;
  package_duration: string;
  price: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  auto_renew: boolean;
  subscription_file_url?: string;
  subscription_link?: string;
  file_name?: string;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [orderSubscriptions, setOrderSubscriptions] = useState<UserSubscription[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    file: null as File | null,
    link: '',
    fileName: ''
  });
  const [uploading, setUploading] = useState(false);
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

  const fetchOrderSubscriptions = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching order subscriptions:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন তথ্য লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
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

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedOrder?.id}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('order-attachments')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('order-attachments')
      .getPublicUrl(fileName);

    return { url: publicUrl, fileName: file.name };
  };

  const handleSubscriptionUpdate = async () => {
    if (!selectedOrder) return;

    try {
      setUploading(true);
      let fileUrl = '';
      let fileName = '';

      // Upload file if provided
      if (subscriptionDetails.file) {
        const uploadResult = await handleFileUpload(subscriptionDetails.file);
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
      }

      // Update subscription details
      const { error } = await supabase.rpc('update_subscription_details', {
        p_order_id: selectedOrder.id,
        p_file_url: fileUrl || null,
        p_link: subscriptionDetails.link || null,
        p_file_name: fileName || subscriptionDetails.fileName || null
      });

      if (error) throw error;

      toast({
        title: "সফল",
        description: "সাবস্ক্রিপশন আপডেট হয়েছে।",
      });

      setShowSubscriptionDialog(false);
      setSubscriptionDetails({ file: null, link: '', fileName: '' });
      setSelectedOrder(null);
      // Refresh subscriptions for this order
      fetchOrderSubscriptions(selectedOrder.id);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  const openSubscriptionDialog = (order: Order) => {
    setSelectedOrder(order);
    setSubscriptionDetails({ file: null, link: '', fileName: '' });
    fetchOrderSubscriptions(order.id);
    setShowSubscriptionDialog(true);
  };

  const openOrderDetailsDialog = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderSubscriptions(order.id);
    setShowOrderDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-72"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">অর্ডার পরিচালনা</h2>
          <p className="text-gray-600">সব অর্ডার দেখুন এবং স্ট্যাটাস আপডেট করুন।</p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          রিফ্রেশ
        </Button>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
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
              
              {/* Product Details Summary */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  প্রোডাক্ট সমূহ
                </h4>
                <div className="space-y-1 text-sm">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product_name} ({item.package_duration})</span>
                      <span>৳{item.price.toLocaleString()} × {item.quantity}</span>
                    </div>
                  ))}
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
                  <h4 className="font-semibold mb-2">অর্ডার বিবরণ</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>সাবটোটাল:</strong> ৳{(order.total_amount + (order.discount_amount || 0)).toLocaleString()}</p>
                    {order.discount_amount > 0 && (
                      <p className="text-green-600"><strong>ছাড়:</strong> -৳{order.discount_amount.toLocaleString()}</p>
                    )}
                    <p><strong>মোট:</strong> ৳{order.total_amount.toLocaleString()}</p>
                    {order.promo_code && (
                      <p><strong>প্রোমো কোড:</strong> {order.promo_code}</p>
                    )}
                  </div>
                </div>
              </div>

              {order.admin_message && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm">
                    <strong>অ্যাডমিন মেসেজ:</strong> {order.admin_message}
                  </p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => openOrderDetailsDialog(order)}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Eye size={14} />
                  বিস্তারিত দেখুন
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => openStatusDialog(order)}
                  className="flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  স্ট্যাটাস আপডেট
                </Button>
                
                {order.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openSubscriptionDialog(order)}
                    className="flex items-center gap-1"
                  >
                    <Upload size={14} />
                    সাবস্ক্রিপশন পরিচালনা
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetailsDialog} onOpenChange={setShowOrderDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>অর্ডার বিস্তারিত তথ্য</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      গ্রাহকের তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>নাম:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>ইমেইল:</strong> {selectedOrder.customer_email}</p>
                    <p><strong>ফোন:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>ঠিকানা:</strong> {selectedOrder.customer_address}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      অর্ডার তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>অর্ডার ID:</strong> #{selectedOrder.id.slice(0, 8)}</p>
                    <p><strong>স্ট্যাটাস:</strong> {getStatusBadge(selectedOrder.status)}</p>
                    <p><strong>তারিখ:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('bn-BD')}</p>
                    <p><strong>পেমেন্ট মেথড:</strong> {selectedOrder.payment_method}</p>
                    {selectedOrder.transaction_id && (
                      <p><strong>ট্রানজেকশন ID:</strong> {selectedOrder.transaction_id}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">প্রোডাক্ট বিবরণ</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>প্রোডাক্ট</TableHead>
                        <TableHead>প্যাকেজ সময়কাল</TableHead>
                        <TableHead>সংখ্যা</TableHead>
                        <TableHead>মূল্য</TableHead>
                        <TableHead>মোট</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell>{item.package_duration}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>৳{item.price.toLocaleString()}</TableCell>
                          <TableCell>৳{(item.price * item.quantity).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 text-right space-y-1">
                    <p><strong>সাবটোটাল:</strong> ৳{(selectedOrder.total_amount + (selectedOrder.discount_amount || 0)).toLocaleString()}</p>
                    {selectedOrder.discount_amount > 0 && (
                      <p className="text-green-600"><strong>ছাড়:</strong> -৳{selectedOrder.discount_amount.toLocaleString()}</p>
                    )}
                    <p className="text-lg"><strong>মোট:</strong> ৳{selectedOrder.total_amount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Subscriptions (if order is confirmed) */}
              {selectedOrder.status === 'confirmed' && orderSubscriptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      সাবস্ক্রিপশন তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderSubscriptions.map((subscription) => (
                        <div key={subscription.id} className="p-4 border rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold">{subscription.product_name}</h4>
                              <p className="text-sm text-gray-600">প্যাকেজ: {subscription.package_duration}</p>
                              <p className="text-sm text-gray-600">মূল্য: ৳{subscription.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm"><strong>শুরু:</strong> {new Date(subscription.starts_at).toLocaleDateString('bn-BD')}</p>
                              <p className="text-sm"><strong>শেষ:</strong> {new Date(subscription.expires_at).toLocaleDateString('bn-BD')}</p>
                              <p className="text-sm"><strong>স্ট্যাটাস:</strong> {subscription.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</p>
                              <p className="text-sm"><strong>অটো রিনিউ:</strong> {subscription.auto_renew ? 'হ্যাঁ' : 'না'}</p>
                            </div>
                          </div>
                          
                          {(subscription.subscription_file_url || subscription.subscription_link) && (
                            <div className="mt-3 p-2 bg-green-50 rounded border-l-4 border-green-500">
                              <p className="text-sm font-medium text-green-800">অ্যাক্সেস তথ্য:</p>
                              {subscription.subscription_file_url && (
                                <p className="text-sm text-green-700">ফাইল: {subscription.file_name || 'ডাউনলোড উপলব্ধ'}</p>
                              )}
                              {subscription.subscription_link && (
                                <p className="text-sm text-green-700">লিংক: উপলব্ধ</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>অর্ডার স্ট্যাটাস আপডেট</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm"><strong>অর্ডার:</strong> #{selectedOrder.id.slice(0, 8)}</p>
                <p className="text-sm"><strong>গ্রাহক:</strong> {selectedOrder.customer_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <strong className="text-sm">বর্তমান স্ট্যাটাস:</strong>
                  {getStatusBadge(selectedOrder.status)}
                </div>
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

      {/* Subscription Management Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>সাবস্ক্রিপশন পরিচালনা</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm"><strong>অর্ডার:</strong> #{selectedOrder.id.slice(0, 8)}</p>
                <p className="text-sm"><strong>গ্রাহক:</strong> {selectedOrder.customer_name}</p>
              </div>

              {/* Current Subscriptions */}
              {orderSubscriptions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">বর্তমান সাবস্ক্রিপশন সমূহ:</h3>
                  <div className="space-y-3">
                    {orderSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{subscription.product_name}</h4>
                            <p className="text-sm text-gray-600">{subscription.package_duration} • ৳{subscription.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(subscription.starts_at).toLocaleDateString('bn-BD')} - {new Date(subscription.expires_at).toLocaleDateString('bn-BD')}
                            </p>
                          </div>
                          <Badge variant={subscription.is_active ? "default" : "secondary"}>
                            {subscription.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </Badge>
                        </div>
                        
                        {(subscription.subscription_file_url || subscription.subscription_link) && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            <p className="font-medium text-green-800">অ্যাক্সেস তথ্য:</p>
                            {subscription.subscription_file_url && (
                              <p className="text-green-700">📄 {subscription.file_name || 'ডাউনলোড ফাইল'}</p>
                            )}
                            {subscription.subscription_link && (
                              <p className="text-green-700">🔗 সাবস্ক্রিপশন লিংক</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add/Update Subscription Files */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">সাবস্ক্রিপশন ফাইল/লিংক আপডেট করুন:</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">ফাইল আপলোড</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setSubscriptionDetails({
                        ...subscriptionDetails,
                        file: e.target.files?.[0] || null
                      })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      পিডিএফ, টেক্সট বা ইমেজ ফাইল আপলোড করুন
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="link">সাবস্ক্রিপশন লিংক</Label>
                    <Input
                      id="link"
                      type="url"
                      value={subscriptionDetails.link}
                      onChange={(e) => setSubscriptionDetails({
                        ...subscriptionDetails,
                        link: e.target.value
                      })}
                      placeholder="https://example.com/subscription"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fileName">ফাইলের নাম (ঐচ্ছিক)</Label>
                    <Input
                      id="fileName"
                      value={subscriptionDetails.fileName}
                      onChange={(e) => setSubscriptionDetails({
                        ...subscriptionDetails,
                        fileName: e.target.value
                      })}
                      placeholder="কাস্টম ফাইলের নাম"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
                  বাতিল
                </Button>
                <Button 
                  onClick={handleSubscriptionUpdate} 
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      আপলোড হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      আপডেট করুন
                    </>
                  )}
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
