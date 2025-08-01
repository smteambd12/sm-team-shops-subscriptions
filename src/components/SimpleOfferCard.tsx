
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { OfferProduct } from '@/types/popularProducts';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';

interface SimpleOfferCardProps {
  product: OfferProduct;
}

const SimpleOfferCard = ({ product }: SimpleOfferCardProps) => {
  const { addToCart } = useCart();
  const { products } = useProducts();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Adding offer to cart:', product);
    
    if (!product.offer_items || product.offer_items.length === 0) {
      toast.error('এই অফারে কোন পণ্য নেই');
      return;
    }

    let addedItems = 0;

    product.offer_items.forEach(item => {
      const actualProduct = products.find(p => p.id === item.product_id);
      if (actualProduct) {
        const actualPackage = actualProduct.packages.find(pkg => pkg.id === item.package_id);
        if (actualPackage) {
          // Add each quantity to cart
          for (let i = 0; i < item.quantity; i++) {
            addToCart(item.product_id, item.package_id);
            addedItems++;
          }
        }
      }
    });

    if (addedItems > 0) {
      toast.success(`${product.title} কার্টে যোগ করা হয়েছে!`);
    } else {
      toast.error('পণ্যটি কার্টে যোগ করা যায়নি');
    }
  };

  const isVideo = product.image_url?.includes('.mp4') || product.image_url?.includes('.webm');

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-orange-200 bg-white min-w-[280px] max-w-[280px] overflow-hidden">
      <CardContent className="p-0">
        {/* Media Section */}
        <div className="relative h-32 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
          {product.image_url ? (
            isVideo ? (
              <video
                src={product.image_url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-orange-400 text-sm">কোন ছবি নেই</span>
            </div>
          )}
          
          {/* Discount Badge */}
          {product.discount_percentage && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-red-600 text-white shadow-lg border-0 text-xs px-2 py-1 font-bold">
                {product.discount_percentage}% ছাড়
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3 space-y-3">
          {/* Product Title */}
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.original_price && (
                  <span className="text-sm text-gray-500 line-through">
                    ৳{product.original_price}
                  </span>
                )}
                <span className="text-lg font-bold text-green-600">
                  ৳{product.offer_price || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm py-2 h-8"
            size="sm"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            কার্টে যোগ করুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleOfferCard;
