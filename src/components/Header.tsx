import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  Button
} from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  ShoppingCart,
  Heart,
  User,
  Zap,
  Coins
} from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-800">TechStore</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-4 xl:space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              হোম
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              ক্যাটেগরি
            </Link>
            {user && (
              <Link to="/coins" className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center gap-1">
                <Coins className="w-4 h-4" />
                কয়েন
              </Link>
            )}
            <Link to="/team-support" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              সাপোর্ট
            </Link>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {user ? (
              <>
                <Link 
                  to="/favorites" 
                  className="text-gray-700 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="ফেভারিট"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                
                <Link 
                  to="/cart" 
                  className="relative text-gray-700 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="কার্ট"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative p-2">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">আকাউন্ট</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="w-full cursor-pointer">
                        ড্যাশবোর্ড
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full cursor-pointer">
                        প্রোফাইল
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="w-full cursor-pointer">
                        অর্ডার
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/coins" className="w-full cursor-pointer flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        কয়েন
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/live-chat" className="w-full cursor-pointer">
                        লাইভ চ্যাট
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      লগআউট
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">লগইন</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">সাইনআপ</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {user && (
              <Link 
                to="/cart" 
                className="relative text-gray-700 hover:text-purple-600 transition-colors p-2"
                title="কার্ট"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                হোম
              </Link>
              <Link 
                to="/categories" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ক্যাটেগরি
              </Link>
              {user && (
                <>
                  <Link 
                    to="/coins" 
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Coins className="w-4 h-4" />
                    কয়েন
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ড্যাশবোর্ড
                  </Link>
                  <Link 
                    to="/profile" 
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    প্রোফাইল
                  </Link>
                  <Link 
                    to="/orders" 
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    অর্ডার
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ফেভারিট
                  </Link>
                  <Link 
                    to="/live-chat" 
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    লাইভ চ্যাট
                  </Link>
                </>
              )}
              <Link 
                to="/team-support" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                সাপোর্ট
              </Link>
              {user ? (
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  লগআউট
                </button>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <Link 
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" size="sm" className="w-full">লগইন</Button>
                  </Link>
                  <Link 
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button size="sm" className="w-full">সাইনআপ</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
