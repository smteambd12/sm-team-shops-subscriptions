
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Clock, CheckCircle, DollarSign } from 'lucide-react';

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
}

interface OrderStatsCardsProps {
  stats: OrderStats;
  formatCurrency: (amount: number) => string;
}

const OrderStatsCards: React.FC<OrderStatsCardsProps> = ({ stats, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">মোট অর্ডার</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="h-12 w-12 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">অপেক্ষমান</p>
              <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">নিশ্চিত</p>
              <p className="text-3xl font-bold">{stats.confirmedOrders}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">মোট আয়</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatsCards;
