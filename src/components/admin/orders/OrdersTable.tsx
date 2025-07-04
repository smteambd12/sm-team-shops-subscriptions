
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Settings,
  Clock,
  ShoppingCart
} from 'lucide-react';
import OrderManagementDialog from './OrderManagementDialog';
import type { EnhancedOrder, UserSubscription } from '@/types/admin';

interface OrdersTableProps {
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

const OrdersTable: React.FC<OrdersTableProps> = ({
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
  const formatDurationDays = (days: number) => {
    if (days >= 36500) return 'লাইফটাইম';
    if (days >= 365) return `${Math.floor(days / 365)} বছর`;
    if (days >= 30) return `${Math.floor(days / 30)} মাস`;
    return `${days} দিন`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>অর্ডার তথ্য</TableHead>
            <TableHead>গ্রাহক</TableHead>
            <TableHead>পণ্যের তথ্য</TableHead>
            <TableHead>মোট পরিমাণ</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
            <TableHead>পেমেন্ট</TableHead>
            <TableHead>অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            // Use consolidated data from orders table as primary source
            const displayProductName = order.product_name || order.order_items.map(item => item.product_name).join(' + ');
            const displayQuantity = order.product_quantity || order.order_items.reduce((sum, item) => sum + item.quantity, 0);
            const displayDuration = order.duration_days ? formatDurationDays(order.duration_days) : 'N/A';

            return (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      #{order.id.slice(0, 8)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-sm text-gray-600">{order.customer_email}</div>
                    <div className="text-sm text-gray-600">{order.customer_phone}</div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-2 max-w-xs">
                    {/* Consolidated Product Information */}
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <div className="font-medium text-green-800 text-sm flex items-center gap-1 mb-2">
                        <ShoppingCart className="h-3 w-3" />
                        পণ্যসমূহ
                      </div>
                      <div className="text-xs text-gray-700 mb-3 break-words">
                        {displayProductName}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-green-700">পরিমাণ:</span>
                          <div className="text-gray-600 font-semibold">
                            {displayQuantity} টি
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-green-700 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            মেয়াদ:
                          </span>
                          <div className="text-gray-600 font-semibold">
                            {displayDuration}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-bold text-green-700 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(order.total_amount)}
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="text-sm text-red-600">
                        ছাড়: {formatCurrency(order.discount_amount)}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-2">
                    {getStatusBadge(order.status)}
                    {subscriptions[order.id] && subscriptions[order.id].length > 0 && (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                        {subscriptions[order.id].length} সাবস্ক্রিপশন
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{getPaymentMethodLabel(order.payment_method)}</div>
                    {order.transaction_id && (
                      <div className="text-xs text-gray-600 font-mono">
                        {order.transaction_id.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        পরিচালনা
                      </Button>
                    </DialogTrigger>
                    <OrderManagementDialog 
                      order={order}
                      subscriptions={subscriptions}
                      products={products}
                      onOrderUpdate={onOrderUpdate}
                    />
                  </Dialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
