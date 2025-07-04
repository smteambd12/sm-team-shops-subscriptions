
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const EmptyCart: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">কার্ট খালি</h3>
          <p className="text-gray-600">কোন পণ্য নেই। প্রথমে পণ্য যোগ করুন।</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyCart;
