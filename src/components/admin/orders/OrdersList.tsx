
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Table, Grid } from 'lucide-react';
import OrderCard from './OrderCard';
import OrdersTable from './OrdersTable';
import type { EnhancedOrder, UserSubscription } from '@/types/admin';

interface OrdersListProps {
  orders: EnhancedOrder[];
  subscriptions: {[key: string]: UserSubscription[]};
  products: any;
  getStatusBadge: (status: string) => JSX.Element;
  getDurationLabel: (duration: string) => string;
  getPaymentMethodLabel: (method: string) => string;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
  onOrderUpdate: (orderId: string) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  subscriptions,
  products,
  getStatusBadge,
  getDurationLabel,
  getPaymentMethodLabel,
  formatDate,
  formatCurrency,
  onOrderUpdate
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">
            কোন অর্ডার খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-gray-600">
            আপনার সার্চ বা ফিল্টার অনুযায়ী কোন অর্ডার পাওয়া যায়নি।
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {orders.length} টি অর্ডার পাওয়া গেছে
        </p>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" />
            কার্ড ভিউ
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2"
          >
            <Table className="h-4 w-4" />
            টেবিল ভিউ
          </Button>
        </div>
      </div>
      
      {viewMode === 'cards' ? (
        <div className="grid gap-6">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              subscriptions={subscriptions}
              products={products}
              getStatusBadge={getStatusBadge}
              getDurationLabel={getDurationLabel}
              getPaymentMethodLabel={getPaymentMethodLabel}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onOrderUpdate={onOrderUpdate}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <OrdersTable
              orders={orders}
              subscriptions={subscriptions}
              products={products}
              getStatusBadge={getStatusBadge}
              getDurationLabel={getDurationLabel}
              getPaymentMethodLabel={getPaymentMethodLabel}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onOrderUpdate={onOrderUpdate}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrdersList;
