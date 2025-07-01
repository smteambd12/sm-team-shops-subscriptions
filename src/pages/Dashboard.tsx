
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  ShoppingCart,
  Heart,
  Calendar,
  TrendingUp,
  Award,
  Star,
  Bell,
  Settings,
  CreditCard,
  Download,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  activeSubscriptions: number;
  totalSpent: number;
  favoriteProducts: number;
  recentOrders: any[];
  upcomingRenewals: any[];
  achievements: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeSubscriptions: 0,
    totalSpent: 0,
    favoriteProducts: 0,
    recentOrders: [],
    upcomingRenewals: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      // Fetch favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user?.id);

      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const upcomingRenewals = subscriptions?.filter(sub => {
        const expiryDate = new Date(sub.expires_at);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }) || [];

      // Create achievements based on user activity
      const achievements = [];
      if (orders && orders.length >= 1) achievements.push({ name: 'প্রথম অর্ডার', icon: '🎉', description: 'প্রথম অর্ডার সম্পন্ন' });
      if (orders && orders.length >= 5) achievements.push({ name: 'নিয়মিত ক্রেতা', icon: '🏆', description: '৫টি অর্ডার সম্পন্ন' });
      if (totalSpent >= 1000) achievements.push({ name: 'বড় ক্রেতা', icon: '💎', description: '১০০০+ টাকা খরচ' });
      if (subscriptions && subscriptions.length >= 3) achievements.push({ name: 'প্রিমিয়াম ইউজার', icon: '⭐', description: '৩+ সক্রিয় সাবস্ক্রিপশন' });

      setStats({
        totalOrders: orders?.length || 0,
        activeSubscriptions: subscriptions?.length || 0,
        totalSpent,
        favoriteProducts: favorites?.length || 0,
        recentOrders: orders?.slice(0, 5) || [],
        upcomingRenewals,
        achievements
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">আমার ড্যাশবোর্ড</h1>
          <p className="text-gray-600 mt-2">আপনার অ্যাকাউন্টের সব তথ্য এক জায়গায়</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/profile')}>
          <Settings className="h-4 w-4 mr-2" />
          সেটিংস
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">মোট অর্ডার</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">সক্রিয় সাবস্ক্রিপশন</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">মোট খরচ</p>
                <p className="text-2xl font-bold">৳{stats.totalSpent.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100">পছন্দের পণ্য</p>
                <p className="text-2xl font-bold">{stats.favoriteProducts}</p>
              </div>
              <Heart className="h-8 w-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">ওভারভিউ</TabsTrigger>
          <TabsTrigger value="orders">অর্ডার</TabsTrigger>
          <TabsTrigger value="subscriptions">সাবস্ক্রিপশন</TabsTrigger>
          <TabsTrigger value="achievements">অর্জন</TabsTrigger>
          <TabsTrigger value="analytics">অ্যানালিটিক্স</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  সাম্প্রতিক অর্ডার
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">অর্ডার #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">৳{order.total_amount.toLocaleString()}</p>
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'confirmed' ? 'secondary' :
                            order.status === 'pending' ? 'outline' : 'destructive'
                          }>
                            {order.status === 'pending' ? 'প্রসেসিং' :
                             order.status === 'confirmed' ? 'নিশ্চিত' :
                             order.status === 'delivered' ? 'ডেলিভার' : 'বাতিল'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                      সব অর্ডার দেখুন
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">কোনো অর্ডার নেই</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Renewals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  আসছে রিনিউয়াল
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.upcomingRenewals.length > 0 ? (
                  <div className="space-y-4">
                    {stats.upcomingRenewals.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{sub.product_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(sub.expires_at).toLocaleDateString('bn-BD')} এ শেষ
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.ceil((new Date(sub.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} দিন
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">কোনো আসছে রিনিউয়াল নেই</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>দ্রুত অ্যাকশন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/')}>
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  কেনাকাটা
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/favorites')}>
                  <Heart className="h-6 w-6 mb-2" />
                  পছন্দের তালিকা
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/subscriptions')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  সাবস্ক্রিপশন
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/profile')}>
                  <User className="h-6 w-6 mb-2" />
                  প্রোফাইল
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার ইতিহাস</CardTitle>
              <CardDescription>আপনার সব অর্ডারের বিস্তারিত</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">অর্ডার #{order.id.slice(0, 8)}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                        <Badge variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'confirmed' ? 'secondary' :
                          order.status === 'pending' ? 'outline' : 'destructive'
                        }>
                          {order.status === 'pending' ? 'প্রসেসিং' :
                           order.status === 'confirmed' ? 'নিশ্চিত' :
                           order.status === 'delivered' ? 'ডেলিভার' : 'বাতিল'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">পেমেন্ট: {order.payment_method}</p>
                          {order.promo_code && (
                            <p className="text-sm text-green-600">প্রোমো: {order.promo_code}</p>
                          )}
                        </div>
                        <p className="font-bold text-lg">৳{order.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" onClick={() => navigate('/orders')}>
                    সব অর্ডার দেখুন
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">কোনো অর্ডার নেই</p>
                  <Button className="mt-4" onClick={() => navigate('/')}>
                    কেনাকাটা শুরু করুন
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>সাবস্ক্রিপশন ম্যানেজমেন্ট</CardTitle>
              <CardDescription>আপনার সক্রিয় সাবস্ক্রিপশন পরিচালনা করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full mb-4" onClick={() => navigate('/subscriptions')}>
                বিস্তারিত সাবস্ক্রিপশন দেখুন
              </Button>
              <div className="grid gap-4">
                <div className="text-center text-gray-600">
                  সাবস্ক্রিপশন তথ্য লোড করা হচ্ছে...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                আপনার অর্জন
              </CardTitle>
              <CardDescription>আপনার কার্যকলাপের ভিত্তিতে অর্জিত ব্যাজ</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.achievements.map((achievement, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold text-yellow-800">{achievement.name}</h4>
                      <p className="text-sm text-yellow-700">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">এখনো কোনো অর্জন নেই</p>
                  <p className="text-sm text-gray-500 mt-2">কেনাকাটা করুন এবং অর্জন আনলক করুন!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  খরচের পরিসংখ্যান
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>মোট খরচ</span>
                    <span className="font-bold">৳{stats.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>গড় অর্ডার মূল্য</span>
                    <span className="font-bold">
                      ৳{stats.totalOrders > 0 ? Math.round(stats.totalSpent / stats.totalOrders).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>মাসিক গড় খরচ</span>
                    <span className="font-bold">৳{Math.round(stats.totalSpent / 12).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  কার্যকলাপ সূচক
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>প্রোফাইল সম্পূর্ণতা</span>
                      <span>৮৫%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>সাবস্ক্রিপশন ব্যবহার</span>
                      <span>৭২%</span>
                    </div>
                    <Progress value={72} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>গ্রাহক সন্তুষ্টি</span>
                      <span>৯৫%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
