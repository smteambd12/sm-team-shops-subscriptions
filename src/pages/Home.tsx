
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Zap, 
  Shield, 
  Crown,
  ArrowRight,
  Gift
} from 'lucide-react';
import SubscriptionNotificationBanner from '@/components/notifications/SubscriptionNotificationBanner';
import { useSubscriptionNotifications } from '@/hooks/useSubscriptionNotifications';
import PremiumSection from '../components/PremiumSection';

const Home = () => {
  const { user } = useAuth();
  const { expiringCount, expiredCount, loading } = useSubscriptionNotifications();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Crown className="w-12 h-12 text-yellow-300" />
              <h1 className="text-5xl font-bold">
                ডিজিটাল পণ্য ও সেবা
              </h1>
              <Crown className="w-12 h-12 text-yellow-300" />
            </div>
            <p className="text-xl mb-8 opacity-90">
              উন্নত মানের ওয়েব ও মোবাইল অ্যাপ্লিকেশন, টিউটোরিয়াল এবং AI-পাওয়ার্ড টুলস
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5 mr-2" />
                কেনাকাটা শুরু করুন
              </Button>
              {user && (
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Heart className="w-5 h-5 mr-2" />
                  আমার প্রিয়
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Notifications */}
      {user && !loading && (
        <div className="container mx-auto px-4 py-4">
          <SubscriptionNotificationBanner 
            expiringCount={expiringCount} 
            expiredCount={expiredCount} 
          />
        </div>
      )}

      {/* Premium Section */}
      <PremiumSection />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">কেন আমাদের বেছে নিবেন?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              আমাদের অভিজ্ঞ দল আপনার জন্য সেরা মানের ডিজিটাল সমাধান তৈরি করে
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>দ্রুত ডেলিভারি</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  অর্ডার করার পর দ্রুততম সময়ে আপনার পণ্য পৌঁছে যাবে
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>মানের গ্যারান্টি</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  প্রতিটি পণ্য সর্বোচ্চ মানের এবং পূর্ণ সাপোর্ট সহ
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>সেরা দাম</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  বাজারের সবচেয়ে প্রতিযোগিতামূলক দামে সেরা পণ্য
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">আমাদের ক্যাটেগরি</h2>
            <p className="text-gray-600">
              বিভিন্ন ধরনের ডিজিটাল পণ্য ও সেবা
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/categories?category=web" className="group">
              <Card className="hover:shadow-lg transition-all group-hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🌐</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">ওয়েব অ্যাপ্লিকেশন</h3>
                  <p className="text-gray-600 mb-4">
                    আধুনিক ও কার্যকর ওয়েব অ্যাপ্লিকেশন
                  </p>
                  <Badge variant="secondary">১৫+ পণ্য</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link to="/categories?category=mobile" className="group">
              <Card className="hover:shadow-lg transition-all group-hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📱</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">মোবাইল অ্যাপ</h3>
                  <p className="text-gray-600 mb-4">
                    Android ও iOS এর জন্য অ্যাপ
                  </p>
                  <Badge variant="secondary">১০+ পণ্য</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link to="/categories?category=tutorial" className="group">
              <Card className="hover:shadow-lg transition-all group-hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">টিউটোরিয়াল</h3>
                  <p className="text-gray-600 mb-4">
                    প্রোগ্রামিং ও ডিজাইন টিউটোরিয়াল
                  </p>
                  <Badge variant="secondary">২০+ পণ্য</Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">আজই শুরু করুন</h2>
          <p className="text-xl mb-8 opacity-90">
            আপনার ডিজিটাল যাত্রা শুরু করুন আমাদের সাথে
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/categories">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                সব পণ্য দেখুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {!user && (
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  রেজিস্টার করুন
                  <Gift className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
