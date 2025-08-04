import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useUsers } from '@/hooks/useUsers';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import UsersManagement from '@/components/admin/UsersManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';
import CoinsManagement from '@/components/admin/CoinsManagement';
import CoinsAnalytics from '@/components/admin/CoinsAnalytics';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const { orders, loading: ordersLoading, fetchOrders } = useOrders();
  const { users, loading: usersLoading, fetchUsers } = useUsers();
  const { settings, loading: settingsLoading, fetchSettings } = useSiteSettings();

  useEffect(() => {
    if (!user?.isAdmin) {
      return;
    }

    fetchProducts();
    fetchOrders();
    fetchUsers();
    fetchSettings();
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="coins">কয়েন সিস্টেম</TabsTrigger>
            <TabsTrigger value="coins-analytics">কয়েন অ্যানালিটিক্স</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManagement />
          </TabsContent>

          <TabsContent value="coins">
            <CoinsManagement />
          </TabsContent>

          <TabsContent value="coins-analytics">
            <CoinsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
