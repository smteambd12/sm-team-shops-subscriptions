
import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { Product } from '../types';

interface CartItemProps {
  item: CartItemType;
  product: Product;
  onUpdateQuantity: (productId: string, packageId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string, packageId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  product,
  onUpdateQuantity,
  onRemoveFromCart
}) => {
  const pkg = product.packages.find(p => p.id === item.packageId);
  
  if (!pkg) {
    console.log('Package not found:', { productId: item.productId, packageId: item.packageId });
    return null;
  }

  const getDurationText = (duration: string) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
      default: return duration;
    }
  };

  return (
    <div className="flex items-center border-b border-gray-200 py-4 sm:py-6 last:border-b-0">
      <img
        src={product.image || 'https://via.placeholder.com/80x80'}
        alt={product.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
      />
      
      <div className="flex-1 ml-2 sm:ml-4 min-w-0">
        <h3 className="font-bold text-sm sm:text-lg text-gray-800 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-1 hidden sm:block">{product.description}</p>
        <p className="text-purple-600 font-medium text-xs sm:text-sm">প্যাকেজ: {getDurationText(pkg.duration)}</p>
      </div>
      
      <div className="flex items-center mx-2 sm:mx-4">
        <button
          onClick={() => onUpdateQuantity(item.productId, item.packageId, item.quantity - 1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Minus size={14} className="sm:w-4 sm:h-4" />
        </button>
        <span className="mx-2 sm:mx-3 font-medium text-sm sm:text-base">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.productId, item.packageId, item.quantity + 1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Plus size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>
      
      <div className="text-right flex-shrink-0">
        <div className="font-bold text-sm sm:text-lg">৳{pkg.price * item.quantity}</div>
        {pkg.originalPrice && (
          <div className="text-xs sm:text-sm text-gray-500 line-through">৳{pkg.originalPrice * item.quantity}</div>
        )}
      </div>
      
      <button
        onClick={() => onRemoveFromCart(item.productId, item.packageId)}
        className="ml-2 sm:ml-4 p-1 sm:p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
      >
        <Trash2 size={16} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default CartItem;
