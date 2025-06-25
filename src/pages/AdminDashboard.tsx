
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Package, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Order, OrderItem } from '@/types';

interface ExtendedOrder extends Order {
  order_items: OrderItem[];
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllOrders();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setIsAdmin(true);
      } else {
        toast({
          title: "অ্যাক্সেস নিষিদ্ধ",
          description: "আপনার অ্যাডমিন অ্যাক্সেস নেই।",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Admin check error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const currentOrder = orders.find(order => order.id === orderId);
      const oldStatus = currentOrder?.status;

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          admin_message: adminMessage || null
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Create status history entry
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: user?.id,
          admin_message: adminMessage || null
        });

      if (historyError) throw historyError;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, admin_message: adminMessage || null }
          : order
      ));

      setAdminMessage('');
      setSelectedOrderId(null);

      toast({
        title: "সফল",
        description: `অর্ডার স্ট্যাটাস ${newStatus} এ আপডেট করা হয়েছে।`,
      });

    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার আপডেট করতে সমস্যা হয়েছে।",
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

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      confirmed: orders.filter(order => order.status === 'confirmed').length,
      processing: orders.filter(order => order.status === 'processing').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0)
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const stats = getOrderStats();

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
        <h1 className="text-3xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অপেক্ষমান</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">নিশ্চিত</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>সকল অর্ডার</CardTitle>
          <CardDescription>
            সিস্টেমের সকল অর্ডার পরিচালনা করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>অর্ডার ID</TableHead>
                <TableHead>গ্রাহক</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>৳{order.total_amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(order.status || 'pending')}</TableCell>
                  <TableCell>
                    {new Date(order.created_at!).toLocaleDateString('bn-BD')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {selectedOrderId === order.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="অ্যাডমিন মেসেজ (ঐচ্ছিক)"
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                            className="w-48"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              নিশ্চিত
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              প্রক্রিয়াধীন
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              ডেলিভার
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            >
                              বাতিল
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrderId(null);
                                setAdminMessage('');
                              }}
                            >
                              বন্ধ
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          আপডেট করুন
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
