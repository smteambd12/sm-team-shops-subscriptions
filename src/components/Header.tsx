
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingCart, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "লগআউট সফল",
        description: "আপনি সফলভাবে লগআউট হয়েছেন।",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "লগআউট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SM TEAM SHOPS
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="পণ্য খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600">
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors">
              <ShoppingCart size={24} />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Favorites */}
            <Link to="/favorites" className="p-2 text-gray-700 hover:text-purple-600 transition-colors">
              <Heart size={24} />
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-purple-600 transition-colors">
                  <User size={24} />
                  <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">প্রোফাইল</Link>
                  <Link to="/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">অর্ডার হিস্টোরি</Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <LogOut size={16} />
                    লগআউট
                  </button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all duration-200"
              >
                লগইন
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-purple-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="পণ্য খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Search size={20} />
                  </button>
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="px-4 space-y-2">
                <Link to="/categories/web" className="block py-2 text-gray-800 hover:text-purple-600">ওয়েব সাবস্ক্রিপশন</Link>
                <Link to="/categories/mobile" className="block py-2 text-gray-800 hover:text-purple-600">মোবাইল অ্যাপস</Link>
                <Link to="/categories/tutorial" className="block py-2 text-gray-800 hover:text-purple-600">টিউটোরিয়াল</Link>
                <Link to="/contact" className="block py-2 text-gray-800 hover:text-purple-600">যোগাযোগ</Link>
                {user && (
                  <>
                    <Link to="/profile" className="block py-2 text-gray-800 hover:text-purple-600">প্রোফাইল</Link>
                    <Link to="/orders" className="block py-2 text-gray-800 hover:text-purple-600">অর্ডার হিস্টোরি</Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Categories Bar */}
      <div className="hidden md:block bg-gradient-to-r from-purple-50 to-blue-50 border-t">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8 py-3">
            <Link to="/categories/web" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              ওয়েব সাবস্ক্রিপশন
            </Link>
            <Link to="/categories/mobile" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              মোবাইল অ্যাপস
            </Link>
            <Link to="/categories/tutorial" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              টিউটোরিয়াল কোর্স
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              যোগাযোগ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
