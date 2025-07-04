
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  User, 
  FileText, 
  Settings,
  Download,
  ExternalLink,
  MessageSquare,
  Clock,
  ShoppingCart
} from 'lucide-react';
import OrderManagementDialog from './OrderManagementDialog';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  package_id: string;
  package_duration: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  quantity: number;
  product_image?: string;
}

interface UserSubscription {
  id: string;
  subscription_file_url?: string;
  subscription_link?: string;
  file_name?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_method: string;
  transaction_id?: string;
  promo_code?: string;
  discount_amount: number;
  status: string;
  admin_message?: string;
  created_at: string;
  updated_at?: string;
  // Consolidated fields from orders table
  product_name?: string;
  product_price?: number;
  product_quantity?: number;
  duration_days?: number;
  // New text fields with concatenated values
  product_price_text?: string;
  product_quantity_text?: string;
  duration_days_text?: string;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  subscriptions: {[key: string]: UserSubscription[]};
  products: {[key: string]: any};
  getStatusBadge: (status: string) => JSX.Element;
  getDurationLabel: (duration: string) => string;
  getPaymentMethodLabel: (method: string) => string;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
  onOrderUpdate: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  subscriptions,
  products,
  getStatusBadge,
  getDurationLabel,
  getPaymentMethodLabel,
  formatDate,
  formatCurrency,
  onOrderUpdate
}) => {
  const isMobile = useIsMobile();
  
  const formatDurationDays = (days: number) => {
    if (days >= 36500) return 'লাইফটাইম';
    if (days >= 365) return `${Math.floor(days / 365)} বছর`;
    if (days >= 30) return `${Math.floor(days / 30)} মাস`;
    return `${days} দিন`;
  };

  // Use consolidated data from orders table as primary source, with fallback to order_items
  const displayProductName = order.product_name || 
    (order.order_items && order.order_items.length > 0 ? 
      order.order_items.map(item => item.product_name).join(' + ') : 
      'N/A');
      
  const displayQuantity = order.product_quantity || 
    (order.order_items && order.order_items.length > 0 ? 
      order.order_items.reduce((sum, item) => sum + item.quantity, 0) : 
      0);
      
  const displayDuration = order.duration_days ? formatDurationDays(order.duration_days) : 'N/A';
  
  // Use concatenated text fields for detailed display when available
  const displayQuantityText = order.product_quantity_text || displayQuantity.toString();
  const displayDurationText = order.duration_days_text || displayDuration;
  const displayPriceText = order.product_price_text || 
    (order.product_price ? formatCurrency(order.product_price) : 'N/A');

  return (
    <Card className={`overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow ${isMobile ? 'mx-1' : ''}`}>
      <CardHeader className={`bg-gradient-to-r from-gray-50 to-gray-100 border-b ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} gap-3`}>
          <div className={`flex items-center gap-3 sm:gap-4`}>
            <div>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} flex items-center gap-2`}>
                <Package className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
                অর্ডার #{order.id.slice(0, 8)}
              </CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                <Calendar className="h-4 w-4 inline mr-1" />
                {formatDate(order.created_at)}
                {order.updated_at && (
                  <span className="ml-3 text-green-600">
                    (আপডেট: {formatDate(order.updated_at)})
                  </span>
                )}
              </CardDescription>
            </div>
            <div className={`flex ${isMobile ? 'flex-row' : 'items-center'} gap-2 sm:gap-3`}>
              <div className={`${isMobile ? 'text-xs' : ''}`}>{getStatusBadge(order.status)}</div>
              <Badge variant="outline" className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-green-700 border-green-300`}>
                <DollarSign className="h-3 w-3 mr-1" />
                {formatCurrency(order.total_amount)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {displayQuantity} আইটেম
              </Badge>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                size="sm"
                className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 ${isMobile ? 'w-full justify-center' : ''}`}
              >
                <Settings className="h-4 w-4" />
                পরিচালনা করুন
              </Button>
            </DialogTrigger>
            <OrderManagementDialog 
              order={order}
              subscriptions={subscriptions}
              products={products}
              onOrderUpdate={onOrderUpdate}
            />
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-4 sm:gap-6`}>
          {/* Customer Info */}
          <div>
            <h4 className={`font-semibold mb-3 flex items-center gap-2 text-blue-800 ${isMobile ? 'text-sm' : ''}`}>
              <User className="h-4 w-4" />
              গ্রাহক তথ্য
            </h4>
            <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'} bg-blue-50 ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
              <p><strong>নাম:</strong> {order.customer_name}</p>
              <p><strong>ইমেইল:</strong> {order.customer_email}</p>
              <p><strong>ফোন:</strong> {order.customer_phone}</p>
              <p><strong>পেমেন্ট:</strong> {getPaymentMethodLabel(order.payment_method)}</p>
            </div>
          </div>

          {/* Enhanced Products Summary with Concatenated Details */}
          <div>
            <h4 className={`font-semibold mb-3 flex items-center gap-2 text-green-800 ${isMobile ? 'text-sm' : ''}`}>
              <ShoppingCart className="h-4 w-4" />
              পণ্যের বিস্তারিত
            </h4>
            <div className="space-y-3">
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} ${isMobile ? 'p-3' : 'p-4'} bg-green-50 rounded-lg border border-green-200`}>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-green-800">পণ্যসমূহ:</span>
                    <p className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'} mt-1 break-words`}>
                      {displayProductName}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 pt-2 border-t border-green-200">
                    <div>
                      <span className={`font-medium text-green-800 ${isMobile ? 'text-xs' : 'text-xs'}`}>পরিমাণসমূহ:</span>
                      <p className={`text-gray-700 font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {displayQuantityText} টি
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium text-green-800 ${isMobile ? 'text-xs' : 'text-xs'}`}>মূল্যসমূহ:</span>
                      <p className={`text-gray-700 font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        ৳{displayPriceText}
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium text-green-800 ${isMobile ? 'text-xs' : 'text-xs'} flex items-center gap-1`}>
                        <Clock className="h-3 w-3" />
                        মেয়াদসমূহ:
                      </span>
                      <p className={`text-gray-700 font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {displayDurationText} দিন
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-green-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className={`font-medium text-green-800 ${isMobile ? 'text-xs' : 'text-xs'}`}>মোট পরিমাণ:</span>
                        <p className={`text-gray-700 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
                          {displayQuantity} টি
                        </p>
                      </div>
                      <div>
                        <span className={`font-medium text-green-800 ${isMobile ? 'text-xs' : 'text-xs'}`}>মোট মেয়াদ:</span>
                        <p className={`text-gray-700 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
                          {displayDuration}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Subscription Info */}
          <div>
            <h4 className={`font-semibold mb-3 flex items-center gap-2 text-purple-800 ${isMobile ? 'text-sm' : ''}`}>
              <FileText className="h-4 w-4" />
              স্ট্যাটাস ও সাবস্ক্রিপশন
            </h4>
            <div className="space-y-3">
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-purple-50 rounded-lg border border-purple-200`}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-purple-600 mb-1`}>বর্তমান স্ট্যাটাস:</p>
                <div className="flex justify-center">
                  {getStatusBadge(order.status)}
                </div>
              </div>
              
              {subscriptions[order.id] && subscriptions[order.id].length > 0 && (
                <div className={`${isMobile ? 'p-2' : 'p-3'} bg-green-50 rounded-lg border border-green-200`}>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-green-700 font-medium mb-2`}>
                    সাবস্ক্রিপশন তৈরি হয়েছে: {subscriptions[order.id].length}টি
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subscriptions[order.id].map((sub, index) => (
                      <div key={index} className="flex gap-1">
                        {sub.subscription_file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(sub.subscription_file_url, '_blank')}
                            className={`flex items-center gap-1 ${isMobile ? 'text-xs px-2 py-1 h-6' : 'text-xs px-2 py-1 h-6'}`}
                          >
                            <Download className="h-3 w-3" />
                            ফাইল
                          </Button>
                        )}
                        {sub.subscription_link && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(sub.subscription_link, '_blank')}
                            className={`flex items-center gap-1 ${isMobile ? 'text-xs px-2 py-1 h-6' : 'text-xs px-2 py-1 h-6'}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                            লিংক
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gray-50 rounded-lg border border-gray-200`}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mb-1`}>মোট পরিমাণ:</p>
                <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-800`}>
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Message */}
        {order.admin_message && (
          <div className={`mt-4 sm:mt-6 ${isMobile ? 'p-3' : 'p-4'} bg-blue-50 border border-blue-200 rounded-lg`}>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-800`}>
              <MessageSquare className="h-4 w-4 inline mr-2" />
              <strong>অ্যাডমিন বার্তা:</strong> {order.admin_message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
