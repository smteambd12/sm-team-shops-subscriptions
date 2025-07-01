
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { toast } from 'sonner';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import CheckoutSection from '../components/CheckoutSection';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = getCartTotal();

  const handleCheckout = () => {
    if (!user) {
      toast.error('চেকআউট করতে প্রথমে লগইন করুন!');
      navigate('/auth');
      return;
    }
    setShowCheckout(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-4 sm:mb-6 mx-auto"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingCart size={60} className="sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">আপনার কার্ট খালি</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">কার্টে কোনো পণ্য নেই। কেনাকাটা শুরু করুন!</p>
            <Link 
              to="/"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2 text-sm sm:text-base"
            >
              <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
              <span>কেনাকাটা করুন</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center mb-4 sm:mb-8">
          <Link to="/" className="mr-2 sm:mr-4 p-1 sm:p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">শপিং কার্ট</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">আপনার পণ্যসমূহ ({items.length})</h2>
              
              {items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                
                if (!product) {
                  console.log('Product not found:', { productId: item.productId, packageId: item.packageId });
                  return null;
                }

                return (
                  <CartItem
                    key={`${item.productId}-${item.packageId}`}
                    item={item}
                    product={product}
                    onUpdateQuantity={updateQuantity}
                    onRemoveFromCart={removeFromCart}
                  />
                );
              })}
            </div>
          </div>

          {/* Order Summary or Checkout */}
          <div className="lg:col-span-1">
            {!showCheckout ? (
              <OrderSummary
                subtotal={subtotal}
                appliedPromo={appliedPromo}
                onCheckout={handleCheckout}
              />
            ) : (
              <CheckoutSection onGoBack={() => setShowCheckout(false)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
