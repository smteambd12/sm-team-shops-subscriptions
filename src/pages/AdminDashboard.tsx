
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  BarChart3, 
  Gift, 
  CreditCard,
  MessageSquare,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import PromoCodes from '@/components/admin/PromoCodes';
import SiteSettings from '@/components/admin/SiteSettings';
import AdminStats from '@/components/admin/AdminStats';
import SubscriptionsManagement from '@/components/admin/SubscriptionsManagement';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    checkAdminStatus();
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Admin check error:', error);
        toast({
          title: "অ্যাক্সেস নিষেধ",
          description: "আপনার অ্যাডমিন অ্যাক্সেস নেই।",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">অ্যাক্সেস নিষেধ</h3>
            <p className="text-gray-600 mb-4">আপনার অ্যাডমিন অ্যাক্সেস নেই।</p>
            <Button onClick={() => navigate('/')}>
              হোমে ফিরুন
            </Button>
          </CardContent>
        </Card>
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
        <div>
          <h1 className="text-3xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-gray-600">সাইট পরিচালনা ও নিয়ন্ত্রণ প্যানেল</p>
        </div>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 size={16} />
            পরিসংখ্যান
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package size={16} />
            পণ্য পরিচালনা
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            অর্ডার পরিচালনা
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Calendar size={16} />
            সাবস্ক্রিপশন
          </TabsTrigger>
          <TabsTrigger value="promo" className="flex items-center gap-2">
            <Gift size={16} />
            প্রোমো কোড
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            সেটিংস
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <AdminStats />
        </TabsContent>

        <TabsContent value="products">
          <ProductsManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersManagement />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionsManagement />
        </TabsContent>

        <TabsContent value="promo">
          <PromoCodes />
        </TabsContent>

        <TabsContent value="settings">
          <SiteSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
