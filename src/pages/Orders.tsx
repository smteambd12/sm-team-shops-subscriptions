import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import OrderCommunications from '@/components/OrderCommunications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  package_id: string;
  package_duration: string;
  price: number;
  quantity: number;
}

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

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(ordersData || []);
    } catch (error: any) {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          হোমে ফিরুন
        </Button>
        <h1 className="text-3xl font-bold">আমার অর্ডার</h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">কোন অর্ডার নেই</h3>
            <p className="text-gray-600 mb-4">আপনার এখনো কোন অর্ডার নেই।</p>
            <Button onClick={() => navigate('/')}>
              কেনাকাটা শুরু করুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      অর্ডার #{order.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      {new Date(order.created_at).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-lg font-semibold">
                        ৳{order.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          চ্যাট
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>অর্ডার কমিউনিকেশন</DialogTitle>
                        </DialogHeader>
                        <OrderCommunications 
                          orderId={order.id} 
                          orderNumber={order.id.slice(0, 8)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Admin Message */}
                {order.admin_message && (
                  <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      <strong>অ্যাডমিন মেসেজ:</strong> {order.admin_message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">গ্রাহকের তথ্য</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>নাম:</strong> {order.customer_name}</p>
                      <p><strong>ইমেইল:</strong> {order.customer_email}</p>
                      <p><strong>ফোন:</strong> {order.customer_phone}</p>
                      <p><strong>ঠিকানা:</strong> {order.customer_address}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">পেমেন্ট তথ্য</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>পেমেন্ট মাধ্যম:</strong> {order.payment_method}</p>
                      {order.transaction_id && (
                        <p><strong>ট্রানজেকশন ID:</strong> {order.transaction_id}</p>
                      )}
                      {order.promo_code && (
                        <p><strong>প্রোমো কোড:</strong> {order.promo_code}</p>
                      )}
                      {order.discount_amount > 0 && (
                        <p><strong>ছাড়:</strong> ৳{order.discount_amount.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">অর্ডার আইটেম</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>পণ্য</TableHead>
                        <TableHead>প্যাকেজ</TableHead>
                        <TableHead>সংখ্যা</TableHead>
                        <TableHead className="text-right">মূল্য</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell>{item.package_duration}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">৳{item.price.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
