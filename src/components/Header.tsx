
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, User, LogOut, Package, Heart, Menu, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "সফলভাবে লগআউট",
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

  const handleLiveChat = () => {
    // Open WhatsApp chat or other live chat service
    window.open('https://wa.me/+8801234567890?text=সালাম! আমি SM TEAM SHOPS থেকে সাহায্য চাই।', '_blank');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SM</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SM TEAM SHOPS
              </h1>
              <p className="text-xs text-gray-600">ডিজিটাল সার্ভিস প্রোভাইডার</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              হোম
            </Link>
            <Link to="/categories/web" className="text-gray-700 hover:text-purple-600 transition-colors">
              ওয়েব সার্ভিস
            </Link>
            <Link to="/categories/mobile" className="text-gray-700 hover:text-purple-600 transition-colors">
              মোবাইল অ্যাপ
            </Link>
            <Link to="/categories/tutorial" className="text-gray-700 hover:text-purple-600 transition-colors">
              টিউটোরিয়াল
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Live Chat Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLiveChat}
              className="hidden md:flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
            >
              <MessageCircle size={16} />
              লাইভ চ্যাট
            </Button>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart size={16} />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="প্রোফাইল" />
                      <AvatarFallback>
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user.user_metadata?.full_name || 'ব্যবহারকারী'}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      প্রোফাইল
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      আমার অর্ডার
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      প্রিয় পণ্য
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
              <div className="flex items-center space-x-2">
                <div className="hidden md:block text-sm text-gray-600">
                  <span className="animate-pulse">🎉 ফ্রি রেজিস্ট্রেশন করুন</span>
                </div>
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <User size={16} className="mr-1" />
                    লগইন
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm">
                  <Menu size={16} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-purple-600 transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    হোম
                  </Link>
                  <Link 
                    to="/categories/web" 
                    className="text-gray-700 hover:text-purple-600 transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ওয়েব সার্ভিস
                  </Link>
                  <Link 
                    to="/categories/mobile" 
                    className="text-gray-700 hover:text-purple-600 transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    মোবাইল অ্যাপ
                  </Link>
                  <Link 
                    to="/categories/tutorial" 
                    className="text-gray-700 hover:text-purple-600 transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    টিউটোরিয়াল
                  </Link>
                  
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleLiveChat}
                      className="w-full flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <MessageCircle size={16} />
                      লাইভ চ্যাট
                    </Button>
                  </div>

                  {!user && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-3 text-center animate-pulse">
                        🎉 ফ্রি রেজিস্ট্রেশন করুন
                      </p>
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                          <User size={16} className="mr-2" />
                          লগইন / রেজিস্টার
                        </Button>
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
