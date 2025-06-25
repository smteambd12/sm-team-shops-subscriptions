
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, CheckCircle, Star, Users } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const Home = () => {
  const webProducts = products.filter(p => p.category === 'web').slice(0, 3);
  const mobileProducts = products.filter(p => p.category === 'mobile').slice(0, 3);
  const tutorialProducts = products.filter(p => p.category === 'tutorial').slice(0, 2);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            সেরা দামে সব
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              সাবস্ক্রিপশন
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            Netflix, Spotify, Canva সহ সব জনপ্রিয় অ্যাপের সাবস্ক্রিপশন পান ৫০% পর্যন্ত ছাড়ে
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/categories/web"
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              এখনই কিনুন
            </Link>
            <Link 
              to="/categories/tutorial"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              কোর্স দেখুন
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">১০০০+</div>
              <div className="text-purple-200">খুশি কাস্টমার</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">৫০+</div>
              <div className="text-purple-200">প্রিমিয়াম অ্যাপ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">২৪/৭</div>
              <div className="text-purple-200">সাপোর্ট সেবা</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="flex justify-center mt-12">
          <ArrowDown className="animate-bounce text-white/60" size={32} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">কেন আমাদের বেছে নেবেন?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">১০০% অরিজিনাল</h3>
              <p className="text-gray-600">সব সাবস্ক্রিপশন সম্পূর্ণ অরিজিনাল ও বৈধ</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">সেরা দাম</h3>
              <p className="text-gray-600">বাজারের সবচেয়ে কম দামে পাবেন</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">২৪/৭ সাপোর্ট</h3>
              <p className="text-gray-600">যেকোনো সমস্যায় সাহায্য পাবেন</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-orange-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">তাৎক্ষণিক ডেলিভারি</h3>
              <p className="text-gray-600">পেমেন্টের পরপরই অ্যাক্টিভ হবে</p>
            </div>
          </div>
        </div>
      </section>

      {/* Web Subscriptions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">জনপ্রিয় ওয়েব সাবস্ক্রিপশন</h2>
            <p className="text-gray-600">Netflix, Spotify, Canva সহ আরো অনেক কিছু</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {webProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link 
              to="/categories/web"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-block"
            >
              সব ওয়েব সাবস্ক্রিপশন দেখুন
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Apps */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">মোবাইল অ্যাপ সাবস্ক্রিপশন</h2>
            <p className="text-gray-600">KineMaster, CapCut সহ প্রো ভার্সন পান</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {mobileProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link 
              to="/categories/mobile"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-block"
            >
              সব মোবাইল অ্যাপ দেখুন
            </Link>
          </div>
        </div>
      </section>

      {/* Tutorial Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">প্রিমিয়াম কোর্স</h2>
            <p className="text-gray-600">দক্ষতা বৃদ্ধির জন্য বিশেষজ্ঞদের কোর্স</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            {tutorialProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link 
              to="/categories/tutorial"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-block"
            >
              সব কোর্স দেখুন
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">এখনই শুরু করুন</h2>
          <p className="text-xl mb-8 text-purple-100">
            হাজারো কাস্টমার আমাদের সেবা নিয়ে সন্তুষ্ট। আপনিও যোগ দিন আজই!
          </p>
          <Link 
            to="/register"
            className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-block"
          >
            ফ্রি রেজিস্ট্রেশন করুন
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
