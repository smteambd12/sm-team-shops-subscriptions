
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Package, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw, Settings, CreditCard, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Order, OrderItem } from '@/types';
import { paymentMethods } from '@/data/products';

interface ExtendedOrder extends Order {
  order_items: OrderItem[];
}

type OrderStatus = 'confirmed' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface PaymentMethod {
  name: string;
  displayName: string;
  number: string;
  icon: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentMethod[]>(paymentMethods);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
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
      loadPaymentSettings();
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

  const loadPaymentSettings = () => {
    const saved = localStorage.getItem('paymentSettings');
    if (saved) {
      setPaymentSettings(JSON.parse(saved));
    }
  };

  const savePaymentSettings = () => {
    localStorage.setItem('paymentSettings', JSON.stringify(paymentSettings));
    toast({
      title: "সফল",
      description: "পেমেন্ট সেটিংস সংরক্ষিত হয়েছে।",
    });
  };

  const updatePaymentMethod = (name: string, field: string, value: string) => {
    setPaymentSettings(prev => 
      prev.map(method => 
        method.name === name 
          ? { ...method, [field]: value }
          : method
      )
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const currentOrder = orders.find(order => order.id === orderId);
      const oldStatus = currentOrder?.status;

      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          admin_message: adminMessage || null
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          হোমে ফিরুন
        </Button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          অ্যাডমিন ড্যাশবোর্ড
        </h1>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">মোট অর্ডার</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">অপেক্ষমান</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">নিশ্চিত</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">মোট আয়</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">৳{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package size={16} />
            অর্ডার ম্যানেজমেন্ট
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard size={16} />
            পেমেন্ট সেটিংস
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Settings size={16} />
            প্রোডাক্ট ম্যানেজমেন্ট
          </TabsTrigger>
        </TabsList>

        {/* Orders Management */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package />
                সকল অর্ডার
              </CardTitle>
              <CardDescription>
                সিস্টেমের সকল অর্ডার পরিচালনা করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
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
                                  className="w-64"
                                />
                                <div className="flex gap-1 flex-wrap">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard />
                পেমেন্ট মেথড সেটিংস
              </CardTitle>
              <CardDescription>
                পেমেন্ট মেথডের তথ্য কাস্টমাইজ করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentSettings.map((method) => (
                <div key={method.name} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <h3 className="font-semibold text-lg">{method.displayName}</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPayment(editingPayment === method.name ? null : method.name)}
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                  
                  {editingPayment === method.name ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`${method.name}-display`}>ডিসপ্লে নাম</Label>
                        <Input
                          id={`${method.name}-display`}
                          value={method.displayName}
                          onChange={(e) => updatePaymentMethod(method.name, 'displayName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${method.name}-number`}>নাম্বার</Label>
                        <Input
                          id={`${method.name}-number`}
                          value={method.number}
                          onChange={(e) => updatePaymentMethod(method.name, 'number', e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => {
                          savePaymentSettings();
                          setEditingPayment(null);
                        }}>
                          <Save size={16} className="mr-1" />
                          সংরক্ষণ
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingPayment(null)}>
                          বাতিল
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <p><strong>নাম্বার:</strong> {method.number}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Management */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings />
                প্রোডাক্ট ম্যানেজমেন্ট
              </CardTitle>
              <CardDescription>
                প্রোডাক্ট যোগ, সম্পাদনা এবং মুছে ফেলুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">প্রোডাক্ট ম্যানেজমেন্ট</h3>
                <p className="text-gray-600 mb-4">
                  এই ফিচারটি শীঘ্রই আসছে। আপাতত products.ts ফাইল এডিট করে প্রোডাক্ট পরিবর্তন করুন।
                </p>
                <Button disabled>
                  <Plus size={16} className="mr-2" />
                  নতুন প্রোডাক্ট যোগ করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
