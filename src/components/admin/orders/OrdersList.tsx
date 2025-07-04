
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import OrderCard from './OrderCard';

interface OrdersListProps {
  orders: any[];
  subscriptions: any;
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
      </div>
      
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
    </div>
  );
};

export default OrdersList;
