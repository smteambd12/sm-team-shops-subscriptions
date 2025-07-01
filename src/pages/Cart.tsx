
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { toast } from 'sonner';
import CheckoutForm from '../components/CheckoutForm';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = getCartTotal();
  const promoDiscount = appliedPromo ? appliedPromo.discount : 0;
  const total = subtotal - promoDiscount;

  const handleApplyPromo = () => {
    // প্রোমো কোড যাচাইয়ের লজিক পরে যোগ করা হবে
    toast.error('প্রোমো কোড ফিচার শীঘ্রই আসছে!');
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('চেকআউট করতে প্রথমে লগইন করুন!');
      navigate('/auth');
      return;
    }
    setShowCheckout(true);
  };

  const getDurationText = (duration: string) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
      default: return duration;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 mx-auto"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingCart size={80} className="text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">আপনার কার্ট খালি</h2>
            <p className="text-gray-600 mb-8">কার্টে কোনো পণ্য নেই। কেনাকাটা শুরু করুন!</p>
            <Link 
              to="/"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>কেনাকাটা করুন</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">শপিং কার্ট</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">আপনার পণ্যসমূহ ({items.length})</h2>
              
              {items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                const pkg = product?.packages.find(p => p.id === item.packageId);
                
                if (!product || !pkg) {
                  console.log('Product or package not found:', { productId: item.productId, packageId: item.packageId });
                  return null;
                }

                return (
                  <div key={`${item.productId}-${item.packageId}`} className="flex items-center border-b border-gray-200 py-6 last:border-b-0">
                    <img
                      src={product.image || 'https://via.placeholder.com/80x80'}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 ml-4">
                      <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                      <p className="text-gray-600 text-sm">{product.description}</p>
                      <p className="text-purple-600 font-medium">প্যাকেজ: {getDurationText(pkg.duration)}</p>
                    </div>
                    
                    <div className="flex items-center mx-4">
                      <button
                        onClick={() => updateQuantity(item.productId, item.packageId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-3 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.packageId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">৳{pkg.price * item.quantity}</div>
                      {pkg.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">৳{pkg.originalPrice * item.quantity}</div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.productId, item.packageId)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            {!showCheckout ? (
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">অর্ডার সামারি</h2>
                
                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">প্রোমো কোড</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="প্রোমো কোড লিখুন"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors"
                    >
                      প্রয়োগ
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-green-600 text-sm mt-2">✓ {appliedPromo.code} প্রয়োগ হয়েছে</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>সাবটোটাল:</span>
                    <span>৳{subtotal}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>প্রোমো ছাড়:</span>
                      <span>-৳{promoDiscount}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>মোট:</span>
                      <span>৳{total}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  চেকআউট করুন
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <CheckoutForm />
                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ফিরে যান
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
