
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CoinBalance from '@/components/coins/CoinBalance';
import PromoCodeShop from '@/components/coins/PromoCodeShop';
import UserPromoCodes from '@/components/coins/UserPromoCodes';

const Coins = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">কয়েন সিস্টেম</h1>
          <p className="text-gray-600">কয়েন জমা করুন এবং বিশেষ প্রোমো কোড কিনুন</p>
        </div>

        {/* Coin Balance */}
        <div className="max-w-md mx-auto mb-8">
          <CoinBalance />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="shop" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="shop">প্রোমো শপ</TabsTrigger>
            <TabsTrigger value="my-codes">আমার কোড</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shop">
            <PromoCodeShop />
          </TabsContent>
          
          <TabsContent value="my-codes">
            <UserPromoCodes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Coins;
