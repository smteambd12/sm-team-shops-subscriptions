
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, CheckCircle, Star, Users, Zap, Shield, Award, Sparkles, Globe, Smartphone, BookOpen, TrendingUp, Clock, Heart, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const webProducts = products.filter(p => p.category === 'web').slice(0, 3);
  const mobileProducts = products.filter(p => p.category === 'mobile').slice(0, 3);
  const tutorialProducts = products.filter(p => p.category === 'tutorial').slice(0, 2);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Sparkles className="text-yellow-400 animate-pulse" size={40} />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              সেরা দামে সব
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                সাবস্ক্রিপশন
              </span>
            </h1>
            
            <p className="text-xl md:text-3xl mb-8 text-purple-100 max-w-4xl mx-auto leading-relaxed">
              Netflix, Spotify, Canva সহ সব জনপ্রিয় অ্যাপের সাবস্ক্রিপশন পান 
              <span className="text-yellow-400 font-bold">৫০% পর্যন্ত ছাড়ে</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                to="/categories/web"
                className="group bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-2"
              >
                <span className="flex items-center justify-center gap-2">
                  <Zap className="group-hover:animate-bounce" size={24} />
                  এখনই কিনুন
                </span>
              </Link>
              <Link 
                to="/categories/tutorial"
                className="group border-3 border-white text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <BookOpen className="group-hover:animate-bounce" size={24} />
                  কোর্স দেখুন
                </span>
              </Link>
            </div>
            
            {/* Enhanced Stats */}
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">১০০০+</div>
                <div className="text-purple-200 flex items-center justify-center gap-1">
                  <Heart size={16} />
                  খুশি কাস্টমার
                </div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">৫০+</div>
                <div className="text-purple-200 flex items-center justify-center gap-1">
                  <Globe size={16} />
                  প্রিমিয়াম অ্যাপ
                </div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">২৪/৭</div>
                <div className="text-purple-200 flex items-center justify-center gap-1">
                  <Clock size={16} />
                  সাপোর্ট সেবা
                </div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">৯৮%</div>
                <div className="text-purple-200 flex items-center justify-center gap-1">
                  <TrendingUp size={16} />
                  সন্তুষ্টির হার
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Scroll Indicator */}
        <div className="flex justify-center mt-12">
          <div className="animate-bounce bg-white/20 p-3 rounded-full backdrop-blur-sm">
            <ArrowDown className="text-white/80" size={32} />
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              কেন আমাদের বেছে নেবেন?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              আমরা শুধু সেবা প্রদান করি না, আমরা আপনার ডিজিটাল জীবনকে সহজ করি
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-2xl hover:shadow-xl hover:bg-white">
              <div className="bg-gradient-to-br from-green-400 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Shield className="text-white" size={40} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">১০০% অরিজিনাল</h3>
              <p className="text-gray-600 leading-relaxed">সব সাবস্ক্রিপশন সম্পূর্ণ অরিজিনাল ও বৈধ। কোন ঝামেলা নেই, কোন ঝুঁকি নেই।</p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-2xl hover:shadow-xl hover:bg-white">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Award className="text-white" size={40} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">সেরা দাম</h3>
              <p className="text-gray-600 leading-relaxed">বাজারের সবচেয়ে কম দামে পাবেন। আমরা গ্যারান্টি দিচ্ছি সেরা দামের।</p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-2xl hover:shadow-xl hover:bg-white">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Users className="text-white" size={40} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">২৪/৭ সাপোর্ট</h3>
              <p className="text-gray-600 leading-relaxed">যেকোনো সমস্যায় সাহায্য পাবেন। আমাদের দক্ষ টিম সর্বদা প্রস্তুত।</p>
            </div>
            
            <div className="text-center group hover:scale-105 transition-all duration-300 p-6 rounded-2xl hover:shadow-xl hover:bg-white">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Zap className="text-white" size={40} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">তাৎক্ষণিক ডেলিভারি</h3>
              <p className="text-gray-600 leading-relaxed">পেমেন্টের পরপরই অ্যাক্টিভ হবে। কোন অপেক্ষা নেই।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Web Subscriptions */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <Globe className="text-purple-600" size={48} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              জনপ্রিয় ওয়েব সাবস্ক্রিপশন
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Netflix, Spotify, Canva সহ আরো অনেক প্রিমিয়াম সেবা এক জায়গায়
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {webProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              to="/categories/web"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold text-lg"
            >
              সব ওয়েব সাবস্ক্রিপশন দেখুন
              <ArrowDown className="rotate-[-90deg]" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Mobile Apps */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <Smartphone className="text-green-600" size={48} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              মোবাইল অ্যাপ সাবস্ক্রিপশন
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              KineMaster, CapCut সহ সব প্রো ভার্সন অ্যাপ পান অবিশ্বাস্য দামে
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mobileProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              to="/categories/mobile"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-teal-600 text-white px-10 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold text-lg"
            >
              সব মোবাইল অ্যাপ দেখুন
              <ArrowDown className="rotate-[-90deg]" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Tutorial Courses */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <BookOpen className="text-orange-600" size={48} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              প্রিমিয়াম কোর্স
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              দক্ষতা বৃদ্ধির জন্য বিশেষজ্ঞদের থেকে শিখুন প্রো লেভেল কোর্স
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
            {tutorialProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              to="/categories/tutorial"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-10 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold text-lg"
            >
              সব কোর্স দেখুন
              <ArrowDown className="rotate-[-90deg]" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Hide for logged in users */}
      {!user && (
        <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Star className="text-yellow-400 animate-spin" size={60} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6">এখনই শুরু করুন</h2>
              <p className="text-xl md:text-2xl mb-12 text-purple-100 leading-relaxed">
                হাজারো কাস্টমার আমাদের সেবা নিয়ে সন্তুষ্ট। আপনিও যোগ দিন আজই এবং উপভোগ করুন 
                <span className="text-yellow-400 font-bold">বিশেষ ছাড়ের</span> সুবিধা!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  to="/register"
                  className="group bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-2"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="group-hover:animate-bounce" size={24} />
                    ফ্রি রেজিস্ট্রেশন করুন
                  </span>
                </Link>
                
                <Link 
                  to="/categories/web"
                  className="group border-3 border-white text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart className="group-hover:animate-bounce" size={24} />
                    শপিং করুন
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
