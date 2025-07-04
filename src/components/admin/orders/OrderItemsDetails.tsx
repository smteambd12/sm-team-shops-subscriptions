
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Tag, Star, Layers } from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_category?: string;
  product_description?: string;
  package_id: string;
  package_duration: string;
  package_features?: string[];
  price: number;
  original_price?: number;
  discount_percentage?: number;
  quantity: number;
  product_image?: string;
}

interface OrderItemsDetailsProps {
  items: OrderItem[];
  getDurationLabel: (duration: string) => string;
  getCategoryLabel: (category: string) => string;
  formatCurrency: (amount: number) => string;
}

const OrderItemsDetails: React.FC<OrderItemsDetailsProps> = ({
  items,
  getDurationLabel,
  getCategoryLabel,
  formatCurrency
}) => {
  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardHeader className="bg-indigo-50">
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <Package className="h-5 w-5" />
          অর্ডার আইটেম বিস্তারিত
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.product_name}
                  </h4>
                  {item.product_description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {item.product_description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.product_category && (
                      <Badge variant="outline" className="text-blue-700 border-blue-300">
                        <Layers className="h-3 w-3 mr-1" />
                        {getCategoryLabel(item.product_category)}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-purple-700 border-purple-300">
                      <Tag className="h-3 w-3 mr-1" />
                      {getDurationLabel(item.package_duration)}
                    </Badge>
                  </div>
                </div>
                {item.product_image && (
                  <img 
                    src={item.product_image} 
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-lg ml-4"
                  />
                )}
              </div>

              {item.package_features && item.package_features.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    প্যাকেজ ফিচার:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.package_features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <span className="text-gray-600">পরিমাণ:</span>
                  <p className="font-semibold text-gray-800">{item.quantity}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="text-gray-600">মূল্য:</span>
                  <p className="font-semibold text-gray-800">{formatCurrency(item.price)}</p>
                </div>
                {item.original_price && item.original_price > item.price && (
                  <div className="bg-white p-3 rounded border">
                    <span className="text-gray-600">মূল মূল্য:</span>
                    <p className="font-semibold text-gray-500 line-through">
                      {formatCurrency(item.original_price)}
                    </p>
                  </div>
                )}
                {item.discount_percentage && item.discount_percentage > 0 && (
                  <div className="bg-green-100 p-3 rounded border border-green-300">
                    <span className="text-green-700">ছাড়:</span>
                    <p className="font-semibold text-green-700">{item.discount_percentage}%</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">সাবটোটাল:</span>
                  <span className="font-bold text-lg text-gray-800">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemsDetails;
