
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';
import { PopularProduct } from '@/types/popularProducts';

interface PopularProductCardProps {
  product: PopularProduct;
}

const PopularProductCard = ({ product }: PopularProductCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-lg">
          {product.media_type === 'video' ? (
            <div className="relative">
              <img
                src={product.thumbnail_url || product.media_url}
                alt={product.title}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-gray-800 ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={product.media_url}
              alt={product.title}
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            />
          )}
          
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              জনপ্রিয়
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularProductCard;
