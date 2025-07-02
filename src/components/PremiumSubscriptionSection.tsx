
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Star, Zap, Gift, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumSubscriptionSection = () => {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Floating Icons Animation */}
        <div className="absolute top-10 left-10 animate-bounce">
          <Crown className="w-8 h-8 text-white/30" />
        </div>
        <div className="absolute top-20 right-20 animate-pulse">
          <Star className="w-6 h-6 text-white/30" />
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce delay-300">
          <Sparkles className="w-7 h-7 text-white/30" />
        </div>
        <div className="absolute bottom-10 right-10 animate-pulse delay-500">
          <Zap className="w-8 h-8 text-white/30" />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            প্রিমিয়াম সাবস্ক্রিপশন প্ল্যান
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            সবচেয়ে কম দামে পেয়ে যান আপনার পছন্দের সব সেবা
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
              <Gift className="w-5 h-5 mr-2" />
              ৫০% পর্যন্ত ছাড়
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
              <Zap className="w-5 h-5 mr-2" />
              তাৎক্ষণিক ডেলিভারি
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
              <Shield className="w-5 h-5 mr-2" />
              ২৪/৭ সাপোর্ট
            </Badge>
          </div>
        </div>

        {/* Premium Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Basic Plan */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">বেসিক প্ল্যান</h3>
                <p className="text-white/70">শুরুর জন্য পারফেক্ট</p>
              </div>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-white mb-2">৯৯৯ টাকা</div>
                <div className="text-white/70">প্রতি মাসে</div>
              </div>

              <ul className="text-left space-y-3 mb-8 text-white/90">
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-blue-400" />
                  ৫টি প্রিমিয়াম অ্যাপ
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-blue-400" />
                  ২৪/৭ সাপোর্ট
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-blue-400" />
                  মাসিক আপডেট
                </li>
              </ul>

              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105">
                শুরু করুন
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan - Featured */}
          <Card className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg border-2 border-yellow-400/50 hover:border-yellow-400/70 transition-all duration-500 transform hover:scale-110 hover:shadow-2xl relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2 rounded-full text-sm transform rotate-12">
              জনপ্রিয়
            </div>
            
            <CardContent className="p-8 text-center relative z-10">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">প্রো প্ল্যান</h3>
                <p className="text-white/80">সবচেয়ে জনপ্রিয় পছন্দ</p>
              </div>
              
              <div className="mb-6">
                <div className="text-5xl font-bold text-white mb-2">১৯৯৯ টাকা</div>
                <div className="text-white/70">প্রতি মাসে</div>
                <div className="text-yellow-400 text-sm font-semibold mt-1">৩০% ছাড়!</div>
              </div>

              <ul className="text-left space-y-3 mb-8 text-white/90">
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-yellow-400" />
                  ১৫টি প্রিমিয়াম অ্যাপ
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-yellow-400" />
                  অগ্রাধিকার সাপোর্ট
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-yellow-400" />
                  সাপ্তাহিক আপডেট
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-yellow-400" />
                  এক্সক্লুসিভ ফিচার
                </li>
              </ul>

              <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                এখনই নিন
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">এন্টারপ্রাইজ</h3>
                <p className="text-white/70">ব্যবসার জন্য সেরা</p>
              </div>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-white mb-2">৪৯৯৯ টাকা</div>
                <div className="text-white/70">প্রতি মাসে</div>
              </div>

              <ul className="text-left space-y-3 mb-8 text-white/90">
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-purple-400" />
                  আনলিমিটেড অ্যাপ
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-purple-400" />
                  ডেডিকেটেড সাপোর্ট
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-purple-400" />
                  কাস্টম ইন্টিগ্রেশন
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-3 text-purple-400" />
                  এডভান্স অ্যানালিটিক্স
                </li>
              </ul>

              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105">
                যোগাযোগ করুন
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              এখনই শুরু করুন এবং ৩০% ছাড় পান!
            </h3>
            <p className="text-white/80 mb-6">
              সীমিত সময়ের অফার - প্রথম ১০০ জন ব্যবহারকারীর জন্য বিশেষ ছাড়
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105">
                  বিনামূল্যে ট্রায়াল শুরু করুন
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg transition-all duration-300">
                আরও জানুন
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumSubscriptionSection;
