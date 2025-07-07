
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Heart, Package, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const cartItemsCount = getCartItemsCount();

return (
  <header className="bg-white shadow-lg sticky top-0 z-50">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Green box with SM inside */}
          <div className="w-8 h-8 rounded-md bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
            SM
          </div>
          {/* Text beside box */}
          <span className="text-2xl font-bold text-gray-800">SM SHOPS</span>
        </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              হোম
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-purple-600 transition-colors">
              ক্যাটেগরি
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors flex items-center space-x-1">
                  <BarChart3 size={16} />
                  <span>ড্যাশবোর্ড</span>
                </Link>
                <Link to="/subscriptions" className="text-gray-700 hover:text-purple-600 transition-colors flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>সাবস্ক্রিপশন</span>
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <Link to="/favorites" className="p-2 text-gray-700 hover:text-purple-600 transition-colors">
                <Heart size={20} />
              </Link>
            )}
            
            <Link to="/cart" className="p-2 text-gray-700 hover:text-purple-600 transition-colors relative">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2">
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      ড্যাশবোর্ড
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      প্রোফাইল
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      অর্ডার
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscriptions" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      সাবস্ক্রিপশন
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button>লগইন</Button>
              </Link>
            )}
          </div>

          {/* Mobile Actions - Cart and Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Icon */}
            <Link to="/cart" className="p-2 text-gray-700 hover:text-purple-600 transition-colors relative">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="py-4 space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                হোম
              </Link>
              <Link
                to="/categories"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ক্যাটেগরি
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ড্যাশবোর্ড
                  </Link>
                  <Link
                    to="/subscriptions"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    সাবস্ক্রিপশন
                  </Link>
                  <Link
                    to="/favorites"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ফেভারিট
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    প্রোফাইল
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    অর্ডার
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    লগআউট
                  </button>
                </>
              )}
              {!user && (
                <Link
                  to="/auth"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  লগইন
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
