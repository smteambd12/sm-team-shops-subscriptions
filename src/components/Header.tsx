import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Heart,
  Package,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-md flex items-center justify-center text-white font-extrabold text-lg transform hover:scale-105 transition-transform duration-300">
              SM
            </div>
            <span className="text-2xl font-extrabold text-gray-800 drop-shadow-md tracking-wide">
              TEAM SHOPS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link to="/" className="hover:text-purple-600 text-gray-700 transition-colors">
              হোম
            </Link>
            <Link to="/categories" className="hover:text-purple-600 text-gray-700 transition-colors">
              ক্যাটেগরি
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="flex items-center gap-1 hover:text-purple-600 text-gray-700">
                  <BarChart3 size={16} />
                  ড্যাশবোর্ড
                </Link>
                <Link to="/subscriptions" className="flex items-center gap-1 hover:text-purple-600 text-gray-700">
                  <Calendar size={16} />
                  সাবস্ক্রিপশন
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user && (
              <Link to="/favorites" className="hover:text-purple-600 text-gray-700">
                <Heart size={20} />
              </Link>
            )}
            <Link to="/cart" className="relative hover:text-purple-600 text-gray-700">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-100">
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" /> ড্যাশবোর্ড
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">প্রোফাইল</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" /> অর্ডার
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscriptions" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" /> সাবস্ক্রিপশন
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="rounded-full shadow-md">লগইন</Button>
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="relative hover:text-purple-600 text-gray-700">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t mt-2 rounded-lg shadow-sm">
            <nav className="py-3 space-y-1 px-4 text-sm font-medium">
              <Link to="/" className="block py-2 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>হোম</Link>
              <Link to="/categories" className="block py-2 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>ক্যাটেগরি</Link>
              {user && (
                <>
                  <Link to="/dashboard" className="block py-2 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>ড্যাশবোর্ড</Link>
                  <Link to="/subscriptions" className="block py-2 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>সাবস্ক্রিপশন</Link>
                  <Link to="/favorites" className="block py-2 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>ফেভারিট</Link>
                  <Link to="/profile" className="block py-2 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>প্রোফাইল</Link>
                  <Link to="/orders" className="block py-2 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>অর্ডার</Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-red-600 hover:bg-gray-100"
                  >
                    লগআউট
                  </button>
                </>
              )}
              {!user && (
                <Link to="/auth" className="block py-2 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
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
